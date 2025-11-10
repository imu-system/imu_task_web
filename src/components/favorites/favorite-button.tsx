'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToggleFavorite } from '@/hooks/use-favorites';
import type { FavoriteItemType } from '@/lib/firestore-favorites';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';

interface FavoriteButtonProps {
  itemId: string;
  itemType: FavoriteItemType;
  metadata?: {
    title?: string;
    imageUrl?: string;
    category?: string;
    [key: string]: any;
  };
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  iconClassName?: string;
  showLabel?: boolean;
}

/**
 * Favorite Button Component
 * 
 * Animated heart button to toggle favorite status for tasks and providers.
 * Features:
 * - Real-time favorite status
 * - Smooth animations
 * - Loading states
 * - Tooltip support
 * - Responsive sizing
 */
export function FavoriteButton({
  itemId,
  itemType,
  metadata,
  variant = 'ghost',
  size = 'icon',
  className,
  iconClassName,
  showLabel = false,
}: FavoriteButtonProps) {
  const { isFavorited, loading, toggle } = useToggleFavorite(
    itemId,
    itemType,
    metadata
  );
  const t = useTranslations('Favorites');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  };

  const label = isFavorited ? t('removeFromFavorites') : t('addToFavorites');

  const heartIcon = (
    <Heart
      className={cn(
        'transition-all duration-300',
        isFavorited
          ? 'fill-red-500 text-red-500 scale-110'
          : 'text-muted-foreground hover:text-red-500',
        iconClassName
      )}
      data-testid={`favorite-icon-${isFavorited ? 'filled' : 'empty'}`}
    />
  );

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'relative group',
        isFavorited && 'hover:bg-red-50 dark:hover:bg-red-950/20',
        className
      )}
      data-testid="favorite-button"
      aria-label={label}
    >
      {heartIcon}
      {showLabel && (
        <span className="ml-2">
          {isFavorited ? t('removeButton') : t('addToFavorites')}
        </span>
      )}
      
      {/* Pulse animation on favorite */}
      {isFavorited && (
        <span className="absolute inset-0 rounded-md animate-pulse-slow bg-red-500/10" />
      )}
    </Button>
  );

  if (showLabel) {
    return button;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
