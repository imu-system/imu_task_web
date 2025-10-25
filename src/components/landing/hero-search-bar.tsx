'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, MapPin, DollarSign, Tag, TrendingUp, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TASK_CATEGORIES } from '@/lib/constants/categories';

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

  const quickSuggestions = [
    { emoji: '🏠', text: t('hero.search.quickSuggestions.cleaning'), color: 'from-blue-500 to-cyan-500' },
    { emoji: '📦', text: t('hero.search.quickSuggestions.moving'), color: 'from-purple-500 to-pink-500' },
    { emoji: '🌿', text: t('hero.search.quickSuggestions.gardening'), color: 'from-green-500 to-emerald-500' },
    { emoji: '🚗', text: t('hero.search.quickSuggestions.delivery'), color: 'from-orange-500 to-red-500' },
    { emoji: '🔧', text: t('hero.search.quickSuggestions.handyman'), color: 'from-yellow-500 to-orange-500' },
    { emoji: '👨‍🍳', text: t('hero.search.quickSuggestions.cooking'), color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <Card className={`
      ${isHero ? 'p-6 md:p-10' : 'p-4'} 
      bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-primary/10
      ${className}
    `}>
      <form onSubmit={handleSearch}>
        {isHero && (
          <div className="mb-6 text-center">
            <Badge variant="secondary" className="mb-3 px-4 py-1.5">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              {t('hero.search.badge')}
            </Badge>
          </div>
        )}

        <div className={`grid gap-4 ${isHero ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
          {/* Search Query */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
            <Input
              placeholder={t('hero.search.whatPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                pl-12 pr-4
                ${isHero ? 'h-16 text-lg' : 'h-12'}
                border-2 focus:border-primary focus:ring-2 focus:ring-primary/20
                rounded-xl font-medium
                transition-all duration-200
              `}
            />
          </div>

          {/* Location */}
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
            <Input
              placeholder={t('hero.search.wherePlaceholder')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`
                pl-12 pr-4
                ${isHero ? 'h-16 text-lg' : 'h-12'}
                border-2 focus:border-primary focus:ring-2 focus:ring-primary/20
                rounded-xl font-medium
                transition-all duration-200
              `}
            />
          </div>

          {/* Category (Hero only) */}
          {isHero && (
            <div className="relative group">
              <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-16 text-lg pl-12 border-2 focus:border-primary rounded-xl font-medium">
                  <SelectValue placeholder={t('hero.search.categoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-lg">{t('hero.search.allCategories')}</SelectItem>
                  {TASK_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-base">
                      {tCategories(cat.nameKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Budget (Hero only) */}
          {isHero && (
            <div className="relative group">
              <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input
                type="number"
                placeholder={t('hero.search.budgetPlaceholder')}
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="
                  pl-12 pr-4 h-16 text-lg
                  border-2 focus:border-primary focus:ring-2 focus:ring-primary/20
                  rounded-xl font-medium
                  transition-all duration-200
                "
                min="0"
                step="10"
              />
            </div>
          )}

          {/* Search Button */}
          <Button 
            type="submit" 
            size="lg" 
            className={`
              ${isHero ? 'h-16 text-lg font-bold md:col-span-2 lg:col-span-4' : 'h-12'}
              bg-gradient-to-r from-primary via-primary to-purple-600
              hover:from-primary/90 hover:via-primary/90 hover:to-purple-700
              shadow-xl hover:shadow-2xl
              rounded-xl
              transition-all duration-300
              transform hover:scale-[1.02]
            `}
          >
            <Search className="h-5 w-5 mr-2" />
            {t('hero.search.button')}
            <Sparkles className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Quick suggestions */}
        {isHero && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {t('hero.search.popular')}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSearchQuery(suggestion.text)}
                  className={`
                    group relative overflow-hidden
                    px-4 py-3 rounded-xl
                    bg-gradient-to-br ${suggestion.color}
                    text-white font-semibold text-sm
                    shadow-md hover:shadow-xl
                    transition-all duration-300
                    transform hover:scale-105
                    flex items-center justify-center gap-2
                  `}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    {suggestion.emoji}
                  </span>
                  <span className="hidden sm:inline">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </Card>
  );
}
