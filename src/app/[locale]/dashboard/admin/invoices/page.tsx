/**
 * Page de validation des factures - Admin
 * Interface pour valider ou rejeter les factures soumises par les professionnels
 * 
 * Features:
 * - Liste des factures avec filtres par statut
 * - Prévisualisation du fichier PDF/image
 * - Actions : Valider ou Rejeter
 * - Statistiques globales
 * - Marquer comme payé
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  providerId: string;
  providerName?: string;
  clientId: string;
  clientName?: string;
  quoteId?: string;
  status: string;
  amount: number;
  description: string;
  createdAt: any;
  submittedAt?: any;
  fileUrl?: string;
  rejectionReason?: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Brouillon', variant: 'secondary' },
  submitted: { label: 'En attente', variant: 'default' },
  validated: { label: 'Validée', variant: 'default' },
  rejected: { label: 'Rejetée', variant: 'destructive' },
  paid: { label: 'Payée', variant: 'default' },
};

export default function AdminInvoicesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // States
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPaidDialog, setShowPaidDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAccess();
    }
  }, [authLoading, user]);

  useEffect(() => {
    applyFilters();
  }, [invoices, statusFilter]);

  const checkAdminAccess = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      await loadInvoices();
    } catch (err) {
      console.error('Erreur vérification admin:', err);
      setError('Erreur lors de la vérification des permissions');
    }
  };

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);

    try {
      const invoicesQuery = query(
        collection(db, 'invoices'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(invoicesQuery);
      const invoicesData: Invoice[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Charger les infos du professionnel
        let providerName = 'Professionnel inconnu';
        try {
          const providerDoc = await getDoc(doc(db, 'users', data.providerId));
          if (providerDoc.exists()) {
            providerName = providerDoc.data()?.displayName || providerDoc.data()?.email || 'Professionnel';
          }
        } catch (err) {
          console.error('Erreur chargement professionnel:', err);
        }

        // Charger les infos du client
        let clientName = 'Client inconnu';
        try {
          const clientDoc = await getDoc(doc(db, 'users', data.clientId));
          if (clientDoc.exists()) {
            clientName = clientDoc.data()?.displayName || clientDoc.data()?.email || 'Client';
          }
        } catch (err) {
          console.error('Erreur chargement client:', err);
        }

        invoicesData.push({
          id: docSnap.id,
          invoiceNumber: data.invoiceNumber,
          providerId: data.providerId,
          providerName,
          clientId: data.clientId,
          clientName,
          quoteId: data.quoteId,
          status: data.status,
          amount: data.amount,
          description: data.description,
          createdAt: data.createdAt,
          submittedAt: data.submittedAt,
          fileUrl: data.fileUrl,
          rejectionReason: data.rejectionReason,
        });
      }

      setInvoices(invoicesData);
    } catch (err) {
      console.error('Erreur chargement factures:', err);
      setError('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  };

  const handleValidate = async () => {
    if (!selectedInvoice) return;

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const validateInvoice = httpsCallable(functions, 'validateInvoice');
      await validateInvoice({
        invoiceId: selectedInvoice.id,
        action: 'approve',
      });

      setSuccess(`Facture ${selectedInvoice.invoiceNumber} validée avec succès`);
      setShowValidateDialog(false);
      await loadInvoices();
    } catch (err: unknown) {
      console.error('Erreur validation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la validation';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedInvoice || !rejectionReason.trim()) {
      setError('Veuillez indiquer la raison du rejet');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const validateInvoice = httpsCallable(functions, 'validateInvoice');
      await validateInvoice({
        invoiceId: selectedInvoice.id,
        action: 'reject',
        rejectionReason,
      });

      setSuccess(`Facture ${selectedInvoice.invoiceNumber} rejetée`);
      setShowRejectDialog(false);
      setRejectionReason('');
      await loadInvoices();
    } catch (err: unknown) {
      console.error('Erreur rejet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du rejet';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedInvoice) return;

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const markInvoiceAsPaid = httpsCallable(functions, 'markInvoiceAsPaid');
      await markInvoiceAsPaid({
        invoiceId: selectedInvoice.id,
      });

      setSuccess(`Facture ${selectedInvoice.invoiceNumber} marquée comme payée`);
      setShowPaidDialog(false);
      await loadInvoices();
    } catch (err: unknown) {
      console.error('Erreur marquage payé:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du marquage';
      setError(errorMessage);
    } finally {
      setProcessing(false);
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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: invoices.length,
    submitted: invoices.filter((i) => i.status === 'submitted').length,
    validated: invoices.filter((i) => i.status === 'validated').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/admin')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au dashboard admin
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Validation des factures</h1>
          <p className="text-muted-foreground mt-2">
            Validez ou rejetez les factures soumises par les professionnels
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total factures</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.submitted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payées</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.paid}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtre */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Label htmlFor="status-filter" className="text-sm font-medium">
              Statut :
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="submitted">En attente</SelectItem>
                <SelectItem value="validated">Validées</SelectItem>
                <SelectItem value="rejected">Rejetées</SelectItem>
                <SelectItem value="paid">Payées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredInvoices.length} facture(s)
            {statusFilter !== 'all' && ` (${STATUS_LABELS[statusFilter]?.label})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune facture</h3>
              <p className="text-muted-foreground">
                Aucune facture ne correspond aux filtres
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Professionnel</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{invoice.providerName}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
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
                        <div className="flex gap-2 justify-end">
                          {invoice.fileUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(invoice.fileUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}

                          {invoice.status === 'submitted' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowValidateDialog(true);
                                }}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Valider
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Rejeter
                              </Button>
                            </>
                          )}

                          {invoice.status === 'validated' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowPaidDialog(true);
                              }}
                            >
                              Marquer payée
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Validation */}
      <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider la facture</DialogTitle>
            <DialogDescription>
              Confirmez-vous la validation de cette facture ?
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Numéro :</span>
                <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Professionnel :</span>
                <span className="font-medium">{selectedInvoice.providerName}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Montant TTC :</span>
                <span className="text-primary">{formatCurrency(selectedInvoice.amount)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowValidateDialog(false)}
              disabled={processing}
            >
              Annuler
            </Button>
            <Button onClick={handleValidate} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer la validation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejet */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la facture</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet (le professionnel sera notifié)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ex: Le document fourni est illisible..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
              disabled={processing}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Payé */}
      <Dialog open={showPaidDialog} onOpenChange={setShowPaidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme payée</DialogTitle>
            <DialogDescription>
              Confirmez que cette facture a été payée
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Facture :</span>
                <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Montant :</span>
                <span className="text-primary">{formatCurrency(selectedInvoice.amount)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaidDialog(false)}
              disabled={processing}
            >
              Annuler
            </Button>
            <Button onClick={handleMarkAsPaid} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
