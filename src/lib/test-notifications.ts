// src/lib/test-notifications.ts
/**
 * Test utilities for notifications system
 * Use in development to create sample notifications
 */

import {
    createNotification,
    notifyNewMessage,
    notifyNewProposal,
    notifyProposalAccepted,
    notifyBookingConfirmed,
    notifyNewTask,
    notifyPaymentReceived,
} from './firestore-notifications';
import { NotificationType, NotificationCategory, NotificationPriority } from './types/notifications';

/**
 * Create sample notifications for testing
 * @param userId User ID to create notifications for
 */
export async function createSampleNotifications(userId: string): Promise<void> {
    console.log('🧪 Creating sample notifications...');

    try {
        // 1. New Message (normal priority)
        await notifyNewMessage(
            userId,
            'sender123',
            'John Doe',
            'Hey! I saw your task and I would love to help with it. When would be a good time to discuss?',
            'conv123'
        );

        // 2. New Proposal (high priority)
        await notifyNewProposal(
            userId,
            'provider456',
            'Jane Smith',
            'House Cleaning in Paris 16e',
            'proposal789',
            'task456'
        );

        // 3. Proposal Accepted (high priority)
        await notifyProposalAccepted(
            userId,
            'Plumbing Repair in Lyon',
            'proposal101',
            'task202'
        );

        // 4. Booking Confirmed (normal priority)
        await notifyBookingConfirmed(
            userId,
            'booking303',
            'Garden Maintenance',
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
        );

        // 5. New Task (normal priority)
        await notifyNewTask(
            userId,
            'task404',
            'Furniture Assembly - IKEA Wardrobe',
            'Assembly',
            'Marseille, France'
        );

        // 6. Payment Received (high priority)
        await notifyPaymentReceived(
            userId,
            150.50,
            'EUR',
            'Office Cleaning',
            'txn505'
        );

        // 7. Custom notification (low priority)
        await createNotification({
            userId,
            type: NotificationType.SYSTEM_ANNOUNCEMENT,
            category: NotificationCategory.SYSTEM,
            priority: NotificationPriority.LOW,
            title: 'Welcome to ImuTask!',
            body: 'Complete your profile to get better matches for tasks.',
            data: {},
            actionUrl: '/profile',
            icon: 'user-circle',
        });

        console.log('✅ Created 7 sample notifications');
    } catch (error) {
        console.error('❌ Error creating sample notifications:', error);
        throw error;
    }
}

/**
 * Create a single test notification
 * @param userId User ID
 * @param type Notification type
 */
export async function createTestNotification(
    userId: string,
    type: NotificationType = NotificationType.SYSTEM_ANNOUNCEMENT
): Promise<void> {
    const testNotifications: Record<string, {
        category: NotificationCategory;
        priority: NotificationPriority;
        title: string;
        body: string;
        actionUrl: string;
    }> = {
        [NotificationType.NEW_MESSAGE]: {
            category: NotificationCategory.MESSAGES,
            priority: NotificationPriority.NORMAL,
            title: 'Test Message',
            body: 'This is a test message notification',
            actionUrl: '/messages',
        },
        [NotificationType.NEW_PROPOSAL]: {
            category: NotificationCategory.PROPOSALS,
            priority: NotificationPriority.HIGH,
            title: 'Test Proposal',
            body: 'This is a test proposal notification',
            actionUrl: '/proposals',
        },
        [NotificationType.BOOKING_CONFIRMED]: {
            category: NotificationCategory.BOOKINGS,
            priority: NotificationPriority.NORMAL,
            title: 'Test Booking',
            body: 'This is a test booking notification',
            actionUrl: '/bookings',
        },
        [NotificationType.PAYMENT_RECEIVED]: {
            category: NotificationCategory.PAYMENTS,
            priority: NotificationPriority.HIGH,
            title: 'Test Payment',
            body: 'This is a test payment notification',
            actionUrl: '/wallet',
        },
        [NotificationType.SYSTEM_ANNOUNCEMENT]: {
            category: NotificationCategory.SYSTEM,
            priority: NotificationPriority.LOW,
            title: 'Test System',
            body: 'This is a test system notification',
            actionUrl: '/',
        },
    };

    const config = testNotifications[type] || testNotifications[NotificationType.SYSTEM_ANNOUNCEMENT];

    await createNotification({
        userId,
        type,
        ...config,
        data: { test: true, createdAt: new Date().toISOString() },
    });

    console.log(`✅ Created test notification: ${type}`);
}

/**
 * Test notification permissions and rules
 * @param userId User ID
 */
export async function testNotificationPermissions(userId: string): Promise<void> {
    console.log('🧪 Testing notification permissions...');

    try {
        // Test 1: Create notification
        console.log('Test 1: Creating notification...');
        await createTestNotification(userId);
        console.log('✅ Create permission: PASSED');

        // Note: Read, Update, Delete tests should be done in the UI
        // since they require authentication context

        console.log('✅ All permission tests passed');
    } catch (error) {
        console.error('❌ Permission test failed:', error);
        throw error;
    }
}
