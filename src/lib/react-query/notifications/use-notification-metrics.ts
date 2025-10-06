'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { measureCacheHit } from '@/lib/performance';
import { logNotificationFilter } from '@/lib/analytics';

interface NotificationMetrics {
    totalQueries: number;
    cacheHits: number;
    cacheMisses: number;
    activeQueries: number;
    staleQueries: number;
}

export function useNotificationMetrics(): NotificationMetrics {
    const queryClient = useQueryClient();
    const queryCache = queryClient.getQueryCache();

    const queries = queryCache.findAll({ queryKey: ['notifications'] });

    const metrics = queries.reduce(
        (acc, query) => {
            acc.totalQueries++;

            if (query.state.status === 'success' && query.state.dataUpdatedAt > 0) {
                acc.cacheHits++;
                measureCacheHit(true);
            } else {
                acc.cacheMisses++;
                measureCacheHit(false);
            }

            if (query.getObserversCount() > 0) {
                acc.activeQueries++;
            }

            if (query.isStale()) {
                acc.staleQueries++;
            }

            return acc;
        },
        {
            totalQueries: 0,
            cacheHits: 0,
            cacheMisses: 0,
            activeQueries: 0,
            staleQueries: 0,
        }
    );

    return metrics;
}

export function useNotificationAnalytics(userId: string, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                logNotificationFilter();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [enabled]);
}
