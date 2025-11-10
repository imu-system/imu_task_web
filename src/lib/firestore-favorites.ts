import {
    collection,
    doc,
    addDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Favorite Types
 */
export type FavoriteItemType = 'task' | 'provider';

export interface Favorite {
    id: string;
    userId: string;
    itemType: FavoriteItemType;
    itemId: string;
    metadata?: {
        title?: string;
        imageUrl?: string;
        category?: string;
        [key: string]: any;
    };
    createdAt: Date;
    updatedAt?: Date;
}

export interface CreateFavoriteInput {
    itemType: FavoriteItemType;
    itemId: string;
    metadata?: Favorite['metadata'];
}

/**
 * Add item to favorites
 */
export async function addFavorite(
    userId: string,
    input: CreateFavoriteInput
): Promise<string> {
    try {
        // Check if already favorited
        const existing = await getFavoriteByItem(userId, input.itemType, input.itemId);
        if (existing) {
            return existing.id; // Already exists
        }

        const favoriteData = {
            userId,
            itemType: input.itemType,
            itemId: input.itemId,
            metadata: input.metadata || {},
            createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, 'favorites'), favoriteData);
        return docRef.id;
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw new Error('Failed to add favorite');
    }
}

/**
 * Remove item from favorites
 */
export async function removeFavorite(
    userId: string,
    favoriteId: string
): Promise<void> {
    try {
        await deleteDoc(doc(db, 'favorites', favoriteId));
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw new Error('Failed to remove favorite');
    }
}

/**
 * Get all favorites for a user
 */
export async function getFavorites(
    userId: string,
    itemType?: FavoriteItemType
): Promise<Favorite[]> {
    try {
        let q = query(
            collection(db, 'favorites'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        if (itemType) {
            q = query(
                collection(db, 'favorites'),
                where('userId', '==', userId),
                where('itemType', '==', itemType),
                orderBy('createdAt', 'desc')
            );
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                itemType: data.itemType as FavoriteItemType,
                itemId: data.itemId,
                metadata: data.metadata,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            };
        });
    } catch (error) {
        console.error('Error getting favorites:', error);
        throw new Error('Failed to get favorites');
    }
}

/**
 * Get favorite by item (to check if already favorited)
 */
export async function getFavoriteByItem(
    userId: string,
    itemType: FavoriteItemType,
    itemId: string
): Promise<Favorite | null> {
    try {
        const q = query(
            collection(db, 'favorites'),
            where('userId', '==', userId),
            where('itemType', '==', itemType),
            where('itemId', '==', itemId)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            itemType: data.itemType as FavoriteItemType,
            itemId: data.itemId,
            metadata: data.metadata,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        };
    } catch (error) {
        console.error('Error getting favorite by item:', error);
        return null;
    }
}

/**
 * Check if item is favorited
 */
export async function isFavorited(
    userId: string,
    itemType: FavoriteItemType,
    itemId: string
): Promise<boolean> {
    try {
        const favorite = await getFavoriteByItem(userId, itemType, itemId);
        return favorite !== null;
    } catch (error) {
        console.error('Error checking if favorited:', error);
        return false;
    }
}

/**
 * Get favorites count for a user
 */
export async function getFavoritesCount(
    userId: string,
    itemType?: FavoriteItemType
): Promise<number> {
    try {
        const favorites = await getFavorites(userId, itemType);
        return favorites.length;
    } catch (error) {
        console.error('Error getting favorites count:', error);
        return 0;
    }
}
