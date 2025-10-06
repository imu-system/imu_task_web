'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImuTaskLogo } from '@/components/icons';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Validation
      if (!email) {
        throw new Error('Veuillez saisir votre adresse email');
      }

      await resetPassword(email);

      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      console.error('Reset password error:', err);

      // Messages d'erreur en français
      if (err.code === 'auth/user-not-found') {
        setError('Aucun compte trouvé avec cet email');
      } else if (err.code === 'auth/invalid-email') {
        setError('Adresse email invalide');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Trop de tentatives. Veuillez réessayer plus tard');
      } else {
        setError(err.message || 'Une erreur est survenue lors de l\'envoi de l\'email');
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <ImuTaskLogo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">
            {success ? 'Email envoyé !' : 'Mot de passe oublié ?'}
          </CardTitle>
          <CardDescription className="text-center">
            {success 
              ? 'Vérifiez votre boîte de réception'
              : 'Saisissez votre email pour recevoir un lien de réinitialisation'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-50 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <AlertDescription className="text-center">
                  Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
                  <br />
                  Vérifiez votre boîte de réception et suivez les instructions.
                </AlertDescription>
              </Alert>
              <div className="text-sm text-muted-foreground text-center space-y-2">
                <p>Vous n'avez pas reçu l'email ?</p>
                <ul className="list-disc list-inside text-left space-y-1">
                  <li>Vérifiez votre dossier spam/courrier indésirable</li>
                  <li>Assurez-vous que l'adresse email est correcte</li>
                  <li>Attendez quelques minutes (délai de livraison)</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                >
                  Renvoyer
                </Button>
                <Button
                  className="flex-1"
                  asChild
                >
                  <Link href="/auth/login">
                    Retour à la connexion
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </Button>
              </div>
            </form>
          )}

          {!success && (
            <div className="mt-4 text-center">
              <Link 
                href="/auth/login" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
