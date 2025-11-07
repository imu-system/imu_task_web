'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Filter, SortAsc, ImageIcon, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewCard } from './review-card';
import type { Review, ReviewFilters } from '@/types/reviews';
import { cn } from '@/lib/utils';

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

function EmptyState({ className }: { className?: string }) {
  const t = useTranslations('Reviews.empty');
  
  return (
    <div className={cn('text-center py-12', className)} data-testid="reviews-list-empty">
      <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{t('title')}</h3>
      <p className="text-sm text-muted-foreground">{t('description')}</p>
    </div>
  );
}

// ============================================================================
// REVIEWS LIST COMPONENT
// ============================================================================

interface ReviewsListProps {
  reviews: Review[];
  filters?: ReviewFilters;
  onFiltersChange?: (filters: ReviewFilters) => void;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  onRespond?: (reviewId: string) => void;
  canRespond?: boolean;
  currentUserId?: string;
  locale?: string;
  isLoading?: boolean;
  showFilters?: boolean;
  className?: string;
}

export function ReviewsList({
  reviews,
  filters = {},
  onFiltersChange,
  onHelpful,
  onReport,
  onRespond,
  canRespond = false,
  currentUserId,
  locale = 'en',
  isLoading = false,
  showFilters = true,
  className,
}: ReviewsListProps) {
  const t = useTranslations('Reviews.filters');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>(filters.sortBy || 'recent');

  // Handle filter changes
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    const newFilters: ReviewFilters = { ...filters };

    switch (filter) {
      case 'all':
        delete newFilters.verified;
        delete newFilters.hasPhotos;
        delete newFilters.hasResponse;
        break;
      case 'verified':
        newFilters.verified = true;
        break;
      case 'withPhotos':
        newFilters.hasPhotos = true;
        break;
      case 'withResponse':
        newFilters.hasResponse = true;
        break;
    }

    onFiltersChange?.(newFilters);
  };

  // Handle sort changes
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    onFiltersChange?.({ 
      ...filters, 
      sortBy: sort as ReviewFilters['sortBy'],
    });
  };

  // Apply client-side filtering (if backend doesn't handle it)
  let filteredReviews = [...reviews];

  if (activeFilter === 'verified') {
    filteredReviews = filteredReviews.filter((r) => r.verified);
  } else if (activeFilter === 'withPhotos') {
    filteredReviews = filteredReviews.filter((r) => r.photos && r.photos.length > 0);
  } else if (activeFilter === 'withResponse') {
    filteredReviews = filteredReviews.filter((r) => r.response);
  }

  // Apply client-side sorting (if backend doesn't handle it)
  switch (sortBy) {
    case 'recent':
      filteredReviews.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      break;
    case 'highest':
      filteredReviews.sort((a, b) => b.rating - a.rating);
      break;
    case 'lowest':
      filteredReviews.sort((a, b) => a.rating - b.rating);
      break;
    case 'helpful':
      filteredReviews.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
      break;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)} data-testid="reviews-list-loading">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-lg border bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters & Sort */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Filter Tabs */}
          <Tabs value={activeFilter} onValueChange={handleFilterChange} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all" className="gap-1.5">
                {t('all')}
              </TabsTrigger>
              <TabsTrigger value="verified" className="gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                {t('verified')}
              </TabsTrigger>
              <TabsTrigger value="withPhotos" className="gap-1.5">
                <ImageIcon className="h-3 w-3" />
                {t('withPhotos')}
              </TabsTrigger>
              <TabsTrigger value="withResponse" className="gap-1.5">
                <MessageSquare className="h-3 w-3" />
                {t('withResponse')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sort Select */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SortAsc className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t('recent')}</SelectItem>
                <SelectItem value="highest">{t('highest')}</SelectItem>
                <SelectItem value="lowest">{t('lowest')}</SelectItem>
                <SelectItem value="helpful">{t('helpful')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Results Count */}
      {filteredReviews.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
        </p>
      )}

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4" data-testid="reviews-list">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpful={onHelpful}
              onReport={onReport}
              onRespond={onRespond}
              canRespond={canRespond}
              currentUserId={currentUserId}
              locale={locale}
            />
          ))}
        </div>
      )}

      {/* Load More (optional - for pagination) */}
      {/* You can add pagination controls here if needed */}
    </div>
  );
}
