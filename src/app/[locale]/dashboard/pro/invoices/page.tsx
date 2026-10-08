/**
 * Page d'upload de facture - ImuPro
 * Permet aux professionnels d'uploader des factures (PDF ou images)
 * 
 * Features:
 * - Upload de fichiers PDF/JPG/PNG
 * - Prévisualisation du fichier
 * - Formulaire avec montant, description, date d'échéance
 * - Lien optionnel avec un devis accepté
 * - Liste des factures uploadées avec statuts
 */

'use client';

import { useRouter } from '@/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Upload,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Euro,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName?: string;
  quoteId?: string;
  status: string;
  amount: number;
  description: string;
  createdAt: any;
  submittedAt?: any;
  fileUrl?: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  clientName?: string;
  total: number;
  status: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Brouillon', variant: 'secondary' },
  submitted: { label: 'Soumise', variant: 'default' },
  validated: { label: 'Validée', variant: 'default' },
  rejected: { label: 'Rejetée', variant: 'destructive' },
  paid: { label: 'Payée', variant: 'default' },
};

export default function InvoicesUploadPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [clientId, setClientId] = useState('');
  const [quoteId, setQuoteId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Lists
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [acceptedQuotes, setAcceptedQuotes] = useState<Quote[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [authLoading, user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Charger les factures
      const invoicesQuery = query(
        collection(db, 'invoices'),
        where('providerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const invoicesSnapshot = await getDocs(invoicesQuery);
      const invoicesData: Invoice[] = [];

      for (const docSnap of invoicesSnapshot.docs) {
        const data = docSnap.data();
        invoicesData.push({
          id: docSnap.id,
          invoiceNumber: data.invoiceNumber,
          clientId: data.clientId,
          quoteId: data.quoteId,
          status: data.status,
          amount: data.amount,
          description: data.description,
          createdAt: data.createdAt,
          submittedAt: data.submittedAt,
          fileUrl: data.fileUrl,
        });
      }

      setInvoices(invoicesData);

      // Charger les devis acceptés sans facture
      const quotesQuery = query(
        collection(db, 'quotes'),
        where('providerId', '==', user.uid),
        where('status', '==', 'accepted')
      );

      const quotesSnapshot = await getDocs(quotesQuery);
      const quotesData: Quote[] = [];

      for (const docSnap of quotesSnapshot.docs) {
        const data = docSnap.data();

        // Vérifier qu'il n'y a pas déjà de facture pour ce devis
        const hasInvoice = invoicesData.some((inv) => inv.quoteId === docSnap.id);
        if (!hasInvoice) {
          quotesData.push({
            id: docSnap.id,
            quoteNumber: data.quoteNumber,
            clientId: data.clientId,
            total: data.total,
            status: data.status,
          });
        }
      }

      setAcceptedQuotes(quotesData);
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format de fichier non supporté. Utilisez PDF, JPG ou PNG.');
      return;
    }

    // Vérifier la taille (max 10 MB)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      setError('Le fichier est trop volumineux. Taille maximum : 10 MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Générer la prévisualisation
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleQuoteSelect = (selectedQuoteId: string) => {
    setQuoteId(selectedQuoteId);

    const quote = acceptedQuotes.find((q) => q.id === selectedQuoteId);
    if (quote) {
      setClientId(quote.clientId);
      setAmount((quote.total / 100).toFixed(2)); // Convertir centimes en euros
      setDescription(`Facture pour le devis ${quote.quoteNumber}`);

      // Date d'échéance par défaut : +30 jours
      const due = new Date();
      due.setDate(due.getDate() + 30);
      setDueDate(due.toISOString().split('T')[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !clientId || !amount) {
      setError('Veuillez remplir tous les champs requis et sélectionner un fichier');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Convertir le fichier en base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);

      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];

        const uploadInvoice = httpsCallable(functions, 'uploadInvoice');
        const result = await uploadInvoice({
          clientId,
          quoteId: quoteId || null,
          amount: Math.round(parseFloat(amount) * 100), // Convertir en centimes
          description: description || '',
          dueDate: dueDate || null,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileData: base64Data,
        });

        const data = result.data as { success: boolean; invoiceNumber: string };
        if (data.success) {
          setSuccess(`Facture ${data.invoiceNumber} uploadée avec succès !`);

          // Réinitialiser le formulaire
          setClientId('');
          setQuoteId('');
          setAmount('');
          setDescription('');
          setDueDate('');
          setSelectedFile(null);
          setFilePreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          // Recharger les données
          await loadData();
        }
      };

      reader.onerror = () => {
        throw new Error('Erreur lors de la lecture du fichier');
      };
    } catch (err: unknown) {
      console.error('Erreur upload:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload de la facture';
      setError(errorMessage);
    } finally {
      setUploading(false);
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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          onClick={() => router.push('/dashboard/pro')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au dashboard
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Mes factures</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos factures clients
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Formulaire d'upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Uploader une facture
            </CardTitle>
            <CardDescription>
              Formats acceptés : PDF, JPG, PNG (max 10 MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sélection depuis un devis */}
            {acceptedQuotes.length > 0 && (
              <div className="space-y-2">
                <Label>Devis accepté (optionnel)</Label>
                <Select value={quoteId} onValueChange={handleQuoteSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un devis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun devis</SelectItem>
                    {acceptedQuotes.map((quote) => (
                      <SelectItem key={quote.id} value={quote.id}>
                        {quote.quoteNumber} - {formatCurrency(quote.total)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Client ID (caché, sera rempli auto depuis le devis) */}
            <input type="hidden" value={clientId} />

            {/* Montant */}
            <div className="space-y-2">
              <Label htmlFor="amount">Montant TTC (€) *</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de la facture..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Date d'échéance */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Date d'échéance</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Upload de fichier */}
            <div className="space-y-2">
              <Label htmlFor="file">Fichier *</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                ref={fileInputRef}
                onChange={handleFileSelect}
                required
              />
            </div>

            {/* Prévisualisation */}
            {filePreview && (
              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Prévisualisation :</p>
                <img
                  src={filePreview}
                  alt="Prévisualisation"
                  className="max-w-full max-h-64 object-contain rounded"
                />
              </div>
            )}

            {selectedFile && !filePreview && (
              <div className="border rounded-lg p-4 flex items-center gap-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}

            {/* Bouton d'upload */}
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !clientId || !amount}
              className="w-full"
              size="lg"
            >
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Upload className="mr-2 h-4 w-4" />
              Uploader la facture
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total factures</span>
                <span className="text-2xl font-bold">{invoices.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Soumises</span>
                <span className="text-lg font-semibold">
                  {invoices.filter((i) => i.status === 'submitted').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Validées</span>
                <span className="text-lg font-semibold text-green-600">
                  {invoices.filter((i) => i.status === 'validated').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payées</span>
                <span className="text-lg font-semibold text-blue-600">
                  {invoices.filter((i) => i.status === 'paid').length}
                </span>
              </div>
            </CardContent>
          </Card>

          {acceptedQuotes.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">
                  Devis en attente de facture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700">
                  Vous avez {acceptedQuotes.length} devis accepté(s) sans facture associée
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Liste des factures */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des factures</CardTitle>
          <CardDescription>
            {invoices.length} facture(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune facture</h3>
              <p className="text-muted-foreground">
                Commencez par uploader votre première facture
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {invoice.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_LABELS[invoice.status]?.variant || 'outline'}>
                          {STATUS_LABELS[invoice.status]?.label || invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {invoice.fileUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(invoice.fileUrl, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
