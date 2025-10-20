/**
 * Étape 3 : Services et tarifs
 * Liste des services proposés avec tarifs
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Wrench, Plus, Trash2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
}

interface Step3Props {
  data: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onNext: () => void;
}

export default function Step3Services({ data, onSave, onNext }: Step3Props) {
  const [services, setServices] = useState<Service[]>(data.services as Service[] || []);

  const addService = () => {
    setServices([...services, { id: Date.now().toString(), name: '', price: 0, unit: 'heure' }]);
  };

  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const updateService = (id: string, field: keyof Service, value: string | number) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ services });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Services et tarifs
          </CardTitle>
          <CardDescription>Ajoutez vos prestations et grille tarifaire</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="flex gap-2 items-end">
              <div className="flex-1">
                <Label>Service</Label>
                <Input
                  value={service.name}
                  onChange={(e) => updateService(service.id, 'name', e.target.value)}
                  placeholder="Ex: Dépannage plomberie"
                />
              </div>
              <div className="w-32">
                <Label>Tarif (€)</Label>
                <Input
                  type="number"
                  value={service.price}
                  onChange={(e) => updateService(service.id, 'price', Number(e.target.value))}
                />
              </div>
              <Button type="button" variant="destructive" size="icon" onClick={() => removeService(service.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button type="button" variant="outline" onClick={addService} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un service
          </Button>

          <Button type="submit" className="w-full" size="lg">
            Continuer vers les zones d'intervention
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
