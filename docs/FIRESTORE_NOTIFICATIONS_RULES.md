# Firestore Security Rules - Notifications System

## 📋 Overview

This file contains security rules for the `notifications` collection.

## 🔐 Security Model

### Notifications Collection

**Path:** `/notifications/{notificationId}`

**Permissions:**

| Operation | Rule | Description |
|-----------|------|-------------|
| **READ** | `isOwner()` | Users can only read their own notifications |
| **CREATE** | `isCreatingForSelf()` | Users can create notifications for themselves (+ required fields validation) |
| **UPDATE** | `isOwner() + limited fields` | Users can update: `read`, `readAt`, `shown`, `deleted` only |
| **DELETE** | `false` | Hard delete not allowed (use soft delete) |

### Required Fields for Creation

- `userId` (string)
- `type` (NotificationType enum)
- `title` (string)
- `body` (string)
- `category` (NotificationCategory enum)
- `priority` (NotificationPriority enum)
- `read` (boolean)
- `shown` (boolean)
- `createdAt` (Timestamp)

### Updateable Fields

Users can only update these fields on their own notifications:
- `read` (boolean)
- `readAt` (Timestamp)
- `shown` (boolean)
- `deleted` (boolean) - for soft delete

## 🚀 Deployment

### Deploy to Firebase

```bash
# Deploy only notifications rules
firebase deploy --only firestore:rules

# Or merge with existing firestore.rules file
# Copy the content to your main firestore.rules file
```

### Testing Rules

```bash
# Use Firebase Emulator for local testing
firebase emulators:start --only firestore

# Run rules tests (if configured)
npm run test:rules
```

## 📊 Firestore Indexes

### Required Indexes

Create these composite indexes in Firebase Console:

**Index 1: User notifications ordered by date**
- Collection: `notifications`
- Fields:
  - `userId` (Ascending)
  - `createdAt` (Descending)

**Index 2: User unread notifications**
- Collection: `notifications`
- Fields:
  - `userId` (Ascending)
  - `read` (Ascending)
  - `createdAt` (Descending)

**Index 3: User notifications by category**
- Collection: `notifications`
- Fields:
  - `userId` (Ascending)
  - `category` (Ascending)
  - `createdAt` (Descending)

### Create Indexes via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Add the fields as specified above

### Create Indexes via CLI

Alternatively, create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
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
    }
  ],
  "fieldOverrides": []
}
```

Deploy with:
```bash
firebase deploy --only firestore:indexes
```

## 🔍 Testing Queries

### Valid Queries (will work with indexes)

```typescript
// Get all user notifications (ordered by date)
const q1 = query(
  collection(db, 'notifications'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc')
);

// Get unread notifications
const q2 = query(
  collection(db, 'notifications'),
  where('userId', '==', userId),
  where('read', '==', false),
  orderBy('createdAt', 'desc')
);

// Get notifications by category
const q3 = query(
  collection(db, 'notifications'),
  where('userId', '==', userId),
  where('category', '==', 'messages'),
  orderBy('createdAt', 'desc')
);
```

## ⚠️ Important Notes

1. **Soft Delete Only**: Hard deletes are disabled. Use `deleted: true` field instead.

2. **Server-Side Creation**: Most notifications should be created via Cloud Functions for security and consistency.

3. **Limited Updates**: Users can only update metadata fields (read status, shown status), not content.

4. **Privacy**: Users can only see their own notifications.

5. **Index Auto-Creation**: Firebase may auto-suggest indexes when you run queries. Accept these suggestions in the console.

## 📚 Related Documentation

- [Main Notifications Plan](./NOTIFICATIONS_SYSTEM_PLAN.md)
- [Firestore Security Rules Docs](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes Docs](https://firebase.google.com/docs/firestore/query-data/indexing)
