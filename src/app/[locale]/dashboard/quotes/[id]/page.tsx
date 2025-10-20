/**
 * Page de vue client du devis - ImuPro
 * Permet au client de visualiser un devis reçu et de l'accepter/refuser
 * 
 * Features:
 * - Affichage détaillé du devis (lignes, totaux, conditions)
 * - Informations sur le professionnel
 * - Boutons Accepter (vert) / Refuser (rouge avec raison)
 * - Badges de statut
 * - Dialog de confirmation pour acceptation/refus
 * - Marquage automatique comme "vu" au chargement
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Clock,
  Building2,
  Mail,
  Phone,
  MapPin,
  Shield,
} from 'lucide-react';

interface Quote {
  id: string;
  quoteNumber: string;
  providerId: string;
  clientId: string;
  status: string;
  title: string;
  description: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    unit?: string;
    total: number;
  }>;
  subtotal: number;
  travelFee: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  validUntil: any;
  terms: string;
  paymentTerms: string;
  estimatedDuration: string;
  createdAt: any;
  sentAt?: any;
  viewedAt?: any;
}

interface ProProfile {
  businessInfo: {
    companyName: string;
    siret: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  verificationStatus: string;
  rating?: number;
  completedJobs?: number;
}

const PAYMENT_TERMS_LABELS: Record<string, string> = {
  immediate: 'Paiement immédiat',
  upon_completion: 'À la fin des travaux',
  net_7: '7 jours après facturation',
  net_15: '15 jours après facturation',
  net_30: '30 jours après facturation',
  split_50_50: '50% avant, 50% après',
};

export default function ClientQuoteViewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;

  // States
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [proProfile, setProProfile] = useState<ProProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Dialogs
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      loadQuote();
    }
  }, [authLoading, user, quoteId]);

  const loadQuote = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const quoteDoc = await getDoc(doc(db, 'quotes', quoteId));

      if (!quoteDoc.exists()) {
        setError('Devis introuvable');
        return;
      }

      const data = quoteDoc.data();

      // Vérifier que l'utilisateur est bien le client
      if (data.clientId !== user.uid) {
        setError('Vous n\'êtes pas autorisé à voir ce devis');
        return;
      }

      setQuote({
        id: quoteDoc.id,
        ...data,
      } as Quote);

      // Charger le profil du professionnel
      const proDoc = await getDoc(doc(db, 'pro_profiles', data.providerId));
      if (proDoc.exists()) {
        setProProfile(proDoc.data() as ProProfile);
      }

      // Marquer comme vu si c'est la première fois
      if (data.status === 'sent' && !data.viewedAt) {
        await updateDoc(doc(db, 'quotes', quoteId), {
          status: 'viewed',
          viewedAt: new Date(),
        });
        // Mettre à jour localement
        setQuote((prev) => prev ? { ...prev, status: 'viewed' } : null);
      }
    } catch (err) {
      console.error('Erreur chargement devis:', err);
      setError('Erreur lors du chargement du devis');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!quote) return;

    setShowAcceptDialog(false);
    setSubmitting(true);
    setError(null);

    try {
      const acceptQuoteFn = httpsCallable(functions, 'acceptQuote');
      const result = await acceptQuoteFn({ quoteId: quote.id });

      const data = result.data as any;

      if (data.success) {
        // Rediriger vers la réservation créée
        router.push(`/dashboard/bookings/${data.bookingId}`);
      } else {
        setError('Erreur lors de l\'acceptation du devis');
      }
    } catch (err: any) {
      console.error('Erreur acceptation:', err);
      setError(err.message || 'Erreur lors de l\'acceptation du devis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!quote || !declineReason.trim()) {
      setError('Veuillez indiquer la raison du refus');
      return;
    }

    setShowDeclineDialog(false);
    setSubmitting(true);
    setError(null);

    try {
      const declineQuoteFn = httpsCallable(functions, 'declineQuote');
      await declineQuoteFn({
        quoteId: quote.id,
        reason: declineReason.trim(),
      });

      // Recharger le devis
      await loadQuote();
    } catch (err: any) {
      console.error('Erreur refus:', err);
      setError(err.message || 'Erreur lors du refus du devis');
    } finally {
      setSubmitting(false);
      setDeclineReason('');
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const isExpired = (): boolean => {
    if (!quote) return false;
    const validUntil = quote.validUntil.toDate
      ? quote.validUntil.toDate()
      : new Date(quote.validUntil);
    return validUntil < new Date();
  };

  const canAcceptOrDecline = (): boolean => {
    if (!quote) return false;
    return (
      (quote.status === 'sent' || quote.status === 'viewed') &&
      !isExpired()
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Devis introuvable'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au dashboard
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{quote.quoteNumber}</h1>
              <Badge
                variant={
                  quote.status === 'accepted'
                    ? 'default'
                    : quote.status === 'declined' || quote.status === 'cancelled'
                    ? 'destructive'
                    : 'outline'
                }
              >
                {quote.status === 'sent' && 'Envoyé'}
                {quote.status === 'viewed' && 'Vu'}
                {quote.status === 'accepted' && 'Accepté'}
                {quote.status === 'declined' && 'Refusé'}
                {quote.status === 'expired' && 'Expiré'}
                {quote.status === 'cancelled' && 'Annulé'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{quote.title}</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isExpired() && quote.status !== 'accepted' && quote.status !== 'declined' && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ce devis a expiré le {formatDate(quote.validUntil)}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails du devis */}
          <Card>
            <CardHeader>
              <CardTitle>Détails du devis</CardTitle>
              <CardDescription>{quote.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date de création</p>
                  <p className="font-medium">{formatDate(quote.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Valable jusqu'au</p>
                  <p className="font-medium">{formatDate(quote.validUntil)}</p>
                </div>
                {quote.estimatedDuration && (
                  <div>
                    <p className="text-muted-foreground">Durée estimée</p>
                    <p className="font-medium">{quote.estimatedDuration}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Conditions de paiement</p>
                  <p className="font-medium">
                    {PAYMENT_TERMS_LABELS[quote.paymentTerms] || quote.paymentTerms}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lignes du devis */}
          <Card>
            <CardHeader>
              <CardTitle>Prestations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead className="text-right">PU</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.description}</p>
                          {item.unit && (
                            <p className="text-sm text-muted-foreground">
                              Unité: {item.unit}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              {/* Totaux */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span className="font-medium">
                    {formatCurrency(
                      quote.lineItems.reduce((s, i) => s + i.total, 0)
                    )}
                  </span>
                </div>
                {quote.travelFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frais de déplacement</span>
                    <span className="font-medium">
                      +{formatCurrency(quote.travelFee)}
                    </span>
                  </div>
                )}
                {quote.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remise</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(quote.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-muted-foreground">Total HT</span>
                  <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA ({quote.taxRate}%)</span>
                  <span className="font-medium">{formatCurrency(quote.taxAmount)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-lg font-semibold">Total TTC</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(quote.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conditions générales */}
          <Card>
            <CardHeader>
              <CardTitle>Conditions générales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {quote.terms}
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          {canAcceptOrDecline() && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setShowDeclineDialog(true)}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Refuser le devis
              </Button>
              <Button
                className="flex-1"
                onClick={() => setShowAcceptDialog(true)}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Accepter le devis
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar - Informations professionnel */}
        <div className="space-y-6">
          {proProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Professionnel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-lg">
                    {proProfile.businessInfo.companyName}
                  </p>
                  {proProfile.verificationStatus === 'approved' && (
                    <Badge variant="default" className="mt-1">
                      <Shield className="mr-1 h-3 w-3" />
                      Vérifié
                    </Badge>
                  )}
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{proProfile.contactInfo.email}</p>
                    </div>
                  </div>

                  {proProfile.contactInfo.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Téléphone</p>
                        <p className="font-medium">{proProfile.contactInfo.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">Adresse</p>
                      <p className="font-medium">
                        {proProfile.contactInfo.address}
                        <br />
                        {proProfile.contactInfo.postalCode}{' '}
                        {proProfile.contactInfo.city}
                      </p>
                    </div>
                  </div>
                </div>

                {(proProfile.rating || proProfile.completedJobs) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-center">
                      {proProfile.rating && (
                        <div>
                          <p className="text-2xl font-bold">{proProfile.rating.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">Note moyenne</p>
                        </div>
                      )}
                      {proProfile.completedJobs && (
                        <div>
                          <p className="text-2xl font-bold">{proProfile.completedJobs}</p>
                          <p className="text-xs text-muted-foreground">Missions réalisées</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog Acceptation */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accepter le devis</AlertDialogTitle>
            <AlertDialogDescription>
              En acceptant ce devis, vous confirmez votre accord pour les travaux décrits.
              Une réservation sera automatiquement créée.
              <br />
              <br />
              <strong>Montant total : {formatCurrency(quote.total)}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleAccept} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Acceptation...
                </>
              ) : (
                'Confirmer l\'acceptation'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Refus */}
      <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refuser le devis</AlertDialogTitle>
            <AlertDialogDescription>
              Veuillez indiquer la raison du refus pour informer le professionnel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Raison du refus *</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Budget trop élevé, délais trop longs..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDecline}
              disabled={submitting || !declineReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refus...
                </>
              ) : (
                'Confirmer le refus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
