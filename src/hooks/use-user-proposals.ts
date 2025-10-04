'use client';

import { useEffect, useState } from 'react';
import { getProviderProposals, Proposal } from '@/lib/firestore-proposals';

// Re-export Proposal type for convenience
export type { Proposal };

/**
 * Hook to fetch user proposals (provider perspective)
 * @param userId - The ID of the provider
 * @returns Object with proposals, loading state, error, and refetch function
 */
export function useUserProposals(userId: string | null) {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setProposals([]);
            setLoading(false);
            return;
        }

        const fetchProposals = async () => {
            try {
                setLoading(true);
                setError(null);
                const userProposals = await getProviderProposals(userId);
                setProposals(userProposals);
            } catch (err) {
                console.error('Error fetching proposals:', err);
                setError(err instanceof Error ? err.message : 'Failed to load proposals');
            } finally {
                setLoading(false);
            }
        };

        fetchProposals();
    }, [userId]);

    return { proposals, loading, error, refetch: () => getProviderProposals(userId!) };
}
