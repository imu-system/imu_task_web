/**
 * DateRangePicker pour filtres dashboard
 * Phase 9 - Option F : Filtres Avancés
 * 
 * Features :
 * - 6 presets (today, last7days, last30days, thisMonth, lastMonth, custom)
 * - Calendar pour custom range (shadcn/ui + react-day-picker)
 * - Format date i18n
 * - Popover UI
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { fr, enUS, ja } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DateRange, DateRangePreset } from '@/types/filters';

interface FilterDateRangePickerProps {
  preset: DateRangePreset;
  dateRange: DateRange;
  onPresetChange: (preset: DateRangePreset) => void;
  onDateRangeChange: (range: DateRange) => void;
  locale?: string;
  className?: string;
}

export function FilterDateRangePicker({
  preset,
  dateRange,
  onPresetChange,
  onDateRangeChange,
  locale = 'fr',
  className
}: FilterDateRangePickerProps) {
  const t = useTranslations('Dashboard.filters');
  const [isOpen, setIsOpen] = useState(false);
  
  // Date-fns locale mapping
  const dateFnsLocale = locale === 'fr' ? fr : locale === 'ja' ? ja : enUS;
  
  // 6 presets disponibles
  const presets: DateRangePreset[] = [
    'today',
    'last7days',
    'last30days',
    'thisMonth',
    'lastMonth',
    'custom'
  ];
  
  // Format date range pour affichage
  const formatDateRange = () => {
    if (preset === 'custom') {
      if (!dateRange.from && !dateRange.to) {
        return t('dateRange.selectCustom');
      }
      if (dateRange.from && dateRange.to) {
        return `${format(dateRange.from, 'dd MMM yyyy', { locale: dateFnsLocale })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: dateFnsLocale })}`;
      }
      if (dateRange.from) {
        return `${format(dateRange.from, 'dd MMM yyyy', { locale: dateFnsLocale })} - ...`;
      }
      return '...';
    }
    return t(`dateRange.${preset}`);
  };
  
  // Handle preset change
  const handlePresetChange = (newPreset: DateRangePreset) => {
    onPresetChange(newPreset);
    if (newPreset !== 'custom') {
      setIsOpen(false);
    }
  };
  
  // Handle calendar selection
  const handleCalendarSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range) {
      onDateRangeChange({
        from: range.from || null,
        to: range.to || null
      });
      // Auto-close si both dates selected
      if (range.from && range.to) {
        setIsOpen(false);
      }
    }
  };
  
  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="flex-1">{formatDateRange()}</span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          {/* Preset selector */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">
              {t('dateRange.preset')}
            </label>
            <Select value={preset} onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {presets.map((p) => (
                  <SelectItem key={p} value={p}>
                    {t(`dateRange.${p}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Calendar for custom range */}
          {preset === 'custom' && (
            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-2 block">
                {t('dateRange.selectRange')}
              </label>
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from || undefined,
                  to: dateRange.to || undefined
                }}
                onSelect={handleCalendarSelect}
                numberOfMonths={2}
                locale={dateFnsLocale}
                className="rounded-md border"
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
