/**
 * Favorites Service
 * Gère les missions favorites pour les prestataires
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Favorite {
  id: string;
  userId: string; // ID du prestataire
  taskId: string; // ID de la mission
  createdAt: Date;
}

/**
 * Ajouter une mission aux favoris
 */
export async function addFavorite(userId: string, taskId: string): Promise<void> {
  try {
    const favoriteId = `${userId}_${taskId}`;
    const favoriteRef = doc(db, 'favorites', favoriteId);

    await setDoc(favoriteRef, {
      userId,
      taskId,
      createdAt: Timestamp.now(),
    });

    console.log('✅ [Favorites] Added:', taskId);
  } catch (error) {
    console.error('❌ [Favorites] Error adding:', error);
    throw error;
  }
}

/**
 * Retirer une mission des favoris
 */
export async function removeFavorite(userId: string, taskId: string): Promise<void> {
  try {
    const favoriteId = `${userId}_${taskId}`;
    const favoriteRef = doc(db, 'favorites', favoriteId);

    await deleteDoc(favoriteRef);

    console.log('✅ [Favorites] Removed:', taskId);
  } catch (error) {
    console.error('❌ [Favorites] Error removing:', error);
    throw error;
  }
}

/**
 * Vérifier si une mission est en favoris
 */
export async function isFavorite(userId: string, taskId: string): Promise<boolean> {
  try {
    const favoriteId = `${userId}_${taskId}`;
    const favoriteRef = doc(db, 'favorites', favoriteId);
    const favoriteSnap = await getDoc(favoriteRef);

    return favoriteSnap.exists();
  } catch (error) {
    console.error('❌ [Favorites] Error checking:', error);
    return false;
  }
}

/**
 * Récupérer tous les favoris d'un utilisateur
 */
export async function getUserFavorites(userId: string): Promise<string[]> {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const taskIds: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      taskIds.push(data.taskId);
    });

    console.log(`✅ [Favorites] Found ${taskIds.length} favorites for user ${userId}`);
    return taskIds;
  } catch (error) {
    console.error('❌ [Favorites] Error fetching:', error);
    return [];
  }
}

/**
 * Toggle favorite (add/remove)
 */
export async function toggleFavorite(userId: string, taskId: string): Promise<boolean> {
  try {
    const isCurrentlyFavorite = await isFavorite(userId, taskId);

    if (isCurrentlyFavorite) {
      await removeFavorite(userId, taskId);
      return false; // Not favorite anymore
    } else {
      await addFavorite(userId, taskId);
      return true; // Now favorite
    }
  } catch (error) {
    console.error('❌ [Favorites] Error toggling:', error);
    throw error;
  }
}
