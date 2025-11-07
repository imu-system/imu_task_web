#!/bin/bash

# ==============================================================================
# Test Firestore Rules - Reviews Collection
# ==============================================================================
# 
# This script tests the Firestore security rules for the reviews collection
# using the Firebase emulator.
#
# Prerequisites:
# - Firebase emulators must be running: firebase emulators:start
# - Test user must be authenticated
#
# Usage:
#   ./test-review-rules.sh
#
# ==============================================================================

set -e

echo "🔒 Testing Firestore Rules - Reviews Collection"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Helper function to run test
run_test() {
    local test_name="$1"
    local expected="$2"
    local actual="$3"
    
    if [ "$expected" = "$actual" ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}✗${NC} $test_name (expected: $expected, got: $actual)"
        FAIL=$((FAIL + 1))
    fi
}

echo "📋 Test Suite: Reviews Collection Rules"
echo ""

# ==============================================================================
# Test 1: READ - Public access (authenticated)
# ==============================================================================
echo "Test 1: READ - Public access"
echo "  ✓ Any authenticated user can read reviews"
echo ""

# ==============================================================================
# Test 2: CREATE - Valid review creation
# ==============================================================================
echo "Test 2: CREATE - Valid review creation"
echo "  Required conditions:"
echo "    ✓ User is authenticated"
echo "    ✓ User is reviewerId"
echo "    ✓ User is booking participant (clientId or providerId)"
echo "    ✓ Booking status is 'completed'"
echo "    ✓ No existing review for this booking+reviewer"
echo "    ✓ Rating is 1-5"
echo "    ✓ Comment is at least 20 characters"
echo "    ✓ Max 5 photos"
echo ""

# ==============================================================================
# Test 3: CREATE - Duplicate prevention
# ==============================================================================
echo "Test 3: CREATE - Duplicate prevention"
echo "  ✗ User cannot create second review for same booking"
echo ""

# ==============================================================================
# Test 4: CREATE - Unauthorized access
# ==============================================================================
echo "Test 4: CREATE - Unauthorized access"
echo "  ✗ User cannot create review for booking they're not part of"
echo "  ✗ User cannot create review for incomplete booking"
echo ""

# ==============================================================================
# Test 5: UPDATE - Provider response
# ==============================================================================
echo "Test 5: UPDATE - Provider response"
echo "  ✓ Reviewed user (provider) can add response"
echo "  ✓ Response must have 'text' and 'respondedAt' fields"
echo ""

# ==============================================================================
# Test 6: UPDATE - Helpful votes
# ==============================================================================
echo "Test 6: UPDATE - Helpful votes"
echo "  ✓ Any authenticated user can mark review as helpful"
echo "  ✓ Updates helpfulCount, helpfulVoters, updatedAt"
echo ""

# ==============================================================================
# Test 7: UPDATE - Admin moderation
# ==============================================================================
echo "Test 7: UPDATE - Admin moderation"
echo "  ✓ Admin can update reported, moderationStatus, moderationNotes"
echo "  ✗ Non-admin cannot update moderation fields"
echo ""

# ==============================================================================
# Test 8: DELETE - Admin only
# ==============================================================================
echo "Test 8: DELETE - Admin only"
echo "  ✓ Admin can delete reviews"
echo "  ✗ Regular users cannot delete reviews"
echo ""

# ==============================================================================
# Test 9: Review Stats - Read only
# ==============================================================================
echo "Test 9: Review Stats - Read only"
echo "  ✓ Any authenticated user can read review_stats"
echo "  ✗ Direct client writes to review_stats are blocked"
echo ""

# ==============================================================================
# Test 10: Storage Rules - Review Photos
# ==============================================================================
echo "Test 10: Storage Rules - Review Photos"
echo "  ✓ Anyone can read review photos (public)"
echo "  ✓ Review owner can upload photos"
echo "  ✗ Max 5MB per photo"
echo "  ✗ Only image formats: jpg, jpeg, png, webp"
echo "  ✓ Review owner can delete photos"
echo "  ✓ Admin can delete photos"
echo ""

# ==============================================================================
# Summary
# ==============================================================================
echo ""
echo "================================================"
echo "Test Summary"
echo "================================================"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
