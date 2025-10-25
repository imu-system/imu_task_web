/**
 * Service de recherche unifié pour IMU Task
 * Supporte la recherche dans les tâches, prestataires, services
 * avec filtres contextuels par AccountType
 */

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    QueryConstraint,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AccountType } from '@/lib/types';

// Types de résultats de recherche
export interface SearchResult {
    id: string;
    type: 'task' | 'provider' | 'service' | 'booking';
    title: string;
    description?: string;
    category?: string;
    location?: {
        city?: string;
        postalCode?: string;
    };
    relevanceScore: number;
    metadata?: Record<string, any>;
}

// Options de recherche
export interface SearchOptions {
    accountType: AccountType;
    query: string;
    filters?: {
        category?: string;
        location?: string;
        priceRange?: { min: number; max: number };
        status?: string;
        urgent?: boolean;
        nearby?: boolean;
    };
    maxResults?: number;
}

/**
 * Recherche de tâches dans Firestore
 */
async function searchTasks(
    searchQuery: string,
    filters: SearchOptions['filters'],
    accountType: AccountType,
    maxResults: number = 10
): Promise<SearchResult[]> {
    try {
        const tasksRef = collection(db, 'tasks');
        const constraints: QueryConstraint[] = [];

        // Pour les pros: chercher les tâches ouvertes
        if (accountType === AccountType.professional) {
            constraints.push(where('status', '==', 'open'));
        }

        // Filtre par catégorie
        if (filters?.category) {
            constraints.push(where('category', '==', filters.category));
        }

        // Filtre par urgence
        if (filters?.urgent) {
            constraints.push(where('urgent', '==', true));
        }

        // Filtre par statut
        if (filters?.status) {
            constraints.push(where('status', '==', filters.status));
        }

        // Ordre par date de création (plus récent en premier)
        constraints.push(orderBy('createdAt', 'desc'));
        constraints.push(limit(maxResults));

        const q = query(tasksRef, ...constraints);
        const snapshot = await getDocs(q);

        const results: SearchResult[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();

            // Calcul du score de pertinence (simple)
            let relevanceScore = 0;
            const normalizedQuery = searchQuery.toLowerCase();

            if (data.title?.toLowerCase().includes(normalizedQuery)) {
                relevanceScore += 10;
            }
            if (data.description?.toLowerCase().includes(normalizedQuery)) {
                relevanceScore += 5;
            }
            if (data.category?.toLowerCase().includes(normalizedQuery)) {
                relevanceScore += 7;
            }

            // Boost pour les tâches urgentes
            if (data.urgent) {
                relevanceScore += 3;
            }

            // Seuil minimum de pertinence
            if (relevanceScore > 0 || searchQuery === '') {
                results.push({
                    id: doc.id,
                    type: 'task',
                    title: data.title || 'Tâche sans titre',
                    description: data.description,
                    category: data.category,
                    location: {
                        city: data.location?.city,
                        postalCode: data.location?.postalCode,
                    },
                    relevanceScore,
                    metadata: {
                        budget: data.budget,
                        status: data.status,
                        urgent: data.urgent,
                        createdAt: data.createdAt,
                    },
                });
            }
        });

        // Trier par score de pertinence
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
        console.error('Erreur lors de la recherche de tâches:', error);
        return [];
    }
}

/**
 * Recherche de prestataires (comptes professionnels)
 */
async function searchProviders(
    searchQuery: string,
    filters: SearchOptions['filters'],
    maxResults: number = 10
): Promise<SearchResult[]> {
    try {
        const usersRef = collection(db, 'users');
        const constraints: QueryConstraint[] = [
            where('accountType', '==', AccountType.professional),
            limit(maxResults),
        ];

        // Filtre par catégorie de service
        if (filters?.category) {
            constraints.push(where('services', 'array-contains', filters.category));
        }

        const q = query(usersRef, ...constraints);
        const snapshot = await getDocs(q);

        const results: SearchResult[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();

            // Calcul du score de pertinence
            let relevanceScore = 0;
            const normalizedQuery = searchQuery.toLowerCase();

            if (data.displayName?.toLowerCase().includes(normalizedQuery)) {
                relevanceScore += 10;
            }
            if (data.bio?.toLowerCase().includes(normalizedQuery)) {
                relevanceScore += 5;
            }
            if (data.services?.some((s: string) => s.toLowerCase().includes(normalizedQuery))) {
                relevanceScore += 8;
            }

            // Boost pour les prestataires avec bonne note
            if (data.rating >= 4.5) {
                relevanceScore += 5;
            }
            if (data.verified) {
                relevanceScore += 3;
            }

            if (relevanceScore > 0 || searchQuery === '') {
                results.push({
                    id: doc.id,
                    type: 'provider',
                    title: data.displayName || 'Prestataire',
                    description: data.bio,
                    category: data.services?.[0],
                    location: {
                        city: data.address?.city,
                        postalCode: data.address?.postalCode,
                    },
                    relevanceScore,
                    metadata: {
                        rating: data.rating,
                        reviewCount: data.reviewCount,
                        verified: data.verified,
                        services: data.services,
                        photoURL: data.photoURL,
                    },
                });
            }
        });

        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
        console.error('Erreur lors de la recherche de prestataires:', error);
        return [];
    }
}

/**
 * Recherche de services (packages)
 */
async function searchServices(
    searchQuery: string,
    filters: SearchOptions['filters'],
    maxResults: number = 10
): Promise<SearchResult[]> {
    try {
        const servicesRef = collection(db, 'service_packages');
        const constraints: QueryConstraint[] = [
            where('active', '==', true),
            limit(maxResults),
        ];

        if (filters?.category) {
            constraints.push(where('category', '==', filters.category));
        }

        const q = query(servicesRef, ...constraints);
        const snapshot = await getDocs(q);

        const results: SearchResult[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();

            let relevanceScore = 0;
            const normalizedQuery = searchQuery.toLowerCase();

            if (data.name?.toLowerCase().includes(normalizedQuery)) {
                relevanceScore += 10;
            }
            if (data.description?.toLowerCase().includes(normalizedQuery)) {
                relevanceScore += 5;
            }

            // Boost pour les services populaires
            if (data.bookingCount > 50) {
                relevanceScore += 4;
            }

            if (relevanceScore > 0 || searchQuery === '') {
                results.push({
                    id: doc.id,
                    type: 'service',
                    title: data.name || 'Service',
                    description: data.description,
                    category: data.category,
                    relevanceScore,
                    metadata: {
                        price: data.price,
                        duration: data.duration,
                        bookingCount: data.bookingCount,
                        providerId: data.providerId,
                    },
                });
            }
        });

        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
        console.error('Erreur lors de la recherche de services:', error);
        return [];
    }
}

/**
 * Fonction principale de recherche unifiée
 */
export async function performSearch(options: SearchOptions): Promise<{
    tasks: SearchResult[];
    providers: SearchResult[];
    services: SearchResult[];
    total: number;
}> {
    const { query: searchQuery, accountType, filters, maxResults = 10 } = options;

    // Recherche parallèle dans toutes les collections
    const [tasks, providers, services] = await Promise.all([
        searchTasks(searchQuery, filters, accountType, maxResults),
        searchProviders(searchQuery, filters, maxResults),
        searchServices(searchQuery, filters, maxResults),
    ]);

    return {
        tasks,
        providers,
        services,
        total: tasks.length + providers.length + services.length,
    };
}

/**
 * Recherche rapide avec suggestions (pour autocomplete)
 */
export async function getSearchSuggestions(
    query: string,
    accountType: AccountType
): Promise<string[]> {
    if (query.length < 2) return [];

    const options: SearchOptions = {
        accountType,
        query,
        maxResults: 5,
    };

    const results = await performSearch(options);

    // Extraire les titres uniques
    const suggestions = new Set<string>();

    [...results.tasks, ...results.providers, ...results.services]
        .forEach(result => {
            if (result.title) {
                suggestions.add(result.title);
            }
            if (result.category) {
                suggestions.add(result.category);
            }
        });

    return Array.from(suggestions).slice(0, 5);
}

/**
 * Sauvegarde d'une recherche récente (côté client)
 */
export function saveRecentSearch(query: string, accountType: AccountType) {
    if (typeof window === 'undefined') return;

    const key = `recent_searches_${accountType}`;
    const recent = JSON.parse(localStorage.getItem(key) || '[]') as string[];

    // Ajouter la nouvelle recherche en premier
    const updated = [query, ...recent.filter(q => q !== query)].slice(0, 5);

    localStorage.setItem(key, JSON.stringify(updated));
}

/**
 * Récupération des recherches récentes
 */
export function getRecentSearches(accountType: AccountType): string[] {
    if (typeof window === 'undefined') return [];

    const key = `recent_searches_${accountType}`;
    return JSON.parse(localStorage.getItem(key) || '[]') as string[];
}
