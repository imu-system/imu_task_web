/**
 * Configuration Algolia pour IMU Task
 * 
 * Indices:
 * - tasks: Recherche de tâches/missions
 * - users: Recherche de prestataires/professionnels
 * - services: Recherche de services/catégories
 * 
 * Features:
 * - Typo tolerance (plomber → plombier)
 * - Geo-search (trouver tâches à proximité)
 * - Faceted filtering (catégorie, prix, rating)
 * - Highlighting des résultats
 */

import { algoliasearch } from 'algoliasearch';

// Configuration depuis variables d'environnement
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || '';
const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY || ''; // Server-side only

// Vérification de la configuration
export const isAlgoliaConfigured = !!(ALGOLIA_APP_ID && ALGOLIA_SEARCH_API_KEY);

if (!isAlgoliaConfigured) {
    console.warn('⚠️ Algolia credentials are missing. Search functionality will be limited.');
}

// Noms des indices
export const ALGOLIA_INDICES = {
    tasks: 'tasks',
    users: 'users',
    services: 'services',
} as const;

// Client de recherche (public - lecture seule)
export const searchClient = isAlgoliaConfigured
    ? algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY)
    : null;

// Client d'administration (server-side only - écriture)
export const adminClient = typeof window === 'undefined' && ALGOLIA_ADMIN_API_KEY && isAlgoliaConfigured
    ? algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY)
    : null;

/**
 * Configuration des indices Algolia
 */
export const indicesConfig = {
    tasks: {
        name: ALGOLIA_INDICES.tasks,
        searchableAttributes: [
            'title',
            'description',
            'category',
            'tags',
            'location.address',
            'location.city',
        ],
        attributesForFaceting: [
            'filterOnly(status)',
            'category',
            'urgent',
            'searchable(location.city)',
            'budget',
        ],
        customRanking: ['desc(createdAt)', 'desc(budget)'],
        attributesToHighlight: ['title', 'description'],
        attributesToRetrieve: [
            'objectID',
            'title',
            'description',
            'category',
            'budget',
            'status',
            'urgent',
            'createdAt',
            'location',
            'userId',
            '_geoloc',
        ],
        typoTolerance: 'min' as const,
        minWordSizefor1Typo: 4,
        minWordSizefor2Typos: 8,
    },
    users: {
        name: ALGOLIA_INDICES.users,
        searchableAttributes: [
            'profile.displayName',
            'profile.companyName',
            'profile.bio',
            'profile.skills',
            'profile.serviceCategories',
            'profile.location.city',
        ],
        attributesForFaceting: [
            'filterOnly(accountType)',
            'searchable(profile.serviceCategories)',
            'searchable(profile.location.city)',
            'profile.verified',
            'profile.rating',
        ],
        customRanking: ['desc(profile.rating)', 'desc(profile.completedJobs)'],
        attributesToHighlight: ['profile.displayName', 'profile.companyName', 'profile.bio'],
        attributesToRetrieve: [
            'objectID',
            'email',
            'profile.displayName',
            'profile.companyName',
            'profile.photoUrl',
            'profile.bio',
            'profile.skills',
            'profile.serviceCategories',
            'profile.rating',
            'profile.completedJobs',
            'profile.verified',
            'profile.location',
            '_geoloc',
        ],
        typoTolerance: 'min' as const,
        minWordSizefor1Typo: 4,
        minWordSizefor2Typos: 8,
    },
    services: {
        name: ALGOLIA_INDICES.services,
        searchableAttributes: [
            'name',
            'description',
            'category',
            'tags',
            'keywords',
        ],
        attributesForFaceting: [
            'category',
            'searchable(tags)',
            'popular',
        ],
        customRanking: ['desc(bookingCount)', 'desc(rating)'],
        attributesToHighlight: ['name', 'description'],
        attributesToRetrieve: [
            'objectID',
            'name',
            'description',
            'category',
            'icon',
            'tags',
            'bookingCount',
            'rating',
            'popular',
        ],
        typoTolerance: 'strict' as const,
        minWordSizefor1Typo: 4,
        minWordSizefor2Typos: 8,
    },
};

/**
 * Options de recherche par défaut
 */
export const defaultSearchOptions = {
    hitsPerPage: 20,
    attributesToHighlight: ['*'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    snippetEllipsisText: '…',
    removeWordsIfNoResults: 'lastWords' as const,
};

/**
 * Types pour les résultats Algolia
 */
export interface AlgoliaTask {
    objectID: string;
    title: string;
    description: string;
    category: string;
    budget?: number;
    status: string;
    urgent?: boolean;
    createdAt: number;
    location?: {
        address?: string;
        city?: string;
        lat?: number;
        lng?: number;
    };
    userId: string;
    _geoloc?: {
        lat: number;
        lng: number;
    };
    _highlightResult?: any;
    _snippetResult?: any;
}

export interface AlgoliaUser {
    objectID: string;
    email: string;
    profile: {
        displayName?: string;
        companyName?: string;
        photoUrl?: string;
        bio?: string;
        skills?: string[];
        serviceCategories?: string[];
        rating?: number;
        completedJobs?: number;
        verified?: boolean;
        location?: {
            city?: string;
            lat?: number;
            lng?: number;
        };
    };
    _geoloc?: {
        lat: number;
        lng: number;
    };
    _highlightResult?: any;
}

export interface AlgoliaService {
    objectID: string;
    name: string;
    description: string;
    category: string;
    icon?: string;
    tags?: string[];
    bookingCount?: number;
    rating?: number;
    popular?: boolean;
    _highlightResult?: any;
}

/**
 * Filtre de recherche contextuel par AccountType
 */
export function getContextualFilters(accountType: string): string {
    switch (accountType) {
        case 'professional':
            // Les pros voient les tâches ouvertes
            return 'status:open OR status:published';
        case 'individual':
            // Les clients voient leurs tâches + prestataires disponibles
            return '';
        case 'senior':
            // Les seniors voient des services simplifiés
            return 'popular:true';
        default:
            return '';
    }
}
