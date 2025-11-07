/**
 * Hook pour gestion des filtres dashboard
 * Phase 9 - Option F : Filtres Avancés
 * 
 * Fonctionnalités :
 * - State management (date, categories, status, search)
 * - localStorage persistence (dashboard-filters-{userId})
 * - URL params sync (shareable filtered views)
 * - Debounced search (300ms)
 * - Reset filters
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from '@/navigation';
import type {
    DashboardFilters,
    DateRange,
    DateRangePreset,
    FilterStatus,
    FilterPersistenceOptions,
    FilterMetadata,
    ServiceCategory
} from '@/types/filters';
import {
    getDefaultFilters,
    serializeFilters,
    deserializeFilters,
    filtersToUrlParams,
    urlParamsToFilters,
    getFilterMetadata,
    getDateRangeFromPreset
} from '@/lib/filter-utils';

interface UseDashboardFiltersOptions {
    userId?: string;
    persistToLocalStorage?: boolean;
    syncToUrl?: boolean;
    debounceMs?: number; // For search query (default: 300ms)
}

interface UseDashboardFiltersReturn {
    // Current filters state
    filters: DashboardFilters;
    metadata: FilterMetadata;

    // Setters
    setDateRangePreset: (preset: DateRangePreset) => void;
    setDateRange: (range: DateRange) => void;
    setCategories: (categories: ServiceCategory[]) => void;
    toggleCategory: (category: ServiceCategory) => void;
    setStatus: (status: FilterStatus) => void;
    setSearchQuery: (query: string) => void;

    // Actions
    resetFilters: () => void;
    clearDateFilter: () => void;
    clearCategoryFilter: () => void;
    clearStatusFilter: () => void;
    clearSearchFilter: () => void;

    // Utils
    isDefaultFilters: boolean;
    hasActiveFilters: boolean;
}

export function useDashboardFilters(
    options: UseDashboardFiltersOptions = {}
): UseDashboardFiltersReturn {
    const {
        userId,
        persistToLocalStorage = true,
        syncToUrl = true,
        debounceMs = 300
    } = options;

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Storage key
    const storageKey = userId ? `dashboard-filters-${userId}` : 'dashboard-filters';

    // Initialize filters from URL → localStorage → defaults
    const [filters, setFilters] = useState<DashboardFilters>(() => {
        // 1. Try URL params first (highest priority)
        if (syncToUrl && searchParams) {
            const urlFilters = urlParamsToFilters(searchParams);
            if (Object.keys(urlFilters).length > 0) {
                return { ...getDefaultFilters(), ...urlFilters };
            }
        }

        // 2. Try localStorage
        if (persistToLocalStorage && typeof window !== 'undefined') {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const deserialized = deserializeFilters(stored);
                if (deserialized) return deserialized;
            }
        }

        // 3. Default filters
        return getDefaultFilters();
    });

    // Debounced search query state
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(filters.searchQuery);

    // Metadata
    const metadata = useMemo(() => getFilterMetadata(filters), [filters]);

    // Persist to localStorage
    useEffect(() => {
        if (!persistToLocalStorage || typeof window === 'undefined') return;

        try {
            localStorage.setItem(storageKey, serializeFilters(filters));
        } catch (error) {
            console.error('Failed to save filters to localStorage:', error);
        }
    }, [filters, storageKey, persistToLocalStorage]);

    // Sync to URL params
    useEffect(() => {
        if (!syncToUrl) return;

        const params = filtersToUrlParams(filters);
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

        // Only update if different (avoid infinite loops)
        const currentUrl = window.location.pathname + window.location.search;
        if (newUrl !== currentUrl) {
            router.replace(newUrl);
        }
    }, [filters, pathname, router, syncToUrl]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedSearchQuery !== filters.searchQuery) {
                setFilters(prev => ({ ...prev, searchQuery: debouncedSearchQuery }));
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [debouncedSearchQuery, debounceMs, filters.searchQuery]);

    // Setters
    const setDateRangePreset = useCallback((preset: DateRangePreset) => {
        setFilters(prev => ({
            ...prev,
            dateRangePreset: preset,
            dateRange: getDateRangeFromPreset(preset)
        }));
    }, []);

    const setDateRange = useCallback((range: DateRange) => {
        setFilters(prev => ({
            ...prev,
            dateRangePreset: 'custom',
            dateRange: range
        }));
    }, []);

    const setCategories = useCallback((categories: ServiceCategory[]) => {
        setFilters(prev => ({ ...prev, categories }));
    }, []);

    const toggleCategory = useCallback((category: ServiceCategory) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category]
        }));
    }, []);

    const setStatus = useCallback((status: FilterStatus) => {
        setFilters(prev => ({ ...prev, status }));
    }, []);

    const setSearchQuery = useCallback((query: string) => {
        setDebouncedSearchQuery(query);
    }, []);

    // Actions
    const resetFilters = useCallback(() => {
        const defaultFilters = getDefaultFilters();
        setFilters(defaultFilters);
        setDebouncedSearchQuery(defaultFilters.searchQuery);
    }, []);

    const clearDateFilter = useCallback(() => {
        setDateRangePreset('last30days');
    }, [setDateRangePreset]);

    const clearCategoryFilter = useCallback(() => {
        setCategories([]);
    }, [setCategories]);

    const clearStatusFilter = useCallback(() => {
        setStatus('all');
    }, [setStatus]);

    const clearSearchFilter = useCallback(() => {
        setSearchQuery('');
    }, [setSearchQuery]);

    // Utils
    const isDefaultFilters = useMemo(() => {
        const defaults = getDefaultFilters();
        return JSON.stringify(filters) === JSON.stringify(defaults);
    }, [filters]);

    const hasActiveFilters = metadata.isActive;

    return {
        filters,
        metadata,
        setDateRangePreset,
        setDateRange,
        setCategories,
        toggleCategory,
        setStatus,
        setSearchQuery,
        resetFilters,
        clearDateFilter,
        clearCategoryFilter,
        clearStatusFilter,
        clearSearchFilter,
        isDefaultFilters,
        hasActiveFilters
    };
}

/**
 * Hook simplifié pour filtres sans persistence
 */
export function useSimpleFilters(): UseDashboardFiltersReturn {
    return useDashboardFilters({
        persistToLocalStorage: false,
        syncToUrl: false
    });
}
