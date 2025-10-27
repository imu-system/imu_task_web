/**
 * ThreadListItem Component
 * 
 * Item individuel dans la liste des threads
 * Affiche avatar, nom, dernier message, badge unread, timestamp
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { MoreVertical, Archive, ArchiveRestore, Trash2, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTranslations, useLocale } from 'next-intl';
import { useArchiveThread, useDeleteThread, useUpdateThread } from '@/hooks/use-messaging';
import type { Thread } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ThreadListItemProps {
  thread: Thread;
  userId: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ThreadListItem({
  thread,
  userId,
  isSelected,
  onClick,
}: ThreadListItemProps) {
  const t = useTranslations('messaging');
  const locale = useLocale();

  const archiveMutation = useArchiveThread();
  const updateMutation = useUpdateThread();
  const deleteMutation = useDeleteThread();

  // Informations sur l'autre participant
  const otherParticipantId = thread.participants.find((id) => id !== userId);
  const otherParticipant = thread.participantsData?.[otherParticipantId || ''];

  // Nombre de messages non lus pour cet utilisateur
  const unreadCount = thread.unreadCount?.[userId] || 0;

  // Dernier message (tronqué)
  const lastMessagePreview = thread.lastMessage?.content
    ? thread.lastMessage.content.length > 50
      ? thread.lastMessage.content.substring(0, 50) + '...'
      : thread.lastMessage.content
    : t('noMessages');

  // Timestamp formaté
  const timestamp = typeof thread.lastMessageAt === 'string' 
    ? new Date(thread.lastMessageAt) 
    : thread.lastMessageAt;
  const formattedTime = formatDistanceToNow(timestamp, {
    addSuffix: true,
    locale: locale === 'fr' ? fr : enUS,
  });

  // Initiales pour l'avatar
  const initials = otherParticipant?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  // Handle archive/unarchive
  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (thread.status === 'archived') {
      updateMutation.mutate({
        threadId: thread.id,
        updates: { status: 'active' as any },
      });
    } else {
      archiveMutation.mutate(thread.id);
    }
  };

  // Handle delete
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('confirmDelete'))) {
      deleteMutation.mutate(thread.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50',
        isSelected && 'bg-muted',
        unreadCount > 0 && 'bg-blue-50/50 dark:bg-blue-950/20'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-10 w-10">
        <AvatarImage src={otherParticipant?.photoUrl} alt={otherParticipant?.displayName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      {/* Contenu principal */}
      <div className="flex-1 min-w-0">
        {/* Header: Nom + Timestamp */}
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3 className={cn(
            'text-sm font-medium truncate',
            unreadCount > 0 && 'font-semibold'
          )}>
            {otherParticipant?.displayName || t('unknownUser')}
          </h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formattedTime}
          </span>
        </div>

        {/* Dernier message + Badge unread */}
        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            'text-sm text-muted-foreground truncate',
            unreadCount > 0 && 'font-medium text-foreground'
          )}>
            {thread.lastMessage?.senderId === userId && (
              <span className="text-muted-foreground mr-1">{t('you')}:</span>
            )}
            {lastMessagePreview}
          </p>

          {unreadCount > 0 && (
            <Badge variant="default" className="ml-2 shrink-0">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </div>

        {/* Indicateur de frappe (si actif) */}
        {thread.typingUsers && thread.typingUsers.length > 0 && !thread.typingUsers.includes(userId) && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {t('typing')}
          </p>
        )}

        {/* Metadata (task title si disponible) */}
        {thread.taskTitle && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {t('relatedTask')}: {thread.taskTitle}
          </p>
        )}
      </div>

      {/* Menu Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleArchive}>
            {thread.status === 'archived' ? (
              <>
                <ArchiveRestore className="h-4 w-4 mr-2" />
                {t('actions.unarchive')}
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                {t('actions.archive')}
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
