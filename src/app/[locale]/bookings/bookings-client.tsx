'use client';

/**
 * Bookings Page Client Component
 * 
 * Displays all bookings for the current user with auth protection.
 */

import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { BookingList } from '@/components/bookings/booking-list';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserById, User as FirestoreUser } from '@/lib/firestore-users';

export default function BookingsPageClient() {
  const t = useTranslations('Bookings');
  const { user, loading } = useRequireAuth();
  const [userProfile, setUserProfile] = useState<FirestoreUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch user profile to determine role
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) {
        setLoadingProfile(false);
        return;
      }

      try {
        const profile = await getUserById(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user?.uid]);

  if (loading || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return null; // useRequireAuth will redirect
  }

  const userRole: 'client' | 'provider' = userProfile.isProvider ? 'provider' : 'client';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('myBookings')}</h1>
        <p className="text-muted-foreground">
          {userRole === 'provider'
            ? t('general.providerSubtitle') || 'Manage your bookings and track work progress'
            : t('general.clientSubtitle') || 'Track your service bookings and their status'}
        </p>
      </div>

      <BookingList userId={user.uid} userRole={userRole} />
    </div>
  );
}
