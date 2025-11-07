/**
 * DashboardFilters - Composant wrapper
 * Phase 9 - Option F : Filtres Avancés
 * 
 * Combine tous les filtres :
 * - DateRangePicker (6 presets + custom)
 * - CategoryCheckboxes (8 catégories)
 * - StatusRadio (all/completed/active/cancelled)
 * - SearchBar (debounce 300ms)
 * 
 * Features :
 * - Collapsible (Sheet mobile, Card desktop)
 * - Reset all filters button
 * - Active filters count badge
 */

'use client';

import { useTranslations } from 'next-intl';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useDashboardFilters } from '@/hooks/use-dashboard-filters';
import { FilterDateRangePicker } from './filter-date-range-picker';
import { FilterCategoryCheckboxes } from './filter-category-checkboxes';
import { FilterStatusRadio } from './filter-status-radio';
import { FilterSearchBar } from './filter-search-bar';

interface DashboardFiltersProps {
  userId?: string;
  onFiltersChange?: (filters: ReturnType<typeof useDashboardFilters>['filters']) => void;
  variant?: 'card' | 'sheet'; // Card pour desktop, Sheet pour mobile
  className?: string;
}

export function DashboardFilters({
  userId,
  onFiltersChange,
  variant = 'card',
  className
}: DashboardFiltersProps) {
  const t = useTranslations('Dashboard.filters');
  
  const {
    filters,
    metadata,
    setDateRangePreset,
    setDateRange,
    toggleCategory,
    setStatus,
    setSearchQuery,
    resetFilters,
    hasActiveFilters
  } = useDashboardFilters({
    userId,
    persistToLocalStorage: true,
    syncToUrl: true,
    debounceMs: 300
  });
  
  // Notify parent of filter changes
  if (onFiltersChange) {
    onFiltersChange(filters);
  }
  
  // Filter content (shared between Card and Sheet)
  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          {t('search')}
        </label>
        <FilterSearchBar
          value={filters.searchQuery}
          onChange={setSearchQuery}
        />
      </div>
      
      <Separator />
      
      {/* Date Range */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          {t('dateRange.label')}
        </label>
        <FilterDateRangePicker
          preset={filters.dateRangePreset}
          dateRange={filters.dateRange}
          onPresetChange={setDateRangePreset}
          onDateRangeChange={setDateRange}
        />
      </div>
      
      <Separator />
      
      {/* Status */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          {t('status.label')}
        </label>
        <FilterStatusRadio
          value={filters.status}
          onChange={setStatus}
        />
      </div>
      
      <Separator />
      
      {/* Categories */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          {t('categories')}
        </label>
        <FilterCategoryCheckboxes
          selected={filters.categories}
          onChange={() => {}} // Handled by toggleCategory
          onToggle={toggleCategory}
        />
      </div>
      
      {/* Reset button */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button
            type="button"
            variant="outline"
            onClick={resetFilters}
            className="w-full"
          >
            <X className="mr-2 h-4 w-4" />
            {t('resetAll')}
          </Button>
        </>
      )}
    </div>
  );
  
  // Card variant (desktop)
  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('title')}
            </CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary">
                {metadata.activeFiltersCount}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <FiltersContent />
        </CardContent>
      </Card>
    );
  }
  
  // Sheet variant (mobile)
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className={className}>
          <Filter className="mr-2 h-4 w-4" />
          {t('title')}
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {metadata.activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('title')}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <FiltersContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
