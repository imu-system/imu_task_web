
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
import { CalendarIcon, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { suggestTaskCategories } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { type TaskCategory } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { useTranslations } from 'next-intl';

const taskCategories: [TaskCategory, ...TaskCategory[]] = [
  'Courses',
  'Jardinage',
  'Ménage léger',
  'Aide numérique',
  'Aide administrative',
  'Petits bricolages',
  'Garde d’animaux',
];

const formSchema = z.object({
  title: z.string().min(5, 'Le titre doit faire au moins 5 caractères.'),
  description: z.string().min(20, 'La description doit faire au moins 20 caractères.'),
  category: z.enum(taskCategories, {
    errorMap: () => ({ message: 'Veuillez sélectionner une catégorie.' }),
  }),
  location: z.string().min(3, 'Veuillez indiquer un lieu.'),
  date: z.date({
    required_error: 'Veuillez sélectionner une date et une heure.',
  }),
  price: z.coerce.number().min(5, 'Le prix doit être d\'au moins 5€.'),
});

export function CreateTaskForm() {
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('CreateTaskForm');
  const tCat = useTranslations('TaskCategories');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      price: 20,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: t('toastSuccessTitle'),
      description: t('toastSuccessDescription'),
    });
  }

  const handleSuggestCategories = async () => {
    const description = form.getValues('description');
    setIsSuggesting(true);
    const result = await suggestTaskCategories({ taskDescription: description });
    if (result.success && result.categories) {
      setSuggestedCategories(result.categories);
    } else {
      toast({
        variant: 'destructive',
        title: t('toastErrorTitle'),
        description: result.error || t('toastErrorDescription'),
      });
    }
    setIsSuggesting(false);
  };
  
  const categoryMap: Record<TaskCategory, string> = {
    'Courses': tCat('shopping'),
    'Jardinage': tCat('gardening'),
    'Ménage léger': tCat('lightCleaning'),
    'Aide numérique': tCat('digitalHelp'),
    'Aide administrative': tCat('administrativeHelp'),
    'Petits bricolages': tCat('handyman'),
    'Garde d’animaux': tCat('petSitting'),
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
            <Button type="button" variant="outline" size="sm" onClick={handleSuggestCategories} disabled={isSuggesting}>
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
                        key={cat}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => form.setValue('category', cat as TaskCategory, { shouldValidate: true })}
                    >
                        {cat}
                    </Badge>
                    ))}
                </div>
                </div>
            )}
        </div>


        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('categoryLabel')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('categoryPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {taskCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryMap[cat]}
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
            name="location"
            render={({ field }) => (
                <FormItem>
                <FormLabel>{t('locationLabel')}</FormLabel>
                <FormControl>
                    <Input placeholder={t('locationPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>{t('datetimeLabel')}</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={'outline'}
                        className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                        )}
                        >
                        {field.value ? (
                            format(field.value, 'PPP à HH:mm', { locale: fr })
                        ) : (
                            <span>{t('datetimePlaceholder')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        locale={fr}
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="price"
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

        <Button type="submit" size="lg">{t('submitButton')}</Button>
      </form>
    </Form>
    </CardContent>
    </Card>
  );
}
