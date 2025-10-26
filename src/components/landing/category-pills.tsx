'use client';

import { Button } from '@/components/ui/button';
import { AccessibleBadge } from '@/components/ui/accessible-badge';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TASK_CATEGORIES } from '@/lib/constants/categories';
import { logCategoryClick } from '@/lib/analytics';

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

  const handleCategoryClick = (slug: string, categoryName: string, isAccessible: boolean = false) => {
    setSelectedCategory(slug);
    logCategoryClick(slug, categoryName, isAccessible);
    router.push({
      pathname: '/tasks/browse',
      query: { category: slug },
    });
  };

  return (
    <div id="categories" className="relative w-full py-8 bg-background border-b">
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
          {TASK_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.id} className="relative flex-shrink-0">
                <Button
                  variant={selectedCategory === category.slug ? 'default' : 'outline'}
                  className={cn(
                    'h-12 px-6 gap-2 rounded-full font-medium transition-all duration-200',
                    selectedCategory === category.slug
                      ? 'shadow-md'
                      : 'hover:bg-accent hover:shadow-sm'
                  )}
                  onClick={() => handleCategoryClick(category.slug, t(category.nameKey), category.isAccessible || false)}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="whitespace-nowrap">{t(category.nameKey)}</span>
                </Button>
                {category.isAccessible && (
                  <div className="absolute -top-2 -right-2">
                    <AccessibleBadge variant="solid" className="shadow-sm" showIcon={false} />
                  </div>
                )}
              </div>
            );
          })}
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
