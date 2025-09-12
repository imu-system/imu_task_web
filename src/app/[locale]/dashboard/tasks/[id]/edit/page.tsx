
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
import { CalendarIcon, Loader2, Sparkles, Paperclip, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { suggestTaskCategories } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { type ServiceCategory, type Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, Link } from '@/navigation';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
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
  const { toast } = useToast();
  const t = useTranslations('CreateTaskForm'); // Re-use translations from create form
  const tEdit = useTranslations('EditTaskPage');
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const descriptionValue = form.watch('description');

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
                setTask(taskData);
                
                // Populate form
                form.reset({
                    ...taskData,
                    timeWindowStart: taskData.timeWindowStart instanceof Timestamp ? taskData.timeWindowStart.toDate() : taskData.timeWindowStart,
                    timeWindowEnd: taskData.timeWindowEnd instanceof Timestamp ? taskData.timeWindowEnd.toDate() : taskData.timeWindowEnd,
                });
            } else {
                 toast({ variant: 'destructive', title: tEdit('toastNotFoundTitle'), description: tEdit('toastNotFoundDescription') });
                 router.push('/dashboard/tasks');
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
    if (!user || !id) return;
    
    setIsSubmitting(true);
    try {
        const taskRef = doc(db, 'tasks', id);
        await updateDoc(taskRef, {
            ...values,
            updatedAt: serverTimestamp()
        });
        toast({
            title: tEdit('toastSuccessTitle'),
            description: tEdit('toastSuccessDescription'),
        });
        router.push(`/dashboard/tasks/${id}`);
    } catch (error) {
        console.error("Error updating task:", error);
        toast({
            variant: 'destructive',
            title: tEdit('toastErrorTitle'),
            description: tEdit('toastErrorDescription'),
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
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href={`/dashboard/tasks/${id}`}>
                    <ArrowLeft className="h-4 w-4"/>
                </Link>
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

                    <Button type="submit" size="lg" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {tEdit('submitButton')}
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}

    
