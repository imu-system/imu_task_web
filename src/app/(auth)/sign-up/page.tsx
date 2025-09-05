import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <>
      <div className="flex flex-col items-center text-center mb-8">
        <Link href="/" className="flex items-center gap-2 font-bold mb-4">
          <Zap className="h-8 w-8 text-primary" />
        </Link>
        <CardTitle className="text-2xl">Créez votre compte ImuTask</CardTitle>
        <CardDescription>
          Déjà membre ?{' '}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Connectez-vous
          </Link>
        </CardDescription>
      </div>
      <Card>
        <CardContent className="p-6">
          <form className="space-y-6">
            <div>
              <Label htmlFor="name">Nom complet</Label>
              <div className="mt-2">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Adresse e-mail</Label>
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
              <Label htmlFor="password">Mot de passe</Label>
              <div className="mt-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
            
            <div>
              <Button type="submit" className="w-full">
                Créer le compte
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="px-6 pb-6">
             <p className="text-xs text-muted-foreground text-center">
                En créant un compte, vous acceptez nos{' '}
                <Link href="/legal/terms" className="underline hover:text-primary">
                    Conditions d'utilisation
                </Link>
                .
            </p>
        </CardFooter>
      </Card>
    </>
  );
}
