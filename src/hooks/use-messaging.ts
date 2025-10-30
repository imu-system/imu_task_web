/**
 * React Query Hooks for Messaging System
 * 
 * Custom hooks for threads and messages with real-time updates
 * 
 * @module use-messaging
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Thread, Message, ThreadStatus } from '@/lib/types';
import {
    getUserThreads,
    getThread,
    createThread,
    updateThread,
    markThreadAsRead,
    archiveThread,
    subscribeToThread,
    subscribeToUserThreads,
    searchThreads,
    getTotalUnreadCount,
} from '@/lib/firestore-threads';
import {
    getThreadMessages,
    sendMessage,
    sendSystemMessage,
    markMessageAsRead,
    markAllMessagesAsRead,
    subscribeToThreadMessages,
    detectPII,
} from '@/lib/firestore-messages';
import { MessageType } from '@/lib/types';

// ============================================================================
// Query Keys
// ============================================================================

export const messagingKeys = {
    all: ['messaging'] as const,
    threads: () => [...messagingKeys.all, 'threads'] as const,
    threadsList: (userId: string, filters?: any) =>
        [...messagingKeys.threads(), userId, filters] as const,
    thread: (threadId: string) =>
        [...messagingKeys.threads(), threadId] as const,
    threadMessages: (threadId: string) =>
        [...messagingKeys.all, 'messages', threadId] as const,
    unreadCount: (userId: string) =>
        [...messagingKeys.all, 'unread', userId] as const,
};

// ============================================================================
// Thread Hooks
// ============================================================================

/**
 * Get all threads for current user with real-time updates
 */
export function useUserThreads(
    userId: string | undefined,
    filters?: {
        status?: ThreadStatus;
        onlyUnread?: boolean;
    }
) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: messagingKeys.threadsList(userId || '', filters),
        queryFn: () => {
            if (!userId) throw new Error('User ID required');
            return getUserThreads(userId, filters);
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false, // Don't retry on Firestore permission errors
        refetchOnWindowFocus: false, // Don't refetch when window gains focus
    });

    // Real-time subscription
    useEffect(() => {
        if (!userId) return;

        let unsubscribe: (() => void) | undefined;

        try {
            unsubscribe = subscribeToUserThreads(userId, (threads) => {
                queryClient.setQueryData(
                    messagingKeys.threadsList(userId, filters),
                    threads
                );
            });
        } catch (error) {
            console.error('Error subscribing to user threads:', error);
        }

        return () => {
            if (unsubscribe) {
                try {
                    unsubscribe();
                } catch (error) {
                    console.error('Error unsubscribing from user threads:', error);
                }
            }
        };
    }, [userId, queryClient]);

    return query;
}

/**
 * Get single thread by ID with real-time updates
 */
export function useThread(threadId: string | undefined) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: messagingKeys.thread(threadId || ''),
        queryFn: () => {
            if (!threadId) throw new Error('Thread ID required');
            return getThread(threadId);
        },
        enabled: !!threadId,
        staleTime: 1000 * 60, // 1 minute
    });

    // Real-time subscription
    useEffect(() => {
        if (!threadId) return;

        let unsubscribe: (() => void) | undefined;

        try {
            unsubscribe = subscribeToThread(threadId, (thread) => {
                queryClient.setQueryData(messagingKeys.thread(threadId), thread);
            });
        } catch (error) {
            console.error('Error subscribing to thread:', error);
        }

        return () => {
            if (unsubscribe) {
                try {
                    unsubscribe();
                } catch (error) {
                    console.error('Error unsubscribing from thread:', error);
                }
            }
        };
    }, [threadId, queryClient]);

    return query;
}

/**
 * Get total unread count across all threads
 */
export function useUnreadCount(userId: string | undefined) {
    return useQuery({
        queryKey: messagingKeys.unreadCount(userId || ''),
        queryFn: () => {
            if (!userId) return 0;
            return getTotalUnreadCount(userId);
        },
        enabled: !!userId,
        staleTime: 1000 * 30, // 30 seconds
    });
}

/**
 * Search threads by task title or participant name
 */
export function useSearchThreads(
    userId: string | undefined,
    searchQuery: string,
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: [...messagingKeys.threadsList(userId || ''), 'search', searchQuery],
        queryFn: () => {
            if (!userId) return [];
            return searchThreads(userId, searchQuery);
        },
        enabled: options?.enabled !== undefined ? options.enabled : (!!userId && searchQuery.length > 0),
        staleTime: 1000 * 10, // 10 seconds
    });
}

// ============================================================================
// Message Hooks
// ============================================================================

/**
 * Get messages for a thread with real-time updates
 */
export function useThreadMessages(threadId: string | undefined) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: messagingKeys.threadMessages(threadId || ''),
        queryFn: () => {
            if (!threadId) throw new Error('Thread ID required');
            return getThreadMessages(threadId, 100);
        },
        enabled: !!threadId,
        staleTime: 1000 * 60, // 1 minute
    });

    // Real-time subscription
    useEffect(() => {
        if (!threadId) return;

        let unsubscribe: (() => void) | undefined;

        try {
            unsubscribe = subscribeToThreadMessages(threadId, (messages) => {
                queryClient.setQueryData(messagingKeys.threadMessages(threadId), messages);
            });
        } catch (error) {
            console.error('Error subscribing to thread messages:', error);
        }

        return () => {
            if (unsubscribe) {
                try {
                    unsubscribe();
                } catch (error) {
                    console.error('Error unsubscribing from thread messages:', error);
                }
            }
        };
    }, [threadId, queryClient]);

    return query;
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create new thread
 */
export function useCreateThread() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createThread,
        onSuccess: (threadId, variables) => {
            // Invalidate threads list for all participants
            variables.participants.forEach((userId) => {
                queryClient.invalidateQueries({
                    queryKey: messagingKeys.threadsList(userId),
                });
            });
        },
    });
}

/**
 * Send message in thread
 */
export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: sendMessage,
        onMutate: async (newMessage) => {
            // Optimistic update: Add message to cache immediately
            const previousMessages = queryClient.getQueryData<Message[]>(
                messagingKeys.threadMessages(newMessage.threadId)
            );

            if (previousMessages) {
                const optimisticMessage: Message = {
                    id: 'temp-' + Date.now(),
                    ...newMessage,
                    type: (newMessage.type || 'text') as MessageType,
                    attachments: newMessage.attachments || [],
                    readBy: [newMessage.senderId],
                    createdAt: new Date(),
                    containsPII: detectPII(newMessage.content),
                };

                queryClient.setQueryData(
                    messagingKeys.threadMessages(newMessage.threadId),
                    [...previousMessages, optimisticMessage]
                );
            }

            return { previousMessages };
        },
        onError: (err, newMessage, context) => {
            // Rollback on error
            if (context?.previousMessages) {
                queryClient.setQueryData(
                    messagingKeys.threadMessages(newMessage.threadId),
                    context.previousMessages
                );
            }
        },
        onSuccess: (messageId, variables) => {
            // Invalidate queries
            queryClient.invalidateQueries({
                queryKey: messagingKeys.threadMessages(variables.threadId),
            });
            queryClient.invalidateQueries({
                queryKey: messagingKeys.thread(variables.threadId),
            });
        },
    });
}

/**
 * Send system message
 */
export function useSendSystemMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ threadId, systemData }: { threadId: string; systemData: any }) =>
            sendSystemMessage(threadId, systemData),
        onSuccess: (messageId, { threadId }) => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.threadMessages(threadId),
            });
            queryClient.invalidateQueries({
                queryKey: messagingKeys.thread(threadId),
            });
        },
    });
}

/**
 * Mark thread as read
 */
export function useMarkThreadAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ threadId, userId }: { threadId: string; userId: string }) =>
            markThreadAsRead(threadId, userId),
        onSuccess: (_, { threadId, userId }) => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.thread(threadId),
            });
            queryClient.invalidateQueries({
                queryKey: messagingKeys.threadsList(userId),
            });
            queryClient.invalidateQueries({
                queryKey: messagingKeys.unreadCount(userId),
            });
        },
    });
}

/**
 * Mark all messages as read in thread
 */
export function useMarkAllMessagesAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ threadId, userId }: { threadId: string; userId: string }) =>
            markAllMessagesAsRead(threadId, userId),
        onSuccess: (_, { threadId, userId }) => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.threadMessages(threadId),
            });
            queryClient.invalidateQueries({
                queryKey: messagingKeys.thread(threadId),
            });
            queryClient.invalidateQueries({
                queryKey: messagingKeys.unreadCount(userId),
            });
        },
    });
}

/**
 * Archive thread
 */
export function useArchiveThread() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: archiveThread,
        onSuccess: (_, threadId) => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.threads(),
            });
        },
    });
}

/**
 * Update thread
 */
export function useUpdateThread() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ threadId, updates }: { threadId: string; updates: Partial<Thread> }) =>
            updateThread(threadId, updates),
        onSuccess: (_, { threadId }) => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.thread(threadId),
            });
            queryClient.invalidateQueries({
                queryKey: messagingKeys.threads(),
            });
        },
    });
}

/**
 * Delete thread
 */
export function useDeleteThread() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (threadId: string) => {
            const { deleteThread } = await import('@/lib/firestore-threads');
            return deleteThread(threadId);
        },
        onSuccess: (_, threadId) => {
            queryClient.invalidateQueries({
                queryKey: messagingKeys.threads(),
            });
            queryClient.removeQueries({
                queryKey: messagingKeys.thread(threadId),
            });
        },
    });
}
