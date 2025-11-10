/**
 * Firestore Threads (Messaging System)
 * 
 * This module manages the messaging threads (conversations) between users.
 * Threads are automatically created when:
 * - A booking is confirmed (client + provider)
 * - A user initiates a conversation from a profile
 * 
 * @module firestore-threads
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp,
    onSnapshot,
    QuerySnapshot,
    DocumentData,
    writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Thread, ThreadStatus, Message, MessageType } from './types';

const THREADS_COLLECTION = 'threads';
const MESSAGES_COLLECTION = 'messages';

// ============================================================================
// Type Converters
// ============================================================================

/**
 * Convert Firestore document to Thread type
 */
function firestoreToThread(id: string, data: DocumentData): Thread {
    return {
        id,
        participants: data.participants || [],
        participantsData: data.participantsData || {},
        taskId: data.taskId,
        taskTitle: data.taskTitle,
        bookingId: data.bookingId,
        bookingStatus: data.bookingStatus,
        lastMessage: data.lastMessage ? {
            content: data.lastMessage.content,
            senderId: data.lastMessage.senderId,
            createdAt: data.lastMessage.createdAt?.toDate() || new Date(),
        } : undefined,
        lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
        unreadCount: data.unreadCount || {},
        status: data.status || 'active',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        typingUsers: data.typingUsers || [],
    };
}

/**
 * Convert Thread to Firestore document data
 */
function threadToFirestore(thread: Partial<Thread>): DocumentData {
    const data: DocumentData = {
        ...thread,
        createdAt: thread.createdAt instanceof Date
            ? Timestamp.fromDate(thread.createdAt)
            : serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    if (thread.lastMessage) {
        data.lastMessage = {
            ...thread.lastMessage,
            createdAt: thread.lastMessage.createdAt instanceof Date
                ? Timestamp.fromDate(thread.lastMessage.createdAt)
                : serverTimestamp(),
        };
    }

    if (thread.lastMessageAt instanceof Date) {
        data.lastMessageAt = Timestamp.fromDate(thread.lastMessageAt);
    }

    return data;
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new thread
 * Auto-called when a booking is created or user initiates conversation
 */
export async function createThread(threadData: {
    participants: string[];
    participantsData?: Thread['participantsData'];
    taskId?: string;
    taskTitle?: string;
    bookingId?: string;
    bookingStatus?: string;
}): Promise<string> {
    try {
        // Check if thread already exists between these participants
        const existingThread = await findThreadByParticipants(threadData.participants);
        if (existingThread) {
            console.log('Thread already exists:', existingThread.id);
            return existingThread.id;
        }

        const newThread: Partial<Thread> = {
            participants: threadData.participants,
            participantsData: threadData.participantsData || {},
            taskId: threadData.taskId,
            taskTitle: threadData.taskTitle,
            bookingId: threadData.bookingId,
            bookingStatus: threadData.bookingStatus as any,
            lastMessageAt: new Date(),
            unreadCount: threadData.participants.reduce((acc, userId) => {
                acc[userId] = 0;
                return acc;
            }, {} as { [key: string]: number }),
            status: 'active' as ThreadStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = await addDoc(
            collection(db, THREADS_COLLECTION),
            threadToFirestore(newThread)
        );

        console.log('Thread created:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error creating thread:', error);
        throw error;
    }
}

/**
 * Find thread by participants (for deduplication)
 */
export async function findThreadByParticipants(
    participants: string[]
): Promise<Thread | null> {
    try {
        const sortedParticipants = [...participants].sort();

        const q = query(
            collection(db, THREADS_COLLECTION),
            where('participants', '==', sortedParticipants),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return firestoreToThread(doc.id, doc.data());
    } catch (error) {
        console.error('Error finding thread:', error);
        return null;
    }
}

/**
 * Get thread by ID
 */
export async function getThread(threadId: string): Promise<Thread | null> {
    try {
        const docRef = doc(db, THREADS_COLLECTION, threadId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return firestoreToThread(docSnap.id, docSnap.data());
    } catch (error) {
        console.error('Error getting thread:', error);
        throw error;
    }
}

/**
 * Get all threads for a user
 */
export async function getUserThreads(
    userId: string,
    filters?: {
        status?: ThreadStatus;
        onlyUnread?: boolean;
    }
): Promise<Thread[]> {
    try {
        let q = query(
            collection(db, THREADS_COLLECTION),
            where('participants', 'array-contains', userId),
            orderBy('lastMessageAt', 'desc')
        );

        const snapshot = await getDocs(q);
        let threads = snapshot.docs.map(doc =>
            firestoreToThread(doc.id, doc.data())
        );

        // Apply filters
        if (filters?.status) {
            threads = threads.filter(t => t.status === filters.status);
        }

        if (filters?.onlyUnread) {
            threads = threads.filter(t => (t.unreadCount[userId] || 0) > 0);
        }

        return threads;
    } catch (error) {
        console.error('Error getting user threads:', error);
        return []; // Return empty array instead of throwing to prevent loading state lock
    }
}

/**
 * Update thread (e.g., mark as archived, update last message)
 */
export async function updateThread(
    threadId: string,
    updates: Partial<Thread>
): Promise<void> {
    try {
        const docRef = doc(db, THREADS_COLLECTION, threadId);
        await updateDoc(docRef, threadToFirestore(updates));
    } catch (error) {
        console.error('Error updating thread:', error);
        throw error;
    }
}

/**
 * Mark thread as read for a specific user
 */
export async function markThreadAsRead(
    threadId: string,
    userId: string
): Promise<void> {
    try {
        const docRef = doc(db, THREADS_COLLECTION, threadId);
        await updateDoc(docRef, {
            [`unreadCount.${userId}`]: 0,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error marking thread as read:', error);
        throw error;
    }
}

/**
 * Increment unread count for recipients
 */
export async function incrementUnreadCount(
    threadId: string,
    senderId: string,
    allParticipants: string[]
): Promise<void> {
    try {
        const thread = await getThread(threadId);
        if (!thread) return;

        const updates: { [key: string]: any } = {
            updatedAt: serverTimestamp(),
        };

        // Increment unread for all participants except sender
        allParticipants
            .filter(p => p !== senderId)
            .forEach(participantId => {
                const currentCount = thread.unreadCount[participantId] || 0;
                updates[`unreadCount.${participantId}`] = currentCount + 1;
            });

        const docRef = doc(db, THREADS_COLLECTION, threadId);
        await updateDoc(docRef, updates);
    } catch (error) {
        console.error('Error incrementing unread count:', error);
        throw error;
    }
}

/**
 * Archive thread
 */
export async function archiveThread(threadId: string): Promise<void> {
    try {
        await updateThread(threadId, { status: 'archived' as ThreadStatus });
    } catch (error) {
        console.error('Error archiving thread:', error);
        throw error;
    }
}

/**
 * Unarchive thread
 */
export async function unarchiveThread(threadId: string): Promise<void> {
    try {
        await updateThread(threadId, { status: 'active' as ThreadStatus });
    } catch (error) {
        console.error('Error unarchiving thread:', error);
        throw error;
    }
}

/**
 * Delete thread (admin only)
 */
export async function deleteThread(threadId: string): Promise<void> {
    try {
        // Delete all messages in thread first
        const messagesQuery = query(
            collection(db, MESSAGES_COLLECTION),
            where('threadId', '==', threadId)
        );
        const messagesSnapshot = await getDocs(messagesQuery);

        const batch = writeBatch(db);
        messagesSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Delete thread
        const threadRef = doc(db, THREADS_COLLECTION, threadId);
        batch.delete(threadRef);

        await batch.commit();
        console.log('Thread and messages deleted:', threadId);
    } catch (error) {
        console.error('Error deleting thread:', error);
        throw error;
    }
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

/**
 * Subscribe to thread updates
 */
export function subscribeToThread(
    threadId: string,
    callback: (thread: Thread | null) => void
): () => void {
    const docRef = doc(db, THREADS_COLLECTION, threadId);

    return onSnapshot(
        docRef,
        (snapshot) => {
            if (!snapshot.exists()) {
                callback(null);
                return;
            }
            callback(firestoreToThread(snapshot.id, snapshot.data()));
        },
        (error) => {
            console.error('Error subscribing to thread:', error);
            callback(null);
        }
    );
}

/**
 * Subscribe to user's threads
 */
export function subscribeToUserThreads(
    userId: string,
    callback: (threads: Thread[]) => void
): () => void {
    console.log('🔥 subscribeToUserThreads called with userId:', userId);

    // Check Firebase Auth state
    import('@/lib/firebase').then(({ auth }) => {
        console.log('🔥 Firebase Auth currentUser:', auth.currentUser?.uid);
        console.log('🔥 Firebase Auth user matches?', auth.currentUser?.uid === userId);
    });

    const q = query(
        collection(db, THREADS_COLLECTION),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
    );

    console.log('🔥 Query created, setting up onSnapshot...');

    return onSnapshot(
        q,
        (snapshot: QuerySnapshot) => {
            console.log('✅ onSnapshot SUCCESS! Got', snapshot.docs.length, 'threads');
            const threads = snapshot.docs.map(doc =>
                firestoreToThread(doc.id, doc.data())
            );
            callback(threads);
        },
        (error) => {
            console.error('❌ onSnapshot ERROR:', error);
            console.error('❌ Error code:', error.code);
            console.error('❌ Error message:', error.message);
            console.error('❌ Full error:', JSON.stringify(error, null, 2));
            callback([]);
        }
    );
}

// ============================================================================
// Typing Indicators
// ============================================================================

/**
 * Set user typing status
 */
export async function setTypingStatus(
    threadId: string,
    userId: string,
    isTyping: boolean
): Promise<void> {
    try {
        const thread = await getThread(threadId);
        if (!thread) return;

        let typingUsers = thread.typingUsers || [];

        if (isTyping && !typingUsers.includes(userId)) {
            typingUsers.push(userId);
        } else if (!isTyping) {
            typingUsers = typingUsers.filter(id => id !== userId);
        }

        await updateThread(threadId, { typingUsers });
    } catch (error) {
        console.error('Error setting typing status:', error);
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get total unread count for user (across all threads)
 */
export async function getTotalUnreadCount(userId: string): Promise<number> {
    try {
        const threads = await getUserThreads(userId);
        return threads.reduce((total, thread) => {
            return total + (thread.unreadCount[userId] || 0);
        }, 0);
    } catch (error) {
        console.error('Error getting total unread count:', error);
        return 0;
    }
}

/**
 * Search threads by task title or participant name
 */
export async function searchThreads(
    userId: string,
    searchQuery: string
): Promise<Thread[]> {
    try {
        const threads = await getUserThreads(userId);
        const lowerQuery = searchQuery.toLowerCase();

        return threads.filter(thread => {
            // Search in task title
            if (thread.taskTitle?.toLowerCase().includes(lowerQuery)) {
                return true;
            }

            // Search in participant names
            const participantNames = Object.values(thread.participantsData || {})
                .map(p => p.displayName.toLowerCase());

            return participantNames.some(name => name.includes(lowerQuery));
        });
    } catch (error) {
        console.error('Error searching threads:', error);
        return [];
    }
}
