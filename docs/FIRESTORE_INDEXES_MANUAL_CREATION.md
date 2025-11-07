# Firestore Indexes - Manual Creation Guide

**Date:** 2025-01-06  
**Status:** Production Deployment Required  
**Project:** imutask

---

## 🎯 Overview

This guide provides step-by-step instructions to **manually create 5 composite indexes** for the `reviews` collection in Firebase Console. These indexes are required for optimal query performance in the reviews system.

**Why Manual Creation?**
- Firebase CLI deployment conflicts with existing indexes
- Manual creation avoids overwriting production indexes
- Allows selective index deployment per collection

---

## 📋 Prerequisites

1. **Firebase Console Access:** Admin role on project "imutask"
2. **Console URL:** https://console.firebase.google.com/project/imutask/firestore/indexes
3. **Collection:** `reviews` (created automatically when first review submitted)

---

## 🔧 Index Creation Steps

### Step 1: Access Firestore Indexes

1. Open Firebase Console: https://console.firebase.google.com/project/imutask/firestore/indexes
2. Click "**Composite**" tab (top navigation)
3. Click "**Create Index**" button (blue button, top-right)

---

### Index #1: Duplicate Detection (bookingId + reviewerId)

**Purpose:** Prevent duplicate reviews for same booking  
**Used by:** `hasExistingReview()` helper function

**Configuration:**
- **Collection ID:** `reviews`
- **Fields indexed:**
  1. Field: `bookingId` | Order: **Ascending**
  2. Field: `reviewerId` | Order: **Ascending**
- **Query scopes:** Collection
- **Density:** SPARSE_ALL (default)

**Steps:**
1. Click "Create Index"
2. Collection ID: `reviews`
3. Add Field: `bookingId` → Ascending
4. Add Field: `reviewerId` → Ascending
5. Click "Create Index"
6. Wait for status: "Enabled" (1-2 minutes)

---

### Index #2: User Reviews by Time (reviewedUserId + createdAt)

**Purpose:** Fetch user's reviews sorted by most recent  
**Used by:** `getUserReviews()` query in profile pages

**Configuration:**
- **Collection ID:** `reviews`
- **Fields indexed:**
  1. Field: `reviewedUserId` | Order: **Ascending**
  2. Field: `createdAt` | Order: **Descending**
- **Query scopes:** Collection
- **Density:** SPARSE_ALL (default)

**Steps:**
1. Click "Create Index"
2. Collection ID: `reviews`
3. Add Field: `reviewedUserId` → Ascending
4. Add Field: `createdAt` → Descending
5. Click "Create Index"
6. Wait for status: "Enabled"

---

### Index #3: Verified Reviews by Rating (verified + rating)

**Purpose:** Filter verified reviews and sort by rating  
**Used by:** Public profile reviews with "Verified Only" filter

**Configuration:**
- **Collection ID:** `reviews`
- **Fields indexed:**
  1. Field: `verified` | Order: **Ascending**
  2. Field: `rating` | Order: **Descending**
- **Query scopes:** Collection
- **Density:** SPARSE_ALL (default)

**Steps:**
1. Click "Create Index"
2. Collection ID: `reviews`
3. Add Field: `verified` → Ascending
4. Add Field: `rating` → Descending
5. Click "Create Index"
6. Wait for status: "Enabled"

---

### Index #4: Compound Filter + Sort (reviewedUserId + verified + createdAt)

**Purpose:** Filter by user + verified status, sort by time  
**Used by:** Profile pages with "Verified Only" toggle

**Configuration:**
- **Collection ID:** `reviews`
- **Fields indexed:**
  1. Field: `reviewedUserId` | Order: **Ascending**
  2. Field: `verified` | Order: **Ascending**
  3. Field: `createdAt` | Order: **Descending**
- **Query scopes:** Collection
- **Density:** SPARSE_ALL (default)

**Steps:**
1. Click "Create Index"
2. Collection ID: `reviews`
3. Add Field: `reviewedUserId` → Ascending
4. Add Field: `verified` → Ascending
5. Add Field: `createdAt` → Descending
6. Click "Create Index"
7. Wait for status: "Enabled"

---

### Index #5: Most Helpful Reviews (reviewedUserId + helpfulCount)

**Purpose:** Sort user's reviews by helpful votes  
**Used by:** Profile pages with "Most Helpful" sort option

**Configuration:**
- **Collection ID:** `reviews`
- **Fields indexed:**
  1. Field: `reviewedUserId` | Order: **Ascending**
  2. Field: `helpfulCount` | Order: **Descending**
- **Query scopes:** Collection
- **Density:** SPARSE_ALL (default)

**Steps:**
1. Click "Create Index"
2. Collection ID: `reviews`
3. Add Field: `reviewedUserId` → Ascending
4. Add Field: `helpfulCount` → Descending
5. Click "Create Index"
6. Wait for status: "Enabled"

---

## ✅ Verification

### Check Index Status

1. Go to Firebase Console > Firestore > Indexes > Composite
2. Verify all 5 indexes show status "**Enabled**"
3. Expected total: **22 composite indexes** (17 existing + 5 new)

### Test Queries

Run these queries in Firestore Console or your app to verify indexes work:

**Query 1: Duplicate Check**
```typescript
// Should use Index #1
const q = query(
  collection(db, 'reviews'),
  where('bookingId', '==', 'booking123'),
  where('reviewerId', '==', 'user456')
);
```

**Query 2: User Reviews by Time**
```typescript
// Should use Index #2
const q = query(
  collection(db, 'reviews'),
  where('reviewedUserId', '==', 'provider789'),
  orderBy('createdAt', 'desc'),
  limit(10)
);
```

**Query 3: Verified Reviews by Rating**
```typescript
// Should use Index #3
const q = query(
  collection(db, 'reviews'),
  where('verified', '==', true),
  orderBy('rating', 'desc')
);
```

**Query 4: User + Verified + Time**
```typescript
// Should use Index #4
const q = query(
  collection(db, 'reviews'),
  where('reviewedUserId', '==', 'provider789'),
  where('verified', '==', true),
  orderBy('createdAt', 'desc')
);
```

**Query 5: Most Helpful**
```typescript
// Should use Index #5
const q = query(
  collection(db, 'reviews'),
  where('reviewedUserId', '==', 'provider789'),
  orderBy('helpfulCount', 'desc')
);
```

---

## 📊 Expected Results

### Before Indexes
- ⚠️ Queries fail with "Missing index" error
- ⚠️ Firestore suggests creating indexes via error links
- ⚠️ Cannot filter + sort simultaneously

### After Indexes
- ✅ All queries execute in <100ms (typical)
- ✅ No "Missing index" errors
- ✅ Efficient filtering + sorting
- ✅ Profile pages load instantly

---

## 🔍 Monitoring

### Performance Metrics
- Check query performance in Firebase Console > Firestore > Usage tab
- Monitor index size in Indexes tab (should be minimal for MVP)
- Track query execution time in app logs

### Index Build Status
- New indexes take 1-2 minutes to build (small collections)
- Large collections (>10K docs) may take 5-10 minutes
- Status indicator: "Building" → "Enabled"

---

## 🐛 Troubleshooting

### Issue 1: Index Creation Fails
**Error:** "Index already exists"  
**Solution:** Check existing indexes, may have been auto-created by Firebase  
**Action:** Skip duplicate index, verify existing index matches config

### Issue 2: Index Stuck in "Building" State
**Cause:** Large collection or high write load  
**Solution:** Wait 10-15 minutes, then refresh console  
**Fallback:** Delete and recreate index if stuck >30 minutes

### Issue 3: Queries Still Show "Missing Index" Error
**Cause:** Index not fully enabled yet  
**Solution:** Wait for "Enabled" status, then retry query  
**Check:** Verify index fields match query exactly (order matters!)

### Issue 4: Cannot Delete Old Indexes
**Error:** "Index in use by active queries"  
**Solution:** Deploy new app version without old queries first  
**Action:** Delete indexes after 24h cooldown period

---

## 📝 Reference

### Index JSON Definition
Full index definitions available in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "reviews",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "bookingId", "order": "ASCENDING" },
        { "fieldPath": "reviewerId", "order": "ASCENDING" }
      ]
    }
    // ... 4 more indexes
  ]
}
```

### Related Documentation
- **Firestore Rules:** `firestore.rules` (lines 260-322)
- **Review System Docs:** `docs/PHASE8_TASK8.3_COMPLETED.md`
- **Query Performance:** `docs/FIRESTORE_SETUP_SUMMARY.md`

---

## 🎉 Success Checklist

- [ ] Index #1: bookingId + reviewerId (**Duplicate Detection**)
- [ ] Index #2: reviewedUserId + createdAt (**User Reviews by Time**)
- [ ] Index #3: verified + rating (**Verified Reviews by Rating**)
- [ ] Index #4: reviewedUserId + verified + createdAt (**Compound Filter**)
- [ ] Index #5: reviewedUserId + helpfulCount (**Most Helpful**)
- [ ] All indexes show "Enabled" status
- [ ] Test queries execute without errors
- [ ] Profile pages load instantly
- [ ] Update `PHASE8_TASK8.3_COMPLETED.md` with index confirmation

---

**Console URL:** https://console.firebase.google.com/project/imutask/firestore/indexes  
**Estimated Time:** 10-15 minutes (5 indexes × 2 min each)  
**Next Steps:** Task 8.4 - Advanced Pages UI
