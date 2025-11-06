'use client';

/**
 * ProviderConfirmationDialog Component
 * 
 * Dialog pour confirmation/refus de réservation par le provider
 * - Affiche détails de la réservation
 * - Compte à rebours 24h
 * - Boutons Confirmer/Refuser
 * - Champ raison obligatoire si refus
 * - Affichage pénalité en cas de refus
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { fr, enUS, ja } from 'date-fns/locale';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  confirmBooking,
  declineBooking,
  getConfirmationTimeRemaining,
} from '@/lib/provider-confirmation';

interface Booking {
  id: string;
  taskTitle: string;
  clientName: string;
  clientAvatar?: string;
  scheduledDate: Date;
  duration: number;
  totalAmount: number;
  currency: string;
  createdAt: Date;
  status: string;
}

interface ProviderConfirmationDialogProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onConfirmed?: (bookingId: string) => void;
  onDeclined?: (bookingId: string) => void;
  locale: 'fr' | 'en' | 'ja';
}

export function ProviderConfirmationDialog({
  booking,
  open,
  onClose,
  onConfirmed,
  onDeclined,
  locale,
}: ProviderConfirmationDialogProps) {
  const t = useTranslations('Bookings.ProviderConfirmation');
  const { toast } = useToast();
  const [action, setAction] = useState<'confirm' | 'decline' | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);

  const dateLocale = locale === 'fr' ? fr : locale === 'ja' ? ja : enUS;

  if (!booking) return null;

  const timeRemaining = getConfirmationTimeRemaining(booking.createdAt);
  const penalty = booking.totalAmount * 0.1;
  const minPenalty = 5;
  const actualPenalty = Math.max(penalty, minPenalty);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: booking.currency,
    }).format(amount);
  }

  function handleConfirmClick() {
    setAction('confirm');
  }

  function handleDeclineClick() {
    setAction('decline');
    setShowDeclineDialog(true);
  }

  async function handleConfirm() {
    if (!booking) return;

    setLoading(true);
    try {
      await confirmBooking(booking.id, 'current-provider-id'); // Replace with actual provider ID
      
      toast({
        title: t('confirmSuccess'),
        description: t('confirmSuccessMessage'),
      });

      onConfirmed?.(booking.id);
      onClose();
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: t('confirmError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDecline() {
    if (!booking) return;

    if (!declineReason || declineReason.trim().length < 10) {
      toast({
        title: t('declineError'),
        description: t('reasonRequired'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await declineBooking(booking.id, 'current-provider-id', declineReason); // Replace with actual provider ID
      
      toast({
        title: t('declineSuccess'),
        description: t('declineSuccessMessage'),
      });

      onDeclined?.(booking.id);
      setShowDeclineDialog(false);
      onClose();
    } catch (error) {
      console.error('Error declining booking:', error);
      toast({
        title: t('declineError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('title')}
            </DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Countdown Timer */}
            <div
              className={cn(
                'rounded-lg border-2 p-4 text-center',
                timeRemaining.isExpired
                  ? 'border-destructive bg-destructive/10'
                  : timeRemaining.hours < 6
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                  : 'border-primary bg-primary/10'
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">{t('timeRemaining')}</span>
              </div>
              {timeRemaining.isExpired ? (
                <p className="text-2xl font-bold text-destructive">{t('expired')}</p>
              ) : (
                <p className="text-3xl font-bold">
                  {timeRemaining.hours}h {timeRemaining.minutes}m
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {t('deadline')}: {format(timeRemaining.deadline, 'PPp', { locale: dateLocale })}
              </p>
            </div>

            {/* Booking Details */}
            <div className="space-y-3">
              <h4 className="font-semibold">{t('bookingDetails')}</h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">{t('task')}</Label>
                  <p className="font-medium">{booking.taskTitle}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">{t('client')}</Label>
                  <p className="font-medium">{booking.clientName}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">{t('scheduledDate')}</Label>
                  <p className="font-medium">
                    {format(booking.scheduledDate, 'PPp', { locale: dateLocale })}
                  </p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">{t('duration')}</Label>
                  <p className="font-medium">{booking.duration}h</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">{t('amount')}</Label>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(booking.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning about decline penalty */}
            <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-orange-900 dark:text-orange-100">
                    {t('declineWarning')}
                  </p>
                  <p className="text-orange-700 dark:text-orange-300 mt-1">
                    {t('declineWarningMessage', { 
                      penalty: formatCurrency(actualPenalty) 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeclineClick}
              disabled={loading || timeRemaining.isExpired}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t('decline')}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || timeRemaining.isExpired}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Confirmation Dialog */}
      <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('declineConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('declineConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="declineReason">{t('declineReason')}</Label>
              <Textarea
                id="declineReason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder={t('declineReasonPlaceholder')}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {t('reasonMinLength', { min: 10 })}
              </p>
            </div>

            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm font-semibold text-destructive">
                {t('penaltyNotice')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(actualPenalty)} {t('willBeDeducted')}
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDecline}
              disabled={loading || declineReason.trim().length < 10}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? t('declining') : t('confirmDecline')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
