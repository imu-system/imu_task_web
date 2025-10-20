/**
 * Étape 1 : Informations générales
 * Nom de l'entreprise et catégorie métier
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Building2, Briefcase } from 'lucide-react';

interface Step1Props {
  data: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onNext: () => void;
}

const CATEGORIES = [
  'Plomberie',
  'Électricité',
  'Maçonnerie',
  'Menuiserie',
  'Peinture',
  'Carrelage',
  'Chauffage',
  'Climatisation',
  'Toiture',
  'Jardinage',
  'Nettoyage',
  'Déménagement',
  'Autre',
];

export default function Step1GeneralInfo({ data, onSave, onNext }: Step1Props) {
  const [businessName, setBusinessName] = useState(data.businessName as string || '');
  const [category, setCategory] = useState(data.category as string || '');
  const [description, setDescription] = useState(data.description as string || '');
  const [phone, setPhone] = useState(data.phone as string || '');
  const [email, setEmail] = useState(data.email as string || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!businessName.trim()) {
      setError('Le nom de l\'entreprise est requis');
      return;
    }

    if (!category) {
      setError('Veuillez sélectionner une catégorie');
      return;
    }

    if (!phone.trim()) {
      setError('Le numéro de téléphone est requis');
      return;
    }

    try {
      await onSave({
        businessName: businessName.trim(),
        category,
        description: description.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
      onNext();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informations générales
          </CardTitle>
          <CardDescription>
            Présentez votre entreprise et votre activité principale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Nom de l'entreprise */}
          <div className="space-y-2">
            <Label htmlFor="businessName">
              Nom de l'entreprise <span className="text-destructive">*</span>
            </Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ex: Plomberie Dupont"
              required
            />
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Catégorie principale <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Sélectionnez votre métier" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {cat}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Sélectionnez votre activité principale
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description de votre activité</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement votre entreprise et vos prestations..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Cette description sera visible sur votre profil public
            </p>
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Téléphone professionnel <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 12 34 56 78"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@entreprise.fr"
            />
          </div>

          {/* Bouton de soumission */}
          <Button type="submit" className="w-full" size="lg">
            Continuer vers la vérification SIRET
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
