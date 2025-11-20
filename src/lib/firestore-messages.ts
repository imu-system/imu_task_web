/**
 * Firestore Messages (Messaging System)
 * 
 * This module manages individual messages within threads.
 * Features:
 * - Send text, images, files, audio
 * - Real-time message updates
 * - Read receipts
 * - PII detection warnings
 * - System messages (auto-generated)
 * 
 * @module firestore-messages
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp,
    onSnapshot,
    QuerySnapshot,
    DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Message, MessageType, MessageAttachment } from './types';
export type { Message, MessageType, MessageAttachment } from './types';
import { updateThread, incrementUnreadCount, getThread } from './firestore-threads';

const MESSAGES_COLLECTION = 'messages';

// ============================================================================
// PII Detection (Personally Identifiable Information)
// ============================================================================

const PII_PATTERNS = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?[\d\s.-]{6,}/g,
    // French postal address patterns
    address: /\b\d{1,5}\s+(?:rue|avenue|boulevard|place|allée|impasse|chemin)\s+[a-z\s]+,?\s*\d{5}\s+[a-z\s]+\b/gi,
};

/**
 * Detect if message contains PII
 */
export function detectPII(content: string): boolean {
    return Object.values(PII_PATTERNS).some(pattern => pattern.test(content));
}

// ============================================================================
// Type Converters
// ============================================================================

/**
 * Convert Firestore document to Message type
 */
function firestoreToMessage(id: string, data: DocumentData): Message {
    return {
        id,
        threadId: data.threadId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderPhotoUrl: data.senderPhotoUrl,
        content: data.content || '',
        type: data.type || 'text',
        attachments: data.attachments || [],
        readBy: data.readBy || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        systemMetadata: data.systemMetadata,
        containsPII: data.containsPII || false,
        piiWarningShown: data.piiWarningShown || false,
    };
}

/**
 * Convert Message to Firestore document data
 */
function messageToFirestore(message: Partial<Message>): DocumentData {
    return {
        ...message,
        createdAt: message.createdAt instanceof Date
            ? Timestamp.fromDate(message.createdAt)
            : serverTimestamp(),
        updatedAt: message.updatedAt instanceof Date
            ? Timestamp.fromDate(message.updatedAt)
            : serverTimestamp(),
    };
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Send a message
 */
export type SendMessageInput = {
    threadId?: string;
    conversationId?: string; // alias used by some callers
    senderId: string;
    senderName?: string;
    senderPhotoUrl?: string;
    senderAvatar?: string; // legacy alias
    content: string;
    type?: MessageType;
    attachments?: MessageAttachment[];
    recipientId?: string;
    fileUrl?: string;
};

export async function sendMessage(messageData: SendMessageInput): Promise<string | void> {
    try {
        const threadId = (messageData as any).threadId || (messageData as any).conversationId;
        const thread = await getThread(threadId as string);
        if (!thread) {
            throw new Error('Thread not found');
        }

        // Check for PII
        const containsPII = detectPII(messageData.content);

        const newMessage: Partial<Message> = {
            threadId: threadId as string,
            senderId: messageData.senderId,
            senderName: messageData.senderName,
            senderPhotoUrl: (messageData.senderPhotoUrl || messageData.senderAvatar) as string | undefined,
            content: messageData.content,
            type: (messageData.type || 'text') as MessageType,
            attachments: messageData.attachments || [],
            readBy: [messageData.senderId], // Sender has "read" it
            createdAt: new Date(),
            containsPII,
            piiWarningShown: false,
        };

        // Add message to Firestore
        const docRef = await addDoc(
            collection(db, MESSAGES_COLLECTION),
            messageToFirestore(newMessage)
        );

        // Update thread with last message preview
        await updateThread(messageData.threadId, {
            lastMessage: {
                content: messageData.content.substring(0, 100), // Preview (100 chars)
                senderId: messageData.senderId,
                createdAt: new Date(),
            },
            lastMessageAt: new Date(),
        });

        // Increment unread count for other participants
        await incrementUnreadCount(
            messageData.threadId,
            messageData.senderId,
            thread.participants
        );

        console.log('Message sent:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

/**
 * Send a system message (auto-generated)
 */
export async function sendSystemMessage(
    threadId: string,
    systemData: {
        content: string;
        action: 'offer_accepted' | 'payment_validated' | 'dispute_opened' | 'booking_created';
        relatedId?: string;
    }
): Promise<string> {
    try {
        const newMessage: Partial<Message> = {
            threadId,
            senderId: 'system',
            senderName: 'Système ImuTask',
            content: systemData.content,
            type: 'system' as MessageType,
            readBy: [], // No one has read it yet
            createdAt: new Date(),
            systemMetadata: {
                action: systemData.action,
                relatedId: systemData.relatedId,
            },
        };

        const docRef = await addDoc(
            collection(db, MESSAGES_COLLECTION),
            messageToFirestore(newMessage)
        );

        // Update thread last message
        await updateThread(threadId, {
            lastMessage: {
                content: systemData.content,
                senderId: 'system',
                createdAt: new Date(),
            },
            lastMessageAt: new Date(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error sending system message:', error);
        throw error;
    }
}

/**
 * Get messages for a thread
 */
export async function getThreadMessages(
    threadId: string,
    limitCount: number = 50
): Promise<Message[]> {
    try {
        const q = query(
            collection(db, MESSAGES_COLLECTION),
            where('threadId', '==', threadId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map(doc =>
            firestoreToMessage(doc.id, doc.data())
        );

        // Return in chronological order (oldest first)
        return messages.reverse();
    } catch (error) {
        console.error('Error getting thread messages:', error);
        throw error;
    }
}

/**
 * Get a single message by ID
 */
export async function getMessage(messageId: string): Promise<Message | null> {
    try {
        const docRef = doc(db, MESSAGES_COLLECTION, messageId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return firestoreToMessage(docSnap.id, docSnap.data());
    } catch (error) {
        console.error('Error getting message:', error);
        throw error;
    }
}

/**
 * Mark message as read by user
 */
export async function markMessageAsRead(
    messageId: string,
    userId: string
): Promise<void> {
    try {
        const message = await getMessage(messageId);
        if (!message) return;

        if (message.readBy.includes(userId)) {
            return; // Already read
        }

        const docRef = doc(db, MESSAGES_COLLECTION, messageId);
        await updateDoc(docRef, {
            readBy: [...message.readBy, userId],
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error marking message as read:', error);
        throw error;
    }
}

/**
 * Mark all messages in thread as read by user
 */
export async function markAllMessagesAsRead(
    threadId: string,
    userId: string
): Promise<void> {
    try {
        const messages = await getThreadMessages(threadId, 100);

        const unreadMessages = messages.filter(
            msg => !msg.readBy.includes(userId) && msg.senderId !== userId
        );

        // Update each unread message
        const updatePromises = unreadMessages.map(msg =>
            markMessageAsRead(msg.id, userId)
        );

        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error marking all messages as read:', error);
        throw error;
    }
}

/**
 * Update message (e.g., mark PII warning as shown)
 */
export async function updateMessage(
    messageId: string,
    updates: Partial<Message>
): Promise<void> {
    try {
        const docRef = doc(db, MESSAGES_COLLECTION, messageId);
        await updateDoc(docRef, messageToFirestore(updates));
    } catch (error) {
        console.error('Error updating message:', error);
        throw error;
    }
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

/**
 * Subscribe to messages in a thread (real-time)
 */
export function subscribeToThreadMessages(
    threadId: string,
    callback: (messages: Message[]) => void
): () => void {
    const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('threadId', '==', threadId),
        orderBy('createdAt', 'asc')
    );

    return onSnapshot(
        q,
        (snapshot: QuerySnapshot) => {
            const messages = snapshot.docs.map(doc =>
                firestoreToMessage(doc.id, doc.data())
            );
            callback(messages);
        },
        (error) => {
            console.error('Error subscribing to messages:', error);
            callback([]);
        }
    );
}

/**
 * Subscribe to a single message
 */
export function subscribeToMessage(
    messageId: string,
    callback: (message: Message | null) => void
): () => void {
    const docRef = doc(db, MESSAGES_COLLECTION, messageId);

    return onSnapshot(
        docRef,
        (snapshot) => {
            if (!snapshot.exists()) {
                callback(null);
                return;
            }
            callback(firestoreToMessage(snapshot.id, snapshot.data()));
        },
        (error) => {
            console.error('Error subscribing to message:', error);
            callback(null);
        }
    );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get unread message count for user in a thread
 */
export async function getUnreadMessageCount(
    threadId: string,
    userId: string
): Promise<number> {
    try {
        const messages = await getThreadMessages(threadId, 100);
        return messages.filter(
            msg => !msg.readBy.includes(userId) && msg.senderId !== userId
        ).length;
    } catch (error) {
        console.error('Error getting unread message count:', error);
        return 0;
    }
}

/**
 * Check if user has sent any messages in thread
 */
export async function hasUserSentMessages(
    threadId: string,
    userId: string
): Promise<boolean> {
    try {
        const q = query(
            collection(db, MESSAGES_COLLECTION),
            where('threadId', '==', threadId),
            where('senderId', '==', userId),
            limit(1)
        );

        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking user messages:', error);
        return false;
    }
}

// Backwards-compatible aliases for older imports
export const subscribeToMessages = subscribeToThreadMessages;

export async function markAllAsRead(threadId: string, userId: string): Promise<void> {
    return markAllMessagesAsRead(threadId, userId);
}

