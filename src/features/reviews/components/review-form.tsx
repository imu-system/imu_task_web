'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Star, Loader2, Upload, X } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { createReview } from '@/lib/firestore-reviews';
import { useToast } from '@/hooks/use-toast';
import type { CreateReviewInput, ReviewRating, ReviewType } from '@/types/reviews';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(20, 'Le commentaire doit contenir au moins 20 caractères')
    .max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères'),
  detailedRatings: z
    .object({
      communication: z.number().min(1).max(5).optional(),
      quality: z.number().min(1).max(5).optional(),
      professionalism: z.number().min(1).max(5).optional(),
      timeliness: z.number().min(1).max(5).optional(),
      valueForMoney: z.number().min(1).max(5).optional(),
    })
    .optional(),
  photos: z.array(z.string()).max(5, 'Maximum 5 photos').optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

// ============================================================================
// STAR RATING COMPONENT
// ============================================================================

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function StarRating({ value, onChange, label, disabled = false, size = 'md' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onMouseEnter={() => !disabled && setHoverValue(star)}
            onMouseLeave={() => !disabled && setHoverValue(0)}
            onClick={() => !disabled && onChange(star)}
            className={cn(
              'transition-transform hover:scale-110 disabled:cursor-not-allowed',
              !disabled && 'cursor-pointer'
            )}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                star <= (hoverValue || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-muted text-muted-foreground'
              )}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm font-medium text-muted-foreground">
            {value}/5
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// REVIEW FORM COMPONENT
// ============================================================================

interface ReviewFormProps {
  bookingId: string;
  taskId: string;
  reviewerId: string;
  reviewedUserId: string;
  reviewType: ReviewType;
  onSuccess?: () => void;
  onCancel?: () => void;
  showDetailedRatings?: boolean;
  className?: string;
}

export function ReviewForm({
  bookingId,
  taskId,
  reviewerId,
  reviewedUserId,
  reviewType,
  onSuccess,
  onCancel,
  showDetailedRatings = true,
  className,
}: ReviewFormProps) {
  const t = useTranslations('Reviews.form');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: '',
      detailedRatings: showDetailedRatings
        ? {
            communication: 0,
            quality: 0,
            professionalism: 0,
            timeliness: 0,
            valueForMoney: 0,
          }
        : undefined,
      photos: [],
    },
  });

  const handleSubmit = async (values: ReviewFormValues) => {
    try {
      setIsSubmitting(true);

      const input: CreateReviewInput = {
        bookingId,
        taskId,
        reviewerId,
        reviewedUserId,
        type: reviewType,
        rating: values.rating as ReviewRating,
        comment: values.comment,
        detailedRatings: values.detailedRatings && {
          communication: values.detailedRatings.communication as ReviewRating | undefined,
          quality: values.detailedRatings.quality as ReviewRating | undefined,
          professionalism: values.detailedRatings.professionalism as ReviewRating | undefined,
          timeliness: values.detailedRatings.timeliness as ReviewRating | undefined,
          valueForMoney: values.detailedRatings.valueForMoney as ReviewRating | undefined,
        },
        photos: values.photos,
      };

      await createReview(input);

      toast({
        title: t('success.title'),
        description: t('success.description'),
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: t('error.title'),
        description: error instanceof Error ? error.message : t('error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const rating = form.watch('rating');

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('space-y-6', className)}
      >
        {/* Overall Rating */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">{t('rating.label')}</FormLabel>
              <FormControl>
                <StarRating
                  value={field.value}
                  onChange={field.onChange}
                  size="lg"
                />
              </FormControl>
              <FormDescription>{t('rating.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Detailed Ratings */}
        {showDetailedRatings && rating > 0 && (
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">{t('detailedRatings.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('detailedRatings.description')}
            </p>

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="detailedRatings.communication"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarRating
                        value={field.value || 0}
                        onChange={field.onChange}
                        label={t('detailedRatings.communication')}
                        size="sm"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="detailedRatings.quality"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarRating
                        value={field.value || 0}
                        onChange={field.onChange}
                        label={t('detailedRatings.quality')}
                        size="sm"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="detailedRatings.professionalism"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarRating
                        value={field.value || 0}
                        onChange={field.onChange}
                        label={t('detailedRatings.professionalism')}
                        size="sm"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="detailedRatings.timeliness"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarRating
                        value={field.value || 0}
                        onChange={field.onChange}
                        label={t('detailedRatings.timeliness')}
                        size="sm"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="detailedRatings.valueForMoney"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarRating
                        value={field.value || 0}
                        onChange={field.onChange}
                        label={t('detailedRatings.valueForMoney')}
                        size="sm"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Comment */}
        {rating > 0 && (
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('comment.label')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('comment.placeholder')}
                    className="min-h-[120px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {field.value.length}/1000 - {t('comment.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Submit Buttons */}
        {rating > 0 && (
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('submit')}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
