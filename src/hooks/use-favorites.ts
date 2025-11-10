'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorited,
    type Favorite,
    type FavoriteItemType,
    type CreateFavoriteInput,
} from '@/lib/firestore-favorites';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

/**
 * Hook for managing user favorites
 */
export function useFavorites(itemType?: FavoriteItemType) {
    const { user } = useAuth();
    const { toast } = useToast();
    const t = useTranslations('Favorites');

    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load favorites
    const loadFavorites = useCallback(async () => {
        if (!user) {
            setFavorites([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getFavorites(user.uid, itemType);
            setFavorites(data);
        } catch (err) {
            console.error('Error loading favorites:', err);
            setError(err instanceof Error ? err.message : 'Failed to load favorites');
        } finally {
            setLoading(false);
        }
    }, [user, itemType]);

    // Load on mount and user change
    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    // Add to favorites
    const addToFavorites = useCallback(
        async (input: CreateFavoriteInput) => {
            if (!user) {
                toast({
                    title: t('error'),
                    description: t('loginRequired'),
                    variant: 'destructive',
                });
                return null;
            }

            try {
                const favoriteId = await addFavorite(user.uid, input);
                await loadFavorites(); // Reload list

                toast({
                    title: t('added'),
                    description: t('addedSuccess'),
                });

                return favoriteId;
            } catch (err) {
                console.error('Error adding favorite:', err);
                toast({
                    title: t('error'),
                    description: t('addError'),
                    variant: 'destructive',
                });
                return null;
            }
        },
        [user, loadFavorites, toast, t]
    );

    // Remove from favorites
    const removeFromFavorites = useCallback(
        async (favoriteId: string) => {
            if (!user) return;

            try {
                await removeFavorite(user.uid, favoriteId);
                await loadFavorites(); // Reload list

                toast({
                    title: t('removed'),
                    description: t('removedSuccess'),
                });
            } catch (err) {
                console.error('Error removing favorite:', err);
                toast({
                    title: t('error'),
                    description: t('removeError'),
                    variant: 'destructive',
                });
            }
        },
        [user, loadFavorites, toast, t]
    );

    // Check if item is favorited
    const checkIsFavorited = useCallback(
        (itemId: string, type: FavoriteItemType) => {
            return favorites.some(
                (fav) => fav.itemId === itemId && fav.itemType === type
            );
        },
        [favorites]
    );

    // Get favorite ID for item
    const getFavoriteId = useCallback(
        (itemId: string, type: FavoriteItemType) => {
            const favorite = favorites.find(
                (fav) => fav.itemId === itemId && fav.itemType === type
            );
            return favorite?.id || null;
        },
        [favorites]
    );

    return {
        favorites,
        loading,
        error,
        addToFavorites,
        removeFromFavorites,
        checkIsFavorited,
        getFavoriteId,
        refetch: loadFavorites,
    };
}

/**
 * Hook for toggling a single item's favorite status
 */
export function useToggleFavorite(
    itemId: string,
    itemType: FavoriteItemType,
    metadata?: CreateFavoriteInput['metadata']
) {
    const { user } = useAuth();
    const { toast } = useToast();
    const t = useTranslations('Favorites');

    const [isFav, setIsFav] = useState(false);
    const [favoriteId, setFavoriteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Check initial status
    useEffect(() => {
        async function checkStatus() {
            if (!user) {
                setIsFav(false);
                setLoading(false);
                return;
            }

            try {
                const status = await isFavorited(user.uid, itemType, itemId);
                setIsFav(status);
            } catch (err) {
                console.error('Error checking favorite status:', err);
            } finally {
                setLoading(false);
            }
        }

        checkStatus();
    }, [user, itemType, itemId]);

    // Toggle favorite
    const toggle = useCallback(async () => {
        if (!user) {
            toast({
                title: t('error'),
                description: t('loginRequired'),
                variant: 'destructive',
            });
            return;
        }

        try {
            if (isFav && favoriteId) {
                // Remove
                await removeFavorite(user.uid, favoriteId);
                setIsFav(false);
                setFavoriteId(null);

                toast({
                    title: t('removed'),
                    description: t('removedSuccess'),
                });
            } else {
                // Add
                const newFavId = await addFavorite(user.uid, {
                    itemType,
                    itemId,
                    metadata,
                });
                setIsFav(true);
                setFavoriteId(newFavId);

                toast({
                    title: t('added'),
                    description: t('addedSuccess'),
                });
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            toast({
                title: t('error'),
                description: t('toggleError'),
                variant: 'destructive',
            });
        }
    }, [user, isFav, favoriteId, itemType, itemId, metadata, toast, t]);

    return {
        isFavorited: isFav,
        loading,
        toggle,
    };
}
