
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
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { Task } from '@/lib/types';
import { DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

const offerSchema = z.object({
  price: z.coerce.number().min(5, 'Le prix doit être d\'au moins 5€.'),
  message: z.string().min(10, 'Votre message doit contenir au moins 10 caractères.'),
});

type OfferFormValues = z.infer<typeof offerSchema>;

export function OfferForm({ task }: { task: Task }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('OfferForm');

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      price: task.priceOffered,
      message: '',
    },
  });

  async function onSubmit(values: OfferFormValues) {
    setIsSubmitting(true);
    console.log(values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: t('toastSuccessTitle'),
      description: t('toastSuccessDescription'),
    });
    setIsSubmitting(false);
    // Here you would typically close the dialog, which needs to be handled by the parent component.
  }

  return (
    <>
    <DialogHeader>
        <DialogTitle>{t('title')}</DialogTitle>
        <DialogDescription>
            {t('description')}
        </DialogDescription>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('priceLabel')}</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('messageLabel')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('messagePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('submit')}
        </Button>
      </form>
    </Form>
    </>
  );
}
