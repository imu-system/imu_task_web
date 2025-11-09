'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowDown, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/lib/types';

// Import des composants avancés
import { ConversationHeaderAdvanced } from '@/components/messaging/conversation-header-advanced';
import { MessageBubbleAdvanced } from '@/components/messaging/message-bubble-advanced';
import { MessageInputAdvanced } from '@/components/messaging/message-input-advanced';
import { TypingIndicator } from '@/components/messaging/typing-indicator';
import { SearchInConversation } from '@/components/messaging/search-in-conversation';

// Import des hooks
import {
  useThread,
  useMessages,
  useTypingStatus,
} from '@/hooks/use-messaging';
import {
  useMessageReactions,
  useEditMessage,
  useDeleteMessage,
  usePinMessage,
  useStarMessage,
  useForwardMessage,
  useMarkMessagesAsRead,
  usePinnedMessages,
  useSharedMedia,
  useArchiveThread,
  useMuteThread,
} from '@/hooks/use-messaging-advanced';

export function ConversationPageAdvanced() {
  const t = useTranslations('messaging');
  const params = useParams();
  const { user } = useAuth();
  const threadId = params.threadId as string;

  // State
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [starredMessageIds, setStarredMessageIds] = useState<Set<string>>(new Set());

  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: thread, isLoading: threadLoading } = useThread(threadId);
  const { data: messages = [], isLoading: messagesLoading } = useMessages(threadId);
  const { data: typingUsers = [] } = useTypingStatus(threadId);
  const { data: pinnedMessages = [] } = usePinnedMessages(threadId);
  const { data: sharedMedia = [] } = useSharedMedia(threadId);

  // Mutations
  const editMessageMutation = useEditMessage();
  const deleteMessageMutation = useDeleteMessage();
  const pinMessageMutation = usePinMessage(threadId);
  const starMessageMutation = useStarMessage(user?.uid || '');
  const forwardMessageMutation = useForwardMessage();
  const markAsReadMutation = useMarkMessagesAsRead(threadId, user?.uid || '');
  const archiveThreadMutation = useArchiveThread(user?.uid || '');
  const muteThreadMutation = useMuteThread(user?.uid || '');

  // Contact info (autre participant)
  const otherParticipant = thread?.participants.find((p) => p.userId !== user?.uid);
  const contactName = otherParticipant?.name || 'Unknown';
  const contactAvatar = otherParticipant?.photoUrl;
  const contactStatus = typingUsers.some((u) => u.userId !== user?.uid)
    ? ('typing' as const)
    : ('offline' as const); // TODO: Get real online status

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Mark messages as read
  useEffect(() => {
    if (messages.length > 0 && user?.uid) {
      const unreadMessageIds = messages
        .filter((m) => m.senderId !== user.uid && m.status !== 'read')
        .map((m) => m.id);

      if (unreadMessageIds.length > 0) {
        markAsReadMutation.mutate({ messageIds: unreadMessageIds });
      }
    }
  }, [messages, user?.uid, markAsReadMutation]);

  // Handle scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handlers
  const handleReply = (message: Message) => {
    setReplyToMessage(message);
    setEditingMessage(null);
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setReplyToMessage(null);
  };

  const handleDelete = (messageId: string) => {
    deleteMessageMutation.mutate({ messageId, deleteForEveryone: false });
  };

  const handlePin = (messageId: string) => {
    const isPinned = pinnedMessages.some((m) => m.id === messageId);
    pinMessageMutation.mutate({ messageId, pin: !isPinned });
  };

  const handleStar = (messageId: string) => {
    const isMessageStarred = starredMessageIds.has(messageId);
    starMessageMutation.mutate({ messageId, star: !isMessageStarred });
    setStarredMessageIds((prev) => {
      const newSet = new Set(prev);
      if (isMessageStarred) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleForward = (message: Message) => {
    // TODO: Open forward dialog to select threads
    console.log('Forward message:', message.id);
  };

  const handleReact = (messageId: string, emoji: string) => {
    // Handled by MessageBubbleAdvanced via useMessageReactions
  };

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    // Handled by MessageBubbleAdvanced via useMessageReactions
  };

  const handleCall = () => {
    // TODO: Implement call functionality
    console.log('Starting call...');
  };

  const handleVideoCall = () => {
    // TODO: Implement video call
    console.log('Starting video call...');
  };

  const handleToggleStar = () => {
    setIsStarred(!isStarred);
    // TODO: Save to backend
  };

  const handleToggleMute = () => {
    muteThreadMutation.mutate({ threadId, mute: !isMuted });
    setIsMuted(!isMuted);
  };

  const handleArchive = () => {
    archiveThreadMutation.mutate({ threadId, archive: true });
    // TODO: Navigate back to messages list
  };

  const handleDeleteConversation = () => {
    // TODO: Implement delete conversation
    console.log('Delete conversation');
  };

  // Loading states
  if (threadLoading || messagesLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b p-4">
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-16 w-3/4 ml-auto" />
          <Skeleton className="h-16 w-3/4" />
        </div>
        <div className="border-t p-4">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive">
          <AlertDescription>{t('conversationNotFound')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Format shared media for header
  const formattedSharedMedia = sharedMedia.flatMap((item) =>
    (item.attachments || []).map((att) => ({
      id: att.id,
      type: att.type as 'image' | 'video' | 'document' | 'link',
      url: att.url,
      name: att.name,
      thumbnail: att.url,
      createdAt: item.createdAt,
    }))
  );

  return (
    <div className="flex flex-col h-full bg-[#EFEAE2] dark:bg-background">
      {/* Header */}
      <ConversationHeaderAdvanced
        contactName={contactName}
        contactAvatar={contactAvatar}
        contactStatus={contactStatus}
        lastSeen={otherParticipant?.lastSeen}
        isStarred={isStarred}
        isMuted={isMuted}
        onCall={handleCall}
        onVideoCall={handleVideoCall}
        onSearch={() => setShowSearch(true)}
        onToggleStar={handleToggleStar}
        onToggleMute={handleToggleMute}
        onArchive={handleArchive}
        onDelete={handleDeleteConversation}
        sharedMedia={formattedSharedMedia}
        threadId={threadId}
      />

      {/* Pinned Messages Banner */}
      {pinnedMessages.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b px-4 py-2">
          <div className="flex items-center gap-2 text-sm max-w-4xl mx-auto">
            <Pin className="w-4 h-4 text-yellow-600 dark:text-yellow-500 shrink-0" />
            <span className="text-yellow-800 dark:text-yellow-300 truncate">
              {pinnedMessages.length === 1
                ? t('pinnedMessage')
                : t('pinnedMessages', { count: pinnedMessages.length })}
              : {pinnedMessages[0]?.content}
            </span>
          </div>
        </div>
      )}

      {/* Search Panel */}
      {showSearch && (
        <div className="border-b bg-background">
          <SearchInConversation
            threadId={threadId}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 px-4 py-6"
        onScroll={handleScroll}
      >
        <div className="max-w-4xl mx-auto space-y-1">
          {/* Date divider */}
          <div className="text-center my-4">
            <span className="bg-white/80 dark:bg-muted/80 px-3 py-1 rounded-full text-xs text-muted-foreground">
              {new Date().toLocaleDateString()}
            </span>
          </div>

          {/* Messages */}
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId === user?.uid;
            const showAvatar = !isOwnMessage && messages[index + 1]?.senderId !== message.senderId;
            const isPinned = pinnedMessages.some((m) => m.id === message.id);
            const isMessageStarred = starredMessageIds.has(message.id);

            return (
              <MessageBubbleAdvanced
                key={message.id}
                message={message}
                isOwnMessage={isOwnMessage}
                showAvatar={showAvatar}
                showSenderName={!isOwnMessage && thread.isGroup}
                currentUserId={user?.uid || ''}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPin={handlePin}
                onStar={handleStar}
                onForward={handleForward}
                onReact={handleReact}
                onRemoveReaction={handleRemoveReaction}
                isPinned={isPinned}
                isStarred={isMessageStarred}
              />
            );
          })}

          {/* Typing Indicator */}
          {typingUsers.filter((u) => u.userId !== user?.uid).length > 0 && (
            <div className="flex gap-2">
              <div className="w-8 h-8" /> {/* Avatar placeholder */}
              <TypingIndicator userName={contactName} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="absolute bottom-24 right-8 z-10">
          <Button
            size="icon"
            className="rounded-full shadow-lg w-12 h-12"
            onClick={scrollToBottom}
          >
            <ArrowDown className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Message Input */}
      <MessageInputAdvanced
        threadId={threadId}
        senderId={user?.uid || ''}
        senderName={user?.displayName || 'Unknown'}
        senderPhotoUrl={user?.photoURL}
        replyToMessage={replyToMessage}
        onCancelReply={() => setReplyToMessage(null)}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
      />
    </div>
  );
}
