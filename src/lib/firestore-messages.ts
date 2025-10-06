/**
 * Firestore Messages Library
 * 
 * CRUD operations for messages collection with real-time updates
 * Supports: Send, Read, Delete, Mark as read, Real-time subscriptions
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    Timestamp,
    onSnapshot,
    QueryDocumentSnapshot,
    DocumentData,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    updateConversationLastMessage,
    incrementUnreadCount,
} from './firestore-conversations';
import { notifyNewMessage } from './firestore-notifications';

// ============================================================================
// TYPES
// ============================================================================

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    type: 'text' | 'image' | 'file';
    fileUrl?: string; // For image/file types
    fileName?: string; // For file types
    readBy: string[]; // Array of user IDs who read this message
    deleted: boolean;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

export interface SendMessageInput {
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    type?: 'text' | 'image' | 'file';
    fileUrl?: string;
    fileName?: string;
    recipientId: string; // For incrementing unread count
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Send a new message in a conversation
 * Also updates conversation's lastMessage and increments recipient's unread count
 */
export async function sendMessage(
    input: SendMessageInput
): Promise<string> {
    try {
        const {
            conversationId,
            senderId,
            senderName,
            senderAvatar,
            content,
            type = 'text',
            fileUrl,
            fileName,
            recipientId,
        } = input;

        // Create message
        const messagesRef = collection(db, 'messages');
        const newMessageRef = doc(messagesRef);

        const now = Timestamp.now();
        const messageData: Omit<Message, 'id'> = {
            conversationId,
            senderId,
            senderName,
            ...(senderAvatar && { senderAvatar }),
            content,
            type,
            ...(fileUrl && { fileUrl }),
            ...(fileName && { fileName }),
            readBy: [senderId], // Sender has read it by default
            deleted: false,
            createdAt: now,
        };

        await setDoc(newMessageRef, messageData);

        // Update conversation's last message
        const previewContent = type === 'text'
            ? content.substring(0, 100)
            : type === 'image'
                ? '📷 Image'
                : '📎 File';

        await updateConversationLastMessage(conversationId, previewContent);

        // Increment recipient's unread count
        await incrementUnreadCount(conversationId, recipientId);

        // 🔔 Send notification to recipient
        await notifyNewMessage(
            recipientId,
            senderId,
            senderName,
            previewContent,
            conversationId
        );

        return newMessageRef.id;
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send message');
    }
}

/**
 * Get messages for a conversation
 * Supports pagination with limit and cursor
 */
export async function getConversationMessages(
    conversationId: string,
    messagesLimit: number = 50,
    cursor?: QueryDocumentSnapshot<DocumentData>
): Promise<{ messages: Message[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    try {
        const messagesRef = collection(db, 'messages');
        let q = query(
            messagesRef,
            where('conversationId', '==', conversationId),
            where('deleted', '==', false),
            orderBy('createdAt', 'desc'),
            limit(messagesLimit)
        );

        // Add cursor for pagination
        if (cursor) {
            q = query(q, startAfter(cursor));
        }

        const querySnapshot = await getDocs(q);
        const messages: Message[] = [];

        querySnapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data(),
            } as Message);
        });

        // Get last document for pagination
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

        return { messages, lastDoc };
    } catch (error) {
        console.error('Error getting conversation messages:', error);
        throw new Error('Failed to get messages');
    }
}

/**
 * Mark a message as read by a specific user
 * Adds userId to readBy array if not already present
 */
export async function markAsRead(
    messageId: string,
    userId: string
): Promise<void> {
    try {
        const messageRef = doc(db, 'messages', messageId);
        const messageSnap = await getDoc(messageRef);

        if (!messageSnap.exists()) {
            throw new Error('Message not found');
        }

        const messageData = messageSnap.data() as Message;

        // Only update if user hasn't read it yet
        if (!messageData.readBy.includes(userId)) {
            await updateDoc(messageRef, {
                readBy: [...messageData.readBy, userId],
                updatedAt: Timestamp.now(),
            });
        }
    } catch (error) {
        console.error('Error marking message as read:', error);
        throw new Error('Failed to mark message as read');
    }
}

/**
 * Mark all messages in a conversation as read by a specific user
 * Efficient batch operation for when user opens a conversation
 */
export async function markAllAsRead(
    conversationId: string,
    userId: string
): Promise<void> {
    try {
        const messagesRef = collection(db, 'messages');
        const q = query(
            messagesRef,
            where('conversationId', '==', conversationId),
            where('deleted', '==', false)
        );

        const querySnapshot = await getDocs(q);
        const updatePromises: Promise<void>[] = [];

        querySnapshot.forEach((docSnapshot) => {
            const messageData = docSnapshot.data() as Message;

            // Only update if user hasn't read it yet
            if (!messageData.readBy.includes(userId)) {
                const messageRef = doc(db, 'messages', docSnapshot.id);
                updatePromises.push(
                    updateDoc(messageRef, {
                        readBy: [...messageData.readBy, userId],
                        updatedAt: Timestamp.now(),
                    })
                );
            }
        });

        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error marking all messages as read:', error);
        throw new Error('Failed to mark all messages as read');
    }
}

/**
 * Soft delete a message
 * Sets deleted flag instead of actually removing from database
 */
export async function deleteMessage(messageId: string): Promise<void> {
    try {
        const messageRef = doc(db, 'messages', messageId);
        await updateDoc(messageRef, {
            deleted: true,
            content: '[Message deleted]',
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        throw new Error('Failed to delete message');
    }
}

/**
 * Hard delete a message (permanently remove from database)
 * Use with caution - only for admin/moderation purposes
 */
export async function hardDeleteMessage(messageId: string): Promise<void> {
    try {
        const messageRef = doc(db, 'messages', messageId);
        await deleteDoc(messageRef);
    } catch (error) {
        console.error('Error hard deleting message:', error);
        throw new Error('Failed to hard delete message');
    }
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to real-time updates for messages in a conversation
 * Returns unsubscribe function to clean up listener
 */
export function subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void,
    messagesLimit: number = 50
): Unsubscribe {
    try {
        const messagesRef = collection(db, 'messages');
        const q = query(
            messagesRef,
            where('conversationId', '==', conversationId),
            where('deleted', '==', false),
            orderBy('createdAt', 'desc'),
            limit(messagesLimit)
        );

        return onSnapshot(
            q,
            (querySnapshot) => {
                const messages: Message[] = [];
                querySnapshot.forEach((doc) => {
                    messages.push({
                        id: doc.id,
                        ...doc.data(),
                    } as Message);
                });
                callback(messages);
            },
            (error) => {
                console.error('Error in messages subscription:', error);
            }
        );
    } catch (error) {
        console.error('Error subscribing to messages:', error);
        throw new Error('Failed to subscribe to messages');
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get unread message count for a specific conversation and user
 */
export async function getUnreadMessageCount(
    conversationId: string,
    userId: string
): Promise<number> {
    try {
        const messagesRef = collection(db, 'messages');
        const q = query(
            messagesRef,
            where('conversationId', '==', conversationId),
            where('deleted', '==', false)
        );

        const querySnapshot = await getDocs(q);
        let unreadCount = 0;

        querySnapshot.forEach((doc) => {
            const messageData = doc.data() as Message;
            if (!messageData.readBy.includes(userId)) {
                unreadCount++;
            }
        });

        return unreadCount;
    } catch (error) {
        console.error('Error getting unread message count:', error);
        return 0;
    }
}

/**
 * Check if a message has been read by a specific user
 */
export function isMessageRead(message: Message, userId: string): boolean {
    return message.readBy.includes(userId);
}

/**
 * Get the last message in a conversation
 */
export async function getLastMessage(
    conversationId: string
): Promise<Message | null> {
    try {
        const messagesRef = collection(db, 'messages');
        const q = query(
            messagesRef,
            where('conversationId', '==', conversationId),
            where('deleted', '==', false),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data(),
        } as Message;
    } catch (error) {
        console.error('Error getting last message:', error);
        return null;
    }
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export function formatMessageTime(timestamp: Timestamp): string {
    const now = new Date();
    const messageDate = timestamp.toDate();
    const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        // Return formatted date for older messages
        return messageDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    }
}
