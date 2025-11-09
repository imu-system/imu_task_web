'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    deleteDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    addDoc,
    Timestamp,
    writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Message, MessageReaction } from '@/lib/types';

/**
 * Hook pour gérer les réactions sur un message
 */
export function useMessageReactions(messageId: string) {
    const queryClient = useQueryClient();

    const addReaction = useMutation({
        mutationFn: async ({
            emoji,
            userId,
            userName,
        }: {
            emoji: string;
            userId: string;
            userName: string;
        }) => {
            const messageRef = doc(db, 'messages', messageId);
            const reaction: MessageReaction = {
                emoji,
                userId,
                userName,
                createdAt: new Date(),
            };

            await updateDoc(messageRef, {
                reactions: arrayUnion(reaction),
                updatedAt: serverTimestamp(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });

    const removeReaction = useMutation({
        mutationFn: async ({ emoji, userId }: { emoji: string; userId: string }) => {
            const messageRef = doc(db, 'messages', messageId);

            // On doit récupérer toutes les réactions et filtrer
            const messageSnapshot = await getDocs(
                query(collection(db, 'messages'), where('__name__', '==', messageId))
            );

            if (messageSnapshot.empty) return;

            const messageData = messageSnapshot.docs[0].data();
            const reactions = (messageData.reactions || []) as MessageReaction[];
            const updatedReactions = reactions.filter(
                (r) => !(r.emoji === emoji && r.userId === userId)
            );

            await updateDoc(messageRef, {
                reactions: updatedReactions,
                updatedAt: serverTimestamp(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });

    return {
        addReaction,
        removeReaction,
    };
}

/**
 * Hook pour éditer un message
 */
export function useEditMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            messageId,
            newContent,
        }: {
            messageId: string;
            newContent: string;
        }) => {
            const messageRef = doc(db, 'messages', messageId);
            await updateDoc(messageRef, {
                content: newContent,
                isEdited: true,
                editedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

/**
 * Hook pour supprimer un message
 */
export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            messageId,
            deleteForEveryone = false,
        }: {
            messageId: string;
            deleteForEveryone?: boolean;
        }) => {
            if (deleteForEveryone) {
                // Suppression complète
                await deleteDoc(doc(db, 'messages', messageId));
            } else {
                // Soft delete - marquer comme supprimé
                const messageRef = doc(db, 'messages', messageId);
                await updateDoc(messageRef, {
                    isDeleted: true,
                    deletedAt: serverTimestamp(),
                    content: '[Message supprimé]',
                    updatedAt: serverTimestamp(),
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

/**
 * Hook pour épingler/désépingler un message
 */
export function usePinMessage(threadId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            messageId,
            pin = true,
        }: {
            messageId: string;
            pin?: boolean;
        }) => {
            const threadRef = doc(db, 'threads', threadId);

            if (pin) {
                await updateDoc(threadRef, {
                    pinnedMessages: arrayUnion(messageId),
                    updatedAt: serverTimestamp(),
                });
            } else {
                await updateDoc(threadRef, {
                    pinnedMessages: arrayRemove(messageId),
                    updatedAt: serverTimestamp(),
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['threads', threadId] });
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

/**
 * Hook pour marquer un message en favoris
 */
export function useStarMessage(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            messageId,
            star = true,
        }: {
            messageId: string;
            star?: boolean;
        }) => {
            const starredRef = doc(db, 'users', userId, 'starredMessages', messageId);

            if (star) {
                await addDoc(collection(db, 'users', userId, 'starredMessages'), {
                    messageId,
                    starredAt: serverTimestamp(),
                });
            } else {
                await deleteDoc(starredRef);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['starredMessages', userId] });
        },
    });
}

/**
 * Hook pour transférer un message
 */
export function useForwardMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            message,
            toThreadIds,
            senderId,
            senderName,
        }: {
            message: Message;
            toThreadIds: string[];
            senderId: string;
            senderName: string;
        }) => {
            const batch = writeBatch(db);

            for (const threadId of toThreadIds) {
                const messageRef = doc(collection(db, 'messages'));
                batch.set(messageRef, {
                    threadId,
                    senderId,
                    senderName,
                    content: message.content,
                    type: message.type,
                    attachments: message.attachments || [],
                    isForwarded: true,
                    forwardedFrom: {
                        messageId: message.id,
                        originalSenderId: message.senderId,
                        originalSenderName: message.senderName,
                    },
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    status: 'sent',
                });

                // Mettre à jour le thread
                const threadRef = doc(db, 'threads', threadId);
                batch.update(threadRef, {
                    lastMessageContent: message.content,
                    lastMessageTime: serverTimestamp(),
                    lastMessageSenderId: senderId,
                    updatedAt: serverTimestamp(),
                });
            }

            await batch.commit();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            queryClient.invalidateQueries({ queryKey: ['threads'] });
        },
    });
}

/**
 * Hook pour marquer les messages comme lus
 */
export function useMarkMessagesAsRead(threadId: string, userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ messageIds }: { messageIds: string[] }) => {
            const batch = writeBatch(db);

            for (const messageId of messageIds) {
                const messageRef = doc(db, 'messages', messageId);
                batch.update(messageRef, {
                    status: 'read',
                    readAt: serverTimestamp(),
                    readBy: arrayUnion(userId),
                });
            }

            // Mettre à jour le compteur non lu du thread
            const threadRef = doc(db, 'threads', threadId);
            batch.update(threadRef, {
                [`unreadCount.${userId}`]: 0,
                updatedAt: serverTimestamp(),
            });

            await batch.commit();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', threadId] });
            queryClient.invalidateQueries({ queryKey: ['threads', threadId] });
        },
    });
}

/**
 * Hook pour rechercher dans les messages d'une conversation
 */
export function useSearchMessages(threadId: string, searchQuery: string) {
    return useQuery({
        queryKey: ['messages', threadId, 'search', searchQuery],
        queryFn: async () => {
            if (!searchQuery.trim()) return [];

            const messagesRef = collection(db, 'messages');
            const q = query(
                messagesRef,
                where('threadId', '==', threadId),
                where('isDeleted', '!=', true)
            );

            const snapshot = await getDocs(q);
            const messages = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt:
                        doc.data().createdAt instanceof Timestamp
                            ? doc.data().createdAt.toDate()
                            : new Date(doc.data().createdAt),
                }))
                .filter(
                    (msg) =>
                        msg.content &&
                        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
                ) as Message[];

            return messages;
        },
        enabled: !!searchQuery && searchQuery.length > 2,
    });
}

/**
 * Hook pour obtenir les messages épinglés
 */
export function usePinnedMessages(threadId: string) {
    return useQuery({
        queryKey: ['pinnedMessages', threadId],
        queryFn: async () => {
            const threadRef = doc(db, 'threads', threadId);
            const threadSnapshot = await getDocs(
                query(collection(db, 'threads'), where('__name__', '==', threadId))
            );

            if (threadSnapshot.empty) return [];

            const threadData = threadSnapshot.docs[0].data();
            const pinnedMessageIds = (threadData.pinnedMessages || []) as string[];

            if (pinnedMessageIds.length === 0) return [];

            // Récupérer les messages épinglés
            const messagesRef = collection(db, 'messages');
            const messagesQuery = query(
                messagesRef,
                where('__name__', 'in', pinnedMessageIds)
            );

            const messagesSnapshot = await getDocs(messagesQuery);
            return messagesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt:
                    doc.data().createdAt instanceof Timestamp
                        ? doc.data().createdAt.toDate()
                        : new Date(doc.data().createdAt),
            })) as Message[];
        },
    });
}

/**
 * Hook pour obtenir les médias partagés
 */
export function useSharedMedia(threadId: string) {
    return useQuery({
        queryKey: ['sharedMedia', threadId],
        queryFn: async () => {
            const messagesRef = collection(db, 'messages');
            const q = query(
                messagesRef,
                where('threadId', '==', threadId),
                where('type', 'in', ['image', 'file', 'audio'])
            );

            const snapshot = await getDocs(q);
            const media = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: data.type,
                    attachments: data.attachments || [],
                    createdAt:
                        data.createdAt instanceof Timestamp
                            ? data.createdAt.toDate()
                            : new Date(data.createdAt),
                };
            });

            return media;
        },
    });
}

/**
 * Hook pour archiver/désarchiver une conversation
 */
export function useArchiveThread(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            threadId,
            archive = true,
        }: {
            threadId: string;
            archive?: boolean;
        }) => {
            const threadRef = doc(db, 'threads', threadId);
            await updateDoc(threadRef, {
                [`archived.${userId}`]: archive,
                updatedAt: serverTimestamp(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['threads'] });
        },
    });
}

/**
 * Hook pour muter/démuter une conversation
 */
export function useMuteThread(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            threadId,
            mute = true,
            muteUntil,
        }: {
            threadId: string;
            mute?: boolean;
            muteUntil?: Date;
        }) => {
            const threadRef = doc(db, 'threads', threadId);
            await updateDoc(threadRef, {
                [`muted.${userId}`]: mute,
                ...(muteUntil && { [`mutedUntil.${userId}`]: Timestamp.fromDate(muteUntil) }),
                updatedAt: serverTimestamp(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['threads'] });
        },
    });
}
