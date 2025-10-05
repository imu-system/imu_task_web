/**
 * React Query Configuration
 * 
 * Provides optimized caching and data fetching for notifications.
 * 
 * Features:
 * - Automatic background refetching
 * - Smart cache invalidation
 * - Optimistic updates
 * - Error retry logic
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Caching strategy
            staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
            gcTime: 1000 * 60 * 30, // 30 minutes - garbage collection (formerly cacheTime)

            // Refetch strategy
            refetchOnWindowFocus: true, // Refetch when user returns to tab
            refetchOnReconnect: true, // Refetch when internet reconnects
            refetchOnMount: true, // Refetch on component mount

            // Retry strategy
            retry: 3, // Retry failed requests 3 times
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff

            // Performance
            structuralSharing: true, // Prevent unnecessary re-renders

            // Network mode
            networkMode: 'online', // Only fetch when online
        },
        mutations: {
            // Retry mutations once
            retry: 1,
            retryDelay: 1000,

            // Network mode
            networkMode: 'online',

            // Optimistic updates will be handled per-mutation
        },
    },
});

/**
 * Query keys factory for notifications
 * Provides consistent, type-safe query keys
 */
export const notificationKeys = {
    all: ['notifications'] as const,
    lists: () => [...notificationKeys.all, 'list'] as const,
    list: (filters: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
    details: () => [...notificationKeys.all, 'detail'] as const,
    detail: (id: string) => [...notificationKeys.details(), id] as const,
    unreadCount: (userId: string) => [...notificationKeys.all, 'unreadCount', userId] as const,
    unreadCountsByCategory: (userId: string) => [...notificationKeys.all, 'unreadCountsByCategory', userId] as const,
} as const;

/**
 * Notification filter types
 */
export interface NotificationFilters {
    userId: string;
    category?: string;
    unreadOnly?: boolean;
    limit?: number;
}

/**
 * Prefetch notifications for better UX
 * Call this when user is likely to need notifications soon
 */
export async function prefetchNotifications(userId: string) {
    await queryClient.prefetchQuery({
        queryKey: notificationKeys.list({ userId }),
        queryFn: async () => {
            const { getNotificationsPaginated } = await import('../firestore-notifications-optimized');
            return getNotificationsPaginated({ userId, limit: 20 });
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Invalidate all notification queries
 * Call after creating/updating/deleting notifications
 */
export function invalidateNotifications() {
    return queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
    });
}

/**
 * Invalidate unread count queries
 * Call after marking notifications as read
 */
export function invalidateUnreadCounts(userId: string) {
    return Promise.all([
        queryClient.invalidateQueries({
            queryKey: notificationKeys.unreadCount(userId),
        }),
        queryClient.invalidateQueries({
            queryKey: notificationKeys.unreadCountsByCategory(userId),
        }),
    ]);
}

/**
 * Remove specific notification from cache
 */
export function removeNotificationFromCache(notificationId: string) {
    queryClient.removeQueries({
        queryKey: notificationKeys.detail(notificationId),
    });
}

/**
 * Clear all cached notifications
 * Use when user logs out
 */
export function clearNotificationCache() {
    queryClient.removeQueries({
        queryKey: notificationKeys.all,
    });
}
