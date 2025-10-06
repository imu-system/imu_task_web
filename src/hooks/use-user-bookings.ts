/**
 * useUserBookings Hook
 * 
 * React hook to fetch and manage bookings for a user.
 * Automatically fetches bookings based on user role (client or provider).
 */

import { useState, useEffect } from 'react';
import { getClientBookings, getProviderBookings } from '@/lib/firestore-bookings';
import type { Booking } from '@/lib/types';

interface UseUserBookingsReturn {
    bookings: Booking[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useUserBookings(
    userId: string | undefined,
    role: 'client' | 'provider'
): UseUserBookingsReturn {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = async () => {
        if (!userId) {
            setBookings([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data = role === 'client'
                ? await getClientBookings(userId)
                : await getProviderBookings(userId);

            setBookings(data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [userId, role]);

    return {
        bookings,
        loading,
        error,
        refetch: fetchBookings,
    };
}
