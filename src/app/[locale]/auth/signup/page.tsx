'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { SignupForm } from '@/components/auth/signup-form';
import { AuthIllustration } from '@/components/auth/auth-illustration';

export default function SignupPage() {
  const params = useParams();
  const locale = params?.locale as string || 'fr';
  const t = useTranslations('Auth.signup');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-2 gap-8 lg:gap-12 bg-card rounded-3xl shadow-2xl overflow-hidden border border-border/50"
        >
          {/* Left Column - Form */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            {/* Logo & Header */}
            <div className="mb-8">
              <div className="flex justify-center lg:justify-start mb-6">
                <Image
                  src="/images/logo_imutask_v2_no_background.png"
                  alt="ImuTask"
                  width={120}
                  height={48}
                  className="h-12 w-auto"
                  priority
                />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t('title')}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t('subtitle')}
              </p>
            </div>

            {/* Form Component */}
            <SignupForm locale={locale} />
          </div>

          {/* Right Column - Illustration */}
          <AuthIllustration variant="signup" />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>
            {t('footerText')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
