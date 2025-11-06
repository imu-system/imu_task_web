'use client';

/**
 * AvailabilityCalendar Component
 * 
 * Calendrier de gestion des disponibilités pour les providers
 * - Vue calendrier mensuel
 * - Sélection de dates
 * - Affichage des créneaux disponibles
 * - Affichage des périodes bloquées
 * - Actions CRUD sur disponibilités
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';
import { fr, enUS, ja } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  getRecurringAvailabilities,
  getSpecificAvailabilities,
  getBlockedPeriods,
  searchAvailableSlots,
} from '@/lib/firestore-availability';
import type {
  RecurringAvailability,
  SpecificAvailability,
  BlockedPeriod,
  TimeSlot,
  DayOfWeek,
} from '@/types/availability';

interface AvailabilityCalendarProps {
  providerId: string;
  locale: 'fr' | 'en' | 'ja';
  onDateSelect?: (date: Date) => void;
  onAddAvailability?: (date: Date) => void;
  onEditAvailability?: (date: Date, slots: TimeSlot[]) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasAvailability: boolean;
  isBlocked: boolean;
  slots: TimeSlot[];
  blockReason?: string;
}

export function AvailabilityCalendar({
  providerId,
  locale,
  onDateSelect,
  onAddAvailability,
  onEditAvailability,
}: AvailabilityCalendarProps) {
  const t = useTranslations('Availability');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  // Date locale
  const dateLocale = locale === 'fr' ? fr : locale === 'ja' ? ja : enUS;

  // Load availability data
  useEffect(() => {
    loadAvailabilityData();
  }, [currentMonth, providerId]);

  async function loadAvailabilityData() {
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      // Get all availability types
      const [recurring, specific, blocked, availableSlots] = await Promise.all([
        getRecurringAvailabilities(providerId),
        getSpecificAvailabilities(providerId, monthStart, monthEnd),
        getBlockedPeriods(providerId, monthStart, monthEnd),
        searchAvailableSlots({
          providerId,
          startDate: monthStart,
          endDate: monthEnd,
        }),
      ]);

      // Build calendar days
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      // Add days from previous month to complete first week
      const firstDay = getDay(monthStart);
      if (firstDay > 0) {
        const prevMonthEnd = new Date(monthStart);
        prevMonthEnd.setDate(0);
        const prevMonthStart = new Date(prevMonthEnd);
        prevMonthStart.setDate(prevMonthEnd.getDate() - firstDay + 1);
        days.unshift(...eachDayOfInterval({ start: prevMonthStart, end: prevMonthEnd }));
      }

      // Add days from next month to complete last week
      const lastDay = getDay(monthEnd);
      if (lastDay < 6) {
        const nextMonthStart = new Date(monthEnd);
        nextMonthStart.setDate(monthEnd.getDate() + 1);
        const nextMonthEnd = new Date(nextMonthStart);
        nextMonthEnd.setDate(nextMonthStart.getDate() + (6 - lastDay) - 1);
        days.push(...eachDayOfInterval({ start: nextMonthStart, end: nextMonthEnd }));
      }

      const calendarDaysData: CalendarDay[] = days.map(day => {
        const isCurrentMonth = isSameMonth(day, currentMonth);
        const isDayToday = isToday(day);
        
        // Check if blocked
        const blockedPeriod = blocked.find(
          b => day >= b.startDate && day <= b.endDate
        );
        
        // Get available slots for this day
        const daySlots = availableSlots.find(s => isSameDay(s.date, day));
        
        return {
          date: day,
          isCurrentMonth,
          isToday: isDayToday,
          hasAvailability: !!daySlots && daySlots.slots.length > 0,
          isBlocked: !!blockedPeriod,
          slots: daySlots?.slots || [],
          blockReason: blockedPeriod?.reason,
        };
      });

      setCalendarDays(calendarDaysData);
    } catch (error) {
      console.error('Error loading availability data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handlePreviousMonth() {
    setCurrentMonth(prev => subMonths(prev, 1));
  }

  function handleNextMonth() {
    setCurrentMonth(prev => addMonths(prev, 1));
  }

  function handleDateClick(day: CalendarDay) {
    if (!day.isCurrentMonth) return;
    
    setSelectedDate(day.date);
    onDateSelect?.(day.date);
  }

  function handleAddClick(day: CalendarDay) {
    if (!day.isCurrentMonth || day.isBlocked) return;
    onAddAvailability?.(day.date);
  }

  function handleEditClick(day: CalendarDay) {
    if (!day.isCurrentMonth || !day.hasAvailability) return;
    onEditAvailability?.(day.date, day.slots);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {t('calendar.title')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
              aria-label={t('calendar.previousMonth')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[150px] text-center font-semibold">
              {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              aria-label={t('calendar.nextMonth')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="text-muted-foreground">{t('calendar.loading')}</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, index) => (
                <div
                  key={day}
                  className="py-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {t(`calendar.days.${day.toLowerCase()}`)}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isSelected = selectedDate && isSameDay(day.date, selectedDate);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day)}
                    disabled={!day.isCurrentMonth}
                    className={cn(
                      'group relative aspect-square rounded-lg border p-2 text-left transition-all hover:border-primary',
                      day.isCurrentMonth
                        ? 'bg-background'
                        : 'bg-muted/50 text-muted-foreground',
                      day.isToday && 'border-primary font-semibold',
                      isSelected && 'bg-primary/10 border-primary',
                      day.isBlocked && 'bg-destructive/10 border-destructive',
                      !day.isCurrentMonth && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {/* Date number */}
                    <div className="flex items-start justify-between">
                      <span className={cn('text-sm', day.isToday && 'text-primary')}>
                        {format(day.date, 'd')}
                      </span>
                      
                      {/* Actions on hover */}
                      {day.isCurrentMonth && !day.isBlocked && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {day.hasAvailability ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(day);
                              }}
                              className="rounded-full p-0.5 hover:bg-primary/20"
                              aria-label={t('calendar.edit')}
                            >
                              <CalendarIcon className="h-3 w-3" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddClick(day);
                              }}
                              className="rounded-full p-0.5 hover:bg-primary/20"
                              aria-label={t('calendar.add')}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Availability indicators */}
                    <div className="mt-1 flex flex-col gap-0.5">
                      {day.isBlocked ? (
                        <Badge
                          variant="destructive"
                          className="h-4 w-full justify-center text-[10px] py-0"
                        >
                          {t('calendar.blocked')}
                        </Badge>
                      ) : day.hasAvailability ? (
                        <Badge
                          variant="default"
                          className="h-4 w-full justify-center text-[10px] py-0"
                        >
                          {day.slots.length} {t('calendar.slots')}
                        </Badge>
                      ) : null}
                    </div>

                    {/* Tooltip with details */}
                    {day.isCurrentMonth && (day.hasAvailability || day.isBlocked) && (
                      <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
                        <div className="rounded-lg bg-popover p-2 shadow-lg border min-w-[200px]">
                          {day.isBlocked ? (
                            <div className="text-xs">
                              <p className="font-semibold text-destructive">
                                {t('calendar.blocked')}
                              </p>
                              <p className="text-muted-foreground">{day.blockReason}</p>
                            </div>
                          ) : (
                            <div className="text-xs space-y-1">
                              <p className="font-semibold">
                                {t('calendar.availableSlots')}:
                              </p>
                              {day.slots.map((slot, i) => (
                                <p key={i} className="text-muted-foreground">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border-2 border-primary" />
                <span className="text-sm text-muted-foreground">
                  {t('calendar.legend.today')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="h-4">
                  {t('calendar.legend.available')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {t('calendar.legend.hasSlots')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="h-4">
                  {t('calendar.legend.blocked')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {t('calendar.legend.unavailable')}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
