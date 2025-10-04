/**
 * ConversationList Component
 * 
 * Displays list of user conversations in sidebar
 * Shows unread counts, last message preview, and avatar
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, es, de, ja } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations, useLocale } from 'next-intl';
import type { Conversation } from '@/lib/firestore-conversations';
import { getOtherParticipant } from '@/lib/firestore-conversations';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  currentUserId: string;
  loading: boolean;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

const localeMap = {
  en: enUS,
  fr: fr,
  es: es,
  de: de,
  ja: ja,
};

export function ConversationList({
  conversations,
  selectedConversationId,
  currentUserId,
  loading,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const t = useTranslations('messages');
  const locale = useLocale() as keyof typeof localeMap;

  if (loading) {
    return (
      <div className="flex flex-col h-full border-r">
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 p-2 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 p-3">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r bg-muted/10">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{t('general.conversations')}</h2>
          <Badge variant="secondary">{conversations.length}</Badge>
        </div>
        <Button onClick={onNewConversation} className="w-full" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          {t('actions.newConversation')}
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">{t('placeholders.noConversations')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('labels.startNewConversation')}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation, currentUserId);
              const unreadCount = conversation.unreadCount[currentUserId] || 0;
              const isSelected = conversation.id === selectedConversationId;
              
              const timestamp = conversation.lastMessageAt?.toDate
                ? formatDistanceToNow(conversation.lastMessageAt.toDate(), {
                    addSuffix: true,
                    locale: localeMap[locale] || enUS,
                  })
                : '';

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    'w-full flex gap-3 p-3 rounded-lg text-left transition-colors',
                    'hover:bg-muted',
                    isSelected && 'bg-muted'
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={otherUser?.avatar} />
                    <AvatarFallback>
                      {otherUser?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {otherUser?.name || t('labels.unknown')}
                      </span>
                      {unreadCount > 0 && (
                        <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-xs">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </div>

                    <p
                      className={cn(
                        'text-xs truncate',
                        unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {conversation.lastMessage || t('placeholders.noMessages')}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
