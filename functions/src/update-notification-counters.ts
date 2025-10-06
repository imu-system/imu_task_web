/**
 * Cloud Function: Update Notification Counters
 *
 * Maintains user statistics for notifications:
 * - Total notification count
 * - Unread notification count
 * - Last notification timestamp
 *
 * Triggered on any notification create/update/delete.
 * Uses Firestore transactions for consistency.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface UserStats {
    totalNotifications: number;
    unreadNotifications: number;
    lastNotificationAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
}

/**
 * Firestore trigger to update notification counters
 */
export const updateNotificationCounters = functions
  .region("europe-west1")
  .firestore.document("notifications/{notificationId}")
  .onWrite(async (change) => {
    const db = admin.firestore();
    const before = change.before.data();
    const after = change.after.data();

    // Notification deleted - decrease total count
    if (!after && before) {
      const userId = before.userId;
      const userStatsRef = db.collection("userStats").doc(userId);

      try {
        await db.runTransaction(async (transaction) => {
          const statsDoc = await transaction.get(userStatsRef);

          if (statsDoc.exists) {
            const updates: Record<string, unknown> = {
              totalNotifications: admin.firestore.FieldValue.increment(-1),
              updatedAt: admin.firestore.Timestamp.now(),
            };

            // Decrease unread count if notification was unread
            if (!before.read) {
              updates.unreadNotifications = admin.firestore.FieldValue.increment(-1);
            }

            transaction.update(userStatsRef, updates);
          }
        });

        console.log(`✅ Updated counters after deletion for user ${userId}`);
        return null;
      } catch (error) {
        console.error("❌ Error updating counters (delete):", error);
        throw error;
      }
    }

    // Early return if no after data
    if (!after) {
      return null;
    }

    const userId = after.userId;
    const userStatsRef = db.collection("userStats").doc(userId);

    try {
      await db.runTransaction(async (transaction) => {
        const statsDoc = await transaction.get(userStatsRef);

        if (!statsDoc.exists) {
          // Initialize stats for new user
          const initialStats: UserStats = {
            totalNotifications: 1,
            unreadNotifications: after.read ? 0 : 1,
            lastNotificationAt: after.createdAt,
            updatedAt: admin.firestore.Timestamp.now(),
          };

          transaction.set(userStatsRef, initialStats);
          console.log(`✅ Initialized stats for user ${userId}`);
        } else {
          const updates: Record<string, unknown> = {
            updatedAt: admin.firestore.Timestamp.now(),
          };

          // New notification created
          if (!before) {
            updates.totalNotifications = admin.firestore.FieldValue.increment(1);
            if (!after.read) {
              updates.unreadNotifications = admin.firestore.FieldValue.increment(1);
            }
            updates.lastNotificationAt = after.createdAt;
            console.log(`✅ New notification created for user ${userId}`);
          } else {
            const wasUnread = !before.read;
            const isUnread = !after.read;

            if (wasUnread && !isUnread) {
              // Marked as read
              updates.unreadNotifications = admin.firestore.FieldValue.increment(-1);
              console.log(`✅ Notification marked as read for user ${userId}`);
            } else if (!wasUnread && isUnread) {
              // Marked as unread
              updates.unreadNotifications = admin.firestore.FieldValue.increment(1);
              console.log(`✅ Notification marked as unread for user ${userId}`);
            }
          }

          transaction.update(userStatsRef, updates);
        }
      });

      return null;
    } catch (error) {
      console.error("❌ Error updating notification counters:", error);
      throw error;
    }
  });
