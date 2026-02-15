/**
 * useMessages Hook
 * 
 * Manages messages in a conversation with real-time updates
 * Provides send, mark as read, and pagination functionality
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Message } from '@/lib/firestore-messages';
import {
    subscribeToMessages,
    sendMessage as sendMessageFn,
    markAllAsRead as markAllAsReadFn,
    type SendMessageInput,
} from '@/lib/firestore-messages';
import { MessageType } from '@/lib/types';
import { resetUnreadCount } from '@/lib/firestore-conversations';

interface UseMessagesReturn {
    messages: Message[];
    loading: boolean;
    error: string | null;
    sending: boolean;
    sendMessage: (content: string, imageUrl?: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

interface UseMessagesProps {
    conversationId: string | null;
    currentUserId: string | undefined;
    currentUserName: string;
    currentUserAvatar?: string;
    recipientId: string | undefined;
}

/**
 * Hook to manage messages in a conversation with real-time updates
 * @param props - Configuration including conversation ID and user info
 * @returns Messages data with send and mark as read functions
 */
export function useMessages({
    conversationId,
    currentUserId,
    currentUserName,
    currentUserAvatar,
    recipientId,
}: UseMessagesProps): UseMessagesReturn {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    // Subscribe to real-time messages
    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const unsubscribe = subscribeToMessages(
            conversationId,
            (newMessages) => {
                // Reverse to show oldest first
                setMessages([...newMessages].reverse());
                setLoading(false);
            }
        );

        // Cleanup listener on unmount
        return () => {
            unsubscribe();
        };
    }, [conversationId]);

    // Mark all messages as read when conversation is opened
    useEffect(() => {
        if (conversationId && currentUserId) {
            markAllAsReadFn(conversationId, currentUserId).catch((err) => {
                console.error('Error marking messages as read:', err);
            });

            // Also reset unread count in conversation
            resetUnreadCount(conversationId, currentUserId).catch((err) => {
                console.error('Error resetting unread count:', err);
            });
        }
    }, [conversationId, currentUserId]);

    // Send a new message
    const sendMessage = useCallback(
        async (content: string, imageUrl?: string) => {
            if (!conversationId || !currentUserId || !recipientId) {
                return;
            }

            // Require either content or imageUrl
            if (!content.trim() && !imageUrl) {
                return;
            }

            setSending(true);
            setError(null);

            try {
                const input: SendMessageInput = {
                    conversationId,
                    senderId: currentUserId,
                    senderName: currentUserName,
                    senderAvatar: currentUserAvatar,
                    content: content.trim() || '📷 Image',
                    type: imageUrl ? MessageType.image : MessageType.text,
                    recipientId,
                    ...(imageUrl && { fileUrl: imageUrl }),
                };

                await sendMessageFn(input);
            } catch (err) {
                console.error('Error sending message:', err);
                setError('Failed to send message');
            } finally {
                setSending(false);
            }
        },
        [conversationId, currentUserId, currentUserName, currentUserAvatar, recipientId]
    );

    // Mark all messages as read
    const markAllAsRead = useCallback(async () => {
        if (!conversationId || !currentUserId) {
            return;
        }

        try {
            await markAllAsReadFn(conversationId, currentUserId);
            await resetUnreadCount(conversationId, currentUserId);
        } catch (err) {
            console.error('Error marking all messages as read:', err);
        }
    }, [conversationId, currentUserId]);

    return {
        messages,
        loading,
        error,
        sending,
        sendMessage,
        markAllAsRead,
    };
}
