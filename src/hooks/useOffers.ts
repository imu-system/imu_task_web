import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    createOffer,
    getProviderOffers,
    getOffersForTask,
    withdrawOffer
} from '@/lib/firebase/offers';
import type { Offer, CreateOfferInput } from '@/types/offer';

export function useProviderOffers() {
    const { user } = useAuth();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.uid) return;

        const fetchOffers = async () => {
            try {
                const data = await getProviderOffers(user.uid);
                setOffers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load offers');
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, [user?.uid]);

    return { offers, loading, error };
}

export function useTaskOffers(taskId: string) {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!taskId) return;

        const fetchOffers = async () => {
            try {
                const data = await getOffersForTask(taskId);
                setOffers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load offers');
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, [taskId]);

    return { offers, loading, error };
}

export function useCreateOffer() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitOffer = async (input: CreateOfferInput): Promise<string | null> => {
        if (!user?.uid) {
            setError('Must be logged in');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const offerId = await createOffer(user.uid, input);
            return offerId;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create offer';
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { submitOffer, loading, error };
}
