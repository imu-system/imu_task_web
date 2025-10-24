'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, MapPin, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';

const TASK_CATEGORIES = [
  'home_services',
  'delivery',
  'tutoring',
  'digital_help',
  'gardening',
  'pet_care',
  'event_help',
  'moving',
] as const;

interface HeroSearchBarProps {
  variant?: 'hero' | 'compact';
  className?: string;
}

export function HeroSearchBar({ variant = 'hero', className = '' }: HeroSearchBarProps) {
  const t = useTranslations('LandingPage');
  const tCategories = useTranslations('TaskCategories');
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('all');
  const [maxBudget, setMaxBudget] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    if (category !== 'all') params.set('category', category);
    if (maxBudget) params.set('maxBudget', maxBudget);

    // Navigate to browse page with filters
    router.push(`/tasks/browse?${params.toString()}`);
  };

  const isHero = variant === 'hero';

  return (
    <Card className={`${isHero ? 'p-6 md:p-8' : 'p-4'} bg-white shadow-xl ${className}`}>
      <form onSubmit={handleSearch}>
        <div className={`grid gap-4 ${isHero ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          {/* Search Query */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t('hero.search.whatPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${isHero ? 'h-14 text-lg' : 'h-12'}`}
            />
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t('hero.search.wherePlaceholder')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`pl-10 ${isHero ? 'h-14 text-lg' : 'h-12'}`}
            />
          </div>

          {/* Category (Hero only) */}
          {isHero && (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-14 text-lg">
                <SelectValue placeholder={t('hero.search.categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('hero.search.allCategories')}</SelectItem>
                {TASK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {tCategories(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Budget (Hero only) */}
          {isHero && (
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="number"
                placeholder={t('hero.search.budgetPlaceholder')}
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="pl-10 h-14 text-lg"
                min="0"
                step="10"
              />
            </div>
          )}

          {/* Search Button */}
          <Button 
            type="submit" 
            size="lg" 
            className={`${isHero ? 'h-14 text-lg font-semibold md:col-span-4' : 'h-12'} bg-primary hover:bg-primary/90`}
          >
            <Search className="h-5 w-5 mr-2" />
            {t('hero.search.button')}
          </Button>
        </div>

        {/* Quick suggestions */}
        {isHero && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">{t('hero.search.popular')}:</span>
            {['Ménage', 'Déménagement', 'Jardinage', 'Livraison'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setSearchQuery(term)}
                className="text-sm px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </form>
    </Card>
  );
}
