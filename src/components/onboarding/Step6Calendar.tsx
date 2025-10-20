/**
 * Étape 6 : Calendrier de disponibilités
 * Définir les horaires et jours disponibles
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon } from 'lucide-react';

interface Step6Props {
  data: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onNext: () => void;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function Step6Calendar({ data, onSave, onNext }: Step6Props) {
  const [availableDays, setAvailableDays] = useState<string[]>(data.availableDays as string[] || []);

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ availableDays });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Disponibilités
          </CardTitle>
          <CardDescription>Sélectionnez vos jours de disponibilité</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={day}
                  checked={availableDays.includes(day)}
                  onCheckedChange={() => toggleDay(day)}
                />
                <Label htmlFor={day} className="cursor-pointer">
                  {day}
                </Label>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" size="lg">
            Continuer vers les CGV
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
