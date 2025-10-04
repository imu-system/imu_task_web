/**
 * ConversationList Component
 * 
 * Displays list of user conversations in sidebar
 * Shows unread counts, last message preview, and avatar
 */

'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, es, de, ja } from 'date-fns/locale';
import { MessageCircle, Archive, MoreVertical, ArchiveRestore, BellOff, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations, useLocale } from 'next-intl';
import type { Conversation } from '@/lib/firestore-conversations';
import { getOtherParticipant } from '@/lib/firestore-conversations';
import {
  archiveConversation,
  unarchiveConversation,
  muteConversation,
  unmuteConversation,
  isConversationMuted,
} from '@/lib/firestore-conversation-actions';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  archivedConversations: Conversation[];
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
  archivedConversations,
  selectedConversationId,
  currentUserId,
  loading,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const t = useTranslations('messages');
  const locale = useLocale() as keyof typeof localeMap;
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const handleArchive = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await archiveConversation(conversationId, currentUserId);
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  const handleUnarchive = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await unarchiveConversation(conversationId, currentUserId);
    } catch (error) {
      console.error('Failed to unarchive conversation:', error);
    }
  };

  const handleMute = async (conversationId: string, conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const isMuted = isConversationMuted(conversation.mutedBy, currentUserId);
      if (isMuted) {
        await unmuteConversation(conversationId, currentUserId);
      } else {
        await muteConversation(conversationId, currentUserId);
      }
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

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

  const renderConversationItem = (conversation: Conversation, isArchived: boolean = false) => {
    const otherUser = getOtherParticipant(conversation, currentUserId);
    const unreadCount = conversation.unreadCount[currentUserId] || 0;
    const isSelected = conversation.id === selectedConversationId;
    const isMuted = isConversationMuted(conversation.mutedBy, currentUserId);
    
    const timestamp = conversation.lastMessageAt?.toDate
      ? formatDistanceToNow(conversation.lastMessageAt.toDate(), {
          addSuffix: true,
          locale: localeMap[locale] || enUS,
        })
      : '';

    return (
      <div
        key={conversation.id}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors relative group',
          isSelected
            ? 'bg-primary/10 border border-primary/20'
            : 'hover:bg-muted/50'
        )}
        onClick={() => onSelectConversation(conversation.id)}
      >
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage src={otherUser?.avatar} />
          <AvatarFallback>{otherUser?.name[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-medium text-sm truncate flex items-center gap-1">
              {otherUser?.name}
              {isMuted && <BellOff className="h-3 w-3 text-muted-foreground" />}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">{timestamp}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground truncate">
              {conversation.lastMessage}
            </p>
            {unreadCount > 0 && !isMuted && (
              <Badge variant="destructive" className="shrink-0">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => handleMute(conversation.id, conversation, e)}>
              {isMuted ? (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Unmute
                </>
              ) : (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Mute
                </>
              )}
            </DropdownMenuItem>
            {isArchived ? (
              <DropdownMenuItem onClick={(e) => handleUnarchive(conversation.id, e)}>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Unarchive
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={(e) => handleArchive(conversation.id, e)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

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

      {/* Tabs: Active / Archived */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'archived')} className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="active" className="flex-1">
            Active ({conversations.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex-1">
            <Archive className="h-3 w-3 mr-1" />
            Archived ({archivedConversations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex-1 m-0">
          <ScrollArea className="h-full">
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
                {conversations.map((conv) => renderConversationItem(conv, false))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="archived" className="flex-1 m-0">
          <ScrollArea className="h-full">
            {archivedConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Archive className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No archived conversations</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {archivedConversations.map((conv) => renderConversationItem(conv, true))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
