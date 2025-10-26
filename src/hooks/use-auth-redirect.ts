'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAccountType } from '@/lib/firestore-users';
import type { AccountType } from '@/lib/types';

/**
 * Smart authentication redirection hook
 * Redirects users based on their account type after authentication
 * 
 * Flow:
 * - If user is authenticated:
 *   - Fetches accountType from Firestore
 *   - If no accountType → redirect to /onboarding
 *   - If accountType exists → redirect to /dashboard/{accountType}
 * - If user is not authenticated: no action (public pages)
 * 
 * Usage:
 * const { isRedirecting } = useAuthRedirect(locale);
 */
export function useAuthRedirect(locale: string = 'fr') {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [accountType, setAccountType] = useState<AccountType | null>(null);

    useEffect(() => {
        // Don't redirect if auth is still loading or already redirecting
        if (authLoading || isRedirecting) {
            return;
        }

        // Don't redirect if no user
        if (!user) {
            return;
        }

        // Redirect authenticated user based on account type
        const handleRedirect = async () => {
            try {
                setIsRedirecting(true);

                // Fetch account type from Firestore
                const userAccountType = await getAccountType(user.uid);
                setAccountType(userAccountType);

                // If no account type, user needs to complete onboarding
                if (!userAccountType) {
                    console.log('🔀 Redirecting to onboarding (no account type)');
                    router.push(`/${locale}/onboarding`);
                    return;
                }

                // Redirect to appropriate dashboard based on account type
                console.log(`🔀 Redirecting to dashboard/${userAccountType}`);
                router.push(`/${locale}/dashboard/${userAccountType}`);
            } catch (error) {
                console.error('❌ Error during auth redirect:', error);
                // On error, default to onboarding to be safe
                router.push(`/${locale}/onboarding`);
            } finally {
                setIsRedirecting(false);
            }
        };

        handleRedirect();
    }, [user, authLoading, locale, router, isRedirecting]);

    return {
        isRedirecting,
        accountType,
    };
}
