'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import {
  ShoppingBasket,
  Truck,
  Spade,
  Package,
  Wrench,
  PawPrint,
  GraduationCap,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  nameKey: string;
  icon: React.ReactNode;
  slug: string;
}

const categories: Category[] = [
  {
    id: '1',
    nameKey: 'cleaning',
    icon: <Sparkles className="h-5 w-5" />,
    slug: 'menage',
  },
  {
    id: '2',
    nameKey: 'moving',
    icon: <Truck className="h-5 w-5" />,
    slug: 'demenagement',
  },
  {
    id: '3',
    nameKey: 'gardening',
    icon: <Spade className="h-5 w-5" />,
    slug: 'jardinage',
  },
  {
    id: '4',
    nameKey: 'delivery',
    icon: <Package className="h-5 w-5" />,
    slug: 'livraison',
  },
  {
    id: '5',
    nameKey: 'handyman',
    icon: <Wrench className="h-5 w-5" />,
    slug: 'bricolage',
  },
  {
    id: '6',
    nameKey: 'petCare',
    icon: <PawPrint className="h-5 w-5" />,
    slug: 'garde-animaux',
  },
  {
    id: '7',
    nameKey: 'tutoring',
    icon: <GraduationCap className="h-5 w-5" />,
    slug: 'cours-particuliers',
  },
  {
    id: '8',
    nameKey: 'shopping',
    icon: <ShoppingBasket className="h-5 w-5" />,
    slug: 'courses',
  },
  {
    id: '9',
    nameKey: 'other',
    icon: <MoreHorizontal className="h-5 w-5" />,
    slug: 'autres',
  },
];

export function CategoryPills() {
  const router = useRouter();
  const t = useTranslations('LandingPage.categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    checkScroll();
  }, []);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 100);
    }
  };

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    router.push({
      pathname: '/tasks/browse',
      query: { category: slug },
    });
  };

  return (
    <div className="relative w-full py-8 bg-background border-b">
      <div className="container mx-auto px-4 md:px-6">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg bg-background hover:bg-accent"
            onClick={() => scroll('left')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
        )}

        {/* Category Pills Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]"
          onScroll={checkScroll}
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              className={cn(
                'flex-shrink-0 h-12 px-6 gap-2 rounded-full font-medium transition-all duration-200',
                selectedCategory === category.slug
                  ? 'shadow-md'
                  : 'hover:bg-accent hover:shadow-sm'
              )}
              onClick={() => handleCategoryClick(category.slug)}
            >
              {category.icon}
              <span className="whitespace-nowrap">{t(category.nameKey)}</span>
            </Button>
          ))}
        </div>

        {/* Scroll Right Button */}
        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg bg-background hover:bg-accent"
            onClick={() => scroll('right')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Button>
        )}
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
