/**
 * Page de vue professionnel du devis - ImuPro
 * Permet au professionnel de visualiser un devis créé avec timeline et actions
 * 
 * Features:
 * - Détails complets du devis (lignes, totaux, conditions)
 * - Timeline du workflow (Créé → Envoyé → Vu → Accepté/Refusé)
 * - Informations client
 * - Actions : Renvoyer, Télécharger PDF (optionnel), Annuler
 * - Convertir en facture (si accepté)
 * - Status tracking avec indicateurs visuels
 */

'use client';

import { useRouter } from '@/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Send,
  Download,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  User,
  Mail,
  Phone,
  Receipt,
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
  acceptedAt?: any;
  declinedAt?: any;
  clientNotes?: string;
  bookingId?: string;
}

interface Client {
  displayName: string;
  email: string;
  phoneNumber?: string;
}

const PAYMENT_TERMS_LABELS: Record<string, string> = {
  immediate: 'Paiement immédiat',
  upon_completion: 'À la fin des travaux',
  net_7: '7 jours après facturation',
  net_15: '15 jours après facturation',
  net_30: '30 jours après facturation',
  split_50_50: '50% avant, 50% après',
};

export default function ProQuoteViewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;

  // States
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Dialogs
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

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

      // Vérifier que l'utilisateur est bien le professionnel
      if (data.providerId !== user.uid) {
        setError('Vous n\'êtes pas autorisé à voir ce devis');
        return;
      }

      setQuote({
        id: quoteDoc.id,
        ...data,
      } as Quote);

      // Charger les informations du client
      const clientDoc = await getDoc(doc(db, 'users', data.clientId));
      if (clientDoc.exists()) {
        setClient(clientDoc.data() as Client);
      }
    } catch (err) {
      console.error('Erreur chargement devis:', err);
      setError('Erreur lors du chargement du devis');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!quote) return;

    setShowResendDialog(false);
    setSubmitting(true);
    setError(null);

    try {
      const sendQuoteFn = httpsCallable(functions, 'sendQuote');
      await sendQuoteFn({ quoteId: quote.id });

      // Recharger le devis
      await loadQuote();
    } catch (err: any) {
      console.error('Erreur renvoi:', err);
      setError(err.message || 'Erreur lors du renvoi du devis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!quote) return;

    setShowCancelDialog(false);
    setSubmitting(true);
    setError(null);

    try {
      const cancelQuoteFn = httpsCallable(functions, 'cancelQuote');
      await cancelQuoteFn({
        quoteId: quote.id,
        reason: 'Annulé par le professionnel',
      });

      // Recharger le devis
      await loadQuote();
    } catch (err: any) {
      console.error('Erreur annulation:', err);
      setError(err.message || 'Erreur lors de l\'annulation du devis');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-5 w-5" />;
      case 'sent':
        return <Send className="h-5 w-5" />;
      case 'viewed':
        return <Eye className="h-5 w-5" />;
      case 'accepted':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'declined':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'expired':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-muted-foreground" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      viewed: 'Vu par le client',
      accepted: 'Accepté',
      declined: 'Refusé',
      expired: 'Expiré',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
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
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Devis introuvable'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/pro/quotes')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à mes devis
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
                {getStatusLabel(quote.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">{quote.title}</p>
          </div>

          {/* Actions principales */}
          <div className="flex flex-wrap gap-2">
            {quote.status === 'draft' && (
              <Button
                onClick={() => setShowResendDialog(true)}
                disabled={submitting}
              >
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </Button>
            )}

            {(quote.status === 'sent' || quote.status === 'viewed') && (
              <Button
                variant="outline"
                onClick={() => setShowResendDialog(true)}
                disabled={submitting}
              >
                <Send className="mr-2 h-4 w-4" />
                Renvoyer
              </Button>
            )}

            {quote.status === 'accepted' && quote.bookingId && (
              <Button
                onClick={() => router.push(`/dashboard/pro/bookings/${quote.bookingId}`)}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Voir la réservation
              </Button>
            )}

            {quote.status !== 'accepted' && quote.status !== 'cancelled' && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                disabled={submitting}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {quote.status === 'declined' && quote.clientNotes && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Raison du refus :</strong> {quote.clientNotes}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline du devis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Créé */}
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Devis créé</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(quote.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Envoyé */}
                {quote.sentAt && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Send className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Devis envoyé au client</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(quote.sentAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Vu */}
                {quote.viewedAt && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Devis consulté par le client</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(quote.viewedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Accepté */}
                {quote.acceptedAt && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-600">Devis accepté !</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(quote.acceptedAt)}
                      </p>
                      {quote.bookingId && (
                        <p className="text-sm text-muted-foreground">
                          Réservation créée : {quote.bookingId.substring(0, 8)}...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Refusé */}
                {quote.declinedAt && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <XCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-destructive">Devis refusé</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(quote.declinedAt)}
                      </p>
                      {quote.clientNotes && (
                        <p className="text-sm mt-1">
                          <strong>Raison :</strong> {quote.clientNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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
                  <p className="font-medium">
                    {formatDate(quote.validUntil)}
                  </p>
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
        </div>

        {/* Sidebar - Informations client */}
        <div className="space-y-6">
          {client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-lg">{client.displayName}</p>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium break-all">{client.email}</p>
                    </div>
                  </div>

                  {client.phoneNumber && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Téléphone</p>
                        <p className="font-medium">{client.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/messages?userId=${quote.clientId}`)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer un message
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Stats du devis */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut</span>
                <Badge variant="outline">
                  {getStatusLabel(quote.status)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créé le</span>
                <span className="font-medium">
                  {new Intl.DateTimeFormat('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }).format(
                    quote.createdAt.toDate
                      ? quote.createdAt.toDate()
                      : new Date(quote.createdAt)
                  )}
                </span>
              </div>
              {quote.sentAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envoyé le</span>
                  <span className="font-medium">
                    {new Intl.DateTimeFormat('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                    }).format(
                      quote.sentAt.toDate
                        ? quote.sentAt.toDate()
                        : new Date(quote.sentAt)
                    )}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant TTC</span>
                <span className="font-bold text-primary">
                  {formatCurrency(quote.total)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Renvoyer */}
      <AlertDialog open={showResendDialog} onOpenChange={setShowResendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {quote.status === 'draft' ? 'Envoyer' : 'Renvoyer'} le devis
            </AlertDialogTitle>
            <AlertDialogDescription>
              {quote.status === 'draft'
                ? 'Le devis sera envoyé au client qui recevra une notification.'
                : 'Une nouvelle notification sera envoyée au client.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleResend} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Confirmer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Annuler */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler le devis</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le client sera informé de l'annulation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Annulation...
                </>
              ) : (
                'Confirmer l\'annulation'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
