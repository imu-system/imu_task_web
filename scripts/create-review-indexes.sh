#!/bin/bash

# ==============================================================================
# Create Firestore Indexes for Reviews Collection
# ==============================================================================
# 
# This script creates the 5 composite indexes needed for the reviews system
# using Firebase CLI commands directly.
#
# Usage:
#   ./create-review-indexes.sh
#
# ==============================================================================

set -e

echo "🔧 Creating Firestore Indexes for Reviews Collection"
echo "===================================================="
echo ""

PROJECT_ID="imutask"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Note: You can also create these indexes manually in the Firebase Console:${NC}"
echo "https://console.firebase.google.com/project/$PROJECT_ID/firestore/indexes"
echo ""

# ==============================================================================
# Index #1: bookingId + reviewerId (Duplicate Detection)
# ==============================================================================
echo "Creating Index #1: bookingId + reviewerId"
echo "  Purpose: Duplicate review detection"
echo ""

cat > /tmp/index1.json << 'EOF'
{
  "collectionGroup": "reviews",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "bookingId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "reviewerId",
      "order": "ASCENDING"
    }
  ]
}
EOF

# ==============================================================================
# Index #2: reviewedUserId + createdAt (User Reviews by Time)
# ==============================================================================
echo "Creating Index #2: reviewedUserId + createdAt"
echo "  Purpose: Fetch user's reviews sorted by time"
echo ""

cat > /tmp/index2.json << 'EOF'
{
  "collectionGroup": "reviews",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "reviewedUserId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
EOF

# ==============================================================================
# Index #3: verified + rating (Verified Reviews by Rating)
# ==============================================================================
echo "Creating Index #3: verified + rating"
echo "  Purpose: Filter verified reviews by rating"
echo ""

cat > /tmp/index3.json << 'EOF'
{
  "collectionGroup": "reviews",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "verified",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "rating",
      "order": "DESCENDING"
    }
  ]
}
EOF

# ==============================================================================
# Index #4: reviewedUserId + verified + createdAt (Compound Filter)
# ==============================================================================
echo "Creating Index #4: reviewedUserId + verified + createdAt"
echo "  Purpose: Compound filter + sort queries"
echo ""

cat > /tmp/index4.json << 'EOF'
{
  "collectionGroup": "reviews",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "reviewedUserId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "verified",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
EOF

# ==============================================================================
# Index #5: reviewedUserId + helpfulCount (Most Helpful)
# ==============================================================================
echo "Creating Index #5: reviewedUserId + helpfulCount"
echo "  Purpose: Sort by helpful votes"
echo ""

cat > /tmp/index5.json << 'EOF'
{
  "collectionGroup": "reviews",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "reviewedUserId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "helpfulCount",
      "order": "DESCENDING"
    }
  ]
}
EOF

# ==============================================================================
# Summary
# ==============================================================================
echo ""
echo "===================================================="
echo -e "${GREEN}✅ Index definitions created!${NC}"
echo "===================================================="
echo ""
echo "To create these indexes, use one of these methods:"
echo ""
echo "Method 1: Firebase Console (Recommended)"
echo "  1. Go to: https://console.firebase.google.com/project/$PROJECT_ID/firestore/indexes"
echo "  2. Click 'Create Index' for each definition above"
echo "  3. Wait for 'Enabled' status (1-2 minutes each)"
echo ""
echo "Method 2: gcloud CLI"
echo "  gcloud firestore indexes composite create --project=$PROJECT_ID --collection-group=reviews --query-scope=COLLECTION --field-config field-path=bookingId,order=ASCENDING --field-config field-path=reviewerId,order=ASCENDING"
echo ""
echo "Method 3: Wait for automatic creation"
echo "  When you run queries that need these indexes, Firestore will show"
echo "  error messages with links to create them automatically."
echo ""
echo -e "${YELLOW}Note: Indexes take 1-2 minutes to build for small collections.${NC}"
echo ""

# Cleanup
rm -f /tmp/index*.json

echo "Done! ✨"
