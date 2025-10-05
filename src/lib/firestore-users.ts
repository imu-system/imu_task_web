/**
 * Firestore Users Library
 * 
 * Provides CRUD operations for users collection.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    isProvider: boolean;
    skills?: string[];
    profileDescription?: string;
    availability?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Get a user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return null;
        }

        const data = userSnap.data();
        return {
            id: userSnap.id,
            name: data.name || 'Unknown User',
            email: data.email || '',
            avatarUrl: data.avatarUrl,
            isProvider: data.isProvider || false,
            skills: data.skills || [],
            profileDescription: data.profileDescription,
            availability: data.availability,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        };
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

/**
 * Get multiple users by IDs
 */
export async function getUsersByIds(userIds: string[]): Promise<User[]> {
    try {
        const users = await Promise.all(
            userIds.map(async (id) => {
                const user = await getUserById(id);
                return user;
            })
        );

        return users.filter((user): user is User => user !== null);
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}

/**
 * Get providers (users with isProvider=true) who have a specific skill/category
 * Used for notifying relevant providers about new tasks
 * 
 * @param skill - The skill/category to match
 * @param options - Optional filtering options
 * @returns Array of matching providers
 */
export async function getProvidersBySkill(
    skill: string,
    options?: {
        onlyAvailable?: boolean;  // Filter only available providers
        maxResults?: number;      // Limit number of results
        location?: string;        // Future: filter by location proximity
    }
): Promise<User[]> {
    try {
        const usersRef = collection(db, 'users');

        // Build query with filters
        let q = query(
            usersRef,
            where('isProvider', '==', true),
            where('skills', 'array-contains', skill)
        );

        // Add availability filter if requested
        if (options?.onlyAvailable) {
            q = query(q, where('availability', '==', true));
        }

        const snapshot = await getDocs(q);

        let providers: User[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || 'Unknown User',
                email: data.email || '',
                avatarUrl: data.avatarUrl,
                isProvider: data.isProvider || false,
                skills: data.skills || [],
                profileDescription: data.profileDescription,
                availability: data.availability,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            };
        });

        // Apply max results limit if specified
        if (options?.maxResults && providers.length > options.maxResults) {
            providers = providers.slice(0, options.maxResults);
            console.log(`⚠️ Limited results to ${options.maxResults} providers`);
        }

        console.log(`✅ Found ${providers.length} providers with skill: ${skill}${options?.onlyAvailable ? ' (available only)' : ''}`);
        return providers;
    } catch (error) {
        console.error('Error getting providers by skill:', error);
        return [];
    }
}

/**
 * Get all available providers (useful for admin/dashboard)
 */
export async function getAvailableProviders(): Promise<User[]> {
    try {
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            where('isProvider', '==', true),
            where('availability', '==', true)
        );

        const snapshot = await getDocs(q);

        const providers: User[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || 'Unknown User',
                email: data.email || '',
                avatarUrl: data.avatarUrl,
                isProvider: data.isProvider || false,
                skills: data.skills || [],
                profileDescription: data.profileDescription,
                availability: data.availability,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            };
        });

        console.log(`✅ Found ${providers.length} available providers`);
        return providers;
    } catch (error) {
        console.error('Error getting available providers:', error);
        return [];
    }
}

/**
 * Get providers by multiple skills (OR logic)
 * Useful when a task could match multiple skill categories
 * 
 * @param skills - Array of skills to match
 * @param options - Optional filtering options
 * @returns Array of unique providers matching any of the skills
 */
export async function getProvidersByMultipleSkills(
    skills: string[],
    options?: {
        onlyAvailable?: boolean;
        maxResults?: number;
    }
): Promise<User[]> {
    try {
        // Fetch providers for each skill in parallel
        const providersArrays = await Promise.all(
            skills.map(skill => getProvidersBySkill(skill, options))
        );

        // Flatten and deduplicate by user ID
        const uniqueProvidersMap = new Map<string, User>();

        providersArrays.forEach(providers => {
            providers.forEach(provider => {
                if (!uniqueProvidersMap.has(provider.id)) {
                    uniqueProvidersMap.set(provider.id, provider);
                }
            });
        });

        const uniqueProviders = Array.from(uniqueProvidersMap.values());

        // Apply max results if specified
        const finalProviders = options?.maxResults
            ? uniqueProviders.slice(0, options.maxResults)
            : uniqueProviders;

        console.log(`✅ Found ${finalProviders.length} unique providers across ${skills.length} skills`);
        return finalProviders;
    } catch (error) {
        console.error('Error getting providers by multiple skills:', error);
        return [];
    }
}
