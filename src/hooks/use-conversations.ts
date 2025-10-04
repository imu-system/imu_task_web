/**
 * useConversations Hook
 * 
 * Manages user conversations with real-time updates from Firestore
 * Provides loading states, error handling, and unread count
 */

'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Conversation } from '@/lib/firestore-conversations';
import { getTotalUnreadCount } from '@/lib/firestore-conversations';

interface UseConversationsReturn {
    conversations: Conversation[];
    archivedConversations: Conversation[];
    activeConversations: Conversation[];
    loading: boolean;
    error: string | null;
    totalUnreadCount: number;
    refreshUnreadCount: () => Promise<void>;
}

/**
 * Hook to manage user conversations with real-time updates
 * @param userId - Current user ID
 * @returns Conversations data with loading and error states
 */
export function useConversations(userId: string | undefined): UseConversationsReturn {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);

    // Filter archived and active conversations
    const archivedConversations = conversations.filter(conv =>
        conv.archivedBy?.includes(userId || '')
    );
    const activeConversations = conversations.filter(conv =>
        !conv.archivedBy?.includes(userId || '')
    );

    // Fetch total unread count
    const refreshUnreadCount = async () => {
        if (!userId) return;
        try {
            const count = await getTotalUnreadCount(userId);
            setTotalUnreadCount(count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setConversations([]);
            return;
        }

        setLoading(true);
        setError(null);

        // Set up real-time listener for conversations
        const conversationsRef = collection(db, 'conversations');
        const q = query(
            conversationsRef,
            where('participants', 'array-contains', userId),
            orderBy('lastMessageAt', 'desc')
        );

        let unsubscribe: Unsubscribe;

        try {
            unsubscribe = onSnapshot(
                q,
                (querySnapshot) => {
                    const convs: Conversation[] = [];
                    querySnapshot.forEach((doc) => {
                        convs.push({
                            id: doc.id,
                            ...doc.data(),
                        } as Conversation);
                    });
                    setConversations(convs);
                    setLoading(false);

                    // Refresh unread count when conversations update
                    refreshUnreadCount();
                },
                (err) => {
                    console.error('Error in conversations listener:', err);
                    setError('Failed to load conversations');
                    setLoading(false);
                }
            );
        } catch (err) {
            console.error('Error setting up conversations listener:', err);
            setError('Failed to initialize conversations');
            setLoading(false);
        }

        // Cleanup listener on unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [userId]);

    return {
        conversations,
        archivedConversations,
        activeConversations,
        loading,
        error,
        totalUnreadCount,
        refreshUnreadCount,
    };
}
