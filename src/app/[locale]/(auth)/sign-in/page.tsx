
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/navigation';
import { Zap, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, useAuth, type SignInFormValues } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect } from 'react';

export default function SignInPage() {
  const t = useTranslations('SignInPage');
  const { signIn, loading, error, setError } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => {
    return () => {
      setError(null);
    }
  }, [setError]);

  return (
    <>
      <div className="flex flex-col items-center text-center mb-8">
        <Link href="/" className="flex items-center gap-2 font-bold mb-4">
          <Zap className="h-8 w-8 text-primary" />
        </Link>
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription>
          {t('orSignUp')}{' '}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            {t('signUpLink')}
          </Link>
        </CardDescription>
      </div>
      <Card>
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit(signIn)}>
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>{t('errorTitle')}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div>
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <div className="mt-2">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:underline">
                    {t('forgotPasswordLink')}
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                />
                 {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                {t('submitButton')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
