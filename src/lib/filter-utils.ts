/**
 * Utilitaires pour filtrage de données dashboard
 * Phase 9 - Option F : Filtres Avancés
 * 
 * Fonctions helpers pour :
 * - Date range calculations (presets → from/to)
 * - Generic filtering logic (tasks, bookings, users)
 * - URL params sync
 * - localStorage persistence
 */

import type {
    DashboardFilters,
    DateRange,
    DateRangePreset,
    FilterResult,
    FilterFunction,
    FilterMetadata,
    ServiceCategory
} from '@/types/filters';
import type { Task } from '@/lib/firestore-tasks';
import type { Booking } from '@/lib/types';

/**
 * Calcule la date range à partir d'un preset
 */
export function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
        case 'today':
            return {
                from: today,
                to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // End of today
            };

        case 'last7days':
            return {
                from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
                to: now
            };

        case 'last30days':
            return {
                from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
                to: now
            };

        case 'thisMonth':
            return {
                from: new Date(now.getFullYear(), now.getMonth(), 1),
                to: now
            };

        case 'lastMonth': {
            const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            return {
                from: firstDayLastMonth,
                to: lastDayLastMonth
            };
        }

        case 'custom':
            return {
                from: null,
                to: null
            };

        default:
            return {
                from: null,
                to: null
            };
    }
}

/**
 * Vérifie si une date est dans la range
 */
export function isDateInRange(date: Date | null | undefined, range: DateRange): boolean {
    if (!date) return false;
    if (!range.from && !range.to) return true; // No date filter

    const timestamp = date.getTime();

    if (range.from && timestamp < range.from.getTime()) return false;
    if (range.to && timestamp > range.to.getTime()) return false;

    return true;
}

/**
 * Vérifie si le texte match la query de recherche
 */
export function matchesSearchQuery(text: string | undefined | null, query: string): boolean {
    if (!query.trim()) return true; // No search filter
    if (!text) return false;

    const normalizedText = text.toLowerCase().trim();
    const normalizedQuery = query.toLowerCase().trim();

    return normalizedText.includes(normalizedQuery);
}

/**
 * Applique les filtres sur une liste de tasks
 */
export function filterTasks(
    tasks: Task[],
    filters: DashboardFilters
): FilterResult<Task> {
    const dateRange = filters.dateRangePreset === 'custom'
        ? filters.dateRange
        : getDateRangeFromPreset(filters.dateRangePreset);

    const filtered = tasks.filter(task => {
        // Date filter
        if (!isDateInRange(task.createdAt, dateRange)) return false;

        // Category filter
        if (filters.categories.length > 0 && !filters.categories.includes(task.category as ServiceCategory)) {
            return false;
        }

        // Status filter
        if (filters.status !== 'all') {
            if (filters.status === 'completed' && task.status !== 'completed') return false;
            if (filters.status === 'active' && !['open', 'in_progress'].includes(task.status)) return false;
            if (filters.status === 'cancelled' && task.status !== 'cancelled') return false;
        }

        // Search filter
        if (!matchesSearchQuery(task.title, filters.searchQuery) &&
            !matchesSearchQuery(task.description, filters.searchQuery)) {
            return false;
        }

        return true;
    });

    return {
        data: filtered,
        totalCount: tasks.length,
        filteredCount: filtered.length,
        appliedFilters: {
            hasDateFilter: !!(dateRange.from || dateRange.to),
            hasCategoryFilter: filters.categories.length > 0,
            hasStatusFilter: filters.status !== 'all',
            hasSearchFilter: !!filters.searchQuery.trim()
        }
    };
}

/**
 * Applique les filtres sur une liste de bookings
 */
export function filterBookings(
    bookings: Booking[],
    filters: DashboardFilters
): FilterResult<Booking> {
    const dateRange = filters.dateRangePreset === 'custom'
        ? filters.dateRange
        : getDateRangeFromPreset(filters.dateRangePreset);

    const filtered = bookings.filter(booking => {
        // Date filter (on scheduledDate or createdAt)
        const dateToCheck = booking.scheduledDate
            ? (typeof booking.scheduledDate === 'string' ? new Date(booking.scheduledDate) : booking.scheduledDate)
            : (typeof booking.createdAt === 'string' ? new Date(booking.createdAt) : booking.createdAt);
        if (!isDateInRange(dateToCheck, dateRange)) return false;

        // Category filter (via task.category if populated)
        if (filters.categories.length > 0 && booking.task) {
            if (!filters.categories.includes(booking.task.category as ServiceCategory)) {
                return false;
            }
        }

        // Status filter
        if (filters.status !== 'all') {
            if (filters.status === 'completed' && booking.status !== 'completed') return false;
            if (filters.status === 'active' && !['pending', 'accepted', 'in_progress'].includes(booking.status)) return false;
            if (filters.status === 'cancelled' && booking.status !== 'cancelled') return false;
        }

        // Search filter (on task title/description if populated)
        if (filters.searchQuery.trim() && booking.task) {
            if (!matchesSearchQuery(booking.task.title, filters.searchQuery) &&
                !matchesSearchQuery(booking.task.description, filters.searchQuery)) {
                return false;
            }
        }

        return true;
    });

    return {
        data: filtered,
        totalCount: bookings.length,
        filteredCount: filtered.length,
        appliedFilters: {
            hasDateFilter: !!(dateRange.from || dateRange.to),
            hasCategoryFilter: filters.categories.length > 0,
            hasStatusFilter: filters.status !== 'all',
            hasSearchFilter: !!filters.searchQuery.trim()
        }
    };
}

/**
 * Applique une fonction de filtrage générique
 */
export function applyFilters<T>(
    items: T[],
    filters: DashboardFilters,
    filterFn: FilterFunction<T>
): FilterResult<T> {
    const filtered = items.filter(item => filterFn(item, filters));

    const dateRange = filters.dateRangePreset === 'custom'
        ? filters.dateRange
        : getDateRangeFromPreset(filters.dateRangePreset);

    return {
        data: filtered,
        totalCount: items.length,
        filteredCount: filtered.length,
        appliedFilters: {
            hasDateFilter: !!(dateRange.from || dateRange.to),
            hasCategoryFilter: filters.categories.length > 0,
            hasStatusFilter: filters.status !== 'all',
            hasSearchFilter: !!filters.searchQuery.trim()
        }
    };
}

/**
 * Calcule les métadonnées des filtres
 */
export function getFilterMetadata(filters: DashboardFilters): FilterMetadata {
    const hasDateFilter = filters.dateRangePreset !== 'last30days'; // Default preset
    const hasCategoryFilter = filters.categories.length > 0;
    const hasStatusFilter = filters.status !== 'all';
    const hasSearchFilter = !!filters.searchQuery.trim();

    const activeFiltersCount = [
        hasDateFilter,
        hasCategoryFilter,
        hasStatusFilter,
        hasSearchFilter
    ].filter(Boolean).length;

    return {
        lastUpdated: new Date(),
        isActive: activeFiltersCount > 0,
        activeFiltersCount
    };
}

/**
 * Sérialise les filtres pour localStorage
 */
export function serializeFilters(filters: DashboardFilters): string {
    return JSON.stringify({
        ...filters,
        dateRange: {
            from: filters.dateRange.from?.toISOString() || null,
            to: filters.dateRange.to?.toISOString() || null
        }
    });
}

/**
 * Désérialise les filtres depuis localStorage
 */
export function deserializeFilters(json: string): DashboardFilters | null {
    try {
        const parsed = JSON.parse(json);
        return {
            ...parsed,
            dateRange: {
                from: parsed.dateRange.from ? new Date(parsed.dateRange.from) : null,
                to: parsed.dateRange.to ? new Date(parsed.dateRange.to) : null
            }
        };
    } catch (error) {
        console.error('Failed to deserialize filters:', error);
        return null;
    }
}

/**
 * Convertit les filtres en URL params
 */
export function filtersToUrlParams(filters: DashboardFilters): URLSearchParams {
    const params = new URLSearchParams();

    // Date range
    if (filters.dateRangePreset !== 'last30days') {
        params.set('datePreset', filters.dateRangePreset);
    }
    if (filters.dateRangePreset === 'custom') {
        if (filters.dateRange.from) {
            params.set('from', filters.dateRange.from.toISOString());
        }
        if (filters.dateRange.to) {
            params.set('to', filters.dateRange.to.toISOString());
        }
    }

    // Categories
    if (filters.categories.length > 0) {
        params.set('categories', filters.categories.join(','));
    }

    // Status
    if (filters.status !== 'all') {
        params.set('status', filters.status);
    }

    // Search
    if (filters.searchQuery.trim()) {
        params.set('q', filters.searchQuery);
    }

    return params;
}

/**
 * Parse les URL params en filtres
 */
export function urlParamsToFilters(params: URLSearchParams): Partial<DashboardFilters> {
    const filters: Partial<DashboardFilters> = {};

    // Date preset
    const datePreset = params.get('datePreset') as DateRangePreset | null;
    if (datePreset) {
        filters.dateRangePreset = datePreset;
    }

    // Custom date range
    const from = params.get('from');
    const to = params.get('to');
    if (from || to) {
        filters.dateRange = {
            from: from ? new Date(from) : null,
            to: to ? new Date(to) : null
        };
    }

    // Categories
    const categories = params.get('categories');
    if (categories) {
        filters.categories = categories.split(',') as any[];
    }

    // Status
    const status = params.get('status');
    if (status) {
        filters.status = status as any;
    }

    // Search
    const query = params.get('q');
    if (query) {
        filters.searchQuery = query;
    }

    return filters;
}

/**
 * Réinitialise les filtres à leur valeur par défaut
 */
export function getDefaultFilters(): DashboardFilters {
    return {
        dateRangePreset: 'last30days',
        dateRange: getDateRangeFromPreset('last30days'),
        categories: [],
        status: 'all',
        searchQuery: ''
    };
}
