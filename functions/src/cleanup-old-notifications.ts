/**
 * Cloud Function: Cleanup Old Notifications
 *
 * Deletes notifications older than 30 days to keep database clean.
 * Runs daily at 2 AM (Europe/Paris timezone).
 *
 * Performance:
 * - Batch operations (500 docs per batch)
 * - Prevents database bloat
 * - Reduces storage costs
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const RETENTION_DAYS = 30;
const BATCH_SIZE = 500;

/**
 * Scheduled function to delete old notifications
 * Schedule: Every day at 2 AM Paris time
 */
export const cleanupOldNotifications = functions
  .region("europe-west1")
  .pubsub.schedule("0 2 * * *")
  .timeZone("Europe/Paris")
  .onRun(async () => {
    const db = admin.firestore();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    console.log(`🧹 Starting cleanup for notifications older than ${cutoffDate.toISOString()}`);

    try {
      const notificationsRef = db.collection("notifications");
      const oldNotifications = await notificationsRef
        .where("createdAt", "<", admin.firestore.Timestamp.fromDate(cutoffDate))
        .get();

      if (oldNotifications.empty) {
        console.log("✅ No old notifications to clean up");
        return {deletedCount: 0};
      }

      let batch = db.batch();
      let operationCount = 0;
      let deletedCount = 0;

      for (const doc of oldNotifications.docs) {
        batch.delete(doc.ref);
        operationCount++;
        deletedCount++;

        // Commit batch when reaching size limit
        if (operationCount === BATCH_SIZE) {
          await batch.commit();
          console.log(`✅ Committed batch of ${operationCount} deletions`);
          batch = db.batch();
          operationCount = 0;
        }
      }

      // Commit remaining operations
      if (operationCount > 0) {
        await batch.commit();
        console.log(`✅ Committed final batch of ${operationCount} deletions`);
      }

      console.log(`✅ Successfully cleaned up ${deletedCount} old notifications`);

      return {
        deletedCount,
        cutoffDate: cutoffDate.toISOString(),
        success: true,
      };
    } catch (error) {
      console.error("❌ Error cleaning up notifications:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to cleanup old notifications",
        error
      );
    }
  });
