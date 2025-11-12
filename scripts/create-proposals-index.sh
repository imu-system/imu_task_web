#!/bin/bash

# Script to create Firestore index for proposals collection
# This index is required for querying proposals by taskId with createdAt ordering

echo "🔥 Creating Firestore index for proposals..."
echo ""
echo "Index details:"
echo "  Collection: proposals"
echo "  Fields: taskId (ASC), createdAt (DESC)"
echo ""

# Open the Firebase console to create the index
CONSOLE_URL="https://console.firebase.google.com/v1/r/project/imutask/firestore/indexes?create_composite=Cklwcm9qZWN0cy9pbXV0YXNrL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9wcm9wb3NhbHMvaW5kZXhlcy9fEAEaCgoGdGFza0lkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg"

echo "📌 Opening Firebase Console to create index..."
echo ""
echo "If your browser doesn't open automatically, use this link:"
echo "$CONSOLE_URL"
echo ""

# Try to open in default browser
if command -v open &> /dev/null; then
    open "$CONSOLE_URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$CONSOLE_URL"
else
    echo "⚠️  Could not open browser automatically"
fi

echo ""
echo "✅ After creating the index in the console:"
echo "   1. Wait for the index to build (can take a few minutes)"
echo "   2. Uncomment the orderBy in src/lib/firestore-proposals.ts (line 140)"
echo "   3. Remove the client-side sort (line 164)"
echo ""
