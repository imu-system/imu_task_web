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

const taskCategories: TaskCategory[] = [
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
      title: "Mission créée !",
      description: "Votre mission a été publiée avec succès.",
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
        title: 'Erreur',
        description: result.error,
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
              <FormLabel>Titre de la mission</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Tondre la pelouse" {...field} />
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
              <FormLabel>Description détaillée</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez précisément ce dont vous avez besoin..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Plus vous serez précis, plus vous recevrez d'offres pertinentes.
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
                Suggérer des catégories avec l'IA
            </Button>
            {suggestedCategories.length > 0 && (
                <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Suggestions :</p>
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
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {taskCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
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
                <FormLabel>Lieu de la mission</FormLabel>
                <FormControl>
                    <Input placeholder="Adresse, Ville" {...field} />
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
                <FormLabel>Date et heure</FormLabel>
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
                            <span>Choisissez une date</span>
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
                    {/* Time picker could be added here */}
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
              <FormLabel>Votre budget (en €)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>
                Ceci est le montant qui sera proposé au prestataire.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg">Publier la mission</Button>
      </form>
    </Form>
    </CardContent>
    </Card>
  );
}
