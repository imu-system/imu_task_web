'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AccountType } from '@/lib/types';
import { AccountTypeCard } from '@/components/onboarding/account-type-card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { saveAccountType } from '@/lib/firestore-users';
import { setAccountTypeCookie } from '@/lib/account-type-cookie';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('Onboarding');
  
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const accountTypes: AccountType[] = [
    AccountType.individual,
    AccountType.professional,
    AccountType.senior,
  ];

  // Map AccountType to dashboard route
  const getDashboardPath = (accountType: AccountType): string => {
    const dashboardMap: Record<AccountType, string> = {
      [AccountType.individual]: 'client',
      [AccountType.professional]: 'pro',
      [AccountType.senior]: 'senior',
    };
    return dashboardMap[accountType];
  };

  const handleContinue = async () => {
    if (!selectedType || !user) {
      setError(t('selectAccountTypeError'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save account type to Firestore
      await saveAccountType(user.uid, selectedType);
      
      // Set cookie for middleware
      setAccountTypeCookie(selectedType);

      toast({
        title: t('successTitle'),
        description: t('successDescription'),
      });

      // Redirect to appropriate dashboard with correct path mapping
      setTimeout(() => {
        const dashboardRoute = getDashboardPath(selectedType);
        const dashboardPath = `/${locale}/dashboard/${dashboardRoute}`;
        router.push(dashboardPath);
      }, 500);
    } catch (err: any) {
      console.error('Error updating account type:', err);
      setError(t('errorSaving'));
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="space-y-12">
          {/* Header with Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/images/logo_imutask_v2_no_background.png"
                alt="ImuTask"
                width={180}
                height={60}
                priority
                className="h-16 w-auto"
              />
            </div>

            {/* Welcome Message */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {t('welcome')} 👋
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                {t('subtitle')}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{t('step1of2')}</span>
            </div>
          </motion.div>

          {/* Account Type Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {accountTypes.map((type, index) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <AccountTypeCard
                    type={type}
                    selected={selectedType === type}
                    onSelect={setSelectedType}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col items-center gap-6"
          >
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!selectedType || loading}
              className="min-w-[280px] h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                <>
                  {t('continue')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            {!selectedType && (
              <p className="text-sm text-muted-foreground animate-pulse">
                {t('selectPrompt')}
              </p>
            )}
          </motion.div>

          {/* Benefits Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span>💡</span>
                <span className="font-medium">{t('tip.label')}:</span>
                <span>{t('tip.text')}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>🔒</span>
              <span>{t('security')}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
