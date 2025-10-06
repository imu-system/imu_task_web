/**
 * Notification List with Infinite Scroll
 * 
 * Features:
 * - Cursor-based pagination (20 per page)
 * - Infinite scroll with "Load More" button
 * - Optimistic updates
 * - Loading states
 * - Empty states
 * - Error handling
 */

'use client';

import { useNotifications, useMarkAsRead, useDismissNotification, useDeleteNotification } from '@/lib/react-query/use-notifications';
import { NotificationCard } from './notification-card';
import { Button } from '@/components/ui/button';
import { Loader2, Inbox } from 'lucide-react';
import { useEffect, useRef, useCallback } from 'react';
import type { NotificationCategory, Notification } from '@/lib/types/notifications';
import type { InfiniteData } from '@tanstack/react-query';
import type { NotificationQueryResult } from '@/lib/firestore-notifications-optimized';

interface NotificationListInfiniteProps {
  userId: string;
  category?: NotificationCategory;
  unreadOnly?: boolean;
}

export function NotificationListInfinite({
  userId,
  category,
  unreadOnly = false,
}: NotificationListInfiniteProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch notifications with pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useNotifications({
    userId,
    category,
    unreadOnly,
    limit: 20,
  });

  // Mutations
  const markAsReadMutation = useMarkAsRead(userId);
  const dismissMutation = useDismissNotification();
  const deleteMutation = useDeleteNotification(userId);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handlers
  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      markAsReadMutation.mutate(notificationId);
    },
    [markAsReadMutation]
  );

  const handleDismiss = useCallback(
    (notificationId: string) => {
      dismissMutation.mutate(notificationId);
    },
    [dismissMutation]
  );

  const handleDelete = useCallback(
    (notificationId: string) => {
      deleteMutation.mutate(notificationId);
    },
    [deleteMutation]
  );

  // Get all notifications from all pages
  const allNotifications: Notification[] = data?.pages ? data.pages.flatMap((page: NotificationQueryResult) => page.notifications) : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm text-destructive">
          Failed to load notifications: {error?.message}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Empty state
  if (allNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No notifications</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {unreadOnly
            ? "You're all caught up!"
            : "You don't have any notifications yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Notification list */}
      {allNotifications.map((notification: Notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkAsRead={handleMarkAsRead}
          onDismiss={handleDismiss}
          onDelete={handleDelete}
        />
      ))}

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-4" />

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Load more button (fallback) */}
      {hasNextPage && !isFetchingNextPage && (
        <div className="flex items-center justify-center py-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            Load More
          </Button>
        </div>
      )}

      {/* End reached */}
      {!hasNextPage && allNotifications.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          No more notifications
        </p>
      )}
    </div>
  );
}
