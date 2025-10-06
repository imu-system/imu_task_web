/**
 * Custom React Query Hooks for Notifications
 * 
 * Provides optimized data fetching with:
 * - Automatic caching
 * - Background refetching
 * - Optimistic updates
 * - Infinite scrolling pagination
 */

'use client';

import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import {
    getNotificationsPaginated,
    getUnreadCountOptimized,
    getUnreadCountsByCategory,
    markNotificationsAsReadBatch,
    deleteNotificationsBatch,
    type NotificationQueryOptions,
} from '../firestore-notifications-optimized';
import {
    markAsRead,
    markAsUnread,
    dismissNotification,
    deleteNotification,
} from '../firestore-notifications';
import { notificationKeys, invalidateUnreadCounts } from './query-client';
import type { Notification, NotificationCategory } from '../types/notifications';
import { trackMutationError } from '../error-tracking';

/**
 * Hook: Get paginated notifications with infinite scroll
 */
export function useNotifications(options: Omit<NotificationQueryOptions, 'startAfterDoc'>) {
    return useInfiniteQuery({
        queryKey: notificationKeys.list(options),
        queryFn: async ({ pageParam }) => {
            return getNotificationsPaginated({
                ...options,
                startAfterDoc: pageParam ?? undefined,
            });
        },
        initialPageParam: null as QueryDocumentSnapshot<DocumentData> | null,
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.lastDoc : null;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Hook: Get unread notification count
 */
export function useUnreadCount(userId: string, category?: NotificationCategory) {
    return useQuery({
        queryKey: category
            ? [...notificationKeys.unreadCount(userId), category]
            : notificationKeys.unreadCount(userId),
        queryFn: () => getUnreadCountOptimized(userId, category),
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 60, // Refetch every minute
    });
}

/**
 * Hook: Get unread counts by category
 */
export function useUnreadCountsByCategory(userId: string) {
    return useQuery({
        queryKey: notificationKeys.unreadCountsByCategory(userId),
        queryFn: () => getUnreadCountsByCategory(userId),
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Hook: Mark notification as read (with optimistic update)
 */
export function useMarkAsRead(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => markAsRead(notificationId),
        onMutate: async (notificationId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });

            // Snapshot previous values
            const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.lists() });

            // Optimistically update cache
            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (old: any) => {
                    if (!old?.pages) return old;

                    return {
                        ...old,
                        pages: old.pages.map((page: any) => ({
                            ...page,
                            notifications: page.notifications.map((notif: Notification) =>
                                notif.id === notificationId
                                    ? { ...notif, read: true, updatedAt: new Date() }
                                    : notif
                            ),
                        })),
                    };
                }
            );

            return { previousData };
        },
        onError: (_err, _notificationId, context) => {
            // Rollback on error
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }

            trackMutationError('markAsRead', _err as Error, { notificationId: _notificationId });
        },
        onSuccess: () => {
            // Invalidate unread counts
            invalidateUnreadCounts(userId);
        },
    });
}

/**
 * Hook: Mark notification as unread
 */
export function useMarkAsUnread(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => markAsUnread(notificationId),
        onError: (_err, _notificationId) => {
            trackMutationError('markAsUnread', _err as Error, { notificationId: _notificationId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
            invalidateUnreadCounts(userId);
        },
    });
}

/**
 * Hook: Dismiss notification (optimistic update)
 */
export function useDismissNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => dismissNotification(notificationId),
        onMutate: async (notificationId) => {
            await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });

            const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.lists() });

            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (old: any) => {
                    if (!old?.pages) return old;

                    return {
                        ...old,
                        pages: old.pages.map((page: any) => ({
                            ...page,
                            notifications: page.notifications.map((notif: Notification) =>
                                notif.id === notificationId
                                    ? { ...notif, dismissed: true, updatedAt: new Date() }
                                    : notif
                            ),
                        })),
                    };
                }
            );

            return { previousData };
        },
        onError: (_err, _notificationId, context) => {
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }

            trackMutationError('dismissNotification', _err as Error, { notificationId: _notificationId });
        },
    });
}

/**
 * Hook: Delete notification (optimistic update)
 */
export function useDeleteNotification(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => deleteNotification(notificationId),
        onMutate: async (notificationId) => {
            await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });

            const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.lists() });

            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (old: any) => {
                    if (!old?.pages) return old;

                    return {
                        ...old,
                        pages: old.pages.map((page: any) => ({
                            ...page,
                            notifications: page.notifications.filter((n: Notification) => n.id !== notificationId),
                        })),
                    };
                }
            );

            return { previousData };
        },
        onError: (_err, _notificationId, context) => {
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }

            trackMutationError('deleteNotification', _err as Error, { notificationId: _notificationId });
        },
        onSuccess: () => {
            invalidateUnreadCounts(userId);
        },
    });
}

/**
 * Hook: Mark all as read (batch operation)
 */
export function useMarkAllAsRead(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationIds: string[]) => markNotificationsAsReadBatch(notificationIds),
        onError: (_err, _notificationIds) => {
            trackMutationError('markAllAsRead', _err as Error, { notificationIds: _notificationIds });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
            invalidateUnreadCounts(userId);
        },
    });
}

/**
 * Hook: Delete multiple notifications (batch operation)
 */
export function useDeleteMultiple(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationIds: string[]) => deleteNotificationsBatch(notificationIds),
        onError: (_err, _notificationIds) => {
            trackMutationError('deleteMultiple', _err as Error, { notificationIds: _notificationIds });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
            invalidateUnreadCounts(userId);
        },
    });
}
