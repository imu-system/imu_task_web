'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useCreateOffer } from '@/hooks/useOffers';
import { createOfferSchema, type CreateOfferFormData } from '@/lib/validations/offer';
import { useTranslations } from 'next-intl';
import { Loader2, Send } from 'lucide-react';

interface OfferFormProps {
  taskId: string;
  taskBudget: number;
  taskTitle: string;
  onSuccess?: () => void;
}

export function OfferForm({ taskId, taskBudget, taskTitle, onSuccess }: OfferFormProps) {
  const t = useTranslations('Offers');
  const router = useRouter();
  const { submitOffer, loading, error } = useCreateOffer();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOfferFormData>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      taskId,
      proposedPrice: taskBudget,
    },
  });

  const onSubmit = async (data: CreateOfferFormData) => {
    const offerId = await submitOffer(data);
    
    if (offerId) {
      setSuccessMessage(t('offerSubmitted'));
      reset();
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Rediriger vers mes offres après 2s
        setTimeout(() => {
          router.push('/dashboard/offers');
        }, 2000);
      }
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{t('submitOffer')}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {t('offerForTask')}: <strong>{taskTitle}</strong>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Prix proposé */}
        <div>
          <Label htmlFor="proposedPrice">{t('proposedPrice')}</Label>
          <div className="relative">
            <Input
              id="proposedPrice"
              type="number"
              step="0.01"
              {...register('proposedPrice', { valueAsNumber: true })}
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              €
            </span>
          </div>
          {errors.proposedPrice && (
            <p className="text-sm text-destructive mt-1">{errors.proposedPrice.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {t('budgetIndicated')}: {taskBudget}€
          </p>
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="message">{t('message')}</Label>
          <Textarea
            id="message"
            rows={4}
            placeholder={t('messagePlaceholder')}
            {...register('message')}
          />
          {errors.message && (
            <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {t('messageHint')}
          </p>
        </div>

        {/* Durée estimée (optionnel) */}
        <div>
          <Label htmlFor="estimatedDuration">{t('estimatedDuration')} ({t('optional')})</Label>
          <div className="relative">
            <Input
              id="estimatedDuration"
              type="number"
              step="0.5"
              placeholder="2"
              {...register('estimatedDuration', { valueAsNumber: true })}
              className="pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {t('hours')}
            </span>
          </div>
          {errors.estimatedDuration && (
            <p className="text-sm text-destructive mt-1">{errors.estimatedDuration.message}</p>
          )}
        </div>

        {/* Message d'erreur global */}
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {t('submit')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
