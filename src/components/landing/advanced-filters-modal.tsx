'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { TASK_CATEGORIES } from '@/lib/constants/categories';
import { 
  DollarSign, 
  Clock, 
  Calendar,
  Star,
  Shield,
  MapPin,
  Sparkles
} from 'lucide-react';

interface AdvancedFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: any) => void;
  initialFilters?: any;
}

export function AdvancedFiltersModal({ 
  open, 
  onOpenChange, 
  onApplyFilters,
  initialFilters = {}
}: AdvancedFiltersModalProps) {
  const t = useTranslations('LandingPage.hero.advancedFilters');
  const tCategories = useTranslations('TaskCategories');

  const [filters, setFilters] = useState({
    category: initialFilters.category || 'all',
    minBudget: initialFilters.minBudget || '',
    maxBudget: initialFilters.maxBudget || '',
    urgency: initialFilters.urgency || 'any',
    verifiedOnly: initialFilters.verifiedOnly || false,
    topRatedOnly: initialFilters.topRatedOnly || false,
    availability: initialFilters.availability || 'any',
    distance: initialFilters.distance || [50],
  });

  const handleApply = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const resetFilters = {
      category: 'all',
      minBudget: '',
      maxBudget: '',
      urgency: 'any',
      verifiedOnly: false,
      topRatedOnly: false,
      availability: 'any',
      distance: [50],
    };
    setFilters(resetFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'category' && value !== 'all') return true;
    if (key === 'urgency' && value !== 'any') return true;
    if (key === 'availability' && value !== 'any') return true;
    if (key === 'verifiedOnly' && value === true) return true;
    if (key === 'topRatedOnly' && value === true) return true;
    if (key === 'minBudget' && value) return true;
    if (key === 'maxBudget' && value) return true;
    if (key === 'distance' && value[0] !== 50) return true;
    return false;
  }).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            {t('title')}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {t('actions.activeCount', { count: activeFiltersCount })}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="h-4 w-4" />
              {t('category.label')}
            </Label>
            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('category.all')}</SelectItem>
                {TASK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {tCategories(cat.nameKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <DollarSign className="h-4 w-4" />
              {t('budget.label')}
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">{t('budget.min')}</Label>
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minBudget}
                  onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                  className="h-11"
                  min="0"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">{t('budget.max')}</Label>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxBudget}
                  onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                  className="h-11"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Distance */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <MapPin className="h-4 w-4" />
              {t('distance.label')} : {t('distance.unit', { distance: filters.distance[0] })}
            </Label>
            <Slider
              value={filters.distance}
              onValueChange={(value) => setFilters({ ...filters, distance: value })}
              min={5}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 km</span>
              <span>100 km</span>
            </div>
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Clock className="h-4 w-4" />
              {t('urgency.label')}
            </Label>
            <Select 
              value={filters.urgency} 
              onValueChange={(value) => setFilters({ ...filters, urgency: value })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t('urgency.options.any')}</SelectItem>
                <SelectItem value="asap">{t('urgency.options.asap')}</SelectItem>
                <SelectItem value="today">{t('urgency.options.today')}</SelectItem>
                <SelectItem value="this-week">{t('urgency.options.thisWeek')}</SelectItem>
                <SelectItem value="flexible">{t('urgency.options.flexible')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="h-4 w-4" />
              {t('availability.label')}
            </Label>
            <Select 
              value={filters.availability} 
              onValueChange={(value) => setFilters({ ...filters, availability: value })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t('availability.options.any')}</SelectItem>
                <SelectItem value="weekdays">{t('availability.options.weekdays')}</SelectItem>
                <SelectItem value="weekends">{t('availability.options.weekends')}</SelectItem>
                <SelectItem value="evenings">{t('availability.options.evenings')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality Filters */}
          <div className="space-y-4 p-4 bg-accent/5 rounded-lg border">
            <Label className="text-base font-semibold">{t('quality.label')}</Label>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <Label htmlFor="verified" className="cursor-pointer">
                  {t('quality.verifiedOnly')}
                </Label>
              </div>
              <Switch
                id="verified"
                checked={filters.verifiedOnly}
                onCheckedChange={(checked) => setFilters({ ...filters, verifiedOnly: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <Label htmlFor="topRated" className="cursor-pointer">
                  {t('quality.topRatedOnly')}
                </Label>
              </div>
              <Switch
                id="topRated"
                checked={filters.topRatedOnly}
                onCheckedChange={(checked) => setFilters({ ...filters, topRatedOnly: checked })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            {t('actions.reset')}
          </Button>
          <Button onClick={handleApply} className="min-w-[120px]">
            {t('actions.apply')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
