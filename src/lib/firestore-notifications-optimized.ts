/**
 * Optimized Firestore Notifications Queries
 * 
 * Provides efficient queries with:
 * - Cursor-based pagination
 * - Composite indexes
 * - Smart caching
 * - Reduced read operations
 */

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    getCountFromServer,
    QueryDocumentSnapshot,
    DocumentData,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Notification, NotificationCategory, NotificationPriority } from './types/notifications';

export interface NotificationQueryOptions {
    userId: string;
    limit?: number;
    category?: NotificationCategory;
    unreadOnly?: boolean;
    priority?: NotificationPriority;
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
}

export interface NotificationQueryResult {
    notifications: Notification[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
    totalCount?: number;
}


/**
 * Get notifications with pagination and filters
 * Uses composite indexes for optimal performance
 */
export async function getNotificationsPaginated(
    options: NotificationQueryOptions
): Promise<NotificationQueryResult> {
    const {
        userId,
        limit: pageLimit = 20,
        category,
        unreadOnly = false,
        priority,
        startAfterDoc,
    } = options;

    try {
        const notificationsRef = collection(db, 'notifications');

        // Build base query
        let constraints: any[] = [
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(pageLimit + 1), // +1 to check if there are more
        ];

        // Add category filter (uses composite index: userId + category + createdAt)
        if (category) {
            constraints = [
                where('userId', '==', userId),
                where('category', '==', category),
                orderBy('createdAt', 'desc'),
                limit(pageLimit + 1),
            ];
        }

        // Add unread filter (uses composite index: userId + read + createdAt)
        if (unreadOnly) {
            constraints = [
                where('userId', '==', userId),
                where('read', '==', false),
                orderBy('createdAt', 'desc'),
                limit(pageLimit + 1),
            ];
        }

        // Add priority filter (uses composite index: userId + priority + createdAt)
        if (priority) {
            constraints = [
                where('userId', '==', userId),
                where('priority', '==', priority),
                orderBy('priority', 'desc'),
                orderBy('createdAt', 'desc'),
                limit(pageLimit + 1),
            ];
        }

        // Combine category + unread filter (uses composite index: userId + category + read + createdAt)
        if (category && unreadOnly) {
            constraints = [
                where('userId', '==', userId),
                where('category', '==', category),
                where('read', '==', false),
                orderBy('createdAt', 'desc'),
                limit(pageLimit + 1),
            ];
        }

        let q = query(notificationsRef, ...constraints);

        // Add pagination cursor
        if (startAfterDoc) {
            q = query(q, startAfter(startAfterDoc));
        }

        const snapshot = await getDocs(q);
        const docs = snapshot.docs;

        // Check if there are more results
        const hasMore = docs.length > pageLimit;
        const notificationDocs = docs.slice(0, pageLimit);

        const notifications: Notification[] = notificationDocs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                type: data.type,
                category: data.category,
                priority: data.priority,
                title: data.title,
                body: data.body,
                data: data.data || {},
                actionUrl: data.actionUrl,
                icon: data.icon,
                read: data.read || false,
                dismissed: data.dismissed || false,
                shown: data.shown || false,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Notification;
        });

        const lastDoc = hasMore ? notificationDocs[notificationDocs.length - 1] : null;

        console.log(`✅ [Optimized] Fetched ${notifications.length} notifications (hasMore: ${hasMore})`);

        return {
            notifications,
            lastDoc,
            hasMore,
        };
    } catch (error) {
        console.error('❌ Error fetching notifications (optimized):', error);
        throw error;
    }
}

/**
 * Get unread count efficiently using aggregation query
 * Faster than fetching all documents
 */
export async function getUnreadCountOptimized(
    userId: string,
    category?: NotificationCategory
): Promise<number> {
    try {
        const notificationsRef = collection(db, 'notifications');

        let constraints: any[] = [
            where('userId', '==', userId),
            where('read', '==', false),
        ];

        if (category) {
            constraints.push(where('category', '==', category));
        }

        const q = query(notificationsRef, ...constraints);
        const countSnapshot = await getCountFromServer(q);

        const count = countSnapshot.data().count;
        console.log(`✅ [Optimized] Unread count: ${count}${category ? ` (${category})` : ''}`);

        return count;
    } catch (error) {
        console.error('❌ Error getting unread count:', error);
        return 0;
    }
}

/**
 * Get unread counts by category efficiently
 */
export async function getUnreadCountsByCategory(
    userId: string
): Promise<Record<NotificationCategory, number>> {
    try {
        const categories = Object.values(NotificationCategory);
        const counts = await Promise.all(
            categories.map(category => getUnreadCountOptimized(userId, category))
        );

        const result: Record<NotificationCategory, number> = {} as any;
        categories.forEach((category, index) => {
            result[category] = counts[index];
        });

        return result;
    } catch (error) {
        console.error('❌ Error getting counts by category:', error);
        return {} as Record<NotificationCategory, number>;
    }
}

/**
 * Get total notification count for a user
 */
export async function getTotalNotificationCount(userId: string): Promise<number> {
    try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(notificationsRef, where('userId', '==', userId));
        const countSnapshot = await getCountFromServer(q);

        return countSnapshot.data().count;
    } catch (error) {
        console.error('❌ Error getting total count:', error);
        return 0;
    }
}

/**
 * Batch mark notifications as read
 * More efficient than individual updates
 */
export async function markNotificationsAsReadBatch(
    notificationIds: string[]
): Promise<void> {
    if (notificationIds.length === 0) return;

    try {
        const { writeBatch, doc } = await import('firebase/firestore');
        const batch = writeBatch(db);

        notificationIds.forEach(id => {
            const notifRef = doc(db, 'notifications', id);
            batch.update(notifRef, {
                read: true,
                updatedAt: Timestamp.now(),
            });
        });

        await batch.commit();
        console.log(`✅ Marked ${notificationIds.length} notifications as read (batch)`);
    } catch (error) {
        console.error('❌ Error marking as read (batch):', error);
        throw error;
    }
}

/**
 * Batch delete notifications
 * More efficient than individual deletes
 */
export async function deleteNotificationsBatch(
    notificationIds: string[]
): Promise<void> {
    if (notificationIds.length === 0) return;

    try {
        const { writeBatch, doc } = await import('firebase/firestore');
        const batch = writeBatch(db);

        notificationIds.forEach(id => {
            const notifRef = doc(db, 'notifications', id);
            batch.delete(notifRef);
        });

        await batch.commit();
        console.log(`✅ Deleted ${notificationIds.length} notifications (batch)`);
    } catch (error) {
        console.error('❌ Error deleting notifications (batch):', error);
        throw error;
    }
}

/**
 * Get notifications for a specific time range
 * Useful for analytics and reporting
 */
export async function getNotificationsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<Notification[]> {
    try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', userId),
            where('createdAt', '>=', Timestamp.fromDate(startDate)),
            where('createdAt', '<=', Timestamp.fromDate(endDate)),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const notifications: Notification[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                type: data.type,
                category: data.category,
                priority: data.priority,
                title: data.title,
                body: data.body,
                data: data.data || {},
                actionUrl: data.actionUrl,
                icon: data.icon,
                read: data.read || false,
                dismissed: data.dismissed || false,
                shown: data.shown || false,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Notification;
        });

        console.log(`✅ Found ${notifications.length} notifications in date range`);
        return notifications;
    } catch (error) {
        console.error('❌ Error getting notifications by date range:', error);
        return [];
    }
}
