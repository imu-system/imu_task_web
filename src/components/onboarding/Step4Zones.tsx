/**
 * Étape 4 : Zones d'intervention
 * Définir où le professionnel intervient
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface Step4Props {
  data: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onNext: () => void;
}

export default function Step4Zones({ data, onSave, onNext }: Step4Props) {
  const [city, setCity] = useState(data.city as string || '');
  const [postalCode, setPostalCode] = useState(data.postalCode as string || '');
  const [radius, setRadius] = useState(data.radius as number || 30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ city, postalCode, radius });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Zones d'intervention
          </CardTitle>
          <CardDescription>Définissez votre zone géographique d'intervention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ville principale</Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Paris"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Code postal</Label>
            <Input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="75001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Rayon d'intervention (km)</Label>
            <Input
              type="number"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              min="5"
              max="100"
            />
            <p className="text-xs text-muted-foreground">
              Jusqu'à {radius} km autour de votre ville
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Continuer vers le portfolio
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
