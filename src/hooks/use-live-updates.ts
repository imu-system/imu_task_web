/**
 * Custom React hooks for real-time data updates using Firestore onSnapshot
 * 
 * Phase 9: Option G - Analytics Temps Réel
 * 
 * Hooks disponibles:
 * - useLiveData: Generic onSnapshot wrapper avec throttle
 * - useActivityFeed: Real-time activity stream
 * - useRealtimeKPI: Live KPI avec change detection
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Query,
    onSnapshot,
    QuerySnapshot,
    DocumentData,
    Unsubscribe
} from 'firebase/firestore';

// ========================================
// TYPES
// ========================================

export interface LiveDataState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    lastUpdate: Date | null;
}

export interface RealtimeKPIState<T> {
    current: T | null;
    previous: T | null;
    change: number;
    changePercent: number;
    loading: boolean;
    error: Error | null;
    lastUpdate: Date | null;
}

export interface Activity {
    id: string;
    type: 'NEW_BOOKING' | 'TASK_COMPLETED' | 'NEW_USER' | 'KYC_SUBMITTED' | 'PROPOSAL_CREATED';
    userId: string;
    metadata: {
        bookingId?: string;
        taskId?: string;
        taskTitle?: string;
        amount?: number;
        userName?: string;
        providerName?: string;
        clientName?: string;
        [key: string]: any;
    };
    createdAt: Date;
    read: boolean;
}

// ========================================
// GENERIC LIVE DATA HOOK
// ========================================

/**
 * Generic hook for real-time Firestore queries with throttling
 * 
 * @param query Firestore query to listen to
 * @param transform Transform function to convert snapshot to data
 * @param throttleMs Minimum time between updates (default: 300ms)
 * @param enabled Enable/disable listener (default: true)
 */
export function useLiveData<T>(
    query: Query<DocumentData> | null,
    transform: (snapshot: QuerySnapshot<DocumentData>) => T,
    options: {
        throttleMs?: number;
        enabled?: boolean;
    } = {}
): LiveDataState<T> {
    const { throttleMs = 300, enabled = true } = options;

    const [state, setState] = useState<LiveDataState<T>>({
        data: null,
        loading: true,
        error: null,
        lastUpdate: null
    });

    const lastUpdateRef = useRef<number>(0);
    const pendingUpdateRef = useRef<QuerySnapshot<DocumentData> | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Throttled update function
    const applyUpdate = useCallback((snapshot: QuerySnapshot<DocumentData>) => {
        try {
            const data = transform(snapshot);
            setState({
                data,
                loading: false,
                error: null,
                lastUpdate: new Date()
            });
            lastUpdateRef.current = Date.now();
        } catch (error) {
            console.error('Error transforming snapshot:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error as Error
            }));
        }
    }, [transform]);

    useEffect(() => {
        if (!query || !enabled) {
            setState({ data: null, loading: false, error: null, lastUpdate: null });
            return;
        }

        let unsubscribe: Unsubscribe | null = null;

        try {
            // Set up real-time listener
            unsubscribe = onSnapshot(
                query,
                (snapshot) => {
                    const now = Date.now();
                    const timeSinceLastUpdate = now - lastUpdateRef.current;

                    if (timeSinceLastUpdate >= throttleMs) {
                        // Apply update immediately
                        applyUpdate(snapshot);
                    } else {
                        // Schedule throttled update
                        pendingUpdateRef.current = snapshot;

                        if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                        }

                        timeoutRef.current = setTimeout(() => {
                            if (pendingUpdateRef.current) {
                                applyUpdate(pendingUpdateRef.current);
                                pendingUpdateRef.current = null;
                            }
                        }, throttleMs - timeSinceLastUpdate);
                    }
                },
                (error) => {
                    console.error('Firestore onSnapshot error:', error);
                    setState({
                        data: null,
                        loading: false,
                        error: error as Error,
                        lastUpdate: null
                    });
                }
            );
        } catch (error) {
            console.error('Error setting up listener:', error);
            setState({
                data: null,
                loading: false,
                error: error as Error,
                lastUpdate: null
            });
        }

        // Cleanup
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [query, enabled, throttleMs, applyUpdate]);

    return state;
}

// ========================================
// ACTIVITY FEED HOOK
// ========================================

/**
 * Hook for real-time activity feed
 * Shows recent platform activities (bookings, tasks, users, KYC)
 * 
 * @param userId Optional: Filter activities for specific user (admin sees all if null)
 * @param limit Number of activities to fetch (default: 10)
 */
export function useActivityFeed(
    userId: string | null = null,
    limit: number = 10
): LiveDataState<Activity[]> {
    // This will be implemented after activities collection is created
    // For now, return mock structure
    const [state] = useState<LiveDataState<Activity[]>>({
        data: [],
        loading: false,
        error: null,
        lastUpdate: new Date()
    });

    return state;
}

// ========================================
// REALTIME KPI HOOK
// ========================================

/**
 * Hook for real-time KPI with change detection
 * Tracks current value and calculates change from previous value
 * 
 * @param query Firestore query for KPI data
 * @param extractValue Function to extract numeric value from snapshot
 */
export function useRealtimeKPI(
    query: Query<DocumentData> | null,
    extractValue: (snapshot: QuerySnapshot<DocumentData>) => number
): RealtimeKPIState<number> {
    const [state, setState] = useState<RealtimeKPIState<number>>({
        current: null,
        previous: null,
        change: 0,
        changePercent: 0,
        loading: true,
        error: null,
        lastUpdate: null
    });

    const previousValueRef = useRef<number | null>(null);

    useEffect(() => {
        if (!query) {
            setState({
                current: null,
                previous: null,
                change: 0,
                changePercent: 0,
                loading: false,
                error: null,
                lastUpdate: null
            });
            return;
        }

        let unsubscribe: Unsubscribe | null = null;

        try {
            unsubscribe = onSnapshot(
                query,
                (snapshot) => {
                    try {
                        const current = extractValue(snapshot);
                        const previous = previousValueRef.current;

                        let change = 0;
                        let changePercent = 0;

                        if (previous !== null) {
                            change = current - previous;
                            changePercent = previous !== 0
                                ? ((current - previous) / previous) * 100
                                : 0;
                        }

                        setState({
                            current,
                            previous,
                            change,
                            changePercent,
                            loading: false,
                            error: null,
                            lastUpdate: new Date()
                        });

                        // Update previous value for next comparison
                        previousValueRef.current = current;
                    } catch (error) {
                        console.error('Error extracting KPI value:', error);
                        setState(prev => ({
                            ...prev,
                            loading: false,
                            error: error as Error
                        }));
                    }
                },
                (error) => {
                    console.error('Firestore onSnapshot error:', error);
                    setState({
                        current: null,
                        previous: null,
                        change: 0,
                        changePercent: 0,
                        loading: false,
                        error: error as Error,
                        lastUpdate: null
                    });
                }
            );
        } catch (error) {
            console.error('Error setting up KPI listener:', error);
            setState({
                current: null,
                previous: null,
                change: 0,
                changePercent: 0,
                loading: false,
                error: error as Error,
                lastUpdate: null
            });
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [query, extractValue]);

    return state;
}

// ========================================
// HELPER: Format relative time
// ========================================

/**
 * Format relative time (e.g., "il y a 2min", "il y a 1h")
 */
export function formatRelativeTime(date: Date, locale: string = 'fr'): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (locale === 'fr') {
        if (diffSec < 60) return `il y a ${diffSec}s`;
        if (diffMin < 60) return `il y a ${diffMin}min`;
        if (diffHour < 24) return `il y a ${diffHour}h`;
        if (diffDay < 7) return `il y a ${diffDay}j`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } else {
        if (diffSec < 60) return `${diffSec}s ago`;
        if (diffMin < 60) return `${diffMin}min ago`;
        if (diffHour < 24) return `${diffHour}h ago`;
        if (diffDay < 7) return `${diffDay}d ago`;
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
}
