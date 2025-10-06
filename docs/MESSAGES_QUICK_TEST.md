# Messages Feature - Quick Test Guide

## 🚀 Quick Start Testing (5 minutes)

### Prerequisites
```bash
# Make sure dev server is running
pnpm dev
```

### Test 1: Basic Messaging (2 min)

1. **Browser 1** - Login as User A
2. **Browser 2** - Login as User B (different email)
3. **Browser 1** - Go to `/messages`
4. **Browser 1** - Click "New Conversation", select User B
5. **Browser 1** - Type "Hello!" and send
6. **Browser 2** - Go to `/messages`, verify message appears
7. **Browser 2** - Reply "Hi there!"
8. **Browser 1** - Verify reply received in real-time ✅

### Test 2: Image Upload (1 min)

1. **Browser 1** - Click image upload button (📷)
2. **Browser 1** - Select image file (< 5MB, JPEG/PNG)
3. **Browser 1** - Verify preview shows
4. **Browser 1** - Click send
5. **Browser 2** - Verify image received and clickable ✅

### Test 3: Archive & Mute (1 min)

1. **Browser 1** - Click ⋮ menu on conversation
2. **Browser 1** - Click "Archive"
3. **Browser 1** - Verify conversation moved to "Archived" tab
4. **Browser 1** - Click "Archived" tab, click ⋮, "Unarchive"
5. **Browser 1** - Click ⋮, "Mute"
6. **Browser 2** - Send message
7. **Browser 1** - Verify no unread badge (muted) ✅

### Test 4: Notifications (1 min)

1. **Browser 1** - Allow notifications when prompted
2. **Browser 2** - Send "Test notification"
3. **Browser 1** - Verify notification received
4. **Browser 1** - Click notification → opens conversation ✅

## ✅ Success Criteria

All 4 tests pass = Messages feature fully functional!

## 🐛 Common Issues

### Messages not appearing in real-time
- Check Firestore rules deployed
- Check browser console for errors
- Verify both users authenticated

### Images not uploading
- Check file size < 5MB
- Check file type (JPEG, PNG, GIF, WebP)
- Check Storage rules deployed
- Check Firebase Storage enabled

### Notifications not working
- Check HTTPS (required for notifications)
- Check permission granted
- Check FCM configured
- Check service worker registered

## 🔧 Debug Commands

```bash
# Check Firestore connection
# Open browser console and run:
firebase.firestore().collection('conversations').get()

# Check Auth state
firebase.auth().currentUser

# Check service worker
navigator.serviceWorker.getRegistrations()

# Check FCM token
# Will be logged in console when enabled
```

## 📊 Firebase Console Checks

1. **Firestore** - `/conversations` and `/messages` collections populated
2. **Storage** - `/messages/{conversationId}/{userId}` folders exist
3. **Authentication** - Test users created
4. **Cloud Messaging** - Not required for testing (nice to have)

## 🎯 Production Checklist

Before deploying:
- [ ] All 4 quick tests pass
- [ ] Security rules deployed
- [ ] Storage rules deployed
- [ ] Service worker registered
- [ ] No console errors
- [ ] Images load correctly
- [ ] Real-time updates < 500ms
- [ ] Notifications work on HTTPS

## 📝 Report Issues

If tests fail, report:
1. Which test failed
2. Browser/OS
3. Console errors (screenshot)
4. Steps to reproduce
