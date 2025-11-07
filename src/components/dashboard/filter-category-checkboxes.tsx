/**
 * CategoryMultiSelect pour filtres dashboard
 * Phase 9 - Option F : Filtres Avancés
 * 
 * Features :
 * - Checkboxes pour 8 catégories ImuTask
 * - Toggle all / clear all
 * - Badge avec count (optionnel)
 * - Labels i18n depuis Services.categories.*
 */

'use client';

import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ServiceCategory } from '@/types/filters';

interface CategoryFilterOption {
  value: ServiceCategory;
  count?: number;
}

interface FilterCategoryCheckboxesProps {
  selected: ServiceCategory[];
  onChange: (categories: ServiceCategory[]) => void;
  onToggle?: (category: ServiceCategory) => void;
  options?: CategoryFilterOption[];
  showCounts?: boolean;
  className?: string;
}

export function FilterCategoryCheckboxes({
  selected,
  onChange,
  onToggle,
  options,
  showCounts = false,
  className
}: FilterCategoryCheckboxesProps) {
  const t = useTranslations('Services.categories');
  const tFilters = useTranslations('Dashboard.filters');
  
  // 8 catégories ImuTask par défaut
  const defaultCategories: ServiceCategory[] = [
    'aide_domicile_petits_travaux',
    'courses_livraisons',
    'aide_numerique_administrative',
    'demenagement_manutention',
    'accompagnement_presence',
    'jardinage_exterieur',
    'animaux_compagnie',
    'evenements_occasions'
  ];
  
  const categoryOptions: CategoryFilterOption[] = options || 
    defaultCategories.map(value => ({ value }));
  
  const allSelected = categoryOptions.every(opt => selected.includes(opt.value));
  const noneSelected = selected.length === 0;
  
  const handleToggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(categoryOptions.map(opt => opt.value));
    }
  };
  
  const handleToggle = (category: ServiceCategory) => {
    if (onToggle) {
      onToggle(category);
    } else {
      if (selected.includes(category)) {
        onChange(selected.filter(c => c !== category));
      } else {
        onChange([...selected, category]);
      }
    }
  };
  
  return (
    <div className={className}>
      {/* Toggle All / Clear All */}
      <div className="flex items-center justify-between mb-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleToggleAll}
          className="h-8 text-xs"
        >
          {allSelected ? tFilters('clearAll') : tFilters('selectAll')}
        </Button>
        {!noneSelected && (
          <Badge variant="secondary">
            {selected.length} / {categoryOptions.length}
          </Badge>
        )}
      </div>
      
      {/* Category checkboxes */}
      <div className="space-y-2">
        {categoryOptions.map((option) => {
          const isChecked = selected.includes(option.value);
          
          return (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${option.value}`}
                checked={isChecked}
                onCheckedChange={() => handleToggle(option.value)}
              />
              <Label
                htmlFor={`category-${option.value}`}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                {t(option.value)}
                {showCounts && option.count !== undefined && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {option.count}
                  </Badge>
                )}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
