/**
 * Étape 7 : Acceptation des CGV professionnels
 * Dernière étape avant activation du compte pro
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, AlertCircle } from 'lucide-react';

interface Step7Props {
  data: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onNext: () => void;
}

export default function Step7Terms({ data, onSave, onNext }: Step7Props) {
  const [acceptedTerms, setAcceptedTerms] = useState(data.acceptedTerms as boolean || false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(data.acceptedPrivacy as boolean || false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms || !acceptedPrivacy) {
      setError('Vous devez accepter les conditions pour continuer');
      return;
    }

    await onSave({ acceptedTerms, acceptedPrivacy, acceptedAt: new Date() });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Conditions générales
          </CardTitle>
          <CardDescription>
            Dernière étape : acceptez les conditions d'utilisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
            <h3 className="font-semibold mb-2">Conditions Générales de Vente Professionnels</h3>
            <p className="text-sm text-muted-foreground">
              En tant que professionnel sur ImuPro, vous vous engagez à :
              <br />- Fournir des services de qualité
              <br />- Respecter les délais convenus
              <br />- Maintenir votre profil à jour
              <br />- Répondre aux demandes dans un délai de 48h
              <br />- Respecter les tarifs annoncés
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="cursor-pointer text-sm">
                J'accepte les <a href="/legal/terms-pro" className="text-primary underline">Conditions Générales de Vente</a> pour les professionnels
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy"
                checked={acceptedPrivacy}
                onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
              />
              <Label htmlFor="privacy" className="cursor-pointer text-sm">
                J'accepte la <a href="/legal/privacy" className="text-primary underline">Politique de confidentialité</a>
              </Label>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              🎉 Félicitations ! Après validation, vous pourrez commencer à recevoir des demandes de clients
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" size="lg" disabled={!acceptedTerms || !acceptedPrivacy}>
            Finaliser mon inscription
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
