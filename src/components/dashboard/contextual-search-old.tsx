'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, TrendingUp, Clock, MapPin, Filter, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { fadeInUp, staggerContainer, staggerItem } from '@/components/ui/animated';

interface SearchSuggestion {
  id: string;
  label: string;
  type: 'task' | 'provider' | 'service' | 'location';
  icon?: React.ReactNode;
  action: () => void;
}

interface ContextualSearchProps {
  accountType: AccountType;
  placeholder?: string;
  className?: string;
}

/**
 * Barre de recherche contextuelle adaptée au type de compte
 * 
 * - Client: Recherche de services, prestataires, tâches
 * - Pro: Recherche de missions, clients, opportunités
 * - Senior: Recherche simplifiée avec suggestions populaires
 * 
 * Utilise Firestore pour la recherche en temps réel avec analytics
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

  // Charger les recherches récentes
  useEffect(() => {
    const recent = getRecentSearches(accountType);
    setRecentSearches(recent);
  }, [accountType]);

  // Recherche en temps réel avec debounce
  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

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
        ];

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
  }, [query, accountType]);

  // Sauvegarder une recherche
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    saveRecentSearch(query, accountType);
    setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5));
    
    // Navigation vers page de résultats
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setIsOpen(false);
  }, [query, accountType, router]);

  // Gérer le clic sur un résultat
  const handleResultClick = useCallback((result: SearchResult) => {
    saveRecentSearch(result.title, accountType);
    
    // Analytics
    logSearchSuggestionClick(result.type, result.title);
    
    // Navigation selon le type
    const routes = {
      task: `/dashboard/tasks/${result.id}`,
      provider: `/providers/${result.id}`,
      service: `/services/${result.id}`,
      booking: `/dashboard/bookings/${result.id}`,
    };
    
    router.push(routes[result.type]);
    setIsOpen(false);
    setQuery('');
  }, [accountType, router]);

  // Suggestions selon le type de compte
  const getContextualSuggestions = useCallback((searchQuery: string): SearchSuggestion[] => {
    const lowerQuery = searchQuery.toLowerCase();

    switch (accountType) {
      case AccountType.individual:
        return [
          {
            id: 'plumbing',
            label: 'Plomberie',
            type: 'service' as const,
            icon: <TrendingUp className="h-4 w-4" />,
            action: () => {
              saveSearch('Plomberie');
              router.push('/search?category=plumbery');
            }
          },
          {
            id: 'cleaning',
            label: 'Ménage',
            type: 'service' as const,
            icon: <TrendingUp className="h-4 w-4" />,
            action: () => {
              saveSearch('Ménage');
              router.push('/search?category=cleaning');
            }
          },
          {
            id: 'gardening',
            label: 'Jardinage',
            type: 'service' as const,
            icon: <TrendingUp className="h-4 w-4" />,
            action: () => {
              saveSearch('Jardinage');
              router.push('/search?category=gardening');
            }
          },
          {
            id: 'nearby',
            label: 'Prestataires à proximité',
            type: 'location' as const,
            icon: <MapPin className="h-4 w-4" />,
            action: () => {
              router.push('/search?nearby=true');
            }
          },
        ].filter(s => s.label.toLowerCase().includes(lowerQuery));

      case AccountType.professional:
        return [
          {
            id: 'new-missions',
            label: 'Nouvelles missions',
            type: 'task' as const,
            icon: <TrendingUp className="h-4 w-4" />,
            action: () => {
              router.push('/dashboard/pro/missions?filter=new');
            }
          },
          {
            id: 'urgent',
            label: 'Missions urgentes',
            type: 'task' as const,
            icon: <Clock className="h-4 w-4" />,
            action: () => {
              router.push('/dashboard/pro/missions?filter=urgent');
            }
          },
          {
            id: 'my-area',
            label: 'Dans ma zone',
            type: 'location' as const,
            icon: <MapPin className="h-4 w-4" />,
            action: () => {
              router.push('/dashboard/pro/missions?nearby=true');
            }
          },
        ].filter(s => s.label.toLowerCase().includes(lowerQuery));

      case AccountType.senior:
        return [
          {
            id: 'assistance',
            label: 'Assistance à domicile',
            type: 'service' as const,
            icon: <TrendingUp className="h-4 w-4" />,
            action: () => {
              saveSearch('Assistance à domicile');
              router.push('/search?category=home-assistance');
            }
          },
          {
            id: 'shopping',
            label: 'Courses',
            type: 'service' as const,
            icon: <TrendingUp className="h-4 w-4" />,
            action: () => {
              saveSearch('Courses');
              router.push('/search?category=shopping');
            }
          },
          {
            id: 'medical',
            label: 'Accompagnement médical',
            type: 'service' as const,
            icon: <TrendingUp className="h-4 w-4" />,
            action: () => {
              saveSearch('Accompagnement médical');
              router.push('/search?category=medical-accompaniment');
            }
          },
        ].filter(s => s.label.toLowerCase().includes(lowerQuery));

      default:
        return [];
    }
  }, [accountType, router, saveSearch]);  // Mise à jour des suggestions
  useEffect(() => {
    if (query.length > 0) {
      setSuggestions(getContextualSuggestions(query));
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query, getContextualSuggestions]);

  // Gérer la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearch(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setQuery('');
      setIsOpen(false);
    }
  };

  // Supprimer une recherche récente
  const removeRecentSearch = (search: string) => {
    const updated = recentSearches.filter(s => s !== search);
    setRecentSearches(updated);
    localStorage.setItem(`recent_searches_${accountType}`, JSON.stringify(updated));
  };

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

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={getPlaceholderText()}
          className={cn(
            'pl-12 pr-12 h-12 text-base rounded-full border-2 focus:border-primary transition-all',
            accountType === 'senior' && 'h-16 text-xl font-medium'
          )}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Suggestions dropdown */}
      {isOpen && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Recherches récentes */}
          {recentSearches.length > 0 && query.length === 0 && (
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Recherches récentes</p>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, idx) => (
                  <div key={idx} className="flex items-center justify-between group hover:bg-muted/50 rounded-lg p-2 transition-colors">
                    <button
                      onClick={() => {
                        setQuery(search);
                        router.push(`/search?q=${encodeURIComponent(search)}`);
                      }}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRecentSearch(search)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3">
              <p className="text-sm font-medium text-muted-foreground mb-2">Suggestions</p>
              <div className="space-y-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => {
                      suggestion.action();
                      setQuery('');
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors text-left"
                  >
                    {suggestion.icon}
                    <span className="flex-1">{suggestion.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.type === 'service' && 'Service'}
                      {suggestion.type === 'task' && 'Mission'}
                      {suggestion.type === 'provider' && 'Prestataire'}
                      {suggestion.type === 'location' && 'Localisation'}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
