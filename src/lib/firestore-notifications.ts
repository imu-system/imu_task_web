// src/lib/firestore-notifications.ts
/**
 * Firestore helpers for the notification system
 * Handles CRUD operations for notifications collection
 */

import {
    collection,
    addDoc,
    updateDoc,
    doc,
    Timestamp,
    query,
    where,
    orderBy,
    getDocs,
    writeBatch,
    limit,
} from 'firebase/firestore';
import { db } from './firebase';
import {
    NotificationType,
    NotificationCategory,
    NotificationPriority,
    CreateNotificationParams,
    NotificationDocument,
} from './types/notifications';

/**
 * Create a new notification in Firestore
 * @param params Notification parameters
 * @returns Promise with the created notification ID
 */
export async function createNotification(params: CreateNotificationParams): Promise<string> {
    const {
        userId,
        type,
        title,
        body,
        data = {},
        category,
        priority = NotificationPriority.NORMAL,
        actionUrl,
        icon,
        expiresInDays,
    } = params;

    // Calculate expiration date if specified
    const expiresAt = expiresInDays
        ? Timestamp.fromDate(new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000))
        : null;

    const notificationDoc: NotificationDocument = {
        userId,
        type,
        title,
        body,
        data,
        category,
        priority,
        read: false,
        shown: false,
        createdAt: Timestamp.now(),
        ...(actionUrl && { actionUrl }),
        ...(icon && { icon }),
        ...(expiresAt && { expiresAt }),
    };

    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, notificationDoc);

    console.log(`✅ Notification created: ${docRef.id} (type: ${type})`);
    return docRef.id;
}

/**
 * Mark a notification as read
 * @param notificationId Notification ID
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, {
        read: true,
        readAt: Timestamp.now(),
    });
}

/**
 * Mark a notification as shown (toast displayed)
 * @param notificationId Notification ID
 */
export async function markNotificationAsShown(notificationId: string): Promise<void> {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { shown: true });
}

/**
 * Mark all notifications as read for a user
 * @param userId User ID
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, {
            read: true,
            readAt: Timestamp.now(),
        });
    });

    await batch.commit();
    console.log(`✅ Marked ${snapshot.size} notifications as read for user ${userId}`);
}

/**
 * Delete (soft delete) a notification
 * @param notificationId Notification ID
 */
export async function deleteNotification(notificationId: string): Promise<void> {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { deleted: true });
}

/**
 * Clear all notifications for a user (soft delete)
 * @param userId User ID
 */
export async function clearAllNotifications(userId: string): Promise<void> {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
        notificationsRef,
        where('userId', '==', userId),
        limit(500) // Safety limit
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, { deleted: true });
    });

    await batch.commit();
    console.log(`✅ Cleared ${snapshot.size} notifications for user ${userId}`);
}

/**
 * Get unread notification count for a user
 * @param userId User ID
 * @returns Promise with unread count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
}

// ============================================================================
// FEATURE-SPECIFIC NOTIFICATION HELPERS
// ============================================================================

/**
 * Notify user of a new message
 */
export async function notifyNewMessage(
    recipientId: string,
    senderId: string,
    senderName: string,
    messagePreview: string,
    conversationId: string
): Promise<void> {
    await createNotification({
        userId: recipientId,
        type: NotificationType.NEW_MESSAGE,
        category: NotificationCategory.MESSAGES,
        priority: NotificationPriority.NORMAL,
        title: `New message from ${senderName}`,
        body: messagePreview.substring(0, 100),
        data: {
            conversationId,
            senderId,
            senderName,
        },
        actionUrl: `/messages?conversation=${conversationId}`,
        icon: 'message-square',
    });
}

/**
 * Notify task owner of a new proposal
 */
export async function notifyNewProposal(
    taskOwnerId: string,
    providerId: string,
    providerName: string,
    taskTitle: string,
    proposalId: string,
    taskId: string
): Promise<void> {
    await createNotification({
        userId: taskOwnerId,
        type: NotificationType.NEW_PROPOSAL,
        category: NotificationCategory.PROPOSALS,
        priority: NotificationPriority.HIGH,
        title: 'New Proposal Received',
        body: `${providerName} submitted a proposal for "${taskTitle}"`,
        data: {
            proposalId,
            providerId,
            providerName,
            taskId,
            taskTitle,
        },
        actionUrl: `/proposals/${proposalId}`,
        icon: 'file-text',
    });
}

/**
 * Notify provider that their proposal was accepted
 */
export async function notifyProposalAccepted(
    providerId: string,
    taskTitle: string,
    proposalId: string,
    taskId: string
): Promise<void> {
    await createNotification({
        userId: providerId,
        type: NotificationType.PROPOSAL_ACCEPTED,
        category: NotificationCategory.PROPOSALS,
        priority: NotificationPriority.HIGH,
        title: 'Proposal Accepted! 🎉',
        body: `Your proposal for "${taskTitle}" has been accepted`,
        data: {
            proposalId,
            taskId,
            taskTitle,
        },
        actionUrl: `/proposals/${proposalId}`,
        icon: 'check-circle',
    });
}

/**
 * Notify provider that their proposal was rejected
 */
export async function notifyProposalRejected(
    providerId: string,
    taskTitle: string,
    proposalId: string,
    reason?: string
): Promise<void> {
    await createNotification({
        userId: providerId,
        type: NotificationType.PROPOSAL_REJECTED,
        category: NotificationCategory.PROPOSALS,
        priority: NotificationPriority.NORMAL,
        title: 'Proposal Not Selected',
        body: `Your proposal for "${taskTitle}" was not selected${reason ? `: ${reason}` : ''}`,
        data: {
            proposalId,
            taskTitle,
            reason,
        },
        actionUrl: `/proposals/${proposalId}`,
        icon: 'x-circle',
    });
}

/**
 * Notify user of a booking confirmation
 */
export async function notifyBookingConfirmed(
    userId: string,
    bookingId: string,
    taskTitle: string,
    scheduledDate: Date
): Promise<void> {
    await createNotification({
        userId,
        type: NotificationType.BOOKING_CONFIRMED,
        category: NotificationCategory.BOOKINGS,
        priority: NotificationPriority.NORMAL,
        title: 'Booking Confirmed',
        body: `Your booking for "${taskTitle}" is confirmed for ${scheduledDate.toLocaleDateString()}`,
        data: {
            bookingId,
            taskTitle,
            scheduledDate: scheduledDate.toISOString(),
        },
        actionUrl: `/bookings/${bookingId}`,
        icon: 'calendar-check',
    });
}

/**
 * Notify user of a booking cancellation
 */
export async function notifyBookingCancelled(
    userId: string,
    bookingId: string,
    taskTitle: string,
    reason?: string
): Promise<void> {
    await createNotification({
        userId,
        type: NotificationType.BOOKING_CANCELLED,
        category: NotificationCategory.BOOKINGS,
        priority: NotificationPriority.HIGH,
        title: 'Booking Cancelled',
        body: `Your booking for "${taskTitle}" has been cancelled${reason ? `: ${reason}` : ''}`,
        data: {
            bookingId,
            taskTitle,
            reason,
        },
        actionUrl: `/bookings/${bookingId}`,
        icon: 'calendar-x',
    });
}

/**
 * Notify user of a booking reminder (24h before)
 */
export async function notifyBookingReminder(
    userId: string,
    bookingId: string,
    taskTitle: string,
    scheduledDate: Date
): Promise<void> {
    await createNotification({
        userId,
        type: NotificationType.BOOKING_REMINDER,
        category: NotificationCategory.BOOKINGS,
        priority: NotificationPriority.NORMAL,
        title: 'Upcoming Booking Reminder',
        body: `Reminder: "${taskTitle}" is scheduled for tomorrow at ${scheduledDate.toLocaleTimeString()}`,
        data: {
            bookingId,
            taskTitle,
            scheduledDate: scheduledDate.toISOString(),
        },
        actionUrl: `/bookings/${bookingId}`,
        icon: 'bell',
        expiresInDays: 2, // Auto-expire after 2 days
    });
}

/**
 * Notify user of a new task creation (for providers)
 */
export async function notifyNewTask(
    providerId: string,
    taskId: string,
    taskTitle: string,
    taskCategory: string,
    taskLocation: string
): Promise<void> {
    await createNotification({
        userId: providerId,
        type: NotificationType.TASK_CREATED,
        category: NotificationCategory.TASKS,
        priority: NotificationPriority.NORMAL,
        title: 'New Task Available',
        body: `"${taskTitle}" in ${taskLocation} (${taskCategory})`,
        data: {
            taskId,
            taskTitle,
            taskCategory,
            taskLocation,
        },
        actionUrl: `/tasks/${taskId}`,
        icon: 'briefcase',
    });
}

/**
 * Notify user of task completion
 */
export async function notifyTaskCompleted(
    userId: string,
    taskId: string,
    taskTitle: string
): Promise<void> {
    await createNotification({
        userId,
        type: NotificationType.TASK_COMPLETED,
        category: NotificationCategory.TASKS,
        priority: NotificationPriority.NORMAL,
        title: 'Task Completed',
        body: `"${taskTitle}" has been marked as completed`,
        data: {
            taskId,
            taskTitle,
        },
        actionUrl: `/tasks/${taskId}`,
        icon: 'check-circle-2',
    });
}

/**
 * Notify user of a new review
 */
export async function notifyNewReview(
    revieweeId: string,
    reviewerId: string,
    reviewerName: string,
    rating: number,
    taskTitle: string,
    reviewId: string
): Promise<void> {
    await createNotification({
        userId: revieweeId,
        type: NotificationType.NEW_REVIEW,
        category: NotificationCategory.REVIEWS,
        priority: NotificationPriority.NORMAL,
        title: 'New Review Received',
        body: `${reviewerName} left a ${rating}-star review for "${taskTitle}"`,
        data: {
            reviewId,
            reviewerId,
            reviewerName,
            rating,
            taskTitle,
        },
        actionUrl: `/profile?tab=reviews`,
        icon: 'star',
    });
}

/**
 * Notify user of payment received
 */
export async function notifyPaymentReceived(
    userId: string,
    amount: number,
    currency: string,
    taskTitle: string,
    transactionId: string
): Promise<void> {
    await createNotification({
        userId,
        type: NotificationType.PAYMENT_RECEIVED,
        category: NotificationCategory.PAYMENTS,
        priority: NotificationPriority.HIGH,
        title: 'Payment Received',
        body: `You received ${currency} ${amount.toFixed(2)} for "${taskTitle}"`,
        data: {
            transactionId,
            amount,
            currency,
            taskTitle,
        },
        actionUrl: `/wallet/transactions/${transactionId}`,
        icon: 'dollar-sign',
    });
}

/**
 * Notify user of system announcement
 */
export async function notifySystemAnnouncement(
    userId: string,
    title: string,
    message: string,
    actionUrl?: string
): Promise<void> {
    await createNotification({
        userId,
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        category: NotificationCategory.SYSTEM,
        priority: NotificationPriority.LOW,
        title,
        body: message,
        data: {},
        actionUrl,
        icon: 'megaphone',
        expiresInDays: 7,
    });
}
