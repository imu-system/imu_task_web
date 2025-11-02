/**
 * Header Actions Component
 * 
 * Icônes d'actions dans le header (menu, statut, nouveau chat)
 * Style WhatsApp Web
 */

'use client';

import { MoreVertical, Users, MessageSquarePlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';

interface HeaderActionsProps {
  onNewGroup?: () => void;
  onNewChat?: () => void;
  onSettings?: () => void;
  onArchived?: () => void;
}

export function HeaderActions({
  onNewGroup,
  onNewChat,
  onSettings,
  onArchived,
}: HeaderActionsProps) {
  const t = useTranslations('messaging');

  return (
    <div className="flex items-center gap-1">
      {/* New Group */}
      {onNewGroup && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-[#54656f] hover:bg-[#f0f2f5]"
          onClick={onNewGroup}
          title={t('headerActions.newGroup') || 'New group'}
        >
          <Users className="h-5 w-5" />
        </Button>
      )}

      {/* New Chat */}
      {onNewChat && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-[#54656f] hover:bg-[#f0f2f5]"
          onClick={onNewChat}
          title={t('headerActions.newChat') || 'New chat'}
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      )}

      {/* Menu dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[#54656f] hover:bg-[#f0f2f5]"
            data-testid="header-menu-button"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48" data-testid="header-menu-dropdown">
          {onArchived && (
            <>
              <DropdownMenuItem onClick={onArchived}>
                {t('headerActions.archived') || 'Archived'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {onSettings && (
            <DropdownMenuItem onClick={onSettings}>
              {t('headerActions.settings') || 'Settings'}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
