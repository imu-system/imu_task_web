/**
 * Cloud Functions for IMU Task Web
 *
 * Automated tasks for notifications system:
 * - Cleanup old notifications (30+ days)
 * - Update notification counters
 * - Send push notifications (FCM)
 * - Daily digest emails
 */

import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export {cleanupOldNotifications} from "./cleanup-old-notifications";
export {updateNotificationCounters} from "./update-notification-counters";
export {sendPushNotification} from "./send-push-notification";
export {sendDailyDigest} from "./send-daily-digest";
