'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Loader2, X, Clock, FileText, User, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from '@/navigation';
import { AccountType } from '@/lib/types';
import { 
  performSearch, 
  getRecentSearches, 
  saveRecentSearch,
  type SearchResult 
} from '@/lib/search-service';
import { 
  logDashboardSearch, 
  logSearchSuggestionClick 
} from '@/lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';

interface ContextualSearchProps {
  accountType: AccountType;
  placeholder?: string;
  className?: string;
}

/**
 * Barre de recherche contextuelle avec recherche Firestore en temps réel
 * Analytics et animations intégrées
 */
export function ContextualSearch({ 
  accountType, 
  placeholder, 
  className 
}: ContextualSearchProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger les recherches récentes
  useEffect(() => {
    const recent = getRecentSearches(accountType);
    setRecentSearches(recent);
  }, [accountType]);

  // Recherche en temps réel avec debounce
  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      setIsOpen(query.length > 0 && recentSearches.length > 0);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsOpen(true);

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await performSearch({
          accountType,
          query,
          maxResults: 8,
        });

        // Combiner tous les résultats
        const allResults = [
          ...results.tasks,
          ...results.providers,
          ...results.services,
        ].sort((a, b) => b.relevanceScore - a.relevanceScore);

        setSearchResults(allResults);
        
        // Analytics
        logDashboardSearch(accountType, query, allResults.length);
      } catch (error) {
        console.error('Erreur de recherche:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, accountType, recentSearches.length]);

  // Sauvegarder une recherche
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    saveRecentSearch(query, accountType);
    setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5));
    
    // Navigation vers page de résultats
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setIsOpen(false);
    setQuery('');
  }, [query, accountType, router]);

  // Gérer le clic sur un résultat
  const handleResultClick = useCallback((result: SearchResult) => {
    saveRecentSearch(result.title, accountType);
    
    // Analytics
    logSearchSuggestionClick(result.type, result.title);
    
    // Navigation selon le type
    const routes: Record<SearchResult['type'], string> = {
      task: `/dashboard/tasks/${result.id}`,
      provider: `/providers/${result.id}`,
      service: `/services/${result.id}`,
      booking: `/dashboard/bookings/${result.id}`,
    };
    
    router.push(routes[result.type]);
    setIsOpen(false);
    setQuery('');
  }, [accountType, router]);

  // Gérer le clic sur une recherche récente
  const handleRecentClick = useCallback((search: string) => {
    setQuery(search);
    inputRef.current?.focus();
  }, []);

  // Supprimer une recherche récente
  const removeRecentSearch = useCallback((search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== search);
    setRecentSearches(updated);
    localStorage.setItem(`recent_searches_${accountType}`, JSON.stringify(updated));
  }, [recentSearches, accountType]);

  const getPlaceholderText = () => {
    if (placeholder) return placeholder;
    
    switch (accountType) {
      case AccountType.individual:
        return 'Rechercher un service, prestataire...';
      case AccountType.professional:
        return 'Rechercher une mission, client...';
      case AccountType.senior:
        return 'Que recherchez-vous ?';
      default:
        return 'Rechercher...';
    }
  };

  const getResultIcon = (type: SearchResult['type']) => {
    const icons = {
      task: <FileText className="h-4 w-4" />,
      provider: <User className="h-4 w-4" />,
      service: <Package className="h-4 w-4" />,
      booking: <FileText className="h-4 w-4" />,
    };
    return icons[type];
  };

  const getResultTypeLabel = (type: SearchResult['type']) => {
    const labels = {
      task: 'Tâche',
      provider: 'Prestataire',
      service: 'Service',
      booking: 'Réservation',
    };
    return labels[type];
  };

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={getPlaceholderText()}
          className={cn(
            'pl-12 pr-20 h-12 text-base rounded-full border-2 focus:border-primary transition-all',
            accountType === AccountType.senior && 'h-16 text-xl font-medium'
          )}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Dropdown avec résultats */}
      <AnimatePresence>
        {isOpen && (searchResults.length > 0 || recentSearches.length > 0 || query.length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-full mt-2 w-full bg-background border-2 rounded-2xl shadow-lg overflow-hidden z-50',
              'max-h-[400px] overflow-y-auto'
            )}
          >
            {/* Résultats de recherche */}
            {searchResults.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                  Résultats ({searchResults.length})
                </div>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                >
                  {searchResults.map((result) => (
                    <motion.button
                      key={result.id}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-sm truncate">
                              {result.title}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {getResultTypeLabel(result.type)}
                            </Badge>
                          </div>
                          {result.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {result.description}
                            </p>
                          )}
                          {result.location?.city && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              📍 {result.location.city}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Pas de résultats */}
            {query.length >= 2 && searchResults.length === 0 && !isSearching && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <p>Aucun résultat pour "{query}"</p>
                <p className="text-xs mt-1">Essayez avec d'autres mots-clés</p>
              </div>
            )}

            {/* Recherches récentes */}
            {recentSearches.length > 0 && query.length < 2 && (
              <div className="p-2 border-t">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                  Recherches récentes
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentClick(search)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => removeRecentSearch(search, e)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
