'use client';

import { useParams } from 'next/navigation';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useThread, useMarkThreadAsRead } from '@/hooks/use-messaging';
import { ConversationHeader } from '@/components/messaging/conversation-header';
import { MessageList } from '@/components/messaging/message-list';
import { MessageInput } from '@/components/messaging/message-input';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

export default function ConversationPage() {
  const params = useParams();
  const threadId = params.threadId as string;
  const { user, loading: authLoading } = useRequireAuth();
  const { data: thread, isLoading: threadLoading } = useThread(threadId);
  const markAsReadMutation = useMarkThreadAsRead();

  // Mark thread as read when opened
  useEffect(() => {
    if (user && threadId && thread) {
      const unreadCount = thread.unreadCount[user.uid] || 0;
      if (unreadCount > 0) {
        markAsReadMutation.mutate({ threadId, userId: user.uid });
      }
    }
  }, [threadId, user, thread, markAsReadMutation]);

  // Loading state
  if (authLoading || threadLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="h-16 bg-muted flex items-center gap-3 px-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex-1 bg-[#EFEAE2] dark:bg-[#0B141A] p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-16 w-64 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="h-20 border-t bg-background p-3">
          <Skeleton className="h-full w-full rounded-full" />
        </div>
      </div>
    );
  }

  if (!user || !thread) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">Thread not found</p>
      </div>
    );
  }

  const otherParticipantId = thread.participants.find(id => id !== user.uid);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <ConversationHeader thread={thread} currentUserId={user.uid} locale="fr" />
      <MessageList threadId={threadId} currentUserId={user.uid} otherParticipantId={otherParticipantId} participantsData={thread.participantsData} locale="fr" />
      <MessageInput threadId={threadId} senderId={user.uid} senderName={user.displayName || 'User'} senderPhotoUrl={user.photoURL || undefined} />
    </div>
  );
}
