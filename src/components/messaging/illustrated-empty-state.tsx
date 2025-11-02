/**
 * Illustrated Empty State Component
 * 
 * État vide avec illustration SVG style WhatsApp
 * Différentes illustrations selon le contexte
 */

'use client';

import { MessageCircle, Inbox, Star, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type EmptyStateType = 'no-messages' | 'no-unread' | 'no-favorites' | 'no-groups' | 'search-empty';

interface IllustratedEmptyStateProps {
  type: EmptyStateType;
  searchQuery?: string;
  className?: string;
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, {
  icon: typeof MessageCircle;
  titleKey: string;
  descriptionKey: string;
  iconColor: string;
}> = {
  'no-messages': {
    icon: MessageCircle,
    titleKey: 'emptyStates.noConversations',
    descriptionKey: 'emptyStates.noConversationsDesc',
    iconColor: 'text-[#00a884]',
  },
  'no-unread': {
    icon: Inbox,
    titleKey: 'emptyStates.noUnread',
    descriptionKey: 'emptyStates.noUnreadDesc',
    iconColor: 'text-blue-500',
  },
  'no-favorites': {
    icon: Star,
    titleKey: 'emptyStates.noFavorites',
    descriptionKey: 'emptyStates.noFavoritesDesc',
    iconColor: 'text-amber-500',
  },
  'no-groups': {
    icon: Users,
    titleKey: 'emptyStates.noGroups',
    descriptionKey: 'emptyStates.noGroupsDesc',
    iconColor: 'text-purple-500',
  },
  'search-empty': {
    icon: Inbox,
    titleKey: 'emptyStates.searchEmpty',
    descriptionKey: 'emptyStates.searchEmptyDesc',
    iconColor: 'text-gray-400',
  },
};

export function IllustratedEmptyState({
  type,
  searchQuery,
  className,
}: IllustratedEmptyStateProps) {
  const t = useTranslations('messaging');
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center h-full p-8 text-center',
        className
      )}
      data-testid={`empty-state-${type}`}
    >
      {/* Illustration circle with icon */}
      <div className="relative mb-6">
        {/* Background circles (decoration) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00a884]/5 to-[#25d366]/10 animate-pulse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00a884]/10 to-[#25d366]/20" />
        </div>
        
        {/* Icon */}
        <div className="relative flex items-center justify-center w-32 h-32">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg">
            <Icon className={cn('h-10 w-10', config.iconColor)} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Text content */}
      <h3 className="text-xl font-semibold text-[#111b21] mb-2">
        {t(config.titleKey)}
      </h3>
      <p className="text-sm text-[#667781] max-w-sm">
        {type === 'search-empty' && searchQuery
          ? t(config.descriptionKey, { query: searchQuery })
          : t(config.descriptionKey)
        }
      </p>

      {/* Optional CTA for main empty state */}
      {type === 'no-messages' && (
        <p className="mt-6 text-xs text-[#8696a0]">
          {t('emptyStates.clickNewChat')}
        </p>
      )}
    </div>
  );
}
