'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { Link } from '@/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

// Schema de validation Zod avec messages dynamiques
const createSigninSchema = (t: any) => z.object({
  email: z.string().email({ message: t('validation.emailInvalid') }),
  password: z.string().min(6, { message: t('validation.passwordMin') }),
  rememberMe: z.boolean().optional(),
});

type SigninFormData = z.infer<ReturnType<typeof createSigninSchema>>;

interface SigninFormProps {
  locale?: string;
}

export function SigninForm({ locale = 'fr' }: SigninFormProps) {
  const router = useRouter();
  const t = useTranslations('Auth.signin');
  const tCommon = useTranslations('common');
  const { signIn, signInWithGoogle } = useAuth();
  const { isRedirecting } = useAuthRedirect(locale);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    resolver: zodResolver(createSigninSchema(t)),
    mode: 'onBlur',
  });

  const onSubmit = async (data: SigninFormData) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signIn(data.email, data.password);

      setSuccess(t('successMessage'));
      // Le hook useAuthRedirect gérera la redirection automatiquement
    } catch (err: any) {
      console.error('Signin error:', err);

      // Messages d'erreur traduits
      if (err.code === 'auth/user-not-found') {
        setError(t('errors.userNotFound'));
      } else if (err.code === 'auth/wrong-password') {
        setError(t('errors.wrongPassword'));
      } else if (err.code === 'auth/invalid-email') {
        setError(t('errors.invalidEmail'));
      } else if (err.code === 'auth/user-disabled') {
        setError(t('errors.userDisabled'));
      } else {
        setError(err.message || t('errors.generic'));
      }
      setLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signInWithGoogle();
      setSuccess(t('successMessageGoogle'));
      // Le hook useAuthRedirect gérera la redirection automatiquement
    } catch (err: any) {
      console.error('Google signin error:', err);

      if (err.code === 'auth/popup-closed-by-user') {
        setError(t('errors.popupClosed'));
      } else if (err.code === 'auth/popup-blocked') {
        setError(t('errors.popupBlocked'));
      } else {
        setError(err.message || t('errors.googleGeneric'));
      }
      setLoading(false);
    }
  };

  // Afficher un loader pendant la redirection
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t('redirecting')}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-6 bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* OAuth Buttons */}
      <div className="space-y-3 mb-6">
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 text-base"
          onClick={handleGoogleSignin}
          disabled={loading}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t('googleButton')}
        </Button>

        {/* Apple Sign In - Placeholder for future */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 text-base bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          disabled
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          {t('appleButton')}
        </Button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {tCommon('or')}
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
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
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              {t('passwordLabel')}
            </Label>
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-xs text-primary hover:underline"
            >
              {t('forgotPasswordLink')}
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              className="pl-9 h-11"
              disabled={loading}
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-2">
          <Checkbox id="rememberMe" {...register('rememberMe')} />
          <label
            htmlFor="rememberMe"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('rememberMeLabel')}
          </label>
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
            t('submitButton')
          )}
        </Button>
      </form>

      {/* Sign up link */}
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">{t('noAccount')}</span>{' '}
        <Link href={`/${locale}/auth/signup`} className="font-semibold text-primary hover:underline">
          {t('signUpLink')}
        </Link>
      </div>
    </motion.div>
  );
}
