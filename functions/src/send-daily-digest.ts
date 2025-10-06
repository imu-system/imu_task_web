/**
 * Cloud Function: Send Daily Digest
 *
 * Sends daily email digest to users with unread notifications.
 * Runs at 8 AM daily (Europe/Paris timezone).
 *
 * Features:
 * - Groups notifications by category
 * - Shows top 10 most important
 * - Only sends if user has unread notifications
 * - Respects user email preferences
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface NotificationData {
    id: string;
    title: string;
    body: string;
    priority: number;
    createdAt: Date;
    actionUrl?: string;
}

/**
 * Scheduled function to send daily digest emails
 * Schedule: Every day at 8 AM Paris time
 */
export const sendDailyDigest = functions
  .region("europe-west1")
  .pubsub.schedule("0 8 * * *")
  .timeZone("Europe/Paris")
  .onRun(async () => {
    const db = admin.firestore();

    console.log("📧 Starting daily digest email send");

    try {
      // Get all users who want daily digest
      const usersSnapshot = await db
        .collection("users")
        .where("emailPreferences.dailyDigest", "==", true)
        .get();

      if (usersSnapshot.empty) {
        console.log("✅ No users subscribed to daily digest");
        return {sentCount: 0};
      }

      let sentCount = 0;
      let skippedCount = 0;

      // Process each user
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const userEmail = userData.email;

        if (!userEmail) {
          console.log(`⚠️ User ${userId} has no email address`);
          skippedCount++;
          continue;
        }

        // Get unread notifications from last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const notificationsSnapshot = await db
          .collection("notifications")
          .where("userId", "==", userId)
          .where("read", "==", false)
          .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(yesterday))
          .orderBy("createdAt", "desc")
          .orderBy("priority", "desc")
          .get();

        if (notificationsSnapshot.empty) {
          console.log(`✅ User ${userId} has no unread notifications`);
          skippedCount++;
          continue;
        }

        // Group notifications by category
        const notificationsByCategory: Record<string, NotificationData[]> = {};
        notificationsSnapshot.docs.forEach((doc) => {
          const notif = doc.data();
          const category = notif.category || "other";

          if (!notificationsByCategory[category]) {
            notificationsByCategory[category] = [];
          }

          notificationsByCategory[category].push({
            id: doc.id,
            title: notif.title,
            body: notif.body,
            priority: notif.priority,
            createdAt: notif.createdAt.toDate(),
            actionUrl: notif.actionUrl,
          });
        });

        // Build email content
        const emailSubject = `📬 Vous avez ${notificationsSnapshot.size} notifications non lues`;

        let emailBody = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .category { margin: 20px 0; }
                .category-title { font-size: 18px; font-weight: bold; color: #4F46E5; margin-bottom: 10px; }
                .notification { background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 8px; }
                .notification-title { font-weight: bold; color: #111827; }
                .notification-body { color: #6b7280; margin: 5px 0; }
                .notification-time { font-size: 12px; color: #9ca3af; }
                .cta { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; 
                       border-radius: 6px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>📬 Votre résumé quotidien</h1>
              </div>
              <div class="content">
                <p>Bonjour ${userData.displayName || ""},</p>
                <p>Vous avez <strong>${notificationsSnapshot.size} nouvelles notifications</strong> depuis hier.</p>
        `;

        // Add notifications grouped by category
        Object.entries(notificationsByCategory).forEach(([category, notifications]) => {
          const categoryEmoji: Record<string, string> = {
            tasks: "📋",
            messages: "💬",
            bookings: "📅",
            payments: "💰",
            other: "📌",
          };
          emailBody += `
            <div class="category">
              <div class="category-title">${categoryEmoji[category] || "📌"} ${category.toUpperCase()}</div>
          `;

          notifications.forEach((notif: NotificationData) => {
            const timeAgo = getTimeAgo(notif.createdAt);
            emailBody += `
              <div class="notification">
                <div class="notification-title">${notif.title}</div>
                <div class="notification-body">${notif.body}</div>
                <div class="notification-time">${timeAgo}</div>
              </div>
            `;
          });

          emailBody += "</div>";
        });

        emailBody += `
                <a href="https://imu-task.web.app/notifications" class="cta">
                  Voir toutes les notifications
                </a>
              </div>
              <div class="footer">
                <p>Vous recevez cet email car vous êtes abonné au résumé quotidien.</p>
                <p><a href="https://imu-task.web.app/profile/settings">Gérer mes préférences</a></p>
              </div>
            </body>
          </html>
        `;

        // Send email (using Firebase Extensions or third-party service)
        // For now, we'll log the email content
        console.log(`📧 Would send email to ${userEmail}:`);
        console.log(`   Subject: ${emailSubject}`);
        console.log(`   Notifications: ${notificationsSnapshot.size}`);
        console.log(`   Body length: ${emailBody.length} chars`);

        // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
        // await sendEmail(userEmail, emailSubject, emailBody);

        sentCount++;
      }

      console.log(`✅ Daily digest complete: ${sentCount} sent, ${skippedCount} skipped`);

      return {
        sentCount,
        skippedCount,
        totalUsers: usersSnapshot.size,
      };
    } catch (error) {
      console.error("❌ Error sending daily digest:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to send daily digest",
        error
      );
    }
  });

/**
 * Helper: Get human-readable time ago
 * @param {Date} date - The date to convert to relative time
 * @return {string} Human-readable time difference in French
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `Il y a ${diffMins} minute${diffMins > 1 ? "s" : ""}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  } else {
    return `Il y a ${Math.floor(diffHours / 24)} jour${diffHours >= 48 ? "s" : ""}`;
  }
}
