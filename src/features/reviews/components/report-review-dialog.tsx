'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2, Flag, AlertTriangle } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { reportReview } from '@/lib/firestore-reviews';
import type { ReportReviewInput } from '@/types/reviews';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const reportSchema = z.object({
  reason: z.enum([
    'spam',
    'inappropriate',
    'offensive',
    'fake',
    'irrelevant',
    'other',
  ], {
    required_error: 'Veuillez sélectionner une raison',
  }),
  details: z
    .string()
    .min(10, 'Les détails doivent contenir au moins 10 caractères')
    .max(500, 'Les détails ne peuvent pas dépasser 500 caractères'),
});

type ReportFormValues = z.infer<typeof reportSchema>;

// ============================================================================
// REPORT REVIEW DIALOG COMPONENT
// ============================================================================

interface ReportReviewDialogProps {
  reviewId: string;
  reporterId: string;
  reviewerName?: string;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function ReportReviewDialog({
  reviewId,
  reporterId,
  reviewerName,
  onSuccess,
  children,
}: ReportReviewDialogProps) {
  const t = useTranslations('Reviews.report');
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: undefined,
      details: '',
    },
  });

  const handleSubmit = async (values: ReportFormValues) => {
    try {
      setIsSubmitting(true);

      const input: ReportReviewInput = {
        reviewId,
        reporterId,
        reason: `${values.reason}: ${values.details}`,
      };

      await reportReview(input);

      toast({
        title: t('success.title'),
        description: t('success.description'),
      });

      form.reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error reporting review:', error);
      toast({
        title: t('error.title'),
        description: error instanceof Error ? error.message : t('error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Flag className="h-3.5 w-3.5" />
            {t('trigger')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" data-testid="report-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {reviewerName
              ? t('descriptionWithName', { name: reviewerName })
              : t('description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Reason Select */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reasonLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="report-reason-select">
                        <SelectValue placeholder={t('reasonPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="spam">{t('reasons.spam')}</SelectItem>
                      <SelectItem value="inappropriate">{t('reasons.inappropriate')}</SelectItem>
                      <SelectItem value="offensive">{t('reasons.offensive')}</SelectItem>
                      <SelectItem value="fake">{t('reasons.fake')}</SelectItem>
                      <SelectItem value="irrelevant">{t('reasons.irrelevant')}</SelectItem>
                      <SelectItem value="other">{t('reasons.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('reasonDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Details Textarea */}
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('detailsLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('detailsPlaceholder')}
                      className="min-h-[120px] resize-none"
                      data-testid="report-details-input"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/500 - {t('detailsDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warning */}
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-destructive">
                    {t('warning.title')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('warning.description')}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                data-testid="report-cancel-button"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
                data-testid="report-submit-button"
              >
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
