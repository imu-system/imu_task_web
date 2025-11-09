/**
 * ThreadList Component
 * 
 * Liste des conversations (threads) de l'utilisateur avec filtres et recherche
 * Utilise la nouvelle architecture Thread avec real-time updates
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Search, Filter, Archive, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations, useLocale } from 'next-intl';
import { useUserThreads, useSearchThreads } from '@/hooks/use-messaging';
import { ThreadListItem } from './thread-list-item';
import { FilterPills, type FilterType } from './filter-pills';
import { HeaderActions } from './header-actions';
import { IllustratedEmptyState } from './illustrated-empty-state';
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
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Récupération des threads avec real-time updates (toujours actifs)
  const {
    data: threads = [],
    isLoading,
    error,
    isFetching,
  } = useUserThreads(userId, {
    status: 'active' as ThreadStatus,
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

  // Debug log
  useEffect(() => {
    console.log('📊 ThreadList Debug:', {
      userId,
      threadsCount: threads.length,
      displayedCount: displayedThreads.length,
      isLoading,
      error: error?.message,
      activeFilter,
    });
  }, [threads.length, displayedThreads.length, isLoading, error, userId, activeFilter]);

  // Filtrage selon le filtre actif
  const filteredThreads = useMemo(() => {
    let filtered = displayedThreads;

    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(
          (thread) => thread.unreadCount && thread.unreadCount[userId] > 0
        );
        break;
      case 'favorites':
        // TODO: Implémenter le système de favoris
        filtered = [];
        break;
      case 'groups':
        // TODO: Implémenter les groupes (participants.length > 2)
        filtered = filtered.filter((thread) => thread.participants.length > 2);
        break;
      case 'all':
      default:
        // Pas de filtrage supplémentaire
        break;
    }

    return filtered;
  }, [displayedThreads, activeFilter, userId]);

  // Tri par dernière activité
  const sortedThreads = useMemo(() => {
    return [...filteredThreads].sort((a, b) => {
      const dateA = typeof a.lastMessageAt === 'string' 
        ? new Date(a.lastMessageAt).getTime()
        : a.lastMessageAt.getTime();
      const dateB = typeof b.lastMessageAt === 'string'
        ? new Date(b.lastMessageAt).getTime()
        : b.lastMessageAt.getTime();
      return dateB - dateA;
    });
  }, [filteredThreads]);

  // Nombre de threads non lus
  const unreadCount = useMemo(() => {
    return threads.filter(
      (thread) => thread.unreadCount && thread.unreadCount[userId] > 0
    ).length;
  }, [threads, userId]);

  // Compteurs pour chaque filtre
  const filterCounts = useMemo(() => {
    return {
      all: threads.length,
      unread: threads.filter(
        (thread) => thread.unreadCount && thread.unreadCount[userId] > 0
      ).length,
      favorites: 0, // TODO: Implémenter favoris
      groups: threads.filter((thread) => thread.participants.length > 2).length,
    };
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
    <div className="flex flex-col h-full bg-white" data-testid="thread-list">
      {/* Header avec recherche - WhatsApp style */}
      <div className="p-3 border-b border-border/50 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#111b21]">{t('title')}</h2>
          <HeaderActions
            onNewChat={onNewThread}
            onSettings={() => console.log('Settings')}
            onArchived={() => console.log('Archived')}
          />
        </div>

        {/* Barre de recherche - WhatsApp style */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667781]" />
          <Input
            data-testid="thread-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9 bg-[#F0F2F5] border-none text-[#111b21] placeholder:text-[#667781] h-9 rounded-lg focus-visible:ring-[#00a884]"
          />
        </div>

        {/* Pills de filtres WhatsApp */}
        <FilterPills
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />
      </div>

      {/* Liste des threads */}
      <ScrollArea className="flex-1">
        {(isLoading && !error) || isSearching ? (
          <ThreadListSkeleton />
        ) : sortedThreads.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            activeFilter={activeFilter}
          />
        ) : (
          <div className="divide-y" data-testid="thread-list-items">
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
    <div className="divide-y" data-testid="thread-list-loading">
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
  activeFilter: FilterType;
}

function EmptyState({ searchQuery, activeFilter }: EmptyStateProps) {
  // Déterminer le type d'empty state
  let emptyType: 'no-messages' | 'no-unread' | 'no-favorites' | 'no-groups' | 'search-empty';

  if (searchQuery.length > 2) {
    emptyType = 'search-empty';
  } else {
    switch (activeFilter) {
      case 'unread':
        emptyType = 'no-unread';
        break;
      case 'favorites':
        emptyType = 'no-favorites';
        break;
      case 'groups':
        emptyType = 'no-groups';
        break;
      default:
        emptyType = 'no-messages';
    }
  }

  return (
    <IllustratedEmptyState
      type={emptyType}
      searchQuery={searchQuery}
      className="min-h-[400px]"
    />
  );
}
