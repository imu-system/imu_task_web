'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  loading?: boolean;
  hasMore?: boolean;
  threshold?: number; // Distance from bottom to trigger (in pixels)
  loadingText?: string;
}

/**
 * Infinite Scroll Trigger Component
 * Uses Intersection Observer API to detect when user scrolls near the bottom
 * and triggers loading of more content
 */
export function InfiniteScrollTrigger({
  onLoadMore,
  loading = false,
  hasMore = true,
  threshold = 400,
  loadingText = 'Chargement...',
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Only set up observer if there's more to load
    if (!hasMore || loading) {
      return;
    }

    // Create Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        // When trigger enters viewport, load more
        if (entry.isIntersecting) {
          console.log('🔄 Infinite scroll triggered');
          onLoadMore();
        }
      },
      {
        // Trigger when element is within threshold pixels of viewport
        rootMargin: `${threshold}px`,
        threshold: 0,
      }
    );

    // Start observing
    const trigger = triggerRef.current;
    if (trigger) {
      observerRef.current.observe(trigger);
    }

    // Cleanup
    return () => {
      if (observerRef.current && trigger) {
        observerRef.current.unobserve(trigger);
      }
    };
  }, [onLoadMore, loading, hasMore, threshold]);

  // Don't render anything if no more content
  if (!hasMore) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Vous avez vu toutes les tâches disponibles</p>
      </div>
    );
  }

  return (
    <div
      ref={triggerRef}
      className="flex justify-center items-center py-8"
      data-testid="infinite-scroll-trigger"
    >
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{loadingText}</span>
        </div>
      )}
    </div>
  );
}
