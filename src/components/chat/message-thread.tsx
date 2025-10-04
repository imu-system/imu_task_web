/**
 * MessageThread Component
 * 
 * Displays messages in a conversation with message bubbles
 * Auto-scrolls to bottom on new messages
 */

'use client';

import { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, es, de, ja } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageImage } from '@/components/chat/message-image';
import { AlertCircle } from 'lucide-react';
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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.senderId === currentUserId;
        const timestamp = message.createdAt?.toDate
          ? formatDistanceToNow(message.createdAt.toDate(), {
              addSuffix: true,
              locale: localeMap[locale] || enUS,
            })
          : '';

        return (
          <div
            key={message.id}
            className={cn('flex gap-3 items-end', isCurrentUser ? 'justify-end' : 'justify-start')}
          >
            {!isCurrentUser && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={message.senderAvatar} />
                <AvatarFallback>{message.senderName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            )}

            <div className={cn('flex flex-col gap-1 max-w-[70%]', isCurrentUser && 'items-end')}>
              {!isCurrentUser && (
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

              <span className="text-xs text-muted-foreground px-3">{timestamp}</span>
            </div>

            {isCurrentUser && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={message.senderAvatar} />
                <AvatarFallback>{message.senderName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
