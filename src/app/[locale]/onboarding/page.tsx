'use client';

import { useState } from 'react';
import { useRouter } from '@/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AccountType } from '@/lib/types';
import { AccountTypeSelector } from '@/components/auth/account-type-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!selectedType || !user) {
      setError('Veuillez sélectionner un type de compte');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update user profile with account type
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'profile.accountType': selectedType,
        updatedAt: new Date(),
      });

      toast({
        title: '✅ Profil mis à jour',
        description: 'Votre type de compte a été configuré avec succès.',
      });

      // Redirect to appropriate dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err: any) {
      console.error('Error updating account type:', err);
      setError('Erreur lors de la mise à jour du profil. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Skip for now, redirect to dashboard
    router.push('/dashboard');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            Bienvenue sur ImuTask ! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Pour personnaliser votre expérience, quel type de profil vous correspond ?
          </p>
        </div>

        {/* Account Type Selector */}
        <AccountTypeSelector
          selectedType={selectedType}
          onSelect={setSelectedType}
          locale="fr"
        />

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={loading}
              >
                Passer pour l'instant
              </Button>

              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!selectedType || loading}
                className="min-w-[200px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configuration...
                  </>
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {!selectedType && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Sélectionnez un type de compte pour continuer
              </p>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>
            💡 <strong>Astuce :</strong> Vous pourrez modifier votre type de compte plus tard dans vos paramètres
          </p>
          <p>
            🔒 Vos données sont sécurisées et ne seront jamais partagées
          </p>
        </div>
      </div>
    </div>
  );
}
