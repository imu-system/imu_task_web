'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Message } from '@/lib/types';
import { MessageBubble } from './message-bubble';
import { useThreadMessages } from '@/hooks/use-messaging';
import { cn } from '@/lib/utils';

interface MessageListProps {
  threadId: string;
  currentUserId: string;
  otherParticipantId?: string;
  participantsData?: Record<string, any>;
  locale?: string;
}

export function MessageList({
  threadId,
  currentUserId,
  otherParticipantId,
  participantsData = {},
  locale = 'fr',
}: MessageListProps) {
  const t = useTranslations('messaging');
  const { data: messages, isLoading } = useThreadMessages(threadId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.id !== lastMessageRef.current) {
      lastMessageRef.current = lastMessage.id;
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format date label
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return t('today');
    if (isYesterday(date)) return t('yesterday');
    
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return format(date, 'EEEE', { locale: locale === 'fr' ? fr : enUS });
    }
    
    const currentYear = new Date().getFullYear();
    if (date.getFullYear() === currentYear) {
      return format(date, 'd MMMM', { locale: locale === 'fr' ? fr : enUS });
    }
    
    return format(date, 'd MMMM yyyy', { locale: locale === 'fr' ? fr : enUS });
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: Date; messages: Message[] }[] = [];
    let currentGroup: { date: Date; messages: Message[] } | null = null;

    messages.forEach((message) => {
      const messageDate = typeof message.createdAt === 'string' 
        ? new Date(message.createdAt) 
        : message.createdAt;

      if (!currentGroup || !isSameDay(currentGroup.date, messageDate)) {
        currentGroup = { date: messageDate, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(message);
    });

    return groups;
  };

  // Check if message should show avatar
  const shouldShowAvatar = (message: Message, index: number, groupMessages: Message[]) => {
    if (message.senderId === currentUserId) return false;
    if (index === groupMessages.length - 1) return true;
    
    const nextMessage = groupMessages[index + 1];
    return nextMessage.senderId !== message.senderId;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 bg-[#EFEAE2] dark:bg-[#0B141A] p-4 space-y-4 overflow-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={cn(
            "flex gap-2",
            i % 2 === 0 ? "flex-row" : "flex-row-reverse"
          )}>
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-64 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 bg-[#EFEAE2] dark:bg-[#0B141A] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">💬</p>
          <p className="text-sm">{t('noMessages')}</p>
          <p className="text-xs mt-1">{t('sendFirstMessage')}</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <ScrollArea className="flex-1 bg-[#EFEAE2] dark:bg-[#0B141A]">
      <div className="p-4 space-y-4">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            {/* Date separator */}
            <div className="sticky top-2 z-10 flex justify-center my-4">
              <div className="bg-white/80 dark:bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full shadow-sm">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  {getDateLabel(group.date)}
                </p>
              </div>
            </div>

            {/* Messages */}
            {group.messages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUserId;
              const isRead = message.readBy?.includes(otherParticipantId || '') || false;
              const showAvatar = shouldShowAvatar(message, index, group.messages);
              
              const senderData = participantsData[message.senderId];

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                  isRead={isRead}
                  senderAvatar={senderData?.photoUrl}
                  senderName={senderData?.displayName || message.senderName}
                  locale={locale}
                  showAvatar={showAvatar}
                />
              );
            })}
          </div>
        ))}

        {/* Read receipt for last message */}
        {messages.length > 0 && otherParticipantId && (
          (() => {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.senderId === currentUserId && lastMessage.readBy?.includes(otherParticipantId)) {
              const senderData = participantsData[otherParticipantId];
              return (
                <div className="flex justify-end mb-2">
                  <p className="text-xs text-muted-foreground">
                    {t('seenBy')} {senderData?.displayName || t('unknownUser')}
                  </p>
                </div>
              );
            }
            return null;
          })()
        )}

        {/* Auto-scroll anchor */}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}
