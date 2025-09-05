
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
import { Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SignInPage() {
  const t = useTranslations('SignInPage');

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
          <form className="space-y-6">
            <div>
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <div className="mt-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
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
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full">
                {t('submitButton')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
