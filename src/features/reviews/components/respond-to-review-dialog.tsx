'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { respondToReview } from '@/lib/firestore-reviews';
import type { RespondToReviewInput } from '@/types/reviews';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const responseSchema = z.object({
  responseText: z
    .string()
    .min(10, 'La réponse doit contenir au moins 10 caractères')
    .max(500, 'La réponse ne peut pas dépasser 500 caractères'),
});

type ResponseFormValues = z.infer<typeof responseSchema>;

// ============================================================================
// RESPOND TO REVIEW DIALOG COMPONENT
// ============================================================================

interface RespondToReviewDialogProps {
  reviewId: string;
  providerId: string;
  reviewerName?: string;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function RespondToReviewDialog({
  reviewId,
  providerId,
  reviewerName,
  onSuccess,
  children,
}: RespondToReviewDialogProps) {
  const t = useTranslations('Reviews.respond');
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      responseText: '',
    },
  });

  const handleSubmit = async (values: ResponseFormValues) => {
    try {
      setIsSubmitting(true);

      const input: RespondToReviewInput = {
        reviewId,
        providerId,
        responseText: values.responseText,
      };

      await respondToReview(input);

      toast({
        title: t('success.title'),
        description: t('success.description'),
      });

      form.reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error responding to review:', error);
      toast({
        title: t('error.title'),
        description: error instanceof Error ? error.message : t('error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const responseText = form.watch('responseText');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            {t('trigger')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {reviewerName
              ? t('descriptionWithName', { name: reviewerName })
              : t('description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Response Text */}
            <FormField
              control={form.control}
              name="responseText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('responseLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('responsePlaceholder')}
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {responseText.length}/500 - {t('responseDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            {responseText.length >= 10 && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-semibold mb-2 text-muted-foreground">
                  {t('preview')}
                </p>
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-sm whitespace-pre-wrap">{responseText}</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
