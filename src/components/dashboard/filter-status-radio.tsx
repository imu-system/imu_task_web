/**
 * StatusFilter pour filtres dashboard
 * Phase 9 - Option F : Filtres Avancés
 * 
 * Features :
 * - Radio buttons pour status (all/completed/active/cancelled)
 * - Badge avec count (optionnel)
 * - Labels i18n
 */

'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import type { FilterStatus } from '@/types/filters';

interface StatusFilterOption {
  value: FilterStatus;
  count?: number;
}

interface FilterStatusRadioProps {
  value: FilterStatus;
  onChange: (value: FilterStatus) => void;
  options?: StatusFilterOption[];
  className?: string;
}

export function FilterStatusRadio({
  value,
  onChange,
  options,
  className
}: FilterStatusRadioProps) {
  const t = useTranslations('Dashboard.filters');
  
  // Default options si non fourni
  const defaultOptions: StatusFilterOption[] = [
    { value: 'all' },
    { value: 'completed' },
    { value: 'active' },
    { value: 'cancelled' }
  ];
  
  const statusOptions = options || defaultOptions;
  
  return (
    <div className={className}>
      <RadioGroup value={value} onValueChange={onChange}>
        {statusOptions.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`status-${option.value}`} />
            <Label 
              htmlFor={`status-${option.value}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              {t(`status.${option.value}`)}
              {option.count !== undefined && (
                <Badge variant="secondary" className="ml-1">
                  {option.count}
                </Badge>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
