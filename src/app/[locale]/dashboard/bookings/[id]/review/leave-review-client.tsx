/**
 * Leave Review Client Component
 * 
 * Formulaire de création d'avis avec:
 * - Validation du booking (complété, accès utilisateur)
 * - Vérification pas déjà reviewé
 * - Contexte pré-rempli (bookingId, taskId, users)
 * - Redirect après succès
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { getBooking } from '@/lib/firestore-bookings';
import { canUserReview, hasUserReviewed } from '@/lib/firestore-reviews';
import { ReviewForm } from '@/features/reviews/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Star, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { Booking } from '@/lib/types';
import type { ReviewType } from '@/types/reviews';

interface LeaveReviewClientProps {
  bookingId: string;
}

export default function LeaveReviewClient({ bookingId }: LeaveReviewClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('LeaveReviewPage');
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    const validateAndFetch = async () => {
      if (!user) {
        setError('notAuthenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch booking
        const fetchedBooking = await getBooking(bookingId);
        
        if (!fetchedBooking) {
          setError('bookingNotFound');
          setLoading(false);
          return;
        }

        // Vérifier accès
        if (fetchedBooking.clientId !== user.uid && fetchedBooking.providerId !== user.uid) {
          setError('unauthorized');
          setLoading(false);
          return;
        }

        // Vérifier statut complété
        if (fetchedBooking.status !== 'completed') {
          setError('notCompleted');
          setLoading(false);
          return;
        }

        setBooking(fetchedBooking);

        // Vérifier si déjà reviewé
        const reviewed = await hasUserReviewed(bookingId, user.uid);
        if (reviewed) {
          setAlreadyReviewed(true);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error validating review access:', err);
        setError('fetchError');
        setLoading(false);
      }
    };

    validateAndFetch();
  }, [bookingId, user]);

  const handleReviewSuccess = () => {
    // Redirect vers la page de détail du booking avec message de succès
    router.push(`/dashboard/bookings/${bookingId}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/bookings/${bookingId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Error states
  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToBooking')}
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error === 'notAuthenticated' && t('errors.notAuthenticated')}
            {error === 'bookingNotFound' && t('errors.bookingNotFound')}
            {error === 'unauthorized' && t('errors.unauthorized')}
            {error === 'notCompleted' && t('errors.notCompleted')}
            {error === 'fetchError' && t('errors.fetchError')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Already reviewed
  if (alreadyReviewed) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToBooking')}
        </Button>
        
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            <p className="font-semibold mb-2">{t('alreadyReviewed.title')}</p>
            <p className="text-sm">{t('alreadyReviewed.description')}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No booking
  if (!booking) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToBooking')}
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('errors.bookingNotFound')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Déterminer le type de review (client → provider ou provider → client)
  const reviewType: ReviewType = booking.clientId === user?.uid 
    ? 'client_to_provider' 
    : 'provider_to_client';
  
  const reviewedUserId = booking.clientId === user?.uid 
    ? booking.providerId 
    : booking.clientId;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={handleCancel}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('backToBooking')}
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
          <Star className="h-8 w-8 text-primary" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {reviewType === 'client_to_provider' 
            ? t('subtitle.clientToProvider')
            : t('subtitle.providerToClient')
          }
        </p>
      </div>

      {/* Booking context info */}
      <Alert>
        <AlertDescription>
          <p className="font-semibold mb-1">{t('bookingInfo.title')}</p>
          <p className="text-sm text-muted-foreground">
            {t('bookingInfo.taskTitle')}: {booking.task?.title || t('bookingInfo.unknownTask')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('bookingInfo.amount')}: €{(booking.agreedAmount ?? 0) / 100}
          </p>
        </AlertDescription>
      </Alert>

      {/* Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('form.title')}</CardTitle>
          <CardDescription>{t('form.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewForm
            bookingId={bookingId}
            taskId={booking.taskId}
            reviewerId={user!.uid}
            reviewedUserId={reviewedUserId}
            reviewType={reviewType}
            onSuccess={handleReviewSuccess}
            onCancel={handleCancel}
            showDetailedRatings={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
