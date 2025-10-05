// src/lib/types/notifications.ts
/**
 * Type definitions for the platform-wide notification system
 * Supports Messages, Tasks, Proposals, Bookings, Reviews, Profile, Payments, and System notifications
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Notification Types - All possible notification events across the platform
 */
export enum NotificationType {
    // Messages
    NEW_MESSAGE = 'new_message',

    // Tasks
    TASK_CREATED = 'task_created',
    TASK_UPDATED = 'task_updated',
    TASK_DELETED = 'task_deleted',
    TASK_COMPLETED = 'task_completed',
    TASK_ASSIGNED = 'task_assigned',

    // Proposals
    NEW_PROPOSAL = 'new_proposal',
    PROPOSAL_ACCEPTED = 'proposal_accepted',
    PROPOSAL_REJECTED = 'proposal_rejected',
    PROPOSAL_UPDATED = 'proposal_updated',
    PROPOSAL_WITHDRAWN = 'proposal_withdrawn',

    // Bookings
    BOOKING_CREATED = 'booking_created',
    BOOKING_CONFIRMED = 'booking_confirmed',
    BOOKING_CANCELLED = 'booking_cancelled',
    BOOKING_REMINDER = 'booking_reminder',
    BOOKING_COMPLETED = 'booking_completed',
    BOOKING_UPDATED = 'booking_updated',

    // Reviews
    NEW_REVIEW = 'new_review',
    REVIEW_RESPONSE = 'review_response',

    // Profile
    PROFILE_VERIFIED = 'profile_verified',
    PROFILE_UPDATE_REQUIRED = 'profile_update_required',
    PROFILE_INCOMPLETE = 'profile_incomplete',

    // Payments
    PAYMENT_RECEIVED = 'payment_received',
    PAYMENT_SENT = 'payment_sent',
    PAYMENT_FAILED = 'payment_failed',
    PAYMENT_REFUNDED = 'payment_refunded',
    PAYMENT_PENDING = 'payment_pending',

    // System
    SYSTEM_ANNOUNCEMENT = 'system_announcement',
    SYSTEM_MAINTENANCE = 'system_maintenance',
    ACCOUNT_SECURITY = 'account_security',
    ACCOUNT_SUSPENDED = 'account_suspended',
}

/**
 * Notification Categories - Group notifications by feature area
 */
export enum NotificationCategory {
    MESSAGES = 'messages',
    TASKS = 'tasks',
    PROPOSALS = 'proposals',
    BOOKINGS = 'bookings',
    REVIEWS = 'reviews',
    PROFILE = 'profile',
    PAYMENTS = 'payments',
    SYSTEM = 'system',
}

/**
 * Notification Priority Levels
 * - LOW: Passive display, minimal interruption (3s auto-dismiss)
 * - NORMAL: Standard toast notification (5s auto-dismiss)
 * - HIGH: Persistent toast with sound/vibration, requires user action
 */
export enum NotificationPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
}

/**
 * Main Notification Interface
 * Represents a notification in Firestore and client state
 */
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, any>;
    read: boolean;
    shown: boolean;
    createdAt: Date;
    readAt?: Date;
    expiresAt?: Date;
    priority: NotificationPriority;
    actionUrl?: string;
    icon?: string;
    category: NotificationCategory;
}

/**
 * Firestore Notification Document
 * Firestore-specific version with Timestamp instead of Date
 */
export interface NotificationDocument {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, any>;
    read: boolean;
    shown: boolean;
    createdAt: Timestamp;
    readAt?: Timestamp;
    expiresAt?: Timestamp;
    priority: NotificationPriority;
    actionUrl?: string;
    icon?: string;
    category: NotificationCategory;
}

/**
 * User Notification Preferences
 * Stored in /users/{userId} document
 */
export interface NotificationPreferences {
    enabled: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;

    // Per-category preferences
    categories: {
        [key in NotificationCategory]: {
            enabled: boolean;
            push: boolean;
            email: boolean;
        };
    };

    // Advanced settings
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    quietHoursStart?: string; // "22:00"
    quietHoursEnd?: string;   // "08:00"
}

/**
 * Default notification preferences for new users
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
    enabled: true,
    emailNotifications: true,
    pushNotifications: true,

    categories: {
        [NotificationCategory.MESSAGES]: { enabled: true, push: true, email: false },
        [NotificationCategory.TASKS]: { enabled: true, push: true, email: true },
        [NotificationCategory.PROPOSALS]: { enabled: true, push: true, email: true },
        [NotificationCategory.BOOKINGS]: { enabled: true, push: true, email: true },
        [NotificationCategory.REVIEWS]: { enabled: true, push: true, email: true },
        [NotificationCategory.PROFILE]: { enabled: true, push: false, email: true },
        [NotificationCategory.PAYMENTS]: { enabled: true, push: true, email: true },
        [NotificationCategory.SYSTEM]: { enabled: true, push: true, email: true },
    },

    soundEnabled: true,
    vibrationEnabled: true,
};

/**
 * Notification creation parameters
 */
export interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
    category: NotificationCategory;
    priority?: NotificationPriority;
    actionUrl?: string;
    icon?: string;
    expiresInDays?: number;
}

/**
 * Type guard to check if a value is a valid NotificationType
 */
export function isNotificationType(value: string): value is NotificationType {
    return Object.values(NotificationType).includes(value as NotificationType);
}

/**
 * Type guard to check if a value is a valid NotificationCategory
 */
export function isNotificationCategory(value: string): value is NotificationCategory {
    return Object.values(NotificationCategory).includes(value as NotificationCategory);
}

/**
 * Type guard to check if a value is a valid NotificationPriority
 */
export function isNotificationPriority(value: string): value is NotificationPriority {
    return Object.values(NotificationPriority).includes(value as NotificationPriority);
}
