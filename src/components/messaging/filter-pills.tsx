/**
 * Filter Pills Component
 * 
 * Filtres en forme de pills arrondis style WhatsApp Web
 * 4 filtres : Toutes, Non lues, Favoris, Groupes
 */

'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type FilterType = 'all' | 'unread' | 'favorites' | 'groups';

interface FilterPillsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts?: {
    all: number;
    unread: number;
    favorites: number;
    groups: number;
  };
}

interface FilterOption {
  id: FilterType;
  labelKey: string;
}

const FILTERS: FilterOption[] = [
  { id: 'all', labelKey: 'filters.all' },
  { id: 'unread', labelKey: 'filters.unread' },
  { id: 'favorites', labelKey: 'filters.favorites' },
  { id: 'groups', labelKey: 'filters.groups' },
];

export function FilterPills({
  activeFilter,
  onFilterChange,
  counts,
}: FilterPillsProps) {
  const t = useTranslations('messaging');

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.id;
        const count = counts?.[filter.id] || 0;
        const showCount = count > 0 && filter.id !== 'all';

        return (
          <button
            key={filter.id}
            data-testid={`filter-${filter.id}`}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              // Base styles
              'flex items-center gap-1.5 px-4 py-1.5 rounded-full',
              'text-sm font-medium whitespace-nowrap',
              'transition-all duration-200',
              'border',
              // Active state
              isActive
                ? 'bg-[#25D366] text-white border-[#25D366] shadow-sm'
                : 'bg-background text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground',
              // Hover animation (only for inactive)
              !isActive && 'hover:scale-105 active:scale-95'
            )}
          >
            <span>{t(filter.labelKey)}</span>
            {showCount && (
              <span
                className={cn(
                  'px-1.5 py-0.5 text-xs rounded-full font-semibold min-w-[20px] text-center',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-primary/10 text-primary'
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
