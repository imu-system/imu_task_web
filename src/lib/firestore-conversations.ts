/**
 * Firestore Conversations Library
 * 
 * CRUD operations for conversations collection with real-time updates
 * Supports: Create, Read, Update conversation metadata
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    arrayUnion,
    increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================================================
// TYPES
// ============================================================================

export interface Conversation {
    id: string;
    participants: string[]; // Array of user IDs
    participantNames: { [userId: string]: string }; // Map userId -> displayName
    participantAvatars?: { [userId: string]: string }; // Map userId -> avatarUrl
    lastMessage: string;
    lastMessageAt: Timestamp;
    unreadCount: { [userId: string]: number }; // Map userId -> unread count
    bookingId?: string; // Optional link to booking
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CreateConversationInput {
    userId1: string;
    userName1: string;
    userAvatar1?: string;
    userId2: string;
    userName2: string;
    userAvatar2?: string;
    bookingId?: string;
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Create a new conversation between two users
 * Checks if conversation already exists before creating
 */
export async function createConversation(
    input: CreateConversationInput
): Promise<string> {
    try {
        const { userId1, userName1, userAvatar1, userId2, userName2, userAvatar2, bookingId } = input;

        // Check if conversation already exists between these users
        const existingConv = await findConversationBetweenUsers(userId1, userId2);
        if (existingConv) {
            return existingConv.id;
        }

        // Create new conversation
        const conversationsRef = collection(db, 'conversations');
        const newConversationRef = doc(conversationsRef);

        const now = Timestamp.now();
        const participantNames: { [key: string]: string } = {
            [userId1]: userName1,
            [userId2]: userName2,
        };
        const participantAvatars: { [key: string]: string } = {};
        if (userAvatar1) participantAvatars[userId1] = userAvatar1;
        if (userAvatar2) participantAvatars[userId2] = userAvatar2;

        const conversationData: Omit<Conversation, 'id'> = {
            participants: [userId1, userId2],
            participantNames,
            participantAvatars,
            lastMessage: '',
            lastMessageAt: now,
            unreadCount: {
                [userId1]: 0,
                [userId2]: 0,
            },
            ...(bookingId && { bookingId }),
            createdAt: now,
            updatedAt: now,
        };

        await setDoc(newConversationRef, conversationData);
        return newConversationRef.id;
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw new Error('Failed to create conversation');
    }
}

/**
 * Get a conversation by ID
 */
export async function getConversation(
    conversationId: string
): Promise<Conversation | null> {
    try {
        const conversationRef = doc(db, 'conversations', conversationId);
        const conversationSnap = await getDoc(conversationRef);

        if (!conversationSnap.exists()) {
            return null;
        }

        return {
            id: conversationSnap.id,
            ...conversationSnap.data(),
        } as Conversation;
    } catch (error) {
        console.error('Error getting conversation:', error);
        throw new Error('Failed to get conversation');
    }
}

/**
 * Get all conversations for a user
 * Ordered by lastMessageAt descending (most recent first)
 */
export async function getUserConversations(
    userId: string
): Promise<Conversation[]> {
    try {
        const conversationsRef = collection(db, 'conversations');
        const q = query(
            conversationsRef,
            where('participants', 'array-contains', userId),
            orderBy('lastMessageAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const conversations: Conversation[] = [];

        querySnapshot.forEach((doc) => {
            conversations.push({
                id: doc.id,
                ...doc.data(),
            } as Conversation);
        });

        return conversations;
    } catch (error) {
        console.error('Error getting user conversations:', error);
        throw new Error('Failed to get user conversations');
    }
}

/**
 * Update conversation's last message metadata
 * Called after sending a message
 */
export async function updateConversationLastMessage(
    conversationId: string,
    lastMessage: string
): Promise<void> {
    try {
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
            lastMessage,
            lastMessageAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error updating conversation last message:', error);
        throw new Error('Failed to update conversation');
    }
}

/**
 * Increment unread count for a specific user
 * Called when a message is sent to this user
 */
export async function incrementUnreadCount(
    conversationId: string,
    userId: string
): Promise<void> {
    try {
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
            [`unreadCount.${userId}`]: increment(1),
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error incrementing unread count:', error);
        throw new Error('Failed to increment unread count');
    }
}

/**
 * Reset unread count for a specific user to 0
 * Called when user opens/views the conversation
 */
export async function resetUnreadCount(
    conversationId: string,
    userId: string
): Promise<void> {
    try {
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
            [`unreadCount.${userId}`]: 0,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error resetting unread count:', error);
        throw new Error('Failed to reset unread count');
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find existing conversation between two users
 * Used to prevent duplicate conversations
 */
async function findConversationBetweenUsers(
    userId1: string,
    userId2: string
): Promise<Conversation | null> {
    try {
        const conversationsRef = collection(db, 'conversations');
        const q = query(
            conversationsRef,
            where('participants', 'array-contains', userId1)
        );

        const querySnapshot = await getDocs(q);

        // Filter to find conversation that contains both users
        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            if (data.participants.includes(userId2)) {
                return {
                    id: doc.id,
                    ...data,
                } as Conversation;
            }
        }

        return null;
    } catch (error) {
        console.error('Error finding conversation between users:', error);
        return null;
    }
}

/**
 * Get total unread messages count for a user
 * Sums unread counts across all conversations
 */
export async function getTotalUnreadCount(userId: string): Promise<number> {
    try {
        const conversations = await getUserConversations(userId);
        return conversations.reduce((total, conv) => {
            return total + (conv.unreadCount[userId] || 0);
        }, 0);
    } catch (error) {
        console.error('Error getting total unread count:', error);
        return 0;
    }
}

/**
 * Get other participant's info from conversation
 * Useful for displaying conversation title/avatar
 */
export function getOtherParticipant(
    conversation: Conversation,
    currentUserId: string
): { id: string; name: string; avatar?: string } | null {
    const otherUserId = conversation.participants.find(id => id !== currentUserId);
    if (!otherUserId) return null;

    return {
        id: otherUserId,
        name: conversation.participantNames[otherUserId] || 'Unknown',
        avatar: conversation.participantAvatars?.[otherUserId],
    };
}
