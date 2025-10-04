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
