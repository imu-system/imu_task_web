// src/hooks/use-notification-manager.ts
/**
 * Central notification management hook
 * Provides real-time notification state and CRUD operations
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    writeBatch,
    Timestamp,
    DocumentData,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    Notification,
    NotificationCategory,
    NotificationDocument,
} from '@/lib/types/notifications';

/**
 * Convert Firestore document to Notification object
 */
function convertDocToNotification(doc: QueryDocumentSnapshot<DocumentData>): Notification {
    const data = doc.data() as NotificationDocument;

    return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data || {},
        read: data.read,
        shown: data.shown,
        category: data.category,
        priority: data.priority,
        createdAt: data.createdAt?.toDate() || new Date(),
        readAt: data.readAt?.toDate(),
        expiresAt: data.expiresAt?.toDate(),
        actionUrl: data.actionUrl,
        icon: data.icon,
    };
}

/**
 * Hook return type
 */
export interface UseNotificationManagerReturn {
    notifications: Notification[];
    newNotifications: Notification[];
    totalUnreadCount: number;
    unreadCountByCategory: Record<NotificationCategory, number>;
    hasNewNotifications: boolean;
    loading: boolean;
    error: Error | null;
    markAsRead: (notificationId: string) => Promise<void>;
    markAsShown: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    clearAll: () => Promise<void>;
    refetch: () => void;
}

/**
 * Central notification management hook
 * Listens to Firestore notifications in real-time and provides management methods
 */
export function useNotificationManager(): UseNotificationManagerReturn {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    // Real-time Firestore listener
    useEffect(() => {
        if (!user?.uid) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const notificationsRef = collection(db, 'notifications');
            const q = query(
                notificationsRef,
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const notifs: Notification[] = snapshot.docs
                        .map(convertDocToNotification)
                        .filter(notif => {
                            // Filter out deleted notifications
                            const isDeleted = (notif.data as any)?.deleted;
                            // Filter out expired notifications
                            const isExpired = notif.expiresAt && notif.expiresAt < new Date();
                            return !isDeleted && !isExpired;
                        });

                    setNotifications(notifs);
                    setLoading(false);
                    console.log(`📬 Loaded ${notifs.length} notifications for user ${user.uid}`);
                },
                (err) => {
                    console.error('❌ Error listening to notifications:', err);
                    setError(err as Error);
                    setLoading(false);
                }
            );

            return () => {
                console.log('🔌 Unsubscribing from notifications listener');
                unsubscribe();
            };
        } catch (err) {
            console.error('❌ Error setting up notifications listener:', err);
            setError(err as Error);
            setLoading(false);
        }
    }, [user?.uid, refetchTrigger]);

    // Computed: New notifications (not shown yet)
    const newNotifications = useMemo(() => {
        return notifications.filter(n => !n.shown && !n.read);
    }, [notifications]);

    // Computed: Total unread count
    const totalUnreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    // Computed: Has new notifications
    const hasNewNotifications = useMemo(() => {
        return newNotifications.length > 0;
    }, [newNotifications.length]);

    // Computed: Unread count by category
    const unreadCountByCategory = useMemo(() => {
        const counts: Record<NotificationCategory, number> = {
            [NotificationCategory.MESSAGES]: 0,
            [NotificationCategory.TASKS]: 0,
            [NotificationCategory.PROPOSALS]: 0,
            [NotificationCategory.BOOKINGS]: 0,
            [NotificationCategory.REVIEWS]: 0,
            [NotificationCategory.PROFILE]: 0,
            [NotificationCategory.PAYMENTS]: 0,
            [NotificationCategory.SYSTEM]: 0,
        };

        notifications.forEach(notif => {
            if (!notif.read) {
                counts[notif.category] = (counts[notif.category] || 0) + 1;
            }
        });

        return counts;
    }, [notifications]);

    // Action: Mark notification as read
    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            const notifRef = doc(db, 'notifications', notificationId);
            await updateDoc(notifRef, {
                read: true,
                readAt: Timestamp.now(),
            });
            console.log(`✅ Marked notification ${notificationId} as read`);
        } catch (err) {
            console.error('❌ Error marking notification as read:', err);
            throw err;
        }
    }, []);

    // Action: Mark notification as shown (toast displayed)
    const markAsShown = useCallback(async (notificationId: string) => {
        try {
            const notifRef = doc(db, 'notifications', notificationId);
            await updateDoc(notifRef, { shown: true });
            console.log(`✅ Marked notification ${notificationId} as shown`);
        } catch (err) {
            console.error('❌ Error marking notification as shown:', err);
            throw err;
        }
    }, []);

    // Action: Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        if (!user?.uid) return;

        try {
            const batch = writeBatch(db);
            const unreadNotifs = notifications.filter(n => !n.read);

            unreadNotifs.forEach(notif => {
                const notifRef = doc(db, 'notifications', notif.id);
                batch.update(notifRef, {
                    read: true,
                    readAt: Timestamp.now(),
                });
            });

            await batch.commit();
            console.log(`✅ Marked ${unreadNotifs.length} notifications as read`);
        } catch (err) {
            console.error('❌ Error marking all notifications as read:', err);
            throw err;
        }
    }, [notifications, user?.uid]);

    // Action: Delete notification (soft delete)
    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            const notifRef = doc(db, 'notifications', notificationId);
            await updateDoc(notifRef, { deleted: true });
            console.log(`✅ Deleted notification ${notificationId}`);
        } catch (err) {
            console.error('❌ Error deleting notification:', err);
            throw err;
        }
    }, []);

    // Action: Clear all notifications (soft delete)
    const clearAll = useCallback(async () => {
        if (!user?.uid) return;

        try {
            const batch = writeBatch(db);

            notifications.forEach(notif => {
                const notifRef = doc(db, 'notifications', notif.id);
                batch.update(notifRef, { deleted: true });
            });

            await batch.commit();
            console.log(`✅ Cleared ${notifications.length} notifications`);
        } catch (err) {
            console.error('❌ Error clearing all notifications:', err);
            throw err;
        }
    }, [notifications, user?.uid]);

    // Action: Refetch notifications
    const refetch = useCallback(() => {
        setRefetchTrigger(prev => prev + 1);
    }, []);

    return {
        notifications,
        newNotifications,
        totalUnreadCount,
        unreadCountByCategory,
        hasNewNotifications,
        loading,
        error,
        markAsRead,
        markAsShown,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refetch,
    };
}
