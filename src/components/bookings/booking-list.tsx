/**
 * BookingList Component
 * 
 * Displays a list of bookings with filtering and status badges.
 * Fetches task and user details for each booking.
 * 
 * Features:
 * - Filter by status
 * - Loading states
 * - Empty states
 * - Error handling
 * - Auto-refresh after updates
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUserBookings } from '@/hooks/use-user-bookings';
import { getTask } from '@/lib/firestore-tasks';
import { getUserById } from '@/lib/firestore-users';
import { BookingCard } from './booking-card';
import type { Booking } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';

interface BookingListProps {
  userId: string;
  userRole: 'client' | 'provider';
}

interface BookingWithDetails extends Booking {
  taskTitle: string;
  partnerName: string;
}

export function BookingList({ userId, userRole }: BookingListProps) {
  const t = useTranslations('Bookings');
  const { bookings, loading, error, refetch } = useUserBookings(userId, userRole);
  const [bookingsWithDetails, setBookingsWithDetails] = useState<BookingWithDetails[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (bookings.length === 0) {
        setBookingsWithDetails([]);
        return;
      }

      setLoadingDetails(true);

      try {
        const detailsPromises = bookings.map(async (booking) => {
          try {
            const task = await getTask(booking.taskId);
            const partnerId = userRole === 'client' ? booking.providerId : booking.clientId;
            const partner = await getUserById(partnerId);

            return {
              ...booking,
              taskTitle: task?.title || t('unknownTask'),
              partnerName: partner?.name || t('unknownUser'),
            };
          } catch (error) {
            console.error('Error fetching details for booking:', booking.id, error);
            return {
              ...booking,
              taskTitle: t('unknownTask'),
              partnerName: t('unknownUser'),
            };
          }
        });

        const details = await Promise.all(detailsPromises);
        setBookingsWithDetails(details);
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [bookings, userRole]);

  const filterByStatus = (status: Booking['status'] | 'all') => {
    if (status === 'all') return bookingsWithDetails;
    return bookingsWithDetails.filter((b) => b.status === status);
  };

  const getStatusCount = (status: Booking['status']) => {
    return bookingsWithDetails.filter((b) => b.status === status).length;
  };

  if (loading || loadingDetails) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (bookingsWithDetails.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold mb-2">{t('noBookings')}</p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {userRole === 'client' ? t('noBookingsClient') : t('noBookingsProvider')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('myBookings')}</h2>
          <p className="text-muted-foreground">
            {t('bookingCount', { count: bookingsWithDetails.length })}
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all" className="relative">
            {t('all')}
            <Badge variant="secondary" className="ml-2">
              {bookingsWithDetails.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            {t('status.pending')}
            <Badge variant="secondary" className="ml-2">
              {getStatusCount('pending')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="relative">
            {t('status.confirmed')}
            <Badge variant="secondary" className="ml-2">
              {getStatusCount('confirmed')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="relative">
            {t('status.in_progress')}
            <Badge variant="secondary" className="ml-2">
              {getStatusCount('in_progress')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            {t('status.completed')}
            <Badge variant="secondary" className="ml-2">
              {getStatusCount('completed')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="relative">
            {t('status.cancelled')}
            <Badge variant="secondary" className="ml-2">
              {getStatusCount('cancelled')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="disputed" className="relative">
            {t('status.disputed')}
            <Badge variant="secondary" className="ml-2">
              {getStatusCount('disputed')}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {(['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'] as const).map(
          (status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {filterByStatus(status).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-semibold mb-2">
                      {t('noBookingsWithStatus', { status: t(`status.${status}`) })}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filterByStatus(status).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    userRole={userRole}
                    taskTitle={booking.taskTitle}
                    partnerName={booking.partnerName}
                    onUpdate={refetch}
                  />
                ))
              )}
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
}
