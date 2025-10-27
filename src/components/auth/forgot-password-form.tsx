'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Link } from '@/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

// Schema de validation Zod
const createForgotPasswordSchema = (t: any) => z.object({
  email: z.string().email({ message: t('validation.emailInvalid') }),
});

type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

interface ForgotPasswordFormProps {
  locale?: string;
}

export function ForgotPasswordForm({ locale = 'fr' }: ForgotPasswordFormProps) {
  const t = useTranslations('Auth.forgotPassword');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(createForgotPasswordSchema(t)),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, data.email, {
        url: `${window.location.origin}/${locale}/auth/signin`,
        handleCodeInApp: false,
      });

      setSuccess(true);
      setEmailSent(data.email);
      reset();
    } catch (err: any) {
      console.error('Password reset error:', err);

      // Messages d'erreur traduits
      if (err.code === 'auth/user-not-found') {
        setError(t('errors.userNotFound'));
      } else if (err.code === 'auth/invalid-email') {
        setError(t('errors.invalidEmail'));
      } else if (err.code === 'auth/too-many-requests') {
        setError(t('errors.tooManyRequests'));
      } else {
        setError(err.message || t('errors.generic'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Success State */}
      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-6"
        >
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>
              {/* Pulse effect */}
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-green-400 rounded-full"
              />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              {t('successTitle')}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('successMessage', { email: emailSent })}
            </p>
          </div>

          {/* Instructions */}
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
              {t('checkInbox')}
            </AlertDescription>
          </Alert>

          {/* Next Steps */}
          <div className="space-y-3 pt-4">
            <p className="text-xs text-muted-foreground">
              {t('nextSteps')}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                asChild
                className="w-full"
              >
                <Link href={`/${locale}/auth/signin`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('backToSignin')}
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => setSuccess(false)}
                className="w-full"
              >
                {t('resendEmail')}
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground pt-4">
            {t('noEmail')}{' '}
            <a
              href={`/${locale}/support`}
              className="text-primary hover:underline font-medium"
            >
              {t('contactSupport')}
            </a>
          </p>
        </motion.div>
      ) : (
        /* Form State */
        <>
          {/* Back Link */}
          <Link
            href={`/${locale}/auth/signin`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToSignin')}
          </Link>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {t('title')}
            </h1>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {t('emailLabel')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  className="pl-9 h-11"
                  disabled={loading}
                  autoFocus
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('submittingButton')}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {t('submitButton')}
                </>
              )}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              {t('helpTitle')}
            </h3>
            <ul className="text-xs text-muted-foreground space-y-2 pl-6">
              <li className="list-disc">{t('help1')}</li>
              <li className="list-disc">{t('help2')}</li>
              <li className="list-disc">{t('help3')}</li>
            </ul>
          </div>

          {/* Sign up link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t('noAccount')}</span>{' '}
            <Link
              href={`/${locale}/auth/signup`}
              className="font-semibold text-primary hover:underline"
            >
              {t('signUpLink')}
            </Link>
          </div>
        </>
      )}
    </motion.div>
  );
}
