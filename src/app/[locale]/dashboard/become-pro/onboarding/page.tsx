/**
 * Wizard d'onboarding professionnel - ImuPro
 * Parcours guidé en 7 étapes pour devenir professionnel vérifié
 * 
 * Étapes :
 * 1. Informations générales (nom, catégorie métier)
 * 2. Vérification KYB SIRET (auto)
 * 3. Services et tarifs
 * 4. Zones d'intervention
 * 5. Portfolio (3 images minimum)
 * 6. Calendrier de disponibilités
 * 7. Acceptation CGV professionnels
 * 
 * Features :
 * - Progression sauvegardée automatiquement
 * - Navigation entre étapes
 * - Validation par étape
 * - Barre de progression visuelle
 */

'use client';

import { useRouter } from '@/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  Circle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

// Import des composants d'étape
import Step1GeneralInfo from '@/components/onboarding/Step1GeneralInfo';
import Step2KYBVerification from '@/components/onboarding/Step2KYBVerification';
import Step3Services from '@/components/onboarding/Step3Services';
import Step4Zones from '@/components/onboarding/Step4Zones';
import Step5Portfolio from '@/components/onboarding/Step5Portfolio';
import Step6Calendar from '@/components/onboarding/Step6Calendar';
import Step7Terms from '@/components/onboarding/Step7Terms';

interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  step1Data?: Record<string, unknown>;
  step2Data?: Record<string, unknown>;
  step3Data?: Record<string, unknown>;
  step4Data?: Record<string, unknown>;
  step5Data?: Record<string, unknown>;
  step6Data?: Record<string, unknown>;
  step7Data?: Record<string, unknown>;
  lastUpdated?: Date;
}

const STEPS = [
  {
    number: 1,
    title: 'Informations générales',
    description: 'Nom de l\'entreprise et catégorie métier',
  },
  {
    number: 2,
    title: 'Vérification SIRET',
    description: 'Vérification de votre entreprise',
  },
  {
    number: 3,
    title: 'Services et tarifs',
    description: 'Vos prestations et grille tarifaire',
  },
  {
    number: 4,
    title: 'Zones d\'intervention',
    description: 'Où intervenez-vous ?',
  },
  {
    number: 5,
    title: 'Portfolio',
    description: 'Au moins 3 photos de vos réalisations',
  },
  {
    number: 6,
    title: 'Disponibilités',
    description: 'Votre calendrier de disponibilité',
  },
  {
    number: 7,
    title: 'Conditions générales',
    description: 'Acceptation des CGV professionnels',
  },
];

export default function OnboardingWizardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState<OnboardingProgress>({
    currentStep: 1,
    completedSteps: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Charger la progression sauvegardée
  useEffect(() => {
    if (!authLoading && user) {
      loadProgress();
    }
  }, [authLoading, user]);

  const loadProgress = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const progressDoc = await getDoc(doc(db, 'onboarding_progress', user.uid));
      
      if (progressDoc.exists()) {
        const data = progressDoc.data() as OnboardingProgress;
        setProgress(data);
        setCurrentStep(data.currentStep || 1);
      }
    } catch (err) {
      console.error('Erreur chargement progression:', err);
      setError('Erreur lors du chargement de votre progression');
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (stepData: Record<string, unknown>, stepNumber: number) => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      const updatedProgress: OnboardingProgress = {
        ...progress,
        currentStep: stepNumber,
        [`step${stepNumber}Data`]: stepData,
        lastUpdated: new Date(),
      };

      await setDoc(doc(db, 'onboarding_progress', user.uid), updatedProgress);
      setProgress(updatedProgress);
    } catch (err) {
      console.error('Erreur sauvegarde progression:', err);
      setError('Erreur lors de la sauvegarde de votre progression');
    } finally {
      setSaving(false);
    }
  };

  const markStepComplete = async (stepNumber: number) => {
    if (!user) return;

    const updatedCompletedSteps = [...progress.completedSteps];
    if (!updatedCompletedSteps.includes(stepNumber)) {
      updatedCompletedSteps.push(stepNumber);
    }

    const updatedProgress: OnboardingProgress = {
      ...progress,
      completedSteps: updatedCompletedSteps,
      lastUpdated: new Date(),
    };

    await setDoc(doc(db, 'onboarding_progress', user.uid), updatedProgress);
    setProgress(updatedProgress);
  };

  const handleNextStep = async () => {
    // Marquer l'étape actuelle comme complète
    await markStepComplete(currentStep);

    if (currentStep < 7) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await saveProgress(progress[`step${currentStep}Data` as keyof OnboardingProgress] as Record<string, unknown> || {}, nextStep);
    } else {
      // Onboarding terminé, rediriger vers le dashboard pro
      router.push('/dashboard/pro');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Permettre de revenir à une étape précédente ou complète
    if (stepNumber <= currentStep || progress.completedSteps.includes(stepNumber)) {
      setCurrentStep(stepNumber);
    }
  };

  const calculateProgress = (): number => {
    return (progress.completedSteps.length / 7) * 100;
  };

  const renderStep = () => {
    const stepData = progress[`step${currentStep}Data` as keyof OnboardingProgress] as Record<string, unknown> || {};

    switch (currentStep) {
      case 1:
        return (
          <Step1GeneralInfo
            data={stepData}
            onSave={(data) => saveProgress(data, 1)}
            onNext={handleNextStep}
          />
        );
      case 2:
        return (
          <Step2KYBVerification
            data={stepData as Record<string, unknown>}
            onSave={(data: Record<string, unknown>) => saveProgress(data, 2)}
            onNext={handleNextStep}
          />
        );
      case 3:
        return (
          <Step3Services
            data={stepData as Record<string, unknown>}
            onSave={(data: Record<string, unknown>) => saveProgress(data, 3)}
            onNext={handleNextStep}
          />
        );
      case 4:
        return (
          <Step4Zones
            data={stepData as Record<string, unknown>}
            onSave={(data: Record<string, unknown>) => saveProgress(data, 4)}
            onNext={handleNextStep}
          />
        );
      case 5:
        return (
          <Step5Portfolio
            data={stepData as Record<string, unknown>}
            onSave={(data: Record<string, unknown>) => saveProgress(data, 5)}
            onNext={handleNextStep}
          />
        );
      case 6:
        return (
          <Step6Calendar
            data={stepData as Record<string, unknown>}
            onSave={(data: Record<string, unknown>) => saveProgress(data, 6)}
            onNext={handleNextStep}
          />
        );
      case 7:
        return (
          <Step7Terms
            data={stepData as Record<string, unknown>}
            onSave={(data: Record<string, unknown>) => saveProgress(data, 7)}
            onNext={handleNextStep}
          />
        );
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-2">Devenir professionnel ImuPro</h1>
        <p className="text-muted-foreground">
          Complétez votre profil en 7 étapes pour commencer à recevoir des demandes
        </p>
      </div>

      {/* Barre de progression globale */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Progression</CardTitle>
          <CardDescription>
            {progress.completedSteps.length} / 7 étapes complétées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={calculateProgress()} className="h-3" />
        </CardContent>
      </Card>

      {/* Navigation des étapes */}
      <div className="mb-8">
        <div className="grid grid-cols-7 gap-2">
          {STEPS.map((step) => {
            const isCompleted = progress.completedSteps.includes(step.number);
            const isCurrent = currentStep === step.number;
            const isAccessible = step.number <= currentStep || isCompleted;

            return (
              <button
                key={step.number}
                onClick={() => handleStepClick(step.number)}
                disabled={!isAccessible}
                className={`
                  p-3 rounded-lg text-center transition-all
                  ${isCurrent ? 'bg-primary text-primary-foreground shadow-lg scale-105' : ''}
                  ${isCompleted && !isCurrent ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                  ${!isAccessible ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                  ${isAccessible && !isCurrent && !isCompleted ? 'bg-gray-100 hover:bg-gray-200' : ''}
                `}
              >
                <div className="flex items-center justify-center mb-1">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <p className="text-xs font-medium">{step.number}</p>
              </button>
            );
          })}
        </div>

        {/* Titre et description de l'étape courante */}
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold mb-2">
            Étape {currentStep} : {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-muted-foreground">
            {STEPS[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Contenu de l'étape */}
      <div className="mb-6">
        {renderStep()}
      </div>

      {/* Navigation Précédent/Suivant */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          disabled={currentStep === 1 || saving}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>

        <div className="text-sm text-muted-foreground">
          {saving && (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sauvegarde en cours...
            </span>
          )}
        </div>

        <Button onClick={handleNextStep} disabled={saving}>
          {currentStep === 7 ? 'Terminer' : 'Suivant'}
          {currentStep < 7 && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
