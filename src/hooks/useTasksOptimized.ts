import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    startAfter,
    QueryConstraint,
    DocumentSnapshot,
    Timestamp,
    Query,
    QueryDocumentSnapshot,
    DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task } from '@/lib/firestore-tasks';
import { debounce } from '@/lib/utils';

interface UseTasksOptimizedOptions {
    pageSize?: number;
    filters?: {
        status?: string | string[];
        category?: string | string[];
        minBudget?: number;
        maxBudget?: number;
        clientId?: string;
    };
    sortField?: 'createdAt' | 'budget' | 'deadline';
    sortDirection?: 'asc' | 'desc';
    enableCache?: boolean;
    cacheTTL?: number; // milliseconds
}

interface CacheEntry {
    data: Task[];
    timestamp: number;
    lastDoc: DocumentSnapshot | null;
}

// In-memory cache pour les résultats récents
const tasksCache = new Map<string, CacheEntry>();

// Helper pour convertir les Timestamps Firestore
const convertTimestamps = (data: DocumentData): Task => {
    const task = { ...data } as Task;

    if (data.createdAt instanceof Timestamp) {
        task.createdAt = data.createdAt.toDate();
    }
    if (data.updatedAt instanceof Timestamp) {
        task.updatedAt = data.updatedAt.toDate();
    }
    if (data.deadline instanceof Timestamp) {
        task.deadline = data.deadline.toDate();
    }

    return task;
};

// Générer une clé de cache basée sur les filtres
const getCacheKey = (options: UseTasksOptimizedOptions): string => {
    return JSON.stringify({
        filters: options.filters,
        sortField: options.sortField,
        sortDirection: options.sortDirection,
    });
};

export function useTasksOptimized(options: UseTasksOptimizedOptions = {}) {
    const {
        pageSize = 12,
        filters = {},
        sortField = 'createdAt',
        sortDirection = 'desc',
        enableCache = true,
        cacheTTL = 5 * 60 * 1000, // 5 minutes par défaut
    } = options;

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const lastDocRef = useRef<DocumentSnapshot | null>(null);
    const isInitialLoad = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Build Firestore query constraints
    const buildQueryConstraints = useCallback((lastDoc?: DocumentSnapshot | null): QueryConstraint[] => {
        const constraints: QueryConstraint[] = [];

        // Filters
        if (filters.status) {
            if (Array.isArray(filters.status)) {
                // Pour plusieurs statuts, on devra faire plusieurs queries ou utiliser 'in'
                if (filters.status.length === 1) {
                    constraints.push(where('status', '==', filters.status[0]));
                } else if (filters.status.length > 0) {
                    constraints.push(where('status', 'in', filters.status));
                }
            } else {
                constraints.push(where('status', '==', filters.status));
            }
        }

        if (filters.category) {
            if (Array.isArray(filters.category)) {
                if (filters.category.length === 1) {
                    constraints.push(where('category', '==', filters.category[0]));
                } else if (filters.category.length > 0) {
                    constraints.push(where('category', 'in', filters.category));
                }
            } else {
                constraints.push(where('category', '==', filters.category));
            }
        }

        if (filters.clientId) {
            constraints.push(where('clientId', '==', filters.clientId));
        }

        // Budget filters (nécessite un index composite)
        if (filters.minBudget !== undefined && filters.minBudget > 0) {
            constraints.push(where('budget', '>=', filters.minBudget));
        }
        if (filters.maxBudget !== undefined && filters.maxBudget < Infinity) {
            constraints.push(where('budget', '<=', filters.maxBudget));
        }

        // Sort
        constraints.push(orderBy(sortField, sortDirection));

        // Pagination
        if (lastDoc) {
            constraints.push(startAfter(lastDoc));
        }

        constraints.push(limit(pageSize));

        return constraints;
    }, [filters, sortField, sortDirection, pageSize]);

    // Fetch tasks
    const fetchTasks = useCallback(async (isLoadMore = false) => {
        // Abort previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setError(null);
            }

            // Check cache for initial load
            if (!isLoadMore && enableCache) {
                const cacheKey = getCacheKey(options);
                const cached = tasksCache.get(cacheKey);

                if (cached && Date.now() - cached.timestamp < cacheTTL) {
                    console.log('📦 Using cached tasks');
                    setTasks(cached.data);
                    lastDocRef.current = cached.lastDoc;
                    setHasMore(cached.data.length === pageSize);
                    setLoading(false);
                    return;
                }
            }

            // Build query
            const lastDoc = isLoadMore ? lastDocRef.current : null;
            const constraints = buildQueryConstraints(lastDoc);
            const tasksQuery = query(collection(db, 'tasks'), ...constraints);

            // Execute query
            const snapshot = await getDocs(tasksQuery);

            console.log(`📊 Fetched ${snapshot.docs.length} tasks (${isLoadMore ? 'load more' : 'initial'})`);

            // Convert documents to tasks
            const fetchedTasks: Task[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...convertTimestamps(doc.data()),
            }));

            // Update state
            if (isLoadMore) {
                setTasks(prev => [...prev, ...fetchedTasks]);
            } else {
                setTasks(fetchedTasks);
            }

            // Update pagination
            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            lastDocRef.current = lastVisible || null;
            setHasMore(snapshot.docs.length === pageSize);

            // Update cache
            if (!isLoadMore && enableCache) {
                const cacheKey = getCacheKey(options);
                tasksCache.set(cacheKey, {
                    data: fetchedTasks,
                    timestamp: Date.now(),
                    lastDoc: lastVisible || null,
                });
            }

            // Estimate total count (rough approximation)
            if (!isLoadMore) {
                setTotalCount(fetchedTasks.length);
            }

        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Request aborted');
                return;
            }

            console.error('Error fetching tasks:', err);
            setError(err.message || 'Failed to load tasks');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [buildQueryConstraints, enableCache, cacheTTL, pageSize, options]);

    // Debounced fetch for filter changes
    const debouncedFetch = useMemo(
        () => debounce(() => {
            lastDocRef.current = null; // Reset pagination on filter change
            fetchTasks(false);
        }, 300),
        [fetchTasks]
    );

    // Initial load and filter changes
    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            fetchTasks(false);
        } else {
            debouncedFetch();
        }

        return () => {
            debouncedFetch.cancel?.();
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [filters, sortField, sortDirection, pageSize]);

    // Load more function
    const loadMore = useCallback(() => {
        if (!loading && !loadingMore && hasMore) {
            fetchTasks(true);
        }
    }, [loading, loadingMore, hasMore, fetchTasks]);

    // Refresh function (bypass cache)
    const refresh = useCallback(() => {
        const cacheKey = getCacheKey(options);
        tasksCache.delete(cacheKey);
        lastDocRef.current = null;
        fetchTasks(false);
    }, [fetchTasks, options]);

    // Clear all cache
    const clearCache = useCallback(() => {
        tasksCache.clear();
    }, []);

    return {
        tasks,
        loading,
        loadingMore,
        error,
        hasMore,
        totalCount,
        loadMore,
        refresh,
        clearCache,
    };
}

// Export function to clear cache from outside
export const clearTasksCache = () => {
    tasksCache.clear();
};
