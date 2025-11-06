/**
 * CancellationDialog Component
 * 
 * Displays cancellation policy and calculates refund before confirming cancellation.
 * Shows:
 * - Hours until booking start
 * - Applicable refund percentage
 * - Refund amount in EUR
 * - Provider penalty (if applicable)
 * - Platform fees retained
 * - Reason textarea
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { XCircle, Clock, DollarSign, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { calculateCancellationFees, DEFAULT_CANCELLATION_POLICY, type CancellationCalculation } from '@/lib/cancellation-policies';

interface CancellationDialogProps {
  bookingId: string;
  bookingAmount: number; // En cents
  scheduledDate: Date | string;
  cancelledBy: 'client' | 'provider';
  onConfirm: (reason: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function CancellationDialog({
  bookingId,
  bookingAmount,
  scheduledDate,
  cancelledBy,
  onConfirm,
  trigger,
}: CancellationDialogProps) {
  const t = useTranslations('Bookings.Cancellation');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculation, setCalculation] = useState<CancellationCalculation | null>(null);
  const [open, setOpen] = useState(false);

  // Recalculer les frais à chaque ouverture du dialog
  useEffect(() => {
    if (open) {
      const calc = calculateCancellationFees(
        bookingAmount,
        scheduledDate,
        cancelledBy,
        DEFAULT_CANCELLATION_POLICY
      );
      setCalculation(calc);
    }
  }, [open, bookingAmount, scheduledDate, cancelledBy]);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      return;
    }

    try {
      setLoading(true);
      await onConfirm(reason);
      setOpen(false);
      setReason('');
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amountInCents: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amountInCents / 100);
  };

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} ${t('minutes')}`;
    }
    if (hours < 24) {
      return `${Math.round(hours)} ${t('hours')}`;
    }
    return `${Math.round(hours / 24)} ${t('days')}`;
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <XCircle className="h-4 w-4 mr-2" />
            {t('cancelButton')}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {t('title')}
          </AlertDialogTitle>
          <AlertDialogDescription>{t('description')}</AlertDialogDescription>
        </AlertDialogHeader>

        {calculation && (
          <div className="space-y-4 py-4">
            {/* Can Cancel Check */}
            {!calculation.canCancel ? (
              <Card className="p-4 bg-destructive/10 border-destructive">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive">{t('cannotCancel')}</p>
                    <p className="text-sm text-muted-foreground mt-1">{calculation.reason}</p>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                {/* Timing Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('timeRemaining')}</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatHours(calculation.hoursBeforeStart)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{t('untilStart')}</p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('refundPercent')}</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {calculation.refundPercent}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{t('ofTotal')}</p>
                  </Card>
                </div>

                {/* Refund Breakdown */}
                <Card className="p-4 space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    {t('refundBreakdown')}
                  </h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('originalAmount')}</span>
                      <span className="font-mono">{formatCurrency(bookingAmount)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('refundAmount')}</span>
                      <span className="font-mono font-semibold text-green-600">
                        {formatCurrency(calculation.refundAmount)}
                      </span>
                    </div>

                    {calculation.platformFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('platformFee')}</span>
                        <span className="font-mono text-orange-600">
                          {formatCurrency(calculation.platformFee)}
                        </span>
                      </div>
                    )}

                    {cancelledBy === 'provider' && calculation.providerPenalty > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('providerPenalty')}</span>
                        <span className="font-mono text-red-600">
                          {formatCurrency(calculation.providerPenalty)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <Badge variant="outline" className="w-full justify-start">
                      <Info className="h-3 w-3 mr-2" />
                      {calculation.reason}
                    </Badge>
                  </div>
                </Card>

                {/* Cancellation Reason */}
                <div className="space-y-2">
                  <Label htmlFor="cancellation-reason">
                    {t('reasonLabel')} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="cancellation-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder={t('reasonPlaceholder')}
                    disabled={!calculation.canCancel}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">{t('reasonHint')}</p>
                </div>
              </>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason('')}>
            {t('goBack')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!reason.trim() || !calculation?.canCancel || loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('confirmCancel')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
