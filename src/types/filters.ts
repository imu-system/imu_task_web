/**
 * Types pour les filtres de dashboard
 * Phase 9 - Option F : Filtres Avancés
 * 
 * Définit les structures de données pour :
 * - Date ranges (6 presets + custom)
 * - Category filters (8 catégories ImuTask)
 * - Status filters (completed/active/cancelled)
 * - Search queries (titre/description)
 */

// ServiceCategory est un type plus simple (string)
// On va utiliser les catégories ImuTask définies dans services.ts
export type ServiceCategory = 
  | 'aide_domicile_petits_travaux'
  | 'courses_livraisons'
  | 'aide_numerique_administrative'
  | 'demenagement_manutention'
  | 'accompagnement_presence'
  | 'jardinage_exterieur'
  | 'animaux_compagnie'
  | 'evenements_occasions';

/**
 * Presets de date range
 */
export type DateRangePreset = 
  | 'today'           // Aujourd'hui
  | 'last7days'       // 7 derniers jours
  | 'last30days'      // 30 derniers jours
  | 'thisMonth'       // Ce mois-ci
  | 'lastMonth'       // Mois dernier
  | 'custom';         // Période personnalisée

/**
 * Date range avec from/to
 */
export interface DateRange {
  from: Date | null;
  to: Date | null;
}

/**
 * Status de booking/task pour filtrage
 */
export type FilterStatus = 'completed' | 'active' | 'cancelled' | 'all';

/**
 * État complet des filtres dashboard
 */
export interface DashboardFilters {
  // Date range
  dateRangePreset: DateRangePreset;
  dateRange: DateRange;
  
  // Categories (8 catégories ImuTask)
  categories: ServiceCategory[];
  
  // Status
  status: FilterStatus;
  
  // Search
  searchQuery: string;
}

/**
 * Options pour la persistence des filtres
 */
export interface FilterPersistenceOptions {
  userId: string;
  storageKey?: string; // Default: 'dashboard-filters-{userId}'
  syncToUrl?: boolean; // Sync URL params (default: true)
}

/**
 * Résultat de l'application des filtres
 */
export interface FilterResult<T> {
  data: T[];
  totalCount: number;
  filteredCount: number;
  appliedFilters: {
    hasDateFilter: boolean;
    hasCategoryFilter: boolean;
    hasStatusFilter: boolean;
    hasSearchFilter: boolean;
  };
}

/**
 * Fonction de filtrage générique
 */
export type FilterFunction<T> = (item: T, filters: DashboardFilters) => boolean;

/**
 * Configuration d'un filtre de catégorie
 */
export interface CategoryFilterOption {
  value: ServiceCategory;
  labelKey: string; // Translation key (e.g., "Services.categories.aide_domicile")
  count?: number; // Nombre d'items dans cette catégorie (optionnel)
}

/**
 * Configuration d'un filtre de status
 */
export interface StatusFilterOption {
  value: FilterStatus;
  labelKey: string; // Translation key (e.g., "Dashboard.filters.status.completed")
  count?: number; // Nombre d'items avec ce status (optionnel)
}

/**
 * Métadonnées sur les filtres appliqués
 */
export interface FilterMetadata {
  lastUpdated: Date;
  isActive: boolean; // true si au moins 1 filtre est actif
  activeFiltersCount: number;
}
