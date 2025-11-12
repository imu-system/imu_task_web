'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TasksLoadingSkeletonProps {
  count?: number;
  view?: 'grid' | 'list';
}

/**
 * Loading skeleton for task cards
 * Displays placeholder cards while tasks are being fetched
 */
export function TasksLoadingSkeleton({ count = 6, view = 'grid' }: TasksLoadingSkeletonProps) {
  return (
    <div
      className={
        view === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }
      data-testid="tasks-loading-skeleton"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="space-y-2">
            {/* Title */}
            <Skeleton className="h-6 w-3/4" />
            {/* Badge */}
            <Skeleton className="h-5 w-20" />
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Description lines */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            
            {/* Location */}
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Budget */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Date */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </CardContent>

          <CardFooter>
            {/* Button */}
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

/**
 * Compact loading skeleton for list view
 */
export function TaskListLoadingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-2" data-testid="task-list-loading-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center gap-4 pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </Card>
      ))}
    </div>
  );
}
