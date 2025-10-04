/**
 * Firestore Bookings Library
 * 
 * Provides CRUD operations for bookings collection.
 * A booking is created when a client accepts a proposal.
 * 
 * Status flow:
 * - pending: Booking created, awaiting confirmation
 * - confirmed: Provider confirmed availability
 * - in_progress: Work started
 * - completed: Work finished
 * - cancelled: Booking cancelled by client or provider
 * - disputed: Issue raised, needs resolution
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
    Timestamp,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Booking } from './types';

const COLLECTION_NAME = 'bookings';

/**
 * Create a new booking (called when proposal is accepted)
 */
export async function createBooking(data: {
    taskId: string;
    clientId: string;
    providerId: string;
    proposalId: string;
    amount: number;
    scheduledDate?: Date;
    notes?: string;
}): Promise<string> {
    try {
        const bookingData = {
            taskId: data.taskId,
            clientId: data.clientId,
            providerId: data.providerId,
            proposalId: data.proposalId,
            amount: data.amount,
            status: 'pending' as const,
            scheduledDate: data.scheduledDate ? Timestamp.fromDate(data.scheduledDate) : null,
            notes: data.notes || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), bookingData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw new Error('Failed to create booking');
    }
}

/**
 * Get a single booking by ID
 */
export async function getBooking(bookingId: string): Promise<Booking | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, bookingId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            taskId: data.taskId,
            clientId: data.clientId,
            providerId: data.providerId,
            proposalId: data.proposalId,
            amount: data.amount,
            status: data.status,
            scheduledDate: data.scheduledDate?.toDate(),
            startedAt: data.startedAt?.toDate(),
            completedAt: data.completedAt?.toDate(),
            cancelledAt: data.cancelledAt?.toDate(),
            cancellationReason: data.cancellationReason,
            notes: data.notes,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };
    } catch (error) {
        console.error('Error getting booking:', error);
        throw new Error('Failed to get booking');
    }
}

/**
 * Get all bookings for a specific task
 */
export async function getTaskBookings(taskId: string): Promise<Booking[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('taskId', '==', taskId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                taskId: data.taskId,
                clientId: data.clientId,
                providerId: data.providerId,
                proposalId: data.proposalId,
                amount: data.amount,
                status: data.status,
                scheduledDate: data.scheduledDate?.toDate(),
                startedAt: data.startedAt?.toDate(),
                completedAt: data.completedAt?.toDate(),
                cancelledAt: data.cancelledAt?.toDate(),
                cancellationReason: data.cancellationReason,
                notes: data.notes,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });
    } catch (error) {
        console.error('Error getting task bookings:', error);
        throw new Error('Failed to get task bookings');
    }
}

/**
 * Get all bookings for a client
 */
export async function getClientBookings(clientId: string): Promise<Booking[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('clientId', '==', clientId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                taskId: data.taskId,
                clientId: data.clientId,
                providerId: data.providerId,
                proposalId: data.proposalId,
                amount: data.amount,
                status: data.status,
                scheduledDate: data.scheduledDate?.toDate(),
                startedAt: data.startedAt?.toDate(),
                completedAt: data.completedAt?.toDate(),
                cancelledAt: data.cancelledAt?.toDate(),
                cancellationReason: data.cancellationReason,
                notes: data.notes,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });
    } catch (error) {
        console.error('Error getting client bookings:', error);
        throw new Error('Failed to get client bookings');
    }
}

/**
 * Get all bookings for a provider
 */
export async function getProviderBookings(providerId: string): Promise<Booking[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('providerId', '==', providerId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                taskId: data.taskId,
                clientId: data.clientId,
                providerId: data.providerId,
                proposalId: data.proposalId,
                amount: data.amount,
                status: data.status,
                scheduledDate: data.scheduledDate?.toDate(),
                startedAt: data.startedAt?.toDate(),
                completedAt: data.completedAt?.toDate(),
                cancelledAt: data.cancelledAt?.toDate(),
                cancellationReason: data.cancellationReason,
                notes: data.notes,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });
    } catch (error) {
        console.error('Error getting provider bookings:', error);
        throw new Error('Failed to get provider bookings');
    }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
    bookingId: string,
    status: Booking['status'],
    additionalData?: {
        cancellationReason?: string;
    }
): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, bookingId);
        const updateData: any = {
            status,
            updatedAt: serverTimestamp(),
        };

        // Add timestamp based on status
        if (status === 'in_progress') {
            updateData.startedAt = serverTimestamp();
        } else if (status === 'completed') {
            updateData.completedAt = serverTimestamp();
        } else if (status === 'cancelled') {
            updateData.cancelledAt = serverTimestamp();
            if (additionalData?.cancellationReason) {
                updateData.cancellationReason = additionalData.cancellationReason;
            }
        }

        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw new Error('Failed to update booking status');
    }
}

/**
 * Update booking scheduled date
 */
export async function updateBookingScheduledDate(
    bookingId: string,
    scheduledDate: Date
): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, bookingId);
        await updateDoc(docRef, {
            scheduledDate: Timestamp.fromDate(scheduledDate),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating booking scheduled date:', error);
        throw new Error('Failed to update scheduled date');
    }
}

/**
 * Update booking notes
 */
export async function updateBookingNotes(
    bookingId: string,
    notes: string
): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, bookingId);
        await updateDoc(docRef, {
            notes,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating booking notes:', error);
        throw new Error('Failed to update booking notes');
    }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(
    bookingId: string,
    reason: string
): Promise<void> {
    try {
        await updateBookingStatus(bookingId, 'cancelled', { cancellationReason: reason });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        throw new Error('Failed to cancel booking');
    }
}

/**
 * Delete a booking (admin only, use with caution)
 */
export async function deleteBooking(bookingId: string): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, bookingId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting booking:', error);
        throw new Error('Failed to delete booking');
    }
}

/**
 * Get booking statistics for a user
 */
export async function getUserBookingStats(userId: string, role: 'client' | 'provider') {
    try {
        const bookings = role === 'client'
            ? await getClientBookings(userId)
            : await getProviderBookings(userId);

        const stats = {
            total: bookings.length,
            pending: bookings.filter(b => b.status === 'pending').length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            inProgress: bookings.filter(b => b.status === 'in_progress').length,
            completed: bookings.filter(b => b.status === 'completed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
            disputed: bookings.filter(b => b.status === 'disputed').length,
            totalRevenue: bookings
                .filter(b => b.status === 'completed')
                .reduce((sum, b) => sum + b.amount, 0),
        };

        return stats;
    } catch (error) {
        console.error('Error getting booking stats:', error);
        throw new Error('Failed to get booking stats');
    }
}
