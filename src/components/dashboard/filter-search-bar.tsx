/**
 * SearchBar pour filtres dashboard
 * Phase 9 - Option F : Filtres Avancés
 * 
 * Features :
 * - Input avec icône search
 * - Debounce 300ms (géré par use-dashboard-filters)
 * - Clear button
 * - Placeholder i18n
 */

'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function FilterSearchBar({
  value,
  onChange,
  placeholder,
  className
}: FilterSearchBarProps) {
  const t = useTranslations('Dashboard.filters');
  
  return (
    <div className={`relative ${className || ''}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('searchPlaceholder')}
        className="pl-10 pr-10"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange('')}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{t('clearSearch')}</span>
        </Button>
      )}
    </div>
  );
}
