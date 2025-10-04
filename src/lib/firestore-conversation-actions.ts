import {
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Archive a conversation for a specific user
 * Adds userId to the archivedBy array
 */
export async function archiveConversation(
    conversationId: string,
    userId: string
): Promise<void> {
    try {
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
            archivedBy: arrayUnion(userId),
            updatedAt: Timestamp.now(),
        });
        console.log('Conversation archived successfully');
    } catch (error) {
        console.error('Error archiving conversation:', error);
        throw error;
    }
}

/**
 * Unarchive a conversation for a specific user
 * Removes userId from the archivedBy array
 */
export async function unarchiveConversation(
    conversationId: string,
    userId: string
): Promise<void> {
    try {
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
            archivedBy: arrayRemove(userId),
            updatedAt: Timestamp.now(),
        });
        console.log('Conversation unarchived successfully');
    } catch (error) {
        console.error('Error unarchiving conversation:', error);
        throw error;
    }
}

/**
 * Check if a conversation is archived for a specific user
 */
export function isConversationArchived(
    archivedBy: string[] | undefined,
    userId: string
): boolean {
    return archivedBy?.includes(userId) || false;
}

/**
 * Mute a conversation for a specific user
 * Adds userId to the mutedBy array
 */
export async function muteConversation(
    conversationId: string,
    userId: string
): Promise<void> {
    try {
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
            mutedBy: arrayUnion(userId),
            updatedAt: Timestamp.now(),
        });
        console.log('Conversation muted successfully');
    } catch (error) {
        console.error('Error muting conversation:', error);
        throw error;
    }
}

/**
 * Unmute a conversation for a specific user
 * Removes userId from the mutedBy array
 */
export async function unmuteConversation(
    conversationId: string,
    userId: string
): Promise<void> {
    try {
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
            mutedBy: arrayRemove(userId),
            updatedAt: Timestamp.now(),
        });
        console.log('Conversation unmuted successfully');
    } catch (error) {
        console.error('Error unmuting conversation:', error);
        throw error;
    }
}

/**
 * Check if a conversation is muted for a specific user
 */
export function isConversationMuted(
    mutedBy: string[] | undefined,
    userId: string
): boolean {
    return mutedBy?.includes(userId) || false;
}
