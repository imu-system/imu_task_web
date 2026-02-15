/**
 * Provider Booking Confirmation System
 * 
 * Workflow de confirmation après acceptation d'offre:
 * 1. Client accepte offre → Booking créé avec status 'pending_provider_confirmation'
 * 2. Provider a 24h pour confirmer/refuser
 * 3. Si confirmation → status 'confirmed', notifications envoyées
 * 4. Si refus → booking annulé, remboursement client, pénalité provider
 * 5. Si timeout (>24h) → auto-cancel, remboursement client, pénalité provider
 * 
 * Statuts booking:
 * - pending_provider_confirmation: En attente confirmation provider
 * - confirmed: Provider a confirmé
 * - provider_declined: Provider a refusé
 * - auto_cancelled: Annulé automatiquement (timeout)
 */

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { notifyBookingConfirmed, notifyBookingDeclined } from './firestore-notifications';

export interface ProviderConfirmationResult {
  success: boolean;
  bookingId: string;
  status: 'confirmed' | 'provider_declined';
  message: string;
}

export interface AutoCancelCheckResult {
  cancelled: boolean;
  bookingId: string;
  reason?: string;
}

const CONFIRMATION_DEADLINE_HOURS = 24;

/**
 * Provider confirms a booking
 */
export async function confirmBooking(
  bookingId: string,
  providerId: string
): Promise<ProviderConfirmationResult> {
  try {
    // 1. Get booking
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }

    const booking = bookingSnap.data();

    // 2. Validate provider
    if (booking.providerId !== providerId) {
      throw new Error('Unauthorized: You are not the provider for this booking');
    }

    // 3. Validate status
    if (booking.status !== 'pending_provider_confirmation') {
      throw new Error(`Cannot confirm booking with status: ${booking.status}`);
    }

    // 4. Check if still within deadline
    const createdAt = booking.createdAt?.toDate() || new Date();
    const deadline = new Date(createdAt.getTime() + CONFIRMATION_DEADLINE_HOURS * 60 * 60 * 1000);
    const now = new Date();

    if (now > deadline) {
      throw new Error('Confirmation deadline has passed');
    }

    // 5. Update booking status
    await updateDoc(bookingRef, {
      status: 'confirmed',
      providerConfirmedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 6. Send notifications
    // Determine task title and scheduled date for notification payload
    const taskTitle = booking.taskTitle || (booking.task && booking.task.title) || 'Task';
    const scheduledDate = booking.scheduledDate ? new Date(booking.scheduledDate) : new Date();

    // Notify both client and provider
    await notifyBookingConfirmed(booking.clientId, bookingId, taskTitle, scheduledDate);
    await notifyBookingConfirmed(booking.providerId, bookingId, taskTitle, scheduledDate);

    return {
      success: true,
      bookingId,
      status: 'confirmed',
      message: 'Booking confirmed successfully',
    };
  } catch (error) {
    console.error('Error confirming booking:', error);
    throw error;
  }
}

/**
 * Provider declines a booking
 */
export async function declineBooking(
  bookingId: string,
  providerId: string,
  reason: string
): Promise<ProviderConfirmationResult> {
  try {
    // 1. Get booking
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }

    const booking = bookingSnap.data();

    // 2. Validate provider
    if (booking.providerId !== providerId) {
      throw new Error('Unauthorized: You are not the provider for this booking');
    }

    // 3. Validate status
    if (booking.status !== 'pending_provider_confirmation') {
      throw new Error(`Cannot decline booking with status: ${booking.status}`);
    }

    // 4. Validate reason
    if (!reason || reason.trim().length < 10) {
      throw new Error('Decline reason must be at least 10 characters');
    }

    // 5. Update booking status
    await updateDoc(bookingRef, {
      status: 'provider_declined',
      providerDeclinedAt: serverTimestamp(),
      providerDeclineReason: reason,
      refundAmount: booking.totalAmount || 0,
      refundPercent: 100,
      providerPenalty: calculateProviderPenalty(booking.totalAmount || 0),
      updatedAt: serverTimestamp(),
    });

    // 6. Send notifications
    await notifyBookingDeclined(bookingId, booking.clientId, booking.providerId, reason);

    return {
      success: true,
      bookingId,
      status: 'provider_declined',
      message: 'Booking declined',
    };
  } catch (error) {
    console.error('Error declining booking:', error);
    throw error;
  }
}

/**
 * Check and auto-cancel bookings where provider hasn't confirmed within 24h
 * This should be called by a scheduled Cloud Function
 */
export async function checkAndAutoCancelExpiredBookings(
  bookingId: string
): Promise<AutoCancelCheckResult> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return { cancelled: false, bookingId };
    }

    const booking = bookingSnap.data();

    // Only check bookings pending provider confirmation
    if (booking.status !== 'pending_provider_confirmation') {
      return { cancelled: false, bookingId };
    }

    // Check if deadline passed
    const createdAt = booking.createdAt?.toDate() || new Date();
    const deadline = new Date(createdAt.getTime() + CONFIRMATION_DEADLINE_HOURS * 60 * 60 * 1000);
    const now = new Date();

    if (now <= deadline) {
      return { cancelled: false, bookingId };
    }

    // Auto-cancel
    await updateDoc(bookingRef, {
      status: 'auto_cancelled',
      autoCancelledAt: serverTimestamp(),
      autoCancelReason: 'Provider did not confirm within 24 hours',
      refundAmount: booking.totalAmount || 0,
      refundPercent: 100,
      providerPenalty: calculateProviderPenalty(booking.totalAmount || 0),
      updatedAt: serverTimestamp(),
    });

    // Send notifications
    await notifyBookingDeclined(
      bookingId,
      booking.clientId,
      booking.providerId,
      'Provider did not confirm within 24 hours'
    );

    return {
      cancelled: true,
      bookingId,
      reason: 'Provider confirmation timeout',
    };
  } catch (error) {
    console.error('Error auto-cancelling booking:', error);
    throw error;
  }
}

/**
 * Calculate provider penalty for declining or timeout
 * 10% of booking amount, minimum 5€
 */
function calculateProviderPenalty(bookingAmount: number): number {
  const penalty = bookingAmount * 0.1;
  return Math.max(penalty, 5);
}

/**
 * Get time remaining for provider confirmation
 */
export function getConfirmationTimeRemaining(createdAt: Date): {
  hours: number;
  minutes: number;
  isExpired: boolean;
  deadline: Date;
} {
  const deadline = new Date(createdAt.getTime() + CONFIRMATION_DEADLINE_HOURS * 60 * 60 * 1000);
  const now = new Date();
  const remaining = deadline.getTime() - now.getTime();

  if (remaining <= 0) {
    return {
      hours: 0,
      minutes: 0,
      isExpired: true,
      deadline,
    };
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  return {
    hours,
    minutes,
    isExpired: false,
    deadline,
  };
}

/**
 * Check if booking needs provider confirmation
 */
export function needsProviderConfirmation(booking: {
  status: string;
  createdAt?: Date | Timestamp;
}): boolean {
  if (booking.status !== 'pending_provider_confirmation') {
    return false;
  }

  const createdAt = booking.createdAt instanceof Timestamp
    ? booking.createdAt.toDate()
    : booking.createdAt || new Date();

  const { isExpired } = getConfirmationTimeRemaining(createdAt);
  return !isExpired;
}

/**
 * Get booking confirmation statistics for a provider
 */
export async function getProviderConfirmationStats(providerId: string): Promise<{
  pendingCount: number;
  confirmedCount: number;
  declinedCount: number;
  autoCancelledCount: number;
  confirmationRate: number; // percentage
}> {
  // This would typically query Firestore
  // Placeholder implementation
  return {
    pendingCount: 0,
    confirmedCount: 0,
    declinedCount: 0,
    autoCancelledCount: 0,
    confirmationRate: 0,
  };
}
