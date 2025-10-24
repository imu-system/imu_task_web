/**
 * ConversationList Component
 * 
 * Displays list of user conversations in sidebar
 * Shows unread counts, last message preview, and avatar
 */

'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, es, de, ja } from 'date-fns/locale';
import { MessageCircle, Archive, MoreVertical, ArchiveRestore, BellOff, Bell, Search, ArrowUpDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

type SortOption = 'recent' | 'alphabetical' | 'unread';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Filter and sort conversations
  const filteredAndSortedConversations = useMemo(() => {
    const filterConversations = (convs: Conversation[]) => {
      let filtered = convs;

      // Apply search filter
      if (searchQuery.trim()) {
        filtered = filtered.filter((conv) => {
          const otherUser = getOtherParticipant(conv, currentUserId);
          return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
        });
      }

      // Apply sorting
      const sorted = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'alphabetical':
            const nameA = getOtherParticipant(a, currentUserId)?.name.toLowerCase() || '';
            const nameB = getOtherParticipant(b, currentUserId)?.name.toLowerCase() || '';
            return nameA.localeCompare(nameB);
          
          case 'unread':
            const unreadA = a.unreadCount[currentUserId] || 0;
            const unreadB = b.unreadCount[currentUserId] || 0;
            if (unreadB !== unreadA) return unreadB - unreadA;
            return b.lastMessageAt?.toMillis() - a.lastMessageAt?.toMillis();
          
          case 'recent':
          default:
            return b.lastMessageAt?.toMillis() - a.lastMessageAt?.toMillis();
        }
      });

      return sorted;
    };

    return {
      active: filterConversations(conversations),
      archived: filterConversations(archivedConversations),
    };
  }, [conversations, archivedConversations, searchQuery, sortBy, currentUserId]);

  const handleArchive = useCallback(async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await archiveConversation(conversationId, currentUserId);
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  }, [currentUserId]);

  const handleUnarchive = useCallback(async (conversationId: string) => {
    try {
      await unarchiveConversation(conversationId, currentUserId);
    } catch (error) {
      console.error('Failed to unarchive conversation:', error);
    }
  }, [currentUserId]);

  const handleMute = useCallback(async (conversationId: string, conversation: Conversation, e: React.MouseEvent) => {
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
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="flex flex-col h-full border-r">
        {/* Header Skeleton */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>

        {/* Search & Sort Skeleton */}
        <div className="p-3 border-b space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Tabs Skeleton */}
        <div className="border-b">
          <div className="flex">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>

        {/* Conversations Skeleton */}
        <div className="flex-1 p-2 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-2xl">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
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
          'flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors relative group',
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
              <DropdownMenuItem onClick={() => handleUnarchive(conversation.id)}>
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
          <Badge variant="secondary">
            {activeTab === 'active' ? filteredAndSortedConversations.active.length : filteredAndSortedConversations.archived.length}
          </Badge>
        </div>
        <Button onClick={onNewConversation} className="w-full" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          {t('actions.newConversation')}
        </Button>
      </div>

      {/* Search & Sort */}
      <div className="p-3 border-b space-y-2 bg-background">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('placeholders.searchConversations') || 'Search conversations...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-start h-8">
              <ArrowUpDown className="h-3 w-3 mr-2" />
              {sortBy === 'recent' && (t('sort.recent') || 'Most recent')}
              {sortBy === 'alphabetical' && (t('sort.alphabetical') || 'Alphabetical')}
              {sortBy === 'unread' && (t('sort.unread') || 'Unread first')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuLabel>{t('sort.sortBy') || 'Sort by'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortBy('recent')}>
              {t('sort.recent') || 'Most recent'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>
              {t('sort.alphabetical') || 'Alphabetical'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('unread')}>
              {t('sort.unread') || 'Unread first'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs: Active / Archived */}
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as 'active' | 'archived')} 
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="active" className="flex-1 data-[state=active]:bg-background transition-all">
            Active ({filteredAndSortedConversations.active.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex-1 data-[state=active]:bg-background transition-all">
            <Archive className="h-3 w-3 mr-1" />
            Archived ({filteredAndSortedConversations.archived.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex-1 m-0">
          <ScrollArea className="h-full">
            {filteredAndSortedConversations.active.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center h-[400px]">
                {searchQuery ? (
                  <>
                    <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('placeholders.noResults') || 'No conversations found'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search
                    </p>
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('placeholders.noConversations') || 'No conversations yet'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('labels.startNewConversation') || 'Start a new conversation to get started'}
                    </p>
                    <Button 
                      onClick={onNewConversation} 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                    >
                      <MessageCircle className="h-3 w-3 mr-2" />
                      New Conversation
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredAndSortedConversations.active.map((conv) => renderConversationItem(conv, false))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="archived" className="flex-1 m-0">
          <ScrollArea className="h-full">
            {filteredAndSortedConversations.archived.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center h-[400px]">
                {searchQuery ? (
                  <>
                    <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('placeholders.noResults') || 'No conversations found'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search
                    </p>
                  </>
                ) : (
                  <>
                    <Archive className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('placeholders.noArchivedConversations') || 'No archived conversations'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Archived conversations will appear here
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredAndSortedConversations.archived.map((conv) => renderConversationItem(conv, true))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
