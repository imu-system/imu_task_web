'use client';

import { useForm, Controller } from 'react-hook-form';
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
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon, Loader2, Sparkles, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { suggestTaskCategories } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { type ServiceCategory, type Task } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { useTranslations } from 'next-intl';
import { createTask, getTaskTemplateById } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
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
  numberOfProvidersRequired: z.coerce.number().int().min(1, "Il faut au moins 1 prestataire.").default(1),
  attachments: z.any().optional(),
}).refine(data => data.timeWindowEnd > data.timeWindowStart, {
    message: "L'heure de fin doit être après l'heure de début.",
    path: ['timeWindowEnd'],
});

const mockAddresses = [
    { id: '1', label: 'Maison', formatted: '123 Rue Principale, 75001 Paris, France', isDefault: true },
    { id: '2', label: 'Travail', formatted: '456 Avenue des Champs-Élysées, 75008 Paris, France', isDefault: false },
];

export function CreateTaskForm() {
  const [taskCategories, setTaskCategories] = useState<ServiceCategory[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<ServiceCategory[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { toast } = useToast();
  const t = useTranslations('CreateTaskForm');
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      addressId: mockAddresses.find(a => a.isDefault)?.id || '',
      priceOffered: 20,
      estimatedDurationMin: 60,
      numberOfProvidersRequired: 1,
    },
  });

  const descriptionValue = form.watch('description');

  useEffect(() => {
    setIsLoadingCategories(true);
    const q = query(collection(db, 'serviceCategories'), where('isActive', '==', true));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceCategory));
        setTaskCategories(categories);
        setIsLoadingCategories(false);

        // Pre-fill from template once categories are loaded
        const templateId = searchParams.get('templateId');
        if (templateId) {
            const template = getTaskTemplateById(templateId);
            if (template) {
                const category = categories.find(c => c.name.fr === template.category);
                form.reset({
                    title: template.name,
                    description: template.description,
                    priceOffered: template.price,
                    categoryId: category?.id,
                    addressId: mockAddresses.find(a => a.formatted === template.address)?.id,
                });
                 toast({
                    title: "Modèle chargé",
                    description: `Les informations du modèle "${template.name}" ont été pré-remplies.`,
                });
            }
        }

    }, (error) => {
        console.error("Error fetching categories:", error);
        toast({
            variant: 'destructive',
            title: t('toastErrorTitle'),
            description: "Impossible de charger les catégories.",
        });
        setIsLoadingCategories(false);
    });

    return () => unsubscribe();
  }, [searchParams, toast, t, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: 'destructive',
            title: "Erreur d'authentification",
            description: "Vous devez être connecté pour créer une mission.",
        });
        return;
    }
    setIsSubmitting(true);

    const fullAddress = mockAddresses.find(a => a.id === values.addressId);

    try {
        // We pass the full formatted address string for now
        await createTask({
            ...values,
            price: values.priceOffered,
            date: values.timeWindowStart, // Keep 'date' as the primary start time for now as per data model
            clientId: user.uid,
            location: fullAddress?.formatted || '',
        });
        toast({
            title: t('toastSuccessTitle'),
            description: t('toastSuccessDescription'),
        });
        router.push('/dashboard');
    } catch (error) {
        console.error("Error creating task:", error);
        toast({
            variant: 'destructive',
            title: "Erreur",
            description: "Une erreur est survenue lors de la création de la mission.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleSuggestCategories = async () => {
    const description = form.getValues('description');
    if (description.length < 20) return;
    setIsSuggesting(true);
    const result = await suggestTaskCategories({ taskDescription: description });
    if (result.success && result.categories) {
      const filtered = taskCategories.filter(tc => result.categories!.includes(tc.slug));
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
  
  return (
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

        <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSuggestCategories}
              disabled={isSuggesting || descriptionValue.length < 20 || taskCategories.length === 0}
            >
              {isSuggesting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
              )}
                {t('suggestCategoriesButton')}
            </Button>
            {suggestedCategories.length > 0 && (
                <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">{t('suggestionsLabel')}</p>
                <div className="flex flex-wrap gap-2">
                    {suggestedCategories.map((cat) => (
                    <Badge
                        key={cat.id}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => form.setValue('categoryId', cat.id, { shouldValidate: true })}
                    >
                        {cat.name.fr || cat.slug}
                    </Badge>
                    ))}
                </div>
                </div>
            )}
        </div>


        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('categoryLabel')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCategories}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingCategories ? t('categoryLoading') : t('categoryPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {taskCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name.fr || cat.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="addressId"
          render={({ field }) => (
            <FormItem>
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
        
        <FormField
            control={form.control}
            name="numberOfProvidersRequired"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('providersLabel')}</FormLabel>
                    <FormControl>
                        <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                        {t('providersHelp')}
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />

        <FormField
            control={form.control}
            name="attachments"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('attachmentsLabel')}</FormLabel>
                    <FormControl>
                        <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50">
                            <Paperclip className="mx-auto h-8 w-8 text-muted-foreground"/>
                            <p className="mt-2 text-sm text-muted-foreground">{t('attachmentsPlaceholder')}</p>
                            <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" multiple onChange={(e) => field.onChange(e.target.files)} />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />


        <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('submitButton')}
        </Button>
      </form>
    </Form>
    </CardContent>
    </Card>
  );
}
