/**
 * Cloud Function: Send Push Notification
 *
 * Sends FCM push notifications when new notifications are created.
 * Supports:
 * - Multi-device push (Android, iOS, Web)
 * - Priority-based delivery
 * - Badge counts
 * - Deep linking
 * - Invalid token cleanup
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface NotificationData {
    userId: string;
    type: string;
    category: string;
    priority: "low" | "normal" | "high";
    title: string;
    body: string;
    icon?: string;
    actionUrl?: string;
    data?: Record<string, unknown>;
    read: boolean;
    createdAt: admin.firestore.Timestamp;
}

/**
 * Firestore trigger to send push notification on create
 */
export const sendPushNotification = functions
  .region("europe-west1")
  .firestore.document("notifications/{notificationId}")
  .onCreate(async (snapshot, context) => {
    const notification = snapshot.data() as NotificationData;
    const notificationId = context.params.notificationId;
    const userId = notification.userId;

    console.log(`📱 Sending push notification ${notificationId} to user ${userId}`);

    try {
      const db = admin.firestore();
      const userDoc = await db.collection("users").doc(userId).get();

      if (!userDoc.exists) {
        console.log(`⚠️ User ${userId} not found`);
        return null;
      }

      const userData = userDoc.data()!;
      const fcmTokens: string[] = userData.fcmTokens || [];

      if (fcmTokens.length === 0) {
        console.log(`⚠️ No FCM tokens for user ${userId}`);
        return null;
      }

      // Get unread count for badge
      const unreadCount = userData.unreadNotifications || 1;

      // Prepare FCM message
      const message: admin.messaging.MulticastMessage = {
        tokens: fcmTokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.icon ?
            `https://imu-task.web.app/icons/${notification.icon}.png` :
            undefined,
        },
        data: {
          notificationId,
          type: notification.type,
          category: notification.category,
          actionUrl: notification.actionUrl || "",
          ...notification.data,
        },
        android: {
          priority: notification.priority === "high" ? "high" : "normal",
          notification: {
            channelId: notification.category,
            priority: notification.priority === "high" ? "max" : "default",
            sound: "default",
            clickAction: notification.actionUrl,
            color: "#4F46E5", // Indigo-600
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: unreadCount,
              category: notification.category,
              threadId: notification.category,
              contentAvailable: true,
            },
          },
        },
        webpush: {
          notification: {
            icon: "/icons/notification-icon-192.png",
            badge: "/icons/badge-icon-96.png",
            vibrate: [200, 100, 200],
            requireInteraction: notification.priority === "high",
            tag: notification.category,
            renotify: true,
          },
          fcmOptions: {
            link: notification.actionUrl || "/notifications",
          },
        },
      };

      // Send push notification to all devices
      const response = await admin.messaging().sendEachForMulticast(message);

      console.log(`✅ Sent push to ${response.successCount}/${fcmTokens.length} devices`);

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const tokensToRemove: string[] = [];

        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error;
            // Remove invalid or unregistered tokens
            if (
              error?.code === "messaging/invalid-registration-token" ||
                            error?.code === "messaging/registration-token-not-registered"
            ) {
              tokensToRemove.push(fcmTokens[idx]);
              console.log(`⚠️ Invalid token: ${fcmTokens[idx].substring(0, 20)}...`);
            }
          }
        });

        // Remove invalid tokens from user document
        if (tokensToRemove.length > 0) {
          await db.collection("users").doc(userId).update({
            fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove),
          });
          console.log(`🧹 Removed ${tokensToRemove.length} invalid tokens for user ${userId}`);
        }
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        notificationId,
      };
    } catch (error) {
      console.error("❌ Error sending push notification:", error);
      // Don't throw - we don't want to fail the notification creation
      return null;
    }
  });
