/**
 * Provider Notification Preferences
 * 
 * Manage provider preferences for task notifications, including
 * categories, service radius, budget range, and notification channels.
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ProviderPreferences } from './task-matching';

/**
 * Get provider notification preferences
 */
export async function getProviderPreferences(
    providerId: string
): Promise<ProviderPreferences | null> {
    try {
        const docRef = doc(db, 'providerPreferences', providerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as ProviderPreferences;
        }

        // Return default preferences if not set
        return {
            enableTaskNotifications: true,
            serviceRadiusKm: 25,
            minBudget: 0,
            maxBudget: 1000,
            notificationChannels: ['in-app'],
            preferredCategories: [],
        };
    } catch (error) {
        console.error('Error getting provider preferences:', error);
        return null;
    }
}

/**
 * Save provider notification preferences
 */
export async function saveProviderPreferences(
    providerId: string,
    preferences: ProviderPreferences
): Promise<void> {
    try {
        const docRef = doc(db, 'providerPreferences', providerId);

        await setDoc(docRef, {
            ...preferences,
            updatedAt: new Date(),
        }, { merge: true });

        console.log('✅ Provider preferences saved successfully');
    } catch (error) {
        console.error('❌ Error saving provider preferences:', error);
        throw new Error('Failed to save preferences');
    }
}

/**
 * Update specific preference fields
 */
export async function updateProviderPreferences(
    providerId: string,
    updates: Partial<ProviderPreferences>
): Promise<void> {
    try {
        const docRef = doc(db, 'providerPreferences', providerId);

        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date(),
        });

        console.log('✅ Provider preferences updated successfully');
    } catch (error) {
        console.error('❌ Error updating provider preferences:', error);
        throw new Error('Failed to update preferences');
    }
}

/**
 * Get multiple providers' preferences at once
 */
export async function getBulkProviderPreferences(
    providerIds: string[]
): Promise<Record<string, ProviderPreferences>> {
    try {
        const preferences: Record<string, ProviderPreferences> = {};

        // Fetch preferences in parallel
        const fetchPromises = providerIds.map(async (id) => {
            const prefs = await getProviderPreferences(id);
            if (prefs) {
                preferences[id] = prefs;
            }
        });

        await Promise.all(fetchPromises);

        return preferences;
    } catch (error) {
        console.error('Error getting bulk provider preferences:', error);
        return {};
    }
}

/**
 * Enable/disable task notifications for a provider
 */
export async function toggleTaskNotifications(
    providerId: string,
    enabled: boolean
): Promise<void> {
    await updateProviderPreferences(providerId, {
        enableTaskNotifications: enabled,
    });
}

/**
 * Update notification channels (in-app, email, push)
 */
export async function updateNotificationChannels(
    providerId: string,
    channels: ('in-app' | 'email' | 'push')[]
): Promise<void> {
    await updateProviderPreferences(providerId, {
        notificationChannels: channels,
    });
}

/**
 * Update service radius
 */
export async function updateServiceRadius(
    providerId: string,
    radiusKm: number
): Promise<void> {
    await updateProviderPreferences(providerId, {
        serviceRadiusKm: radiusKm,
    });
}

/**
 * Update preferred categories
 */
export async function updatePreferredCategories(
    providerId: string,
    categories: string[]
): Promise<void> {
    await updateProviderPreferences(providerId, {
        preferredCategories: categories,
    });
}

/**
 * Update budget range
 */
export async function updateBudgetRange(
    providerId: string,
    minBudget: number,
    maxBudget: number
): Promise<void> {
    await updateProviderPreferences(providerId, {
        minBudget,
        maxBudget,
    });
}
