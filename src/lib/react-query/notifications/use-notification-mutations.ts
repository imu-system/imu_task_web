'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    markAsRead,
    markAsUnread,
    deleteNotification,
    clearAllNotifications,
    dismissNotification
} from '@/lib/firestore-notifications';
import { notificationKeys } from './use-notifications';
import { Notification } from '@/lib/types/notifications';

/**
 * Hook: Mark a notification as read
 */
export function useMarkAsRead(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            await markAsRead(notificationId);
        },
        onMutate: async (notificationId) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: notificationKeys.list(userId) });

            // Snapshot current data
            const previousNotifications = queryClient.getQueryData(notificationKeys.list(userId));

            // Optimistically update cache
            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (old: any) => {
                    if (!old) return old;

                    // Handle infinite query structure
                    if (old.pages) {
                        return {
                            ...old,
                            pages: old.pages.map((page: any) => ({
                                ...page,
                                notifications: page.notifications.map((notif: Notification) =>
                                    notif.id === notificationId
                                        ? { ...notif, read: true, readAt: new Date() }
                                        : notif
                                ),
                            })),
                        };
                    }

                    // Handle regular query structure
                    if (Array.isArray(old)) {
                        return old.map((notif: Notification) =>
                            notif.id === notificationId
                                ? { ...notif, read: true, readAt: new Date() }
                                : notif
                        );
                    }

                    return old;
                }
            );

            // Update unread count
            queryClient.setQueryData(
                notificationKeys.unreadCount(userId),
                (old: number | undefined) => Math.max(0, (old || 0) - 1)
            );

            return { previousNotifications };
        },
        onError: (err, notificationId, context) => {
            // Rollback on error
            if (context?.previousNotifications) {
                queryClient.setQueryData(
                    notificationKeys.list(userId),
                    context.previousNotifications
                );
            }
        },
        onSettled: () => {
            // Refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId) });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(userId) });
        },
    });
}

/**
 * Hook: Mark a notification as unread
 */
export function useMarkAsUnread(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            await markAsUnread(notificationId);
        },
        onMutate: async (notificationId) => {
            await queryClient.cancelQueries({ queryKey: notificationKeys.list(userId) });
            const previousNotifications = queryClient.getQueryData(notificationKeys.list(userId));

            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (old: any) => {
                    if (!old) return old;

                    if (old.pages) {
                        return {
                            ...old,
                            pages: old.pages.map((page: any) => ({
                                ...page,
                                notifications: page.notifications.map((notif: Notification) =>
                                    notif.id === notificationId
                                        ? { ...notif, read: false, readAt: null }
                                        : notif
                                ),
                            })),
                        };
                    }

                    if (Array.isArray(old)) {
                        return old.map((notif: Notification) =>
                            notif.id === notificationId
                                ? { ...notif, read: false, readAt: null }
                                : notif
                        );
                    }

                    return old;
                }
            );

            queryClient.setQueryData(
                notificationKeys.unreadCount(userId),
                (old: number | undefined) => (old || 0) + 1
            );

            return { previousNotifications };
        },
        onError: (err, notificationId, context) => {
            if (context?.previousNotifications) {
                queryClient.setQueryData(
                    notificationKeys.list(userId),
                    context.previousNotifications
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId) });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(userId) });
        },
    });
}

/**
 * Hook: Dismiss a notification (mark as read and hidden)
 */
export function useDismissNotification(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            await dismissNotification(notificationId);
        },
        onMutate: async (notificationId) => {
            await queryClient.cancelQueries({ queryKey: notificationKeys.list(userId) });
            const previousNotifications = queryClient.getQueryData(notificationKeys.list(userId));

            // Remove from cache optimistically
            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (old: any) => {
                    if (!old) return old;

                    if (old.pages) {
                        return {
                            ...old,
                            pages: old.pages.map((page: any) => ({
                                ...page,
                                notifications: page.notifications.filter(
                                    (notif: Notification) => notif.id !== notificationId
                                ),
                            })),
                        };
                    }

                    if (Array.isArray(old)) {
                        return old.filter((notif: Notification) => notif.id !== notificationId);
                    }

                    return old;
                }
            );

            return { previousNotifications };
        },
        onError: (err, notificationId, context) => {
            if (context?.previousNotifications) {
                queryClient.setQueryData(
                    notificationKeys.list(userId),
                    context.previousNotifications
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId) });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(userId) });
        },
    });
}

/**
 * Hook: Delete a notification (soft delete)
 */
export function useDeleteNotification(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            await deleteNotification(notificationId);
        },
        onMutate: async (notificationId) => {
            await queryClient.cancelQueries({ queryKey: notificationKeys.list(userId) });
            const previousNotifications = queryClient.getQueryData(notificationKeys.list(userId));

            // Remove from cache optimistically
            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (old: any) => {
                    if (!old) return old;

                    if (old.pages) {
                        return {
                            ...old,
                            pages: old.pages.map((page: any) => ({
                                ...page,
                                notifications: page.notifications.filter(
                                    (notif: Notification) => notif.id !== notificationId
                                ),
                            })),
                        };
                    }

                    if (Array.isArray(old)) {
                        return old.filter((notif: Notification) => notif.id !== notificationId);
                    }

                    return old;
                }
            );

            return { previousNotifications };
        },
        onError: (err, notificationId, context) => {
            if (context?.previousNotifications) {
                queryClient.setQueryData(
                    notificationKeys.list(userId),
                    context.previousNotifications
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId) });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(userId) });
        },
    });
}

/**
 * Hook: Mark all notifications as read
 */
export function useMarkAllAsRead(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationIds: string[]) => {
            // Mark all notifications as read
            await Promise.all(notificationIds.map(id => markAsRead(id)));
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: notificationKeys.list(userId) });
            const previousNotifications = queryClient.getQueryData(notificationKeys.list(userId));

            // Mark all as read optimistically
            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (old: any) => {
                    if (!old) return old;

                    if (old.pages) {
                        return {
                            ...old,
                            pages: old.pages.map((page: any) => ({
                                ...page,
                                notifications: page.notifications.map((notif: Notification) => ({
                                    ...notif,
                                    read: true,
                                    readAt: new Date(),
                                })),
                            })),
                        };
                    }

                    if (Array.isArray(old)) {
                        return old.map((notif: Notification) => ({
                            ...notif,
                            read: true,
                            readAt: new Date(),
                        }));
                    }

                    return old;
                }
            );

            // Set unread count to 0
            queryClient.setQueryData(notificationKeys.unreadCount(userId), 0);

            return { previousNotifications };
        },
        onError: (err, notificationIds, context) => {
            if (context?.previousNotifications) {
                queryClient.setQueryData(
                    notificationKeys.list(userId),
                    context.previousNotifications
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId) });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(userId) });
        },
    });
}

/**
 * Hook: Delete all notifications (soft delete)
 */
export function useDeleteAllNotifications(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await clearAllNotifications(userId);
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: notificationKeys.list(userId) });
            const previousNotifications = queryClient.getQueryData(notificationKeys.list(userId));

            // Clear cache optimistically
            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (old: any) => {
                    if (!old) return old;

                    if (old.pages) {
                        return {
                            ...old,
                            pages: old.pages.map((page: any) => ({
                                ...page,
                                notifications: [],
                            })),
                        };
                    }

                    if (Array.isArray(old)) {
                        return [];
                    }

                    return old;
                }
            );

            queryClient.setQueryData(notificationKeys.unreadCount(userId), 0);

            return { previousNotifications };
        },
        onError: (err, variables, context) => {
            if (context?.previousNotifications) {
                queryClient.setQueryData(
                    notificationKeys.list(userId),
                    context.previousNotifications
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId) });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(userId) });
        },
    });
}
