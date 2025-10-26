'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params?.locale as string || 'fr';
  const t = useTranslations('Auth.forgotPassword');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-3xl shadow-2xl p-8 lg:p-12 border border-border/50"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/images/logo_imutask_v2_no_background.png"
              alt="ImuTask"
              width={120}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </div>

          {/* Form Component */}
          <ForgotPasswordForm locale={locale} />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>{t('footerText')}</p>
        </motion.div>
      </div>
    </div>
  );
}
