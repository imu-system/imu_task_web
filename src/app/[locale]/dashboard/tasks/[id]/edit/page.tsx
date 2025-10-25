
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, Sparkles, Paperclip, ArrowLeft, Trash2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapPicker, type TaskLocation } from '@/components/maps';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { format, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { suggestTaskCategories } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { type ServiceCategory, type Task } from '@/lib/types';
import { TASK_TEMPLATES, ServiceCategory as ServiceCategoryEnum } from '@/types/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter as useNextRouter, Link } from '@/navigation';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const formSchema = z.object({
  title: z.string().min(5, 'Le titre doit faire au moins 5 caractères.'),
  description: z.string().min(20, 'La description doit faire au moins 20 caractères.'),
  categoryId: z.string({ required_error: 'Veuillez sélectionner une catégorie.' }),
  addressId: z.string({ required_error: 'Veuillez sélectionner une adresse.' }),
  timeWindowStart: z.date({
    required_error: 'Veuillez sélectionner une date et une heure de début.',
  }),
  timeWindowEnd: z.date({
    required_error: 'Veuillez sélectionner une date et une heure de fin.',
  }),
  priceOffered: z.coerce.number().min(5, 'Le prix doit être d\'au moins 5€.'),
  estimatedDurationMin: z.coerce.number().int().min(0, "La durée doit être positive.").optional(),
  attachments: z.any().optional(),
}).refine(data => data.timeWindowEnd > data.timeWindowStart, {
    message: "L'heure de fin doit être après l'heure de début.",
    path: ['timeWindowEnd'],
});

/**
 * Helper function to extract localized text from string or Record<string, string>
 * @param text - The text field (can be string or Record<string, string>)
 * @param locale - Preferred locale (default: 'fr')
 * @returns Localized string
 */
function getLocalizedText(text: string | Record<string, string>, locale: string = 'fr'): string {
    if (typeof text === 'string') {
        return text;
    }
    // If it's a Record, try to get the locale, fallback to 'fr', then first available value
    return text[locale] || text.fr || text.en || Object.values(text)[0] || '';
}

const mockAddresses = [
    { id: '1', label: 'Maison', formatted: '123 Rue Principale, 75001 Paris, France', isDefault: true },
    { id: '2', label: 'Travail', formatted: '456 Avenue des Champs-Élysées, 75008 Paris, France', isDefault: false },
];

export default function EditTaskPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [taskCategories, setTaskCategories] = useState<ServiceCategory[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<ServiceCategory[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<TaskLocation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('CreateTaskForm'); // Re-use translations from create form
  const tEdit = useTranslations('EditTaskPage');
  const { user } = useAuth();
  const router = useRouter();
  const nextRouter = useNextRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const descriptionValue = form.watch('description');
  const selectedCategoryId = form.watch('categoryId');
  
  // Filter templates based on selected category
  // Map category name to ServiceCategory enum value
  const categoryNameToEnum: Record<string, ServiceCategoryEnum> = {
    'Aide à domicile': ServiceCategoryEnum.HOME_HELP,
    'Livraison/Courses': ServiceCategoryEnum.DELIVERY,
    'Aide numérique': ServiceCategoryEnum.DIGITAL_HELP,
    'Déménagement': ServiceCategoryEnum.MOVING,
    'Accompagnement': ServiceCategoryEnum.ACCOMPANIMENT,
    'Jardinage': ServiceCategoryEnum.GARDENING,
    'Garde d\'animaux': ServiceCategoryEnum.PET_CARE,
    'Aide événementielle': ServiceCategoryEnum.EVENT_HELP,
  };
  
  const matchingTemplates = selectedCategoryId && taskCategories.length > 0
    ? (() => {
        const selectedCategory = taskCategories.find(cat => cat.id === selectedCategoryId);
        if (!selectedCategory) return [];
        const categoryName = getLocalizedText(selectedCategory.name, 'fr');
        const enumValue = categoryNameToEnum[categoryName];
        if (!enumValue) return [];
        return TASK_TEMPLATES.filter(template => template.category === enumValue);
      })()
    : [];

  useEffect(() => {
    const fetchInitialData = async () => {
        if (!user || !id) return;
        setIsLoading(true);

        try {
            // Fetch categories
            const catQuery = query(collection(db, 'serviceCategories'), where('isActive', '==', true));
            const catSnapshot = await getDocs(catQuery);
            const categories = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceCategory));
            setTaskCategories(categories);

            // Fetch task
            const taskRef = doc(db, 'tasks', id);
            const taskSnap = await getDoc(taskRef);

            if (taskSnap.exists() && taskSnap.data().clientId === user.uid) {
                const taskData = { id: taskSnap.id, ...taskSnap.data() } as Task;
                
                // Check if task can be edited (only 'Open' or 'In Progress' status)
                if (taskData.status === 'Completed') {
                  toast({ 
                    variant: 'destructive', 
                    title: tEdit('cannotEditTitle') || 'Modification impossible',
                    description: tEdit('cannotEditDescription') || 'Cette tâche ne peut plus être modifiée.' 
                  });
                  router.push('/dashboard/tasks');
                  return;
                }
                
                setTask(taskData);
                
                // Load location if available
                if (taskData.location && typeof taskData.location === 'object' && 'coordinates' in taskData.location) {
                  setLocation(taskData.location as TaskLocation);
                }
                
                // Populate form
                form.reset({
                    ...taskData,
                    timeWindowStart: taskData.timeWindowStart 
                        ? (taskData.timeWindowStart instanceof Timestamp ? taskData.timeWindowStart.toDate() : new Date(taskData.timeWindowStart))
                        : undefined,
                    timeWindowEnd: taskData.timeWindowEnd 
                        ? (taskData.timeWindowEnd instanceof Timestamp ? taskData.timeWindowEnd.toDate() : new Date(taskData.timeWindowEnd))
                        : undefined,
                });
            } else {
                 toast({ variant: 'destructive', title: tEdit('toastNotFoundTitle'), description: tEdit('toastNotFoundDescription') });
                 nextRouter.push('/dashboard');
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({ variant: 'destructive', title: t('toastErrorTitle'), description: "Impossible de charger les données." });
        } finally {
            setIsLoading(false);
        }
    }
    fetchInitialData();
  }, [id, user, form, toast, router, t, tEdit]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !id || !location) {
      toast({
        variant: 'destructive',
        title: t('toastErrorTitle'),
        description: 'Veuillez sélectionner une localisation sur la carte.',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
        const taskRef = doc(db, 'tasks', id);
        await updateDoc(taskRef, {
            ...values,
            location: location,
            updatedAt: serverTimestamp()
        });
        toast({
            title: tEdit('toastSuccessTitle') || 'Tâche mise à jour',
            description: tEdit('toastSuccessDescription') || 'Votre tâche a été mise à jour avec succès.',
        });
        router.push('/dashboard/tasks');
    } catch (error) {
        console.error("Error updating task:", error);
        toast({
            variant: 'destructive',
            title: tEdit('toastErrorTitle') || 'Erreur',
            description: tEdit('toastErrorDescription'),
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleApplyTemplate = (template: typeof TASK_TEMPLATES[0]) => {
    form.setValue('title', template.title);
    form.setValue('description', template.description);
    form.setValue('priceOffered', template.suggestedPrice);
    if (template.suggestedDuration) {
      form.setValue('estimatedDurationMin', template.suggestedDuration);
    }
    
    toast({
      title: tEdit('templateAppliedTitle') || 'Modèle appliqué',
      description: tEdit('templateAppliedDescription') || `Le modèle "${template.title}" a été appliqué. Vous pouvez personnaliser les champs.`,
    });
    
    // Track template usage (for analytics - task 9)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'template_applied', {
        template_id: `${template.category}_${template.title.toLowerCase().replace(/\s+/g, '_')}`,
        category: template.category,
      });
    }
  };

  const handleSuggestCategories = async () => {
    const description = form.getValues('description');
    if (description.length < 20) return;
    setIsSuggesting(true);
    const result = await suggestTaskCategories(description);
    if (result.success && result.categories) {
      const filtered = taskCategories.filter(tc => {
        const localizedName = getLocalizedText(tc.name, 'fr');
        return result.categories!.includes(localizedName);
      });
      setSuggestedCategories(filtered);
    } else {
      toast({
        variant: 'destructive',
        title: t('toastErrorTitle'),
        description: result.error || t('toastErrorDescription'),
      });
    }
    setIsSuggesting(false);
  };

  const handleDelete = async () => {
    if (!user || !id) return;
    
    setIsDeleting(true);
    try {
      // Check if there are active proposals
      const proposalsQuery = query(
        collection(db, 'proposals'),
        where('taskId', '==', id),
        where('status', 'in', ['pending', 'accepted'])
      );
      const proposalsSnap = await getDocs(proposalsQuery);
      
      if (!proposalsSnap.empty) {
        toast({
          variant: 'destructive',
          title: tEdit('cannotDeleteTitle') || 'Suppression impossible',
          description: tEdit('cannotDeleteDescription') || 'Cette tâche a des offres actives. Veuillez les gérer avant de supprimer la tâche.',
        });
        setIsDeleting(false);
        return;
      }

      // Delete task
      const taskRef = doc(db, 'tasks', id);
      await deleteDoc(taskRef);
      
      toast({
        title: tEdit('deleteSuccessTitle') || 'Tâche supprimée',
        description: tEdit('deleteSuccessDescription') || 'La tâche a été supprimée avec succès.',
      });
      
      router.push('/dashboard/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        variant: 'destructive',
        title: tEdit('deleteErrorTitle') || 'Erreur',
        description: tEdit('deleteErrorDescription') || 'Impossible de supprimer la tâche.',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4"/>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                {tEdit('title')}
                </h1>
                <p className="text-muted-foreground">
                {tEdit('subtitle')}
                </p>
            </div>
      </div>
        <Card>
            <CardContent className="p-6">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('taskTitleLabel')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('taskTitlePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('descriptionLabel')}</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder={t('descriptionPlaceholder')}
                            className="resize-none"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            {t('descriptionHelp')}
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('categoryLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('categoryPlaceholder')} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {taskCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                {getLocalizedText(cat.name, 'fr')}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    {/* Template Suggestions */}
                    {matchingTemplates.length > 0 && (
                      <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            {tEdit('templateSuggestionsTitle') || 'Modèles suggérés pour cette catégorie'}
                          </CardTitle>
                          <CardDescription>
                            {tEdit('templateSuggestionsDescription') || 'Gagnez du temps en utilisant un modèle pré-rempli. Vous pourrez le personnaliser ensuite.'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {matchingTemplates.map((template, idx) => (
                            <Card key={idx} className="bg-background hover:border-primary/40 transition-colors">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <CardTitle className="text-base font-semibold mb-2">
                                      {template.title}
                                    </CardTitle>
                                    <CardDescription className="text-sm line-clamp-2">
                                      {template.description}
                                    </CardDescription>
                                  </div>
                                  <Button 
                                    type="button"
                                    size="sm"
                                    onClick={() => handleApplyTemplate(template)}
                                    className="shrink-0"
                                  >
                                    {tEdit('applyTemplateButton') || 'Appliquer'}
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">{template.suggestedPrice}€</span>
                                  </div>
                                  {template.suggestedDuration && (
                                    <div className="flex items-center gap-1">
                                      <span>⏱️</span>
                                      <span>{template.suggestedDuration} min</span>
                                    </div>
                                  )}
                                  {template.tags && template.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {template.tags.slice(0, 3).map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                          {tag.replace(/_/g, ' ')}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                    
                    <Separator className="my-6" />
                    
                    {/* Map Picker Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <FormLabel className="text-lg font-semibold">{t('locationLabel')}</FormLabel>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t('locationHelp') || 'Sélectionnez l\'emplacement exact où la tâche doit être effectuée'}
                          </p>
                        </div>
                      </div>
                      <MapPicker 
                        value={location || undefined} 
                        onChange={setLocation}
                        className="h-[400px]"
                      />
                      {!location && (
                        <p className="text-sm text-destructive">
                          Veuillez sélectionner une localisation sur la carte.
                        </p>
                      )}
                    </div>

                    <FormField
                    control={form.control}
                    name="addressId"
                    render={({ field }) => (
                        <FormItem className="hidden">
                        <FormLabel>{t('locationLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('locationPlaceholder')} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {mockAddresses.map((address) => (
                                <SelectItem key={address.id} value={address.id}>
                                {address.label} - {address.formatted}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <Separator className="my-6" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                            control={form.control}
                            name="timeWindowStart"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>{t('startTimeLabel')}</FormLabel>
                                <div className="flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground' )}>
                                            {field.value ? format(field.value, 'PPP', { locale: fr }) : <span>{t('datePlaceholder')}</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date() || date < new Date('1900-01-01')} initialFocus locale={fr}/>
                                        </PopoverContent>
                                    </Popover>
                                    <Input 
                                        type="time" 
                                        className="w-[120px]"
                                        onChange={e => {
                                            const [hours, minutes] = e.target.value.split(':').map(Number);
                                            const newDate = setMinutes(setHours(field.value || new Date(), hours), minutes);
                                            field.onChange(newDate);
                                        }}
                                        defaultValue={field.value ? format(field.value, 'HH:mm') : ''}
                                    />
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="timeWindowEnd"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>{t('endTimeLabel')}</FormLabel>
                                <div className="flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground' )}>
                                            {field.value ? format(field.value, 'PPP', { locale: fr }) : <span>{t('datePlaceholder')}</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date() || date < new Date('1900-01-01')} initialFocus locale={fr}/>
                                        </PopoverContent>
                                    </Popover>
                                    <Input 
                                        type="time" 
                                        className="w-[120px]"
                                        onChange={e => {
                                            const [hours, minutes] = e.target.value.split(':').map(Number);
                                            const newDate = setMinutes(setHours(field.value || new Date(), hours), minutes);
                                            field.onChange(newDate);
                                        }}
                                        defaultValue={field.value ? format(field.value, 'HH:mm') : ''}
                                    />
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                        control={form.control}
                        name="priceOffered"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t('budgetLabel')}</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>
                                {t('budgetHelp')}
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="estimatedDurationMin"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t('durationLabel')}</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder={t('durationPlaceholder')} {...field} />
                            </FormControl>
                            <FormDescription>
                                {t('durationHelp')}
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>

                    <Separator className="my-8" />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center pt-4">
                      <Button 
                        type="submit" 
                        size="lg" 
                        disabled={isSubmitting || !location}
                        className="order-1 sm:order-1"
                      >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {tEdit('submitButton') || 'Enregistrer les modifications'}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            type="button"
                            variant="destructive" 
                            size="lg"
                            disabled={isDeleting}
                            className="order-2 sm:order-2"
                          >
                            {isDeleting ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            {tEdit('deleteButton') || 'Supprimer la tâche'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {tEdit('deleteConfirmTitle') || 'Êtes-vous sûr ?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {tEdit('deleteConfirmDescription') || 'Cette action est irréversible. La tâche sera définitivement supprimée.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {tEdit('deleteCancel') || 'Annuler'}
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDelete}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {tEdit('deleteConfirm') || 'Supprimer'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
