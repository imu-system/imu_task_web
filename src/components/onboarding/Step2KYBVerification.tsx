/**
 * Étape 2 : Vérification KYB SIRET
 * Vérification automatique via l'API SIRET
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { AlertCircle, CheckCircle, Loader2, Shield } from 'lucide-react';

interface Step2Props {
  data: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onNext: () => void;
}

export default function Step2KYBVerification({ data, onSave, onNext }: Step2Props) {
  const [siret, setSiret] = useState(data.siret as string || '');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(data.verified as boolean || false);
  const [companyData, setCompanyData] = useState(data.companyData as Record<string, string> || null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setError(null);
    setVerifying(true);

    try {
      const verifySIRET = httpsCallable(functions, 'verifyKYB_SIRET');
      const result = await verifySIRET({ siret });
      
      if (result.data && (result.data as { valid: boolean }).valid) {
        const data = result.data as { company: Record<string, string> };
        setCompanyData(data.company);
        setVerified(true);
      } else {
        setError('SIRET invalide ou entreprise introuvable');
      }
    } catch (err: unknown) {
      setError('Erreur lors de la vérification du SIRET');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verified) {
      setError('Veuillez d\'abord vérifier votre SIRET');
      return;
    }

    await onSave({ siret, verified, companyData });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Vérification SIRET
          </CardTitle>
          <CardDescription>
            Vérifiez votre numéro SIRET pour valider votre entreprise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verified && companyData && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Entreprise vérifiée : {companyData.name}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="siret">Numéro SIRET</Label>
            <div className="flex gap-2">
              <Input
                id="siret"
                value={siret}
                onChange={(e) => setSiret(e.target.value)}
                placeholder="123 456 789 00010"
                disabled={verified}
              />
              <Button
                type="button"
                onClick={handleVerify}
                disabled={!siret || verifying || verified}
              >
                {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Vérifier
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={!verified}>
            Continuer vers les services
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
