'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal,
  X,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { AdvancedFiltersModal } from './advanced-filters-modal';

interface StickySearchBarProps {
  className?: string;
}

export function StickySearchBar({ className = '' }: StickySearchBarProps) {
  const t = useTranslations('LandingPage.hero.stickySearch');
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<any>({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  const quickSuggestions = [
    { icon: '🏠', text: t('quickSuggestions.cleaning'), category: 'cleaning' },
    { icon: '📦', text: t('quickSuggestions.moving'), category: 'moving' },
    { icon: '🌿', text: t('quickSuggestions.gardening'), category: 'gardening' },
    { icon: '🚗', text: t('quickSuggestions.delivery'), category: 'delivery' },
    { icon: '🔧', text: t('quickSuggestions.handyman'), category: 'handyman' },
    { icon: '👨‍🍳', text: t('quickSuggestions.cooking'), category: 'cooking' },
  ];

  const activeFiltersCount = Object.entries(advancedFilters).filter(([key, value]) => {
    if (key === 'category' && value !== 'all') return true;
    if (key === 'urgency' && value !== 'any') return true;
    if (key === 'availability' && value !== 'any') return true;
    if (key === 'verifiedOnly' && value === true) return true;
    if (key === 'topRatedOnly' && value === true) return true;
    if (key === 'minBudget' && value) return true;
    if (key === 'maxBudget' && value) return true;
    if (key === 'distance' && Array.isArray(value) && value[0] !== 50) return true;
    return false;
  }).length;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    
    // Add advanced filters
    Object.entries(advancedFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== 'any') {
        if (Array.isArray(value)) {
          params.set(key, value[0].toString());
        } else {
          params.set(key, String(value));
        }
      }
    });

    router.push(`/tasks?${params.toString()}`);
  };

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    setShowSuggestions(false);
    // Auto-search after selecting suggestion
    setTimeout(() => {
      const params = new URLSearchParams();
      params.set('q', term);
      if (location) params.set('location', location);
      router.push(`/tasks?${params.toString()}`);
    }, 100);
  };

  const clearFilters = () => {
    setAdvancedFilters({});
  };

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Logo/Brand */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex items-center gap-2 mr-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            ImuTask
          </span>
        </motion.div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 pr-4 h-11 border-2 focus:border-primary"
            />
            
            {/* Quick Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && searchQuery.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-primary/20 rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-2 bg-primary/5 border-b">
                    <div className="flex items-center gap-2 px-2 py-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">{t('popularSearches')}</span>
                    </div>
                  </div>
                  <div className="p-2 grid grid-cols-2 gap-1">
                    {quickSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickSearch(suggestion.text)}
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-left"
                      >
                        <span className="text-xl">{suggestion.icon}</span>
                        <span className="text-sm font-medium">{suggestion.text}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Location Input */}
          <div className="relative hidden md:block w-48">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('locationPlaceholder')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 pr-4 h-11 border-2 focus:border-primary"
            />
          </div>

          {/* Advanced Filters Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFiltersModal(true)}
            className="relative h-11 px-4 border-2 hover:border-primary hidden sm:flex"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">{t('advancedFilters')}</span>
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Search Button */}
          <Button 
            type="submit" 
            size="lg" 
            className="h-11 px-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-md"
          >
            <Search className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">{t('searchButton')}</span>
          </Button>
        </form>

        {/* Active Filters Display */}
        <AnimatePresence>
          {activeFiltersCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="hidden xl:flex items-center gap-2"
            >
              <Badge variant="secondary" className="flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3" />
                {activeFiltersCount} {t('activeFilters')}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        open={showFiltersModal}
        onOpenChange={setShowFiltersModal}
        onApplyFilters={setAdvancedFilters}
        initialFilters={advancedFilters}
      />
    </>
  );
}
