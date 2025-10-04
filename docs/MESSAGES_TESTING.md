# Tests Firebase - Messages Feature

## Test Plan

### 1. Authentication Tests
- [x] User can sign in with email/password
- [ ] User can sign out
- [ ] Auth state persists across page reloads
- [ ] Protected routes redirect to login

### 2. Conversations Tests

#### Create Conversation
- [ ] User can create new conversation with another user
- [ ] Duplicate conversations are prevented
- [ ] Conversation appears in both users' lists
- [ ] Initial metadata is correctly set (participants, names, avatars)

#### Real-time Updates
- [ ] Conversations update in real-time when new message arrives
- [ ] lastMessage and lastMessageAt update correctly
- [ ] Unread count increments for recipient
- [ ] Conversation moves to top of list on new message

#### Archive/Unarchive
- [ ] User can archive a conversation
- [ ] Archived conversation moves to "Archived" tab
- [ ] User can unarchive a conversation
- [ ] Archived status is per-user (doesn't affect other participant)

#### Mute/Unmute
- [ ] User can mute a conversation
- [ ] Muted conversations show mute icon
- [ ] Muted conversations don't show unread badge
- [ ] User can unmute a conversation

### 3. Messages Tests

#### Send Messages
- [ ] User can send text message
- [ ] Message appears immediately in sender's view
- [ ] Message appears in recipient's conversation
- [ ] Message includes correct metadata (sender, timestamp)

#### Send Images
- [ ] User can upload and send image
- [ ] Image is compressed before upload
- [ ] Image validation works (type, size)
- [ ] Image URL is stored in message
- [ ] Image displays in message thread
- [ ] Image can be clicked to view full-size

#### Read Status
- [ ] Messages marked as read when conversation opened
- [ ] Unread count resets when messages read
- [ ] readBy array updates correctly
- [ ] Other user's unread count doesn't change

#### Real-time Updates
- [ ] Messages appear in real-time for both users
- [ ] Scroll to bottom on new message
- [ ] Typing indicator would work (not implemented)

### 4. Security Rules Tests

#### Conversations
- [ ] Authenticated user can read their conversations
- [ ] User cannot read others' conversations
- [ ] User can create conversation only if they're participant
- [ ] User can update conversation metadata
- [ ] User cannot delete conversation

#### Messages
- [ ] User can read messages in their conversations
- [ ] User cannot read messages in others' conversations
- [ ] User can create message only as sender
- [ ] User can create message only in their conversations
- [ ] Message type validation (text, image)
- [ ] User can update only readBy field
- [ ] User can delete only their own messages

#### Storage
- [ ] User can upload images to their folder
- [ ] User cannot upload to others' folders
- [ ] File size limits enforced (5MB for images)
- [ ] File type validation enforced
- [ ] User can delete only their own images

### 5. Notifications Tests
- [ ] User can enable notifications
- [ ] User receives notification on new message
- [ ] Notification shows correct title and body
- [ ] Clicking notification opens conversation
- [ ] Foreground notifications work
- [ ] Background notifications work
- [ ] FCM token saved to Firestore

### 6. UI/UX Tests

#### Conversation List
- [ ] Shows all conversations sorted by last message
- [ ] Shows correct unread counts
- [ ] Shows last message preview
- [ ] Shows relative timestamps
- [ ] Empty state displays correctly
- [ ] Loading state displays correctly

#### Message Thread
- [ ] Messages display in correct order
- [ ] Sender/recipient bubbles styled differently
- [ ] Avatars show correctly
- [ ] Timestamps show correctly
- [ ] Empty state displays correctly
- [ ] Loading state displays correctly

#### Message Input
- [ ] Textarea auto-resizes
- [ ] Send button disabled when empty
- [ ] Ctrl+Enter/Cmd+Enter sends message
- [ ] Image upload button works
- [ ] Image preview shows before sending

### 7. Performance Tests
- [ ] Conversations load within 1 second
- [ ] Messages load within 1 second
- [ ] Image upload within 3 seconds
- [ ] Real-time updates have minimal delay (<500ms)
- [ ] No memory leaks in listeners

### 8. Edge Cases
- [ ] Handle deleted users gracefully
- [ ] Handle missing avatars
- [ ] Handle very long messages
- [ ] Handle many unread messages (99+)
- [ ] Handle offline state
- [ ] Handle network errors

## How to Test

### Manual Testing Steps

1. **Setup**
   ```bash
   # Start development server
   pnpm dev
   
   # Open in two browsers/incognito windows
   http://localhost:3000
   ```

2. **Create Test Users**
   - Sign up as User A in Browser 1
   - Sign up as User B in Browser 2

3. **Test Conversations**
   - User A: Click "New Conversation"
   - User A: Select User B
   - Verify conversation appears for both users

4. **Test Messaging**
   - User A: Send text message
   - User B: Verify message received
   - User B: Reply
   - User A: Verify reply received

5. **Test Images**
   - User A: Click image upload button
   - User A: Select image file
   - Verify preview shows
   - User A: Send
   - User B: Verify image received and displays

6. **Test Archive**
   - User A: Click menu on conversation
   - User A: Click "Archive"
   - Verify conversation moves to Archived tab
   - User B: Verify conversation still in Active tab

7. **Test Mute**
   - User A: Unarchive conversation
   - User A: Click menu > Mute
   - User B: Send message
   - User A: Verify no unread badge shows
   - User A: Click menu > Unmute

8. **Test Notifications**
   - User A: Enable notifications when prompted
   - User B: Send message
   - User A: Verify notification received

### Automated Testing (Future)

```typescript
// Example Firestore Rules Test
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  it('allows user to read their own conversations', async () => {
    const db = getFirestore(authenticatedContext('user1'));
    const conversationRef = doc(db, 'conversations', 'conv1');
    await assertSucceeds(getDoc(conversationRef));
  });

  it('denies user from reading others conversations', async () => {
    const db = getFirestore(authenticatedContext('user2'));
    const conversationRef = doc(db, 'conversations', 'conv1');
    await assertFails(getDoc(conversationRef));
  });
});
```

## Test Results

### Test Session: [Date]
- **Tester**: [Name]
- **Environment**: Development
- **Browser**: [Chrome/Firefox/Safari]

| Test Case | Status | Notes |
|-----------|--------|-------|
| Create Conversation | ⏳ | |
| Send Text Message | ⏳ | |
| Send Image | ⏳ | |
| Archive/Unarchive | ⏳ | |
| Mute/Unmute | ⏳ | |
| Notifications | ⏳ | |
| Security Rules | ⏳ | |

## Known Issues
- [ ] None yet

## Next Steps
1. Execute all manual tests
2. Document results
3. Fix any bugs found
4. Implement automated tests
5. Performance optimization if needed
