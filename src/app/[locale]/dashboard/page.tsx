'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AccountType } from '@/lib/types';
import { Loader2 } from 'lucide-react';

/**
 * Dashboard Router
 * Redirects users to the appropriate dashboard based on their account type
 */
export default function DashboardRouter() {
  const router = useRouter();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const redirectToDashboard = async () => {
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      try {
        // Get user profile from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // New user without profile, redirect to onboarding
          router.push('/onboarding');
          return;
        }

        const userData = userSnap.data();
        const accountType = userData?.profile?.accountType as AccountType | undefined;

        // Redirect based on account type
        if (!accountType) {
          // No account type set, redirect to onboarding
          router.push('/onboarding');
        } else if (accountType === AccountType.individual) {
          router.push('/dashboard/client');
        } else if (accountType === AccountType.professional) {
          router.push('/dashboard/pro');
        } else if (accountType === AccountType.senior) {
          router.push('/dashboard/senior');
        } else {
          // Default fallback
          router.push('/dashboard/client');
        }
      } catch (error) {
        console.error('Error checking account type:', error);
        // Fallback to client dashboard on error
        router.push('/dashboard/client');
      } finally {
        setChecking(false);
      }
    };

    redirectToDashboard();
  }, [user, router]);

  // Loading state while checking
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">
          {checking ? 'Chargement de votre dashboard...' : 'Redirection...'}
        </p>
      </div>
    </div>
  );
}
