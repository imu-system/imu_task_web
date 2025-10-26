/**
 * Composant de recherche Algolia contextuel
 * 
 * Features:
 * - Recherche instantanée (< 20ms avec Algolia)
 * - Typo tolerance ("plomber" → "plombier")
 * - Highlighting des résultats
 * - Geo-search si GPS disponible
 * - Animations fluides
 * - Analytics intégrés
 * - Recherches récentes (localStorage)
 * 
 * Remplace ContextualSearch pour de meilleures performances
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Clock, FileText, User, Package, MapPin, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from '@/navigation';
import { AccountType } from '@/lib/types';
import { useAlgoliaSearch, type SearchHit } from '@/hooks/useAlgoliaSearch';
import { motion, AnimatePresence } from 'framer-motion';
import { logSearchSuggestionClick } from '@/lib/analytics';
import { isAlgoliaConfigured } from '@/lib/algolia-config';

// Clés localStorage pour recherches récentes
const RECENT_SEARCHES_KEY = 'imu_recent_searches';
const MAX_RECENT_SEARCHES = 5;

interface AlgoliaSearchBoxProps {
  accountType: AccountType;
  placeholder?: string;
  className?: string;
  geoLocation?: { lat: number; lng: number };
}

/**
 * Obtenir les recherches récentes depuis localStorage
 */
function getRecentSearches(accountType: AccountType): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = `${RECENT_SEARCHES_KEY}_${accountType}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Sauvegarder une recherche récente
 */
function saveRecentSearch(query: string, accountType: AccountType) {
  if (typeof window === 'undefined' || !query.trim()) return;
  
  try {
    const key = `${RECENT_SEARCHES_KEY}_${accountType}`;
    const recent = getRecentSearches(accountType);
    
    // Ajouter en début, éviter doublons
    const updated = [query, ...recent.filter(q => q !== query)].slice(0, MAX_RECENT_SEARCHES);
    
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
}

/**
 * Obtenir le placeholder contextuel
 */
function getPlaceholder(accountType: AccountType): string {
  switch (accountType) {
    case AccountType.individual:
      return 'Rechercher des services, prestataires...';
    case AccountType.professional:
      return 'Rechercher des missions, clients...';
    case AccountType.senior:
      return 'Rechercher de l\'aide...';
    default:
      return 'Rechercher...';
  }
}

/**
 * Composant de recherche Algolia
 */
export function AlgoliaSearchBox({
  accountType,
  placeholder,
  className,
  geoLocation,
}: AlgoliaSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [algoliaEnabled, setAlgoliaEnabled] = useState(false);
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hook Algolia search
  const { results, isSearching, error, totalHits, search, clearSearch } = useAlgoliaSearch({
    accountType,
    geoLocation,
    indices: ['tasks', 'users', 'services'],
    maxResults: 8,
  });

  // Vérifier si Algolia est configuré
  useEffect(() => {
    setAlgoliaEnabled(isAlgoliaConfigured);
  }, []);

  // Charger les recherches récentes
  useEffect(() => {
    setRecentSearches(getRecentSearches(accountType));
  }, [accountType]);

  // Gérer la recherche en temps réel
  useEffect(() => {
    if (query.length >= 2) {
      search(query);
      setIsOpen(true);
    } else {
      clearSearch();
      setIsOpen(query.length > 0 && recentSearches.length > 0);
    }
  }, [query, search, clearSearch, recentSearches.length]);

  // Fermer le dropdown si clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Gérer la sélection d'un résultat
   */
  const handleSelectResult = (hit: SearchHit) => {
    saveRecentSearch(query, accountType);
    setIsOpen(false);
    setQuery('');
    
    // Analytics
    logSearchSuggestionClick(hit.type, hit.title);

    // Navigation selon le type
    switch (hit.type) {
      case 'task':
        router.push(`/dashboard/tasks/${hit.id}`);
        break;
      case 'user':
        router.push(`/dashboard/providers/${hit.id}`);
        break;
      case 'service':
        router.push(`/dashboard/services?category=${hit.category}`);
        break;
    }
  };

  /**
   * Gérer la sélection d'une recherche récente
   */
  const handleSelectRecent = (recentQuery: string) => {
    setQuery(recentQuery);
    inputRef.current?.focus();
    logSearchSuggestionClick('recent', recentQuery);
  };

  /**
   * Obtenir l'icône selon le type de résultat
   */
  const getResultIcon = (hit: SearchHit) => {
    switch (hit.type) {
      case 'task':
        return <FileText className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'service':
        return <Package className="h-4 w-4" />;
    }
  };

  /**
   * Afficher le type de résultat en français
   */
  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'task':
        return 'Tâche';
      case 'user':
        return 'Prestataire';
      case 'service':
        return 'Service';
      default:
        return '';
    }
  };

  // Si Algolia n'est pas configuré, ne rien afficher
  if (!algoliaEnabled) {
    return (
      <div className={cn('relative', className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || getPlaceholder(accountType)}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9"
          disabled
        />
        <Badge className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" variant="outline">
          Algolia non configuré
        </Badge>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Input de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || getPlaceholder(accountType)}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-9"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => {
              setQuery('');
              clearSearch();
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown avec résultats */}
      <AnimatePresence>
        {isOpen && (query.length >= 2 || recentSearches.length > 0) && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg overflow-hidden z-50 max-h-[400px] overflow-y-auto"
          >
            {/* Erreur */}
            {error && (
              <div className="p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Résultats de recherche */}
            {query.length >= 2 && !error && (
              <>
                {results.length > 0 ? (
                  <div className="p-2">
                    <div className="text-xs text-muted-foreground px-3 py-2">
                      {totalHits} résultat{totalHits > 1 ? 's' : ''} trouvé{totalHits > 1 ? 's' : ''}
                    </div>
                    {results.map((hit) => (
                      <button
                        key={`${hit.type}-${hit.id}`}
                        onClick={() => handleSelectResult(hit)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-start gap-3"
                      >
                        <div className="mt-1">{getResultIcon(hit)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="font-medium text-sm"
                              dangerouslySetInnerHTML={{ __html: hit.highlighted?.title || hit.title }}
                            />
                            <Badge variant="outline" className="text-xs">
                              {getResultTypeLabel(hit.type)}
                            </Badge>
                          </div>
                          <p
                            className="text-xs text-muted-foreground line-clamp-1"
                            dangerouslySetInnerHTML={{
                              __html: hit.highlighted?.description || hit.description,
                            }}
                          />
                          {/* Métadonnées */}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {hit.metadata?.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {hit.metadata.location}
                              </span>
                            )}
                            {hit.metadata?.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {hit.metadata.rating.toFixed(1)}
                              </span>
                            )}
                            {hit.metadata?.urgent && (
                              <Badge variant="destructive" className="text-xs h-5">
                                Urgent
                              </Badge>
                            )}
                            {hit.metadata?.budget && (
                              <span className="font-medium">€{hit.metadata.budget}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : !isSearching ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Aucun résultat trouvé pour &quot;{query}&quot;
                  </div>
                ) : null}
              </>
            )}

            {/* Recherches récentes */}
            {query.length < 2 && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-muted-foreground px-3 py-2">Recherches récentes</div>
                {recentSearches.map((recentQuery, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectRecent(recentQuery)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-3"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{recentQuery}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
