'use client';

/**
 * PREVIEW PAGE - Pour tests e2e uniquement
 * Cette page permet de tester l'UI d'onboarding sans authentification
 * NE PAS utiliser en production - pas de sauvegarde Firestore
 */

import { useState } from 'react';
import { AccountType } from '@/lib/types';
import { AccountTypeCard } from '@/components/onboarding/account-type-card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function OnboardingPreviewPage() {
  const t = useTranslations('Onboarding');
  
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);

  const accountTypes: AccountType[] = [
    AccountType.individual,
    AccountType.professional,
    AccountType.senior,
  ];

  const handleContinue = () => {
    if (!selectedType) return;
    
    // En mode preview, on affiche juste un message
    alert(`Preview Mode - Selected: ${selectedType}\n\nIn production, this would:\n1. Save to Firestore\n2. Redirect to dashboard`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl"
      >
        {/* PREVIEW MODE BANNER */}
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-600">
            <strong>Preview Mode</strong> - UI Test Only (No Authentication Required)
          </p>
        </div>

        {/* Logo ImuTask */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo_imutask.png"
            alt="ImuTask"
            width={180}
            height={60}
            priority
            className="h-auto"
          />
        </div>

        {/* En-tête */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t('step1of2')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-4"
          >
            {t('welcome')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Grid des 3 Cards AccountType */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {accountTypes.map((type, index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <AccountTypeCard
                type={type}
                selected={selectedType === type}
                onSelect={setSelectedType}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bouton Continuer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col items-center gap-4"
        >
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedType}
            className="min-w-[280px] h-14 text-lg font-medium group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {t('continue')}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>

          {!selectedType && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm text-muted-foreground"
            >
              {t('selectPrompt')}
            </motion.p>
          )}
        </motion.div>

        {/* Footer avec bénéfices */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Tip */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">{t('tip.label')}</p>
                <p className="text-sm text-muted-foreground">{t('tip.text')}</p>
              </div>
            </div>

            {/* Security */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Lock className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{t('security')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
