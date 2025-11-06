'use client';

/**
 * RecurringScheduleEditor Component
 * 
 * Éditeur d'horaires récurrents hebdomadaires
 * - Sélection des jours de la semaine
 * - Ajout/suppression de créneaux horaires
 * - Validation des chevauchements
 * - Sauvegarde dans Firestore
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  getRecurringAvailabilities,
  createRecurringAvailability,
  updateRecurringAvailability,
  deleteRecurringAvailability,
} from '@/lib/firestore-availability';
import type {
  RecurringAvailability,
  TimeSlot,
  DayOfWeek,
} from '@/types/availability';

interface DaySchedule {
  dayOfWeek: DayOfWeek;
  enabled: boolean;
  slots: TimeSlot[];
  availabilityId?: string;
}

interface RecurringScheduleEditorProps {
  providerId: string;
  onSave?: () => void;
}

const DAYS: Array<{ value: DayOfWeek; labelKey: string }> = [
  { value: 1, labelKey: 'monday' },
  { value: 2, labelKey: 'tuesday' },
  { value: 3, labelKey: 'wednesday' },
  { value: 4, labelKey: 'thursday' },
  { value: 5, labelKey: 'friday' },
  { value: 6, labelKey: 'saturday' },
  { value: 0, labelKey: 'sunday' },
];

export function RecurringScheduleEditor({
  providerId,
  onSave,
}: RecurringScheduleEditorProps) {
  const t = useTranslations('Availability.recurringSchedule');
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map(day => ({
      dayOfWeek: day.value,
      enabled: false,
      slots: [],
    }))
  );

  useEffect(() => {
    loadSchedule();
  }, [providerId]);

  async function loadSchedule() {
    setLoading(true);
    try {
      const availabilities = await getRecurringAvailabilities(providerId);
      
      const newSchedule = DAYS.map(day => {
        const existing = availabilities.find(a => a.dayOfWeek === day.value);
        return {
          dayOfWeek: day.value,
          enabled: !!existing,
          slots: existing?.timeSlots || [],
          availabilityId: existing?.id,
        };
      });
      
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast({
        title: t('errorMessage'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  function toggleDay(dayOfWeek: DayOfWeek) {
    setSchedule(prev =>
      prev.map(day =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              enabled: !day.enabled,
              slots: !day.enabled && day.slots.length === 0
                ? [{ startTime: '09:00', endTime: '17:00' }]
                : day.slots,
            }
          : day
      )
    );
  }

  function addSlot(dayOfWeek: DayOfWeek) {
    setSchedule(prev =>
      prev.map(day =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              slots: [...day.slots, { startTime: '09:00', endTime: '17:00' }],
            }
          : day
      )
    );
  }

  function removeSlot(dayOfWeek: DayOfWeek, slotIndex: number) {
    setSchedule(prev =>
      prev.map(day =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              slots: day.slots.filter((_, i) => i !== slotIndex),
            }
          : day
      )
    );
  }

  function updateSlot(
    dayOfWeek: DayOfWeek,
    slotIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) {
    setSchedule(prev =>
      prev.map(day =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              slots: day.slots.map((slot, i) =>
                i === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : day
      )
    );
  }

  function validateSlots(slots: TimeSlot[]): boolean {
    // Check for overlapping slots
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1 = slots[i];
        const slot2 = slots[j];
        
        if (
          (slot1.startTime <= slot2.startTime && slot2.startTime < slot1.endTime) ||
          (slot2.startTime <= slot1.startTime && slot1.startTime < slot2.endTime)
        ) {
          return false;
        }
      }
    }
    
    // Check start < end for each slot
    for (const slot of slots) {
      if (slot.startTime >= slot.endTime) {
        return false;
      }
    }
    
    return true;
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Validate all enabled days
      for (const day of schedule) {
        if (day.enabled && !validateSlots(day.slots)) {
          toast({
            title: t('errorMessage'),
            description: `Invalid slots for ${DAYS.find(d => d.value === day.dayOfWeek)?.labelKey}`,
            variant: 'destructive',
          });
          setSaving(false);
          return;
        }
      }

      // Save changes
      const promises: Promise<void | string>[] = [];
      
      for (const day of schedule) {
        if (day.enabled && day.slots.length > 0) {
          // Create or update
          if (day.availabilityId) {
            promises.push(
              updateRecurringAvailability(day.availabilityId, {
                timeSlots: day.slots,
              })
            );
          } else {
            promises.push(
              createRecurringAvailability({
                providerId,
                dayOfWeek: day.dayOfWeek,
                timeSlots: day.slots,
              })
            );
          }
        } else if (!day.enabled && day.availabilityId) {
          // Delete if exists
          promises.push(deleteRecurringAvailability(day.availabilityId));
        }
      }

      await Promise.all(promises);

      toast({
        title: t('successMessage'),
      });

      onSave?.();
      loadSchedule(); // Reload to get updated IDs
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: t('errorMessage'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {DAYS.map(({ value: dayOfWeek, labelKey }) => {
          const daySchedule = schedule.find(d => d.dayOfWeek === dayOfWeek);
          if (!daySchedule) return null;

          return (
            <div
              key={dayOfWeek}
              className={cn(
                'space-y-3 rounded-lg border p-4 transition-colors',
                daySchedule.enabled && 'bg-accent/50'
              )}
            >
              {/* Day header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={daySchedule.enabled}
                    onCheckedChange={() => toggleDay(dayOfWeek)}
                    id={`day-${dayOfWeek}`}
                  />
                  <Label
                    htmlFor={`day-${dayOfWeek}`}
                    className="text-base font-semibold cursor-pointer"
                  >
                    {t(labelKey)}
                  </Label>
                </div>
                
                {daySchedule.enabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSlot(dayOfWeek)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('addSlot')}
                  </Button>
                )}
              </div>

              {/* Time slots */}
              {daySchedule.enabled && (
                <div className="space-y-2 pl-8">
                  {daySchedule.slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t('addSlot')}
                    </p>
                  ) : (
                    daySchedule.slots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <Label className="text-sm">{t('from')}</Label>
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              updateSlot(dayOfWeek, index, 'startTime', e.target.value)
                            }
                            className="w-32"
                          />
                          
                          <Label className="text-sm">{t('to')}</Label>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              updateSlot(dayOfWeek, index, 'endTime', e.target.value)
                            }
                            className="w-32"
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSlot(dayOfWeek, index)}
                          aria-label={t('removeSlot')}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={loadSchedule}
            disabled={saving}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : t('save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
