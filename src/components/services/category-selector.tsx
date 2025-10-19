/**
 * Service Category Selector Component
 * Permet de sélectionner une catégorie de service avec affichage visuel
 */

'use client';

import { useState } from 'react';
import { 
  ServiceCategory, 
  SERVICE_CATEGORIES, 
  ServiceCategoryMetadata 
} from '@/types/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  ShoppingCart, 
  Smartphone, 
  Package, 
  Users, 
  TreePine, 
  Dog,
  PartyPopper,
  Check,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  Home,
  ShoppingCart,
  Smartphone,
  Package,
  Users,
  TreePine,
  Dog,
  PartyPopper,
};

interface ServiceCategorySelectorProps {
  value?: ServiceCategory;
  onChange: (category: ServiceCategory) => void;
  className?: string;
  showExamples?: boolean;
  showPriceRange?: boolean;
}

export function ServiceCategorySelector({
  value,
  onChange,
  className,
  showExamples = true,
  showPriceRange = true,
}: ServiceCategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | undefined>(value);

  const handleSelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
    onChange(category);
  };

  const categories = Object.values(SERVICE_CATEGORIES);

  return (
    <div className={cn('space-y-4', className)} data-testid="service-category-selector">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const IconComponent = ICON_MAP[category.icon as keyof typeof ICON_MAP];
          const isSelected = selectedCategory === category.id;

          return (
            <Card
              key={category.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-lg',
                isSelected && 'ring-2 ring-primary shadow-lg'
              )}
              onClick={() => handleSelect(category.id)}
              data-testid={`category-card-${category.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    'p-2 rounded-lg',
                    `bg-${category.color}-100 dark:bg-${category.color}-900/20`
                  )}>
                    {IconComponent && (
                      <IconComponent className={cn(
                        'h-6 w-6',
                        `text-${category.color}-600 dark:text-${category.color}-400`
                      )} />
                    )}
                  </div>
                  {isSelected && (
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg mt-2">{category.name}</CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {category.description}
                </CardDescription>
              </CardHeader>
              
              {(showPriceRange || showExamples) && (
                <CardContent className="space-y-3">
                  {showPriceRange && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tarif indicatif:</span>
                      <Badge variant="secondary">
                        {category.priceRange.min}-{category.priceRange.max}€/
                        {category.priceRange.unit === 'hour' ? 'h' :
                         category.priceRange.unit === 'visit' ? 'visite' : 'tâche'}
                      </Badge>
                    </div>
                  )}
                  
                  {showExamples && category.examples.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">Exemples:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {category.examples.slice(0, 2).map((example, idx) => (
                          <li key={idx} className="flex items-start">
                            <ChevronRight className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {selectedCategory && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {SERVICE_CATEGORIES[selectedCategory].name}
              </p>
              <p className="text-sm text-muted-foreground">
                Catégorie sélectionnée
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCategory(undefined);
              onChange('' as ServiceCategory);
            }}
          >
            Changer
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Variante compacte pour les filtres de recherche
 */
interface ServiceCategoryFilterProps {
  value?: ServiceCategory[];
  onChange: (categories: ServiceCategory[]) => void;
  className?: string;
}

export function ServiceCategoryFilter({
  value = [],
  onChange,
  className,
}: ServiceCategoryFilterProps) {
  const toggleCategory = (category: ServiceCategory) => {
    const newValue = value.includes(category)
      ? value.filter(c => c !== category)
      : [...value, category];
    onChange(newValue);
  };

  const categories = Object.values(SERVICE_CATEGORIES);

  return (
    <div className={cn('space-y-3', className)} data-testid="service-category-filter">
      <h3 className="text-sm font-medium">Catégories</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const IconComponent = ICON_MAP[category.icon as keyof typeof ICON_MAP];
          const isSelected = value.includes(category.id);

          return (
            <Button
              key={category.id}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCategory(category.id)}
              className="gap-2"
              data-testid={`category-filter-${category.id}`}
            >
              {IconComponent && <IconComponent className="h-4 w-4" />}
              {category.name}
              {isSelected && <Check className="h-3 w-3 ml-1" />}
            </Button>
          );
        })}
      </div>
      {value.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange([])}
          className="text-xs"
        >
          Effacer les filtres ({value.length})
        </Button>
      )}
    </div>
  );
}

/**
 * Badge de catégorie compact
 */
interface ServiceCategoryBadgeProps {
  category: ServiceCategory;
  showIcon?: boolean;
  className?: string;
}

export function ServiceCategoryBadge({
  category,
  showIcon = true,
  className,
}: ServiceCategoryBadgeProps) {
  const metadata = SERVICE_CATEGORIES[category];
  const IconComponent = ICON_MAP[metadata.icon as keyof typeof ICON_MAP];

  return (
    <Badge
      variant="secondary"
      className={cn('gap-1', className)}
      data-testid={`category-badge-${category}`}
    >
      {showIcon && IconComponent && <IconComponent className="h-3 w-3" />}
      {metadata.name}
    </Badge>
  );
}
