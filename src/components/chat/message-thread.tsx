/**
 * MessageThread Component
 * 
 * Display  // Handle scroll event
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!isAtBottom && messages.length > 0);
    
    if (!isAtBottom) {
      setUserHasScrolled(true);
    }
  }, [messages.length]);

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {conversation with message bubbles
 * Auto-scrolls to bottom on new messages
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from 'date-fns';
import { fr, enUS, es, de, ja } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageImage } from '@/components/chat/message-image';
import { AlertCircle, ArrowDown } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import type { Message } from '@/lib/firestore-messages';
import { cn } from '@/lib/utils';

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  error: string | null;
}

const localeMap = {
  en: enUS,
  fr: fr,
  es: es,
  de: de,
  ja: ja,
};

export function MessageThread({ messages, currentUserId, loading, error }: MessageThreadProps) {
  const t = useTranslations('messages');
  const locale = useLocale() as keyof typeof localeMap;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userHasScrolled, setUserHasScrolled] = useState(false);

  // Check if user has scrolled away from bottom
  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!isAtBottom && messages.length > 0);
    
    if (!isAtBottom) {
      setUserHasScrolled(true);
    }
  };

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
    setUserHasScrolled(false);
  }, []);

  // Auto-scroll to bottom on new messages (only if user hasn't scrolled)
  useEffect(() => {
    if (!userHasScrolled && messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages, userHasScrolled]);

  // Initial scroll to bottom (instant)
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('auto');
    }
  }, []);

  // Helper: Check if message should be grouped with previous
  const isGroupedMessage = (currentMsg: Message, prevMsg: Message | undefined): boolean => {
    if (!prevMsg) return false;
    
    const timeDiff = currentMsg.createdAt?.toMillis() - prevMsg.createdAt?.toMillis();
    const isSameSender = prevMsg.senderId === currentMsg.senderId;
    const within5Minutes = timeDiff < 5 * 60 * 1000; // 5 minutes
    
    return isSameSender && within5Minutes;
  };

  // Helper: Format date for separator
  const formatDateSeparator = (date: Date): string => {
    if (isToday(date)) {
      return t('date.today') || 'Today';
    }
    if (isYesterday(date)) {
      return t('date.yesterday') || 'Yesterday';
    }
    return format(date, 'MMMM d, yyyy', { locale: localeMap[locale] || enUS });
  };

  // Helper: Check if we need a date separator
  const shouldShowDateSeparator = (currentMsg: Message, prevMsg: Message | undefined): boolean => {
    if (!prevMsg) return true;
    
    const currentDate = currentMsg.createdAt?.toDate();
    const prevDate = prevMsg.createdAt?.toDate();
    
    if (!currentDate || !prevDate) return false;
    
    return !isSameDay(currentDate, prevDate);
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={cn('flex gap-3', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
            {i % 2 === 0 && <Skeleton className="h-10 w-10 rounded-full shrink-0" />}
            <div className="space-y-2 max-w-[70%]">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full" />
            </div>
            {i % 2 !== 0 && <Skeleton className="h-10 w-10 rounded-full shrink-0" />}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">{t('placeholders.noMessages')}</p>
          <p className="text-sm mt-2">{t('labels.startConversation')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col">
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-1"
        onScroll={handleScroll}
      >
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === currentUserId;
          const prevMessage = index > 0 ? messages[index - 1] : undefined;
          const isGrouped = isGroupedMessage(message, prevMessage);
          const showDateSeparator = shouldShowDateSeparator(message, prevMessage);
          
          const timestamp = message.createdAt?.toDate
            ? formatDistanceToNow(message.createdAt.toDate(), {
                addSuffix: true,
                locale: localeMap[locale] || enUS,
              })
            : '';

          return (
            <div key={message.id}>
              {/* Date Separator */}
              {showDateSeparator && message.createdAt?.toDate && (
                <div className="flex items-center gap-2 my-6">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-xs text-muted-foreground px-3 py-1 bg-muted rounded-full">
                    {formatDateSeparator(message.createdAt.toDate())}
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>
              )}

              {/* Message */}
              <div
                className={cn(
                  'flex gap-3 items-end',
                  isCurrentUser ? 'justify-end' : 'justify-start',
                  isGrouped ? 'mt-1' : 'mt-4'
                )}
              >
                {!isCurrentUser && (
                  <Avatar className={cn('h-8 w-8 shrink-0', isGrouped && 'invisible')}>
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback>{message.senderName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                )}

                <div className={cn('flex flex-col gap-1 max-w-[70%]', isCurrentUser && 'items-end')}>
                  {!isCurrentUser && !isGrouped && (
                    <span className="text-xs text-muted-foreground px-3">{message.senderName}</span>
                  )}
                  
                  {message.type === 'image' && message.fileUrl ? (
                    <div
                      className={cn(
                        'rounded-2xl overflow-hidden',
                        isCurrentUser ? 'rounded-br-sm' : 'rounded-bl-sm'
                      )}
                    >
                      <MessageImage src={message.fileUrl} alt={message.content} />
                      {message.content && message.content !== '📷 Image' && (
                        <div
                          className={cn(
                            'px-4 py-2',
                            isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2 break-words',
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  )}

                  {!isGrouped && (
                    <span className="text-xs text-muted-foreground px-3">{timestamp}</span>
                  )}
                </div>

                {isCurrentUser && (
                  <Avatar className={cn('h-8 w-8 shrink-0', isGrouped && 'invisible')}>
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback>{message.senderName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <Button
            size="sm"
            variant="secondary"
            className="shadow-lg rounded-full h-10 w-10 p-0"
            onClick={() => scrollToBottom('smooth')}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
