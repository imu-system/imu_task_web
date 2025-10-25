/**
 * Hook personnalisé pour la recherche Algolia
 * 
 * Features:
 * - Recherche multi-indices (tasks, users, services)
 * - Typo tolerance automatique
 * - Geo-search avec coordonnées GPS
 * - Faceted filtering
 * - Highlighting des résultats
 * - Debouncing (300ms)
 * - Analytics intégrés
 * 
 * Usage:
 * const { results, isSearching, search, clearSearch } = useAlgoliaSearch({
 *   accountType: AccountType.individual,
 *   indices: ['tasks', 'users'],
 *   geoLocation: { lat: 48.8566, lng: 2.3522 }
 * });
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { searchClient, ALGOLIA_INDICES, defaultSearchOptions, getContextualFilters } from '@/lib/algolia-config';
import type { AlgoliaTask, AlgoliaUser, AlgoliaService } from '@/lib/algolia-config';
import { AccountType } from '@/lib/types';
import { logDashboardSearch } from '@/lib/analytics';

// Types de résultats unifiés
export interface SearchHit {
    id: string;
    type: 'task' | 'user' | 'service';
    title: string;
    description: string;
    category?: string;
    icon?: string;
    highlighted?: {
        title?: string;
        description?: string;
    };
    metadata?: {
        budget?: number;
        rating?: number;
        location?: string;
        urgent?: boolean;
        verified?: boolean;
    };
}

export interface UseAlgoliaSearchOptions {
    accountType: AccountType;
    indices?: Array<'tasks' | 'users' | 'services'>;
    geoLocation?: { lat: number; lng: number };
    radius?: number; // en mètres
    filters?: string; // Filtres Algolia supplémentaires
    maxResults?: number;
}

export interface UseAlgoliaSearchReturn {
    results: SearchHit[];
    isSearching: boolean;
    error: string | null;
    totalHits: number;
    search: (query: string) => void;
    clearSearch: () => void;
}

/**
 * Hook pour rechercher avec Algolia
 */
export function useAlgoliaSearch(options: UseAlgoliaSearchOptions): UseAlgoliaSearchReturn {
    const {
        accountType,
        indices = ['tasks', 'users', 'services'],
        geoLocation,
        radius = 50000, // 50km par défaut
        filters: customFilters,
        maxResults = 20,
    } = options;

    const [results, setResults] = useState<SearchHit[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalHits, setTotalHits] = useState(0);

    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    const abortControllerRef = useRef<AbortController>();

    /**
     * Transformer résultat Algolia Task en SearchHit
     */
    const transformTaskHit = useCallback((hit: AlgoliaTask): SearchHit => {
        return {
            id: hit.objectID,
            type: 'task',
            title: hit.title,
            description: hit.description,
            category: hit.category,
            highlighted: {
                title: hit._highlightResult?.title?.value || hit.title,
                description: hit._highlightResult?.description?.value || hit.description,
            },
            metadata: {
                budget: hit.budget,
                location: hit.location?.city,
                urgent: hit.urgent,
            },
        };
    }, []);

    /**
     * Transformer résultat Algolia User en SearchHit
     */
    const transformUserHit = useCallback((hit: AlgoliaUser): SearchHit => {
        return {
            id: hit.objectID,
            type: 'user',
            title: hit.profile.displayName || hit.profile.companyName || 'Professionnel',
            description: hit.profile.bio || 'Aucune description',
            category: hit.profile.serviceCategories?.[0],
            highlighted: {
                title: hit._highlightResult?.profile?.displayName?.value ||
                    hit._highlightResult?.profile?.companyName?.value ||
                    hit.profile.displayName ||
                    hit.profile.companyName ||
                    'Professionnel',
                description: hit._highlightResult?.profile?.bio?.value || hit.profile.bio || '',
            },
            metadata: {
                rating: hit.profile.rating,
                location: hit.profile.location?.city,
                verified: hit.profile.verified,
            },
        };
    }, []);

    /**
     * Transformer résultat Algolia Service en SearchHit
     */
    const transformServiceHit = useCallback((hit: AlgoliaService): SearchHit => {
        return {
            id: hit.objectID,
            type: 'service',
            title: hit.name,
            description: hit.description,
            category: hit.category,
            icon: hit.icon,
            highlighted: {
                title: hit._highlightResult?.name?.value || hit.name,
                description: hit._highlightResult?.description?.value || hit.description,
            },
            metadata: {
                rating: hit.rating,
            },
        };
    }, []);

    /**
     * Fonction de recherche avec debouncing
     */
    const search = useCallback(
        async (query: string) => {
            // Clear previous timeout
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Si query vide, reset
            if (!query || query.length < 2) {
                setResults([]);
                setTotalHits(0);
                setError(null);
                return;
            }

            // Debounce de 300ms
            searchTimeoutRef.current = setTimeout(async () => {
                setIsSearching(true);
                setError(null);
                abortControllerRef.current = new AbortController();

                try {
                    // Construire les filtres contextuels
                    const contextualFilters = getContextualFilters(accountType);
                    const finalFilters = customFilters
                        ? `(${contextualFilters}) AND (${customFilters})`
                        : contextualFilters;

                    // Options de recherche communes
                    const searchOptions: any = {
                        ...defaultSearchOptions,
                        hitsPerPage: maxResults,
                        filters: finalFilters || undefined,
                    };

                    // Ajouter geo-search si coordonnées disponibles
                    if (geoLocation) {
                        searchOptions.aroundLatLng = `${geoLocation.lat}, ${geoLocation.lng}`;
                        searchOptions.aroundRadius = radius;
                    }

                    // Rechercher dans tous les indices en parallèle
                    const searchPromises = indices.map(async (indexName) => {
                        const response = await searchClient.searchSingleIndex({
                            indexName: ALGOLIA_INDICES[indexName],
                            searchParams: {
                                query,
                                ...searchOptions,
                            },
                        });

                        return {
                            indexName,
                            hits: response.hits,
                            nbHits: response.nbHits,
                        };
                    });

                    const searchResults = await Promise.all(searchPromises);

                    // Transformer et combiner les résultats
                    const allHits: SearchHit[] = [];
                    let total = 0;

                    searchResults.forEach(({ indexName, hits, nbHits }) => {
                        total += nbHits || 0;

                        if (indexName === 'tasks') {
                            allHits.push(...(hits as AlgoliaTask[]).map(transformTaskHit));
                        } else if (indexName === 'users') {
                            allHits.push(...(hits as AlgoliaUser[]).map(transformUserHit));
                        } else if (indexName === 'services') {
                            allHits.push(...(hits as AlgoliaService[]).map(transformServiceHit));
                        }
                    });

                    setResults(allHits);
                    setTotalHits(total);

                    // Analytics
                    logDashboardSearch(accountType, query, total);
                } catch (err: any) {
                    if (err.name !== 'AbortError') {
                        console.error('Algolia search error:', err);
                        setError('Erreur lors de la recherche. Veuillez réessayer.');
                        setResults([]);
                        setTotalHits(0);
                    }
                } finally {
                    setIsSearching(false);
                }
            }, 300);
        },
        [
            accountType,
            customFilters,
            geoLocation,
            radius,
            indices,
            maxResults,
            transformTaskHit,
            transformUserHit,
            transformServiceHit,
        ]
    );

    /**
     * Réinitialiser la recherche
     */
    const clearSearch = useCallback(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setResults([]);
        setTotalHits(0);
        setError(null);
        setIsSearching(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        results,
        isSearching,
        error,
        totalHits,
        search,
        clearSearch,
    };
}
