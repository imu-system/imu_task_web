/**
 * MessagesClient Component
 * 
 * Main messages page with conversation list and message thread
 * Requires authentication and manages conversation selection
 */

'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { getUserById, type User } from '@/lib/firestore-users';
import { useConversations } from '@/hooks/use-conversations';
import { useMessages } from '@/hooks/use-messages';
import { ConversationList } from '@/components/chat/conversation-list';
import { MessageThread } from '@/components/chat/message-thread';
import { MessageInput } from '@/components/chat/message-input';
import { NewConversationDialog } from '@/components/chat/new-conversation-dialog';
import { createConversation } from '@/lib/firestore-conversations';
import { getOtherParticipant } from '@/lib/firestore-conversations';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export function MessagesClient() {
  const t = useTranslations('messages');
  const { user, loading: authLoading } = useRequireAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Fetch user profile
  useEffect(() => {
    async function fetchUserProfile() {
      if (user) {
        try {
          const profile = await getUserById(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    }
    fetchUserProfile();
  }, [user]);

  // Get conversations
  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
  } = useConversations(user?.uid);

  // Get selected conversation details
  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
  const otherUser = selectedConversation
    ? getOtherParticipant(selectedConversation, user?.uid || '')
    : null;

  // Get messages for selected conversation
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sending,
    sendMessage,
  } = useMessages({
    conversationId: selectedConversationId,
    currentUserId: user?.uid,
    currentUserName: userProfile?.name || userProfile?.email || 'Unknown',
    currentUserAvatar: userProfile?.avatarUrl,
    recipientId: otherUser?.id,
  });

  // Handle mobile responsive
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle new conversation creation
  const handleCreateConversation = async (userId: string, initialMessage: string) => {
    if (!user || !userProfile) return;

    try {
      // Get recipient user profile
      const recipientProfile = await getUserById(userId);
      if (!recipientProfile) {
        throw new Error('User not found');
      }

      // Create conversation
      const conversationId = await createConversation({
        userId1: user.uid,
        userName1: userProfile.name || userProfile.email || 'Unknown',
        userAvatar1: userProfile.avatarUrl,
        userId2: userId,
        userName2: recipientProfile.name || recipientProfile.email || 'Unknown',
        userAvatar2: recipientProfile.avatarUrl,
      });

      // Select the new conversation
      setSelectedConversationId(conversationId);

      // Send initial message
      // Note: This will be handled by the MessageInput component after conversation is created
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="space-y-4 w-full max-w-4xl mx-auto p-4">
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-[500px] w-1/3" />
            <Skeleton className="h-[500px] flex-1" />
          </div>
        </div>
      </div>
    );
  }

  const showConversationList = !isMobileView || !selectedConversationId;
  const showMessageThread = !isMobileView || selectedConversationId;

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversation List - Sidebar */}
      <div
        className={cn(
          'w-full md:w-80 lg:w-96',
          !showConversationList && 'hidden md:block'
        )}
      >
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          currentUserId={user?.uid || ''}
          loading={conversationsLoading}
          onSelectConversation={setSelectedConversationId}
          onNewConversation={() => setShowNewConversationDialog(true)}
        />
      </div>

      {/* Message Thread - Main Area */}
      <div
        className={cn(
          'flex-1 flex flex-col',
          !showMessageThread && 'hidden md:flex'
        )}
      >
        {selectedConversationId ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b bg-background flex items-center gap-3">
              {isMobileView && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedConversationId(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex-1">
                <h2 className="font-semibold">{otherUser?.name || t('labels.unknown')}</h2>
                <p className="text-sm text-muted-foreground">{t('status.online')}</p>
              </div>
            </div>

            {/* Messages */}
            <MessageThread
              messages={messages}
              currentUserId={user?.uid || ''}
              loading={messagesLoading}
              error={messagesError}
            />

            {/* Input */}
            <MessageInput onSend={sendMessage} sending={sending} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-muted-foreground max-w-md">
              <h3 className="text-lg font-medium mb-2">{t('labels.selectConversation')}</h3>
              <p className="text-sm">{t('labels.selectConversationDesc')}</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Dialog */}
      <NewConversationDialog
        open={showNewConversationDialog}
        onOpenChange={setShowNewConversationDialog}
        onCreateConversation={handleCreateConversation}
      />

      {/* Error Display */}
      {conversationsError && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{conversationsError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
