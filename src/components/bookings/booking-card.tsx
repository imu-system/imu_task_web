/**
 * BookingCard Component
 * 
 * Displays a single booking with actions based on user role and booking status.
 * 
 * Features:
 * - Status badge with color coding
 * - Task details and amount
 * - Client/Provider information
 * - Action buttons (confirm, start, complete, cancel)
 * - Scheduled date display
 * - Notes display
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import {
  updateBookingStatus,
  cancelBooking,
  updateBookingNotes,
  updateBookingScheduledDate,
} from '@/lib/firestore-bookings';
import type { Booking } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Clock,
  DollarSign,
  User,
  MapPin,
  FileText,
  Edit,
  Loader2,
} from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
  userRole: 'client' | 'provider';
  taskTitle: string;
  partnerName?: string; // Client name for provider, or provider name for client
  onUpdate?: () => void;
}

export function BookingCard({ 
  booking, 
  userRole, 
  taskTitle,
  partnerName,
  onUpdate 
}: BookingCardProps) {
  const t = useTranslations('Bookings');
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [notes, setNotes] = useState(booking.notes || '');
  const [scheduledDate, setScheduledDate] = useState(
    booking.scheduledDate ? booking.scheduledDate.toISOString().split('T')[0] : ''
  );
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showDateDialog, setShowDateDialog] = useState(false);

  const handleStatusUpdate = async (newStatus: Booking['status']) => {
    try {
      setActionLoading(true);
      await updateBookingStatus(booking.id, newStatus);
      
      toast({
        title: t('statusUpdateSuccessTitle'),
        description: t('statusUpdateSuccessDescription', { status: t(`status.${newStatus}`) }),
      });

      onUpdate?.();
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('errorGeneric'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: t('errorTitle'),
        description: t('errorCancelReasonRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(true);
      await cancelBooking(booking.id, cancelReason);
      
      toast({
        title: t('cancelSuccessTitle'),
        description: t('cancelSuccessDescription'),
      });

      setCancelReason('');
      onUpdate?.();
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('errorGeneric'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateNotes = async () => {
    try {
      setActionLoading(true);
      await updateBookingNotes(booking.id, notes);
      
      toast({
        title: t('notesUpdateSuccessTitle'),
        description: t('notesUpdateSuccessDescription'),
      });

      setShowNotesDialog(false);
      onUpdate?.();
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('errorGeneric'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateDate = async () => {
    if (!scheduledDate) {
      toast({
        title: t('errorTitle'),
        description: t('errorDateRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(true);
      await updateBookingScheduledDate(booking.id, new Date(scheduledDate));
      
      toast({
        title: t('dateUpdateSuccessTitle'),
        description: t('dateUpdateSuccessDescription'),
      });

      setShowDateDialog(false);
      onUpdate?.();
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('errorGeneric'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status: Booking['status']) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      disputed: 'bg-orange-100 text-orange-800',
    };
    return classes[status];
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return t('notSet');
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const canConfirm = userRole === 'provider' && booking.status === 'pending';
  const canStart = booking.status === 'confirmed';
  const canComplete = booking.status === 'in_progress';
  const canCancel = ['pending', 'confirmed'].includes(booking.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{taskTitle}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {userRole === 'client' ? t('provider') : t('client')}: {partnerName || t('unknown')}
            </CardDescription>
          </div>
          <Badge className={getStatusBadgeClass(booking.status)}>
            {t(`status.${booking.status}`)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-green-600">
            €{booking.amount.toFixed(2)}
          </span>
        </div>

        {/* Scheduled Date */}
        {booking.scheduledDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {t('scheduledFor')}: {formatDate(booking.scheduledDate)}
          </div>
        )}

        {/* Timestamps */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            {t('created')}: {formatDate(booking.createdAt)}
          </div>
          {booking.startedAt && (
            <div className="flex items-center gap-2">
              <PlayCircle className="h-3 w-3" />
              {t('started')}: {formatDate(booking.startedAt)}
            </div>
          )}
          {booking.completedAt && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3" />
              {t('completed')}: {formatDate(booking.completedAt)}
            </div>
          )}
          {booking.cancelledAt && (
            <div className="flex items-center gap-2">
              <XCircle className="h-3 w-3" />
              {t('cancelled')}: {formatDate(booking.cancelledAt)}
            </div>
          )}
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">{t('notes')}</span>
            </div>
            <p className="text-sm text-muted-foreground">{booking.notes}</p>
          </div>
        )}

        {/* Cancellation Reason */}
        {booking.status === 'cancelled' && booking.cancellationReason && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">{t('cancellationReason')}</span>
            </div>
            <p className="text-sm text-red-700">{booking.cancellationReason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {canConfirm && (
            <Button
              onClick={() => handleStatusUpdate('confirmed')}
              disabled={actionLoading}
              size="sm"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {t('confirm')}
            </Button>
          )}

          {canStart && (
            <Button
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={actionLoading}
              size="sm"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-2" />
              )}
              {t('start')}
            </Button>
          )}

          {canComplete && (
            <Button
              onClick={() => handleStatusUpdate('completed')}
              disabled={actionLoading}
              size="sm"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {t('complete')}
            </Button>
          )}

          {/* Edit scheduled date */}
          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
            <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  {booking.scheduledDate ? t('editDate') : t('setDate')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('editScheduledDate')}</DialogTitle>
                  <DialogDescription>{t('editScheduledDateDescription')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scheduledDate">{t('scheduledDate')}</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDateDialog(false)}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={handleUpdateDate} disabled={actionLoading}>
                    {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t('save')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Edit notes */}
          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
            <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  {t('editNotes')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('editBookingNotes')}</DialogTitle>
                  <DialogDescription>{t('editBookingNotesDescription')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">{t('notes')}</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder={t('notesPlaceholder')}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={handleUpdateNotes} disabled={actionLoading}>
                    {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t('save')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Cancel booking */}
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('cancel')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('cancelBookingTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('cancelBookingDescription')}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cancelReason">{t('cancellationReason')}</Label>
                    <Textarea
                      id="cancelReason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={3}
                      placeholder={t('cancellationReasonPlaceholder')}
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCancelReason('')}>
                    {t('goBack')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    disabled={actionLoading || !cancelReason.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t('confirmCancel')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
