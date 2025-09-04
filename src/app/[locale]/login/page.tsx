import Link from "next/link"
import {useTranslations} from 'next-intl';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImuTaskLogo } from "@/components/icons"

export default function LoginPage({params: {locale}}: {params: {locale: string}}) {
  const t = useTranslations('LoginPage');

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <ImuTaskLogo className="h-12 w-12 text-primary"/>
          </div>
          <CardTitle className="text-2xl text-center">{t('title')}</CardTitle>
          <CardDescription className="text-center">
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" asChild>
                <Link href={`/${locale}`}>{t('loginButton')}</Link>
            </Button>
            <Button variant="outline" className="w-full">
              {t('loginWithGoogle')}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            {t('noAccount')}{" "}
            <Link href={`/${locale}/signup`} className="underline">
              {t('signUp')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
