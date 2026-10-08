/**
 * Page de création de devis - ImuPro
 * Permet aux professionnels de créer des devis pour leurs clients
 * 
 * Features:
 * - Sélection du client
 * - Lignes de devis dynamiques (description, quantité, prix unitaire)
 * - Calcul automatique des totaux (HT, TVA, TTC)
 * - Frais de déplacement et remises
 * - Conditions de paiement
 * - Date de validité
 * - Enregistrer en brouillon ou envoyer directement
 */

'use client';

import { useRouter } from '@/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
  Plus,
  Trash2,
  Save,
  Send,
  Loader2,
  Euro,
  Calendar,
  AlertCircle,
  Calculator,
} from 'lucide-react';

interface QuoteLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
  total: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

const PAYMENT_TERMS = [
  { value: 'immediate', label: 'Paiement immédiat' },
  { value: 'upon_completion', label: 'À la fin des travaux' },
  { value: 'net_7', label: '7 jours après facturation' },
  { value: 'net_15', label: '15 jours après facturation' },
  { value: 'net_30', label: '30 jours après facturation' },
  { value: 'split_50_50', label: '50% avant, 50% après' },
];

const UNITS = ['heure', 'jour', 'm²', 'ml', 'unité', 'forfait'];

export default function NewQuotePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proProfile, setProProfile] = useState<any | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [showSendDialog, setShowSendDialog] = useState(false);

  // Form states
  const [selectedClientId, setSelectedClientId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, unit: 'heure', total: 0 },
  ]);
  const [travelFee, setTravelFee] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(20); // 20% par défaut
  const [paymentTerms, setPaymentTerms] = useState('upon_completion');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [terms, setTerms] = useState(
    'Devis valable 30 jours. Paiement selon les conditions convenues. Les travaux débuteront après acceptation du devis et versement éventuel d\'un acompte.'
  );

  // Totaux calculés
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);

  // Charger le profil pro et vérifier l'accès
  useEffect(() => {
    if (!authLoading && user) {
      loadProProfile();
      loadClients();
    }
  }, [authLoading, user]);

  // Calculer les totaux automatiquement
  useEffect(() => {
    calculateTotals();
  }, [lineItems, travelFee, discountAmount, taxRate]);

  // Initialiser la date de validité (30 jours par défaut)
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setValidUntil(defaultDate.toISOString().split('T')[0]);
  }, []);

  const loadProProfile = async () => {
    if (!user) return;

    try {
      const proDoc = await getDoc(doc(db, 'pro_profiles', user.uid));
      
      if (!proDoc.exists()) {
        router.push('/dashboard/become-pro');
        return;
      }

      const profile = proDoc.data();
      
      if (profile.verificationStatus !== 'approved') {
        setError('Votre profil professionnel doit être vérifié pour créer des devis');
        return;
      }

      setProProfile(profile);
    } catch (err) {
      console.error('Erreur chargement profil pro:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    if (!user) return;

    try {
      // Charger les clients depuis les conversations, réservations, etc.
      // Pour l'instant, simulation avec un tableau vide
      // TODO: Implémenter la récupération réelle des clients
      setClients([]);
    } catch (err) {
      console.error('Erreur chargement clients:', err);
    }
  };

  const calculateTotals = () => {
    // Calculer le sous-total des lignes
    const linesSubtotal = lineItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + itemTotal;
    }, 0);

    // Ajouter frais de déplacement et retirer remise
    const subtotalWithAdjustments = linesSubtotal + (travelFee * 100) - (discountAmount * 100);

    // Calculer la TVA
    const calculatedTaxAmount = taxRate > 0
      ? Math.round(subtotalWithAdjustments * (taxRate / 100))
      : 0;

    // Total TTC
    const calculatedTotal = subtotalWithAdjustments + calculatedTaxAmount;

    setSubtotal(subtotalWithAdjustments);
    setTaxAmount(calculatedTaxAmount);
    setTotal(calculatedTotal);
  };

  const handleAddLine = () => {
    setLineItems([
      ...lineItems,
      { description: '', quantity: 1, unitPrice: 0, unit: 'heure', total: 0 },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lineItems.length === 1) {
      setError('Le devis doit contenir au moins une ligne');
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineChange = (
    index: number,
    field: keyof QuoteLineItem,
    value: string | number
  ) => {
    const updated = [...lineItems];
    const item = updated[index];

    if (field === 'description') {
      item.description = value as string;
    } else if (field === 'quantity') {
      item.quantity = Math.max(0, parseFloat(value as string) || 0);
    } else if (field === 'unitPrice') {
      // Convertir en centimes
      item.unitPrice = Math.round((parseFloat(value as string) || 0) * 100);
    } else if (field === 'unit') {
      item.unit = value as string;
    }

    // Recalculer le total de la ligne
    item.total = item.quantity * item.unitPrice;

    setLineItems(updated);
  };

  const validateForm = (): boolean => {
    if (!selectedClientId) {
      setError('Veuillez sélectionner un client');
      return false;
    }

    if (!title.trim()) {
      setError('Le titre du devis est requis');
      return false;
    }

    if (lineItems.length === 0) {
      setError('Le devis doit contenir au moins une ligne');
      return false;
    }

    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      if (!item.description.trim()) {
        setError(`La description de la ligne ${i + 1} est requise`);
        return false;
      }
      if (item.quantity <= 0) {
        setError(`La quantité de la ligne ${i + 1} doit être supérieure à 0`);
        return false;
      }
    }

    if (!validUntil) {
      setError('La date de validité est requise');
      return false;
    }

    return true;
  };

  const handleSaveDraft = async () => {
    setError(null);

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const createQuoteFn = httpsCallable(functions, 'createQuote');
      
      const result = await createQuoteFn({
        clientId: selectedClientId,
        title: title.trim(),
        description: description.trim(),
        lineItems,
        travelFee: travelFee * 100, // Convertir en centimes
        discountAmount: discountAmount * 100,
        taxRate,
        validUntil: new Date(validUntil),
        terms: terms.trim(),
        paymentTerms,
        estimatedDuration: estimatedDuration.trim(),
      });

      const data = result.data as any;

      if (data.success) {
        router.push(`/dashboard/pro/quotes/${data.quoteId}`);
      } else {
        setError('Erreur lors de la création du devis');
      }
    } catch (err: any) {
      console.error('Erreur création devis:', err);
      setError(err.message || 'Erreur lors de la création du devis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendQuote = async () => {
    setError(null);
    setShowSendDialog(false);

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // Créer le devis
      const createQuoteFn = httpsCallable(functions, 'createQuote');
      
      const createResult = await createQuoteFn({
        clientId: selectedClientId,
        title: title.trim(),
        description: description.trim(),
        lineItems,
        travelFee: travelFee * 100,
        discountAmount: discountAmount * 100,
        taxRate,
        validUntil: new Date(validUntil),
        terms: terms.trim(),
        paymentTerms,
        estimatedDuration: estimatedDuration.trim(),
      });

      const createData = createResult.data as any;

      if (!createData.success) {
        setError('Erreur lors de la création du devis');
        return;
      }

      // Envoyer le devis
      const sendQuoteFn = httpsCallable(functions, 'sendQuote');
      
      const sendResult = await sendQuoteFn({
        quoteId: createData.quoteId,
      });

      const sendData = sendResult.data as any;

      if (sendData.success) {
        router.push(`/dashboard/pro/quotes/${createData.quoteId}`);
      } else {
        setError('Erreur lors de l\'envoi du devis');
      }
    } catch (err: any) {
      console.error('Erreur envoi devis:', err);
      setError(err.message || 'Erreur lors de l\'envoi du devis');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state (pas de profil pro)
  if (!proProfile || error) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Erreur'}</AlertDescription>
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
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-3xl font-bold">Nouveau devis</h1>
        <p className="text-muted-foreground mt-2">
          Créez un devis professionnel pour vos clients
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Formulaire */}
      <div className="grid gap-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Client et description du devis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client */}
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select
                value={selectedClientId}
                onValueChange={setSelectedClientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <SelectItem value="demo" disabled>
                      Aucun client disponible
                    </SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Astuce : Les clients proviennent de vos conversations et réservations
              </p>
            </div>

            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre du devis *</Label>
              <Input
                id="title"
                placeholder="Ex: Plomberie salle de bain - Installation complète"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description détaillée des travaux à réaliser..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lignes du devis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Prestations et produits</CardTitle>
                <CardDescription>
                  Détaillez les lignes de votre devis
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddLine}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ligne
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Description</TableHead>
                    <TableHead className="w-[10%]">Qté</TableHead>
                    <TableHead className="w-[10%]">Unité</TableHead>
                    <TableHead className="w-[15%]">PU (€)</TableHead>
                    <TableHead className="w-[15%]">Total (€)</TableHead>
                    <TableHead className="w-[10%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          placeholder="Description de la prestation"
                          value={item.description}
                          onChange={(e) =>
                            handleLineChange(index, 'description', e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleLineChange(index, 'quantity', e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.unit}
                          onValueChange={(value) =>
                            handleLineChange(index, 'unit', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNITS.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={(item.unitPrice / 100).toFixed(2)}
                          onChange={(e) =>
                            handleLineChange(index, 'unitPrice', e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {(item.total / 100).toFixed(2)} €
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLine(index)}
                          disabled={lineItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Frais et remises */}
        <Card>
          <CardHeader>
            <CardTitle>Frais et remises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Frais de déplacement */}
              <div className="space-y-2">
                <Label htmlFor="travelFee">Frais de déplacement (€)</Label>
                <Input
                  id="travelFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={travelFee}
                  onChange={(e) => setTravelFee(parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Remise */}
              <div className="space-y-2">
                <Label htmlFor="discount">Remise (€)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Taux de TVA */}
            <div className="space-y-2">
              <Label htmlFor="taxRate">Taux de TVA (%)</Label>
              <Select
                value={taxRate.toString()}
                onValueChange={(value) => setTaxRate(parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Exonéré (0%)</SelectItem>
                  <SelectItem value="5.5">Réduit (5.5%)</SelectItem>
                  <SelectItem value="10">Intermédiaire (10%)</SelectItem>
                  <SelectItem value="20">Normal (20%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Récapitulatif des totaux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Récapitulatif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total HT</span>
                <span className="font-medium">
                  {((lineItems.reduce((s, i) => s + i.total, 0) / 100).toFixed(2))} €
                </span>
              </div>
              {travelFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frais de déplacement</span>
                  <span className="font-medium">+{travelFee.toFixed(2)} €</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remise</span>
                  <span className="font-medium text-green-600">
                    -{discountAmount.toFixed(2)} €
                  </span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between">
                <span className="text-muted-foreground">Total HT</span>
                <span className="font-medium">{(subtotal / 100).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TVA ({taxRate}%)</span>
                <span className="font-medium">{(taxAmount / 100).toFixed(2)} €</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-lg font-semibold">Total TTC</span>
                <span className="text-lg font-bold text-primary">
                  {(total / 100).toFixed(2)} €
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conditions de paiement */}
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Conditions de paiement</Label>
              <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map((term) => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Durée estimée */}
            <div className="space-y-2">
              <Label htmlFor="duration">Durée estimée</Label>
              <Input
                id="duration"
                placeholder="Ex: 2-3 jours"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
              />
            </div>

            {/* Date de validité */}
            <div className="space-y-2">
              <Label htmlFor="validUntil">
                <Calendar className="inline h-4 w-4 mr-2" />
                Valable jusqu'au *
              </Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Conditions générales */}
            <div className="space-y-2">
              <Label htmlFor="terms">Conditions générales</Label>
              <Textarea
                id="terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={4}
                placeholder="Conditions générales du devis..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer le brouillon
          </Button>
          <Button
            onClick={() => setShowSendDialog(true)}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Envoyer au client
          </Button>
        </div>
      </div>

      {/* Dialog de confirmation d'envoi */}
      <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'envoi du devis</AlertDialogTitle>
            <AlertDialogDescription>
              Le devis sera envoyé au client qui recevra une notification.
              Vous ne pourrez plus le modifier après l'envoi.
              <br />
              <br />
              <strong>Montant total TTC : {(total / 100).toFixed(2)} €</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendQuote}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Confirmer l\'envoi'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
