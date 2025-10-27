/**
 * ThreadList Component
 * 
 * Liste des conversations (threads) de l'utilisateur avec filtres et recherche
 * Utilise la nouvelle architecture Thread avec real-time updates
 */

'use client';

import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Search, Filter, Archive, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTranslations, useLocale } from 'next-intl';
import { useUserThreads, useSearchThreads } from '@/hooks/use-messaging';
import { ThreadListItem } from './thread-list-item';
import type { Thread, ThreadStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ThreadListProps {
  userId: string;
  selectedThreadId?: string | null;
  onSelectThread: (threadId: string) => void;
  onNewThread?: () => void;
}

export function ThreadList({
  userId,
  selectedThreadId,
  onSelectThread,
  onNewThread,
}: ThreadListProps) {
  const t = useTranslations('messaging');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // Récupération des threads avec real-time updates
  const {
    data: threads = [],
    isLoading,
    error,
  } = useUserThreads(userId, {
    status: (activeTab === 'active' ? 'active' : 'archived') as ThreadStatus,
  });

  // Recherche (si query non vide)
  const {
    data: searchResults = [],
    isLoading: isSearching,
  } = useSearchThreads(userId, searchQuery, {
    enabled: searchQuery.length > 2,
  });

  // Threads affichés (search ou liste normale)
  const displayedThreads = useMemo(() => {
    if (searchQuery.length > 2) {
      return searchResults;
    }
    return threads;
  }, [searchQuery, searchResults, threads]);

  // Tri par dernière activité
  const sortedThreads = useMemo(() => {
    return [...displayedThreads].sort((a, b) => {
      const dateA = typeof a.lastMessageAt === 'string' 
        ? new Date(a.lastMessageAt).getTime()
        : a.lastMessageAt.getTime();
      const dateB = typeof b.lastMessageAt === 'string'
        ? new Date(b.lastMessageAt).getTime()
        : b.lastMessageAt.getTime();
      return dateB - dateA;
    });
  }, [displayedThreads]);

  // Nombre de threads non lus
  const unreadCount = useMemo(() => {
    return threads.filter(
      (thread) => thread.unreadCount && thread.unreadCount[userId] > 0
    ).length;
  }, [threads, userId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {t('errors.loadThreads')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header avec recherche */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          {onNewThread && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNewThread}
            >
              {t('newThread')}
            </Button>
          )}
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9"
          />
        </div>

        {/* Onglets Active / Archived */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="relative">
              {t('tabs.active')}
              {unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived">
              <Archive className="h-4 w-4 mr-2" />
              {t('tabs.archived')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Liste des threads */}
      <ScrollArea className="flex-1">
        {isLoading || isSearching ? (
          <ThreadListSkeleton />
        ) : sortedThreads.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            activeTab={activeTab}
          />
        ) : (
          <div className="divide-y">
            {sortedThreads.map((thread) => (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                userId={userId}
                isSelected={selectedThreadId === thread.id}
                onClick={() => onSelectThread(thread.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function ThreadListSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Empty State
// ============================================================================

interface EmptyStateProps {
  searchQuery: string;
  activeTab: 'active' | 'archived';
}

function EmptyState({ searchQuery, activeTab }: EmptyStateProps) {
  const t = useTranslations('messaging');

  if (searchQuery.length > 2) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
        <Search className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {t('emptyStates.noResults')}
        </p>
      </div>
    );
  }

  if (activeTab === 'archived') {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
        <Archive className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {t('emptyStates.noArchived')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
      <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">
        {t('emptyStates.noThreads')}
      </p>
    </div>
  );
}
