'use client';

import { useState } from 'react';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * SearchBarCompact - Barre de recherche inline style Airbnb
 * 
 * Design ultra-compact:
 * - Tous les champs sur une seule ligne
 * - Bouton recherche circulaire à droite
 * - Fond blanc avec bordure arrondie
 * - Pas de card wrapper
 */
export function SearchBarCompact() {
  const t = useTranslations('LandingPage.hero.search');
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);

    router.push(`/tasks?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-0 bg-white rounded-full shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 p-2">
        
        {/* Quoi rechercher */}
        <div className="flex items-center flex-1 px-5 py-3 min-w-0">
          <Search className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            <label className="text-xs font-semibold text-gray-900 mb-0.5">Quoi</label>
            <Input
              placeholder="Rechercher un service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-sm placeholder:text-gray-400 font-normal"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* Où */}
        <div className="flex items-center flex-1 px-5 py-3 min-w-0">
          <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            <label className="text-xs font-semibold text-gray-900 mb-0.5">Où</label>
            <Input
              placeholder="Ville ou quartier..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-sm placeholder:text-gray-400 font-normal"
            />
          </div>
        </div>

        {/* Bouton Recherche Circulaire */}
        <Button 
          type="submit" 
          size="icon"
          className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0 ml-2"
        >
          <Search className="h-5 w-5 text-white" />
          <span className="sr-only">Rechercher</span>
        </Button>
      </div>
    </form>
  );
}
