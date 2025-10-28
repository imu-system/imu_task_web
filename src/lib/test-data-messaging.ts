/**
 * Utilitaires pour créer des données de test pour la messagerie
 * USAGE: Dans la console Firebase ou via un script temporaire
 */

import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    setDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageType, ThreadStatus } from '@/lib/types';

/**
 * Crée un thread de test entre deux utilisateurs
 * 
 * @example
 * // Dans la console navigateur :
 * import { createTestThread } from '@/lib/test-data-messaging';
 * await createTestThread('user1-id', 'user2-id');
 */
export async function createTestThread(
    userId1: string,
    userId2: string,
    options?: {
        taskId?: string;
        bookingId?: string;
        withMessages?: boolean;
    }
) {
    try {
        // 1. Créer le thread
        const threadRef = await addDoc(collection(db, 'threads'), {
            participants: [userId1, userId2],
            participantsData: {
                [userId1]: {
                    id: userId1,
                    name: 'Utilisateur Test 1',
                    email: 'test1@example.com',
                    photoUrl: null,
                },
                [userId2]: {
                    id: userId2,
                    name: 'Utilisateur Test 2',
                    email: 'test2@example.com',
                    photoUrl: null,
                },
            },
            taskId: options?.taskId || null,
            bookingId: options?.bookingId || null,
            status: ThreadStatus.active,
            unreadCount: {
                [userId1]: 0,
                [userId2]: 0,
            },
            typingUsers: [],
            lastMessage: 'Bonjour ! Comment allez-vous ?',
            lastMessageAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Thread créé:', threadRef.id);

        // 2. Créer des messages si demandé
        if (options?.withMessages) {
            const messages = [
                {
                    threadId: threadRef.id,
                    senderId: userId1,
                    type: MessageType.text,
                    content: 'Bonjour ! Comment allez-vous ?',
                    isRead: false,
                    readBy: [],
                    containsPII: false,
                    createdAt: serverTimestamp(),
                },
                {
                    threadId: threadRef.id,
                    senderId: userId2,
                    type: MessageType.text,
                    content: 'Très bien, merci ! Et vous ?',
                    isRead: false,
                    readBy: [],
                    containsPII: false,
                    createdAt: serverTimestamp(),
                },
                {
                    threadId: threadRef.id,
                    senderId: userId1,
                    type: MessageType.text,
                    content: 'Parfait ! Je voulais discuter du projet...',
                    isRead: false,
                    readBy: [],
                    containsPII: false,
                    createdAt: serverTimestamp(),
                },
            ];

            for (const message of messages) {
                await addDoc(collection(db, 'messages'), message);
            }

            console.log(`✅ ${messages.length} messages créés`);
        }

        return threadRef.id;
    } catch (error) {
        console.error('❌ Erreur création thread test:', error);
        throw error;
    }
}

/**
 * Crée plusieurs threads de test pour différents scénarios
 */
export async function createMultipleTestThreads(userId: string) {
    const testUsers = [
        { id: 'test-user-1', name: 'Alice Martin', email: 'alice@example.com' },
        { id: 'test-user-2', name: 'Bob Dupont', email: 'bob@example.com' },
        { id: 'test-user-3', name: 'Clara Bernard', email: 'clara@example.com' },
        { id: 'test-user-4', name: 'David Petit', email: 'david@example.com' },
    ];

    console.log('🚀 Création de threads de test...');

    for (const user of testUsers) {
        await createTestThread(userId, user.id, { withMessages: true });
        // Délai pour éviter les problèmes de timestamp
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('✅ Tous les threads de test créés !');
}

/**
 * Nettoie tous les threads de test
 * ⚠️ ATTENTION: Supprime TOUS les threads !
 */
export async function cleanupTestThreads() {
    console.warn('⚠️ Cette fonction n\'est pas implémentée pour éviter les suppressions accidentelles.');
    console.log('Pour nettoyer, utilisez la console Firebase directement.');
}

/**
 * Vérifie l'état de la base de données
 */
export async function checkMessagingData() {
    try {
        const threadsSnapshot = await getDocs(collection(db, 'threads'));
        const messagesSnapshot = await getDocs(collection(db, 'messages'));

        console.log('📊 État de la base de données:');
        console.log(`  - Threads: ${threadsSnapshot.size}`);
        console.log(`  - Messages: ${messagesSnapshot.size}`);

        return {
            threadsCount: threadsSnapshot.size,
            messagesCount: messagesSnapshot.size,
        };
    } catch (error) {
        console.error('❌ Erreur vérification données:', error);
        throw error;
    }
}

// Importer getDocs
import { getDocs } from 'firebase/firestore';
