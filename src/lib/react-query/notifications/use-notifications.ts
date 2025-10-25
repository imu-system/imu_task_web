'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getNotificationsPaginated, getUnreadCountOptimized } from '@/lib/firestore-notifications-optimized';
import { NotificationCategory } from '@/lib/types/notifications';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { measureNotificationLoad, measureInfiniteScroll } from '@/lib/performance';
import { logNotificationFilter, logNotificationInfiniteScroll } from '@/lib/analytics';
import { trackQueryError } from '@/lib/error-tracking';

export const notificationKeys = {
    all: ['notifications'] as const,
    lists: () => [...notificationKeys.all, 'list'] as const,
    list: (userId: string, filters: Record<string, any> = {}) =>
        [...notificationKeys.lists(), userId, filters] as const,
    unreadCount: (userId: string) => [...notificationKeys.all, 'unreadCount', userId] as const,
    details: () => [...notificationKeys.all, 'detail'] as const,
    detail: (id: string) => [...notificationKeys.details(), id] as const,
};

export interface UseNotificationsOptions {
    userId: string;
    category?: NotificationCategory;
    unreadOnly?: boolean;
    limit?: number;
    enabled?: boolean;
}

/**
 * Hook: Get paginated notifications with cursor-based pagination
 */
export function useNotifications(options: UseNotificationsOptions) {
    const {
        userId,
        category,
        unreadOnly = false,
        limit = 20,
        enabled = true,
    } = options;

    return useQuery({
        queryKey: notificationKeys.list(userId, { category, unreadOnly, limit }),
        queryFn: async () => {
            const trace = measureNotificationLoad(userId);
            logNotificationFilter(category, unreadOnly);

            try {
                const result = await getNotificationsPaginated({
                    userId,
                    category,
                    unreadOnly,
                    limit,
                });

                trace?.incrementMetric('notifications_fetched', result.notifications.length);
                trace?.stop();

                return result;
            } catch (error) {
                trace?.stop();
                trackQueryError('notifications', error as Error);
                throw error;
            }
        },
        enabled: enabled && !!userId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Hook: Get infinite scrolling notifications
 */
export function useInfiniteNotifications(options: UseNotificationsOptions) {
    const {
        userId,
        category,
        unreadOnly = false,
        limit = 20,
        enabled = true,
    } = options;

    return useInfiniteQuery({
        queryKey: notificationKeys.list(userId, { category, unreadOnly, limit }),
        queryFn: async ({ pageParam }: { pageParam: QueryDocumentSnapshot<DocumentData> | undefined }) => {
            const page = pageParam ? 'next' : 'first';
            const pageNum = pageParam ? 1 : 0;
            const trace = measureInfiniteScroll(page);
            logNotificationInfiniteScroll(pageNum);

            try {
                const result = await getNotificationsPaginated({
                    userId,
                    category,
                    unreadOnly,
                    limit,
                    startAfterDoc: pageParam,
                });

                trace?.incrementMetric('notifications_fetched', result.notifications.length);
                trace?.stop();

                return result;
            } catch (error) {
                trace?.stop();
                trackQueryError('infinite-notifications', error as Error);
                throw error;
            }
        },
        initialPageParam: undefined as QueryDocumentSnapshot<DocumentData> | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.lastDoc : undefined;
        },
        enabled: enabled && !!userId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Hook: Get unread notification count
 */
export function useUnreadCount(userId: string, enabled = true) {
    return useQuery({
        queryKey: notificationKeys.unreadCount(userId),
        queryFn: () => getUnreadCountOptimized(userId),
        enabled: enabled && !!userId,
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 60, // Refetch every minute
    });
}
