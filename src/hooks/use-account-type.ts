'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AccountType } from '@/lib/types';

/**
 * Hook pour récupérer l'accountType de l'utilisateur
 * 
 * Retourne:
 * - accountType: 'individual' | 'professional' | 'senior' | null
 * - loading: boolean
 * - error: string | null
 */
export function useAccountType() {
    const { user } = useAuth();
    const [accountType, setAccountType] = useState<AccountType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccountType = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    setAccountType(null);
                    return;
                }

                const userData = userSnap.data();
                const type = userData?.profile?.accountType as AccountType | undefined;

                setAccountType(type || null);
            } catch (err: any) {
                console.error('Error fetching accountType:', err);
                setError(err.message || 'Failed to fetch account type');
                setAccountType(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAccountType();
    }, [user]);

    return { accountType, loading, error };
}
