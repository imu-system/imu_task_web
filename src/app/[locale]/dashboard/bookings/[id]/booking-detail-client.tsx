/**
 * Booking Detail Client Component
 * 
 * Composant client pour afficher les détails d'une réservation
 * avec bouton "Laisser un avis" pour les bookings complétés
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { getBooking } from '@/lib/firestore-bookings';
import { canUserReview } from '@/lib/firestore-reviews';
import BookingDetailContent from '@/components/booking-detail-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Star, AlertCircle, ArrowLeft } from 'lucide-react';
import type { Booking } from '@/lib/types';

interface BookingDetailPageClientProps {
  bookingId: string;
}

export default function BookingDetailPageClient({ bookingId }: BookingDetailPageClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('BookingDetailPage');
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canLeaveReview, setCanLeaveReview] = useState(false);
  const [checkingReview, setCheckingReview] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!user) {
        setError('notAuthenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedBooking = await getBooking(bookingId);
        
        if (!fetchedBooking) {
          setError('notFound');
          setLoading(false);
          return;
        }

        // Vérifier que l'utilisateur a accès à ce booking
        if (fetchedBooking.clientId !== user.uid && fetchedBooking.providerId !== user.uid) {
          setError('unauthorized');
          setLoading(false);
          return;
        }

        setBooking(fetchedBooking);

        // Vérifier si l'utilisateur peut laisser un avis
        if (fetchedBooking.status === 'completed') {
          setCheckingReview(true);
          const canReview = await canUserReview(bookingId, user.uid);
          setCanLeaveReview(canReview);
          setCheckingReview(false);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('fetchError');
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, user]);

  const handleLeaveReview = () => {
    router.push(`/dashboard/bookings/${bookingId}/review`);
  };

  const handleGoBack = () => {
    router.push('/dashboard/bookings');
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
        <Button variant="ghost" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToBookings')}
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error === 'notAuthenticated' && t('errors.notAuthenticated')}
            {error === 'notFound' && t('errors.notFound')}
            {error === 'unauthorized' && t('errors.unauthorized')}
            {error === 'fetchError' && t('errors.fetchError')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No booking found
  if (!booking) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToBookings')}
        </Button>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">{t('errors.notFound')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={handleGoBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('backToBookings')}
      </Button>

      {/* Leave Review Button (si booking complété et user peut reviewer) */}
      {booking.status === 'completed' && canLeaveReview && !checkingReview && (
        <Alert className="border-green-200 bg-green-50">
          <Star className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-green-900 font-medium">
              {t('reviewPrompt.title')}
            </span>
            <Button 
              onClick={handleLeaveReview}
              size="sm"
              className="ml-4"
            >
              <Star className="mr-2 h-4 w-4" />
              {t('reviewPrompt.button')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Booking Detail Content */}
      <BookingDetailContent booking={booking} />
    </div>
  );
}
