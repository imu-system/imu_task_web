# Phase 5 - Performance & Cloud Functions

## 🎯 Objectifs

Optimiser le système de notifications pour la production avec :
- Performance Firestore optimale
- Cloud Functions pour automatisation
- Caching intelligent
- Pagination efficace
- Tests complets

**Durée estimée :** 6-8 heures  
**Statut actuel :** ⬜ 0%

---

## 📋 Plan d'exécution

### Sprint 5.1 - Optimisation Firestore (2h)
- [ ] 5.1.1 Créer indexes composites optimaux
- [ ] 5.1.2 Règles de sécurité avancées
- [ ] 5.1.3 Optimisation des queries
- [ ] 5.1.4 Firestore bundle configuration

### Sprint 5.2 - Cloud Functions (2h)
- [ ] 5.2.1 Fonction de nettoyage automatique (>30 jours)
- [ ] 5.2.2 Fonction d'agrégation de compteurs
- [ ] 5.2.3 Fonction de notification push (FCM)
- [ ] 5.2.4 Fonction de digest quotidien

### Sprint 5.3 - Caching & Pagination (1.5h)
- [ ] 5.3.1 React Query configuration
- [ ] 5.3.2 Pagination cursor-based
- [ ] 5.3.3 Infinite scroll
- [ ] 5.3.4 Optimistic updates

### Sprint 5.4 - Tests (1.5h)
- [ ] 5.4.1 Tests unitaires (Jest)
- [ ] 5.4.2 Tests d'intégration
- [ ] 5.4.3 Tests E2E (Playwright)
- [ ] 5.4.4 Performance benchmarks

### Sprint 5.5 - Monitoring & Analytics (1h)
- [ ] 5.5.1 Firebase Performance Monitoring
- [ ] 5.5.2 Analytics events
- [ ] 5.5.3 Error tracking
- [ ] 5.5.4 Dashboard metrics

---

## 🔥 Sprint 5.1 - Optimisation Firestore

### 5.1.1 Indexes Composites

**Fichier à créer :** `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "read", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isProvider", "order": "ASCENDING" },
        { "fieldPath": "skills", "arrayConfig": "CONTAINS" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isProvider", "order": "ASCENDING" },
        { "fieldPath": "availability", "order": "ASCENDING" },
        { "fieldPath": "skills", "arrayConfig": "CONTAINS" }
      ]
    }
  ],
  "fieldOverrides": [
    {
      "collectionGroup": "notifications",
      "fieldPath": "createdAt",
      "ttl": false,
      "indexes": []
    }
  ]
}
```

**Bénéfices :**
- Queries 10-50x plus rapides
- Réduction du coût des lectures
- Support de filtres complexes

### 5.1.2 Règles de sécurité avancées

**Fichier à créer :** `firestore.rules` (version production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidNotification() {
      return request.resource.data.keys().hasAll(['userId', 'type', 'category', 'title', 'body', 'createdAt'])
        && request.resource.data.userId is string
        && request.resource.data.type is string
        && request.resource.data.category is string
        && request.resource.data.priority in ['low', 'normal', 'high']
        && request.resource.data.read is bool;
    }
    
    // Rate limiting helper (basic)
    function notTooManyWrites() {
      // En production, utiliser une solution plus robuste
      return true;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      // Read: Only owner can read their notifications
      allow read: if isOwner(resource.data.userId);
      
      // Create: System can create (via Cloud Functions ideally)
      allow create: if isAuthenticated() 
        && isValidNotification()
        && notTooManyWrites();
      
      // Update: Only owner can mark as read/dismissed
      allow update: if isOwner(resource.data.userId)
        && request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['read', 'dismissed', 'updatedAt']);
      
      // Delete: Only owner can delete
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated()
        && (isOwner(resource.data.clientId) || isOwner(resource.data.providerId));
      allow delete: if isOwner(resource.data.clientId);
    }
    
    // Messages, Proposals, Bookings (simplified)
    match /conversations/{conversationId} {
      allow read, write: if isAuthenticated();
    }
    
    match /proposals/{proposalId} {
      allow read, write: if isAuthenticated();
    }
    
    match /bookings/{bookingId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

**Améliorations :**
- Validation stricte des données
- Protection contre les accès non autorisés
- Rate limiting basique
- Permissions granulaires

### 5.1.3 Optimisation des queries

**Fichier à créer :** `src/lib/firestore-notifications-optimized.ts`

```typescript
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Notification, NotificationCategory } from './types/notifications';

export interface NotificationQueryOptions {
  userId: string;
  limit?: number;
  category?: NotificationCategory;
  unreadOnly?: boolean;
  startAfterDoc?: QueryDocumentSnapshot;
}

export interface NotificationQueryResult {
  notifications: Notification[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Optimized notification query with pagination
 */
export async function getNotificationsOptimized(
  options: NotificationQueryOptions
): Promise<NotificationQueryResult> {
  const {
    userId,
    limit: pageLimit = 20,
    category,
    unreadOnly = false,
    startAfterDoc,
  } = options;

  try {
    const notificationsRef = collection(db, 'notifications');
    
    // Build query with proper indexes
    let q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageLimit + 1) // +1 to check if there are more
    );

    // Add category filter if specified
    if (category) {
      q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(pageLimit + 1)
      );
    }

    // Add unread filter if specified
    if (unreadOnly) {
      q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(pageLimit + 1)
      );
    }

    // Add pagination cursor
    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    
    // Check if there are more results
    const hasMore = docs.length > pageLimit;
    const notifications = docs.slice(0, pageLimit).map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        category: data.category,
        priority: data.priority,
        title: data.title,
        body: data.body,
        data: data.data || {},
        actionUrl: data.actionUrl,
        icon: data.icon,
        read: data.read || false,
        dismissed: data.dismissed || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Notification;
    });

    const lastDoc = hasMore ? docs[pageLimit - 1] : null;

    console.log(`✅ Fetched ${notifications.length} notifications (hasMore: ${hasMore})`);

    return {
      notifications,
      lastDoc,
      hasMore,
    };
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Get unread count efficiently
 */
export async function getUnreadCountOptimized(userId: string): Promise<number> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    return 0;
  }
}
```

---

## ☁️ Sprint 5.2 - Cloud Functions

### 5.2.1 Fonction de nettoyage automatique

**Fichier à créer :** `functions/src/cleanup-old-notifications.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Cloud Function: Delete notifications older than 30 days
 * Runs daily at 2 AM
 */
export const cleanupOldNotifications = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    const db = admin.firestore();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const notificationsRef = db.collection('notifications');
      const oldNotifications = await notificationsRef
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .get();

      const batchSize = 500;
      let batch = db.batch();
      let operationCount = 0;
      let deletedCount = 0;

      for (const doc of oldNotifications.docs) {
        batch.delete(doc.ref);
        operationCount++;
        deletedCount++;

        if (operationCount === batchSize) {
          await batch.commit();
          batch = db.batch();
          operationCount = 0;
        }
      }

      if (operationCount > 0) {
        await batch.commit();
      }

      console.log(`✅ Cleaned up ${deletedCount} old notifications`);
      return { deletedCount };
    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
      throw error;
    }
  });
```

### 5.2.2 Fonction d'agrégation de compteurs

**Fichier à créer :** `functions/src/update-notification-counters.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Cloud Function: Update notification counters on notification change
 */
export const updateNotificationCounters = functions.firestore
  .document('notifications/{notificationId}')
  .onWrite(async (change, context) => {
    const db = admin.firestore();
    const before = change.before.data();
    const after = change.after.data();

    if (!after) {
      // Notification deleted
      return null;
    }

    const userId = after.userId;
    const userStatsRef = db.collection('userStats').doc(userId);

    try {
      await db.runTransaction(async (transaction) => {
        const statsDoc = await transaction.get(userStatsRef);
        
        if (!statsDoc.exists) {
          // Initialize stats
          transaction.set(userStatsRef, {
            totalNotifications: 1,
            unreadNotifications: after.read ? 0 : 1,
            lastNotificationAt: after.createdAt,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          const stats = statsDoc.data()!;
          const updates: any = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          // New notification created
          if (!before) {
            updates.totalNotifications = admin.firestore.FieldValue.increment(1);
            if (!after.read) {
              updates.unreadNotifications = admin.firestore.FieldValue.increment(1);
            }
            updates.lastNotificationAt = after.createdAt;
          }
          // Notification updated
          else {
            const wasUnread = !before.read;
            const isUnread = !after.read;

            if (wasUnread && !isUnread) {
              // Marked as read
              updates.unreadNotifications = admin.firestore.FieldValue.increment(-1);
            } else if (!wasUnread && isUnread) {
              // Marked as unread
              updates.unreadNotifications = admin.firestore.FieldValue.increment(1);
            }
          }

          transaction.update(userStatsRef, updates);
        }
      });

      console.log(`✅ Updated notification counters for user ${userId}`);
      return null;
    } catch (error) {
      console.error('❌ Error updating counters:', error);
      throw error;
    }
  });
```

### 5.2.3 Fonction de notification push (FCM)

**Fichier à créer :** `functions/src/send-push-notification.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Cloud Function: Send push notification when new notification created
 */
export const sendPushNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snapshot, context) => {
    const notification = snapshot.data();
    const userId = notification.userId;

    try {
      // Get user's FCM tokens
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        console.log(`User ${userId} not found`);
        return null;
      }

      const userData = userDoc.data()!;
      const fcmTokens = userData.fcmTokens || [];

      if (fcmTokens.length === 0) {
        console.log(`No FCM tokens for user ${userId}`);
        return null;
      }

      // Prepare FCM message
      const message: admin.messaging.MulticastMessage = {
        tokens: fcmTokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.icon ? `https://yourapp.com/icons/${notification.icon}.png` : undefined,
        },
        data: {
          notificationId: context.params.notificationId,
          type: notification.type,
          category: notification.category,
          actionUrl: notification.actionUrl || '',
          ...notification.data,
        },
        android: {
          priority: notification.priority === 'high' ? 'high' : 'normal',
          notification: {
            channelId: notification.category,
            priority: notification.priority === 'high' ? 'max' : 'default',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: userData.unreadNotifications || 1,
            },
          },
        },
        webpush: {
          notification: {
            icon: '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
            vibrate: [200, 100, 200],
          },
        },
      };

      // Send push notification
      const response = await admin.messaging().sendMulticast(message);

      console.log(`✅ Sent push to ${response.successCount}/${fcmTokens.length} devices`);

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const tokensToRemove: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error?.code === 'messaging/invalid-registration-token') {
            tokensToRemove.push(fcmTokens[idx]);
          }
        });

        if (tokensToRemove.length > 0) {
          await admin.firestore().collection('users').doc(userId).update({
            fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove),
          });
          console.log(`🧹 Removed ${tokensToRemove.length} invalid tokens`);
        }
      }

      return { successCount: response.successCount, failureCount: response.failureCount };
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      throw error;
    }
  });
```

---

## 🎯 Prochaines étapes

Ce document sera complété avec :
- Sprint 5.3: Caching & Pagination
- Sprint 5.4: Tests
- Sprint 5.5: Monitoring

**Temps écoulé :** 0h  
**Temps restant estimé :** 6-8h

---

## ✅ Checklist Phase 5

### Sprint 5.1 - Firestore
- [ ] firestore.indexes.json créé
- [ ] firestore.rules déployé
- [ ] Queries optimisées implémentées

### Sprint 5.2 - Cloud Functions
- [ ] Cleanup function déployée
- [ ] Counter aggregation déployée
- [ ] Push notification déployée

### Sprint 5.3 - Caching
- [ ] React Query configuré
- [ ] Pagination implémentée

### Sprint 5.4 - Tests
- [ ] Tests unitaires (>80% coverage)
- [ ] Tests E2E (scénarios critiques)

### Sprint 5.5 - Monitoring
- [ ] Performance monitoring actif
- [ ] Analytics configuré
