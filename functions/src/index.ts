/**
 * Cloud Functions for IMU Task Web
 *
 * Automated tasks for notifications system:
 * - Cleanup old notifications (30+ days)
 * - Update notification counters
 * - Send push notifications (FCM)
 * - Daily digest emails
 *
 * Admin functions:
 * - Assign/remove user roles (admin only)
 * - List users with roles
 *
 * KYC functions:
 * - Submit KYC documents
 * - Approve/reject KYC (admin only, auto-assigns provider role)
 * - List KYC submissions (admin only)
 *
 * KYB functions (ImuPro):
 * - Submit KYB documents for professional verification
 * - Approve/reject KYB (admin only, creates pro profile)
 * - List KYB submissions (admin only)
 */

import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export {cleanupOldNotifications} from "./cleanup-old-notifications";
export {updateNotificationCounters} from "./update-notification-counters";
export {sendPushNotification} from "./send-push-notification";
export {sendDailyDigest} from "./send-daily-digest";

// Admin functions
export {assignUserRole, removeUserRole, listUsersWithRoles} from "./admin/user-roles";

// KYC functions
export {submitKYC, approveKYC, rejectKYC, listKYCSubmissions} from "./kyc/kyc-validation";

// KYB functions (ImuPro)
export {submitKYB, approveKYB, rejectKYB, listKYBSubmissions} from "./kyb/kyb-validation";

// Quote functions (ImuPro)
export {
  createQuote,
  sendQuote,
  acceptQuote,
  declineQuote,
  cancelQuote,
} from "./quotes/quotes-management";

// Export the Firestore instance
export const db = admin.firestore();
