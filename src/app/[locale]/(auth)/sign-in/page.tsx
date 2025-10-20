
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
import { Link, useRouter } from '@/navigation';
import { Zap, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInFormValues } from '@/hooks/use-auth';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.108-11.127-7.462l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.99,34.556,44,29.86,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
)

export default function SignInPage() {
  const t = useTranslations('SignInPage');
  const { signIn, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    return () => {
      setError(null);
    }
  }, []);

  const onSubmit = async (data: SignInFormValues) => {
    setError(null);
    try {
      await signIn(data.email, data.password);
      // Redirection vers le dashboard après connexion réussie
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      // Redirection vers le dashboard après connexion Google réussie
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <>
      <div className="flex flex-col items-center text-center mb-8">
        <Link href="/" className="flex items-center gap-2 font-bold mb-4">
          <Zap className="h-8 w-8 text-primary" />
        </Link>
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription>
          {t('orSignUp')}{' '}
          <Link href="/inscription" className="font-medium text-primary hover:underline">
            {t('signUpLink')}
          </Link>
        </CardDescription>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
             <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                <GoogleIcon className="mr-2"/>
                {t('continueWithGoogle')}
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    {t('orContinueWith')}
                    </span>
                </div>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                    data-testid="login-email"
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
                    data-testid="login-password"
                    {...register('password')}
                    />
                    {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                </div>
                </div>

                <div>
                <Button 
                    type="submit" 
                    className="w-full" 
                    data-testid="login-submit" 
                    disabled={loading}
                >
                    {loading && <Loader2 className="animate-spin" />}
                    {t('submitButton')}
                </Button>
                </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
