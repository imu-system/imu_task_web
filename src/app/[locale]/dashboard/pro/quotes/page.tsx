/**
 * Page de liste des devis - ImuPro
 * Affiche tous les devis créés par le professionnel avec filtres et statistiques
 * 
 * Features:
 * - Liste complète des devis avec statut, client, montant, dates
 * - Filtres : statut, date, client, montant
 * - Stats KPI : Total envoyés, Taux d'acceptation, Valeur totale
 * - Pagination
 * - Actions : Voir détail, Renvoyer, Modifier (brouillon), Annuler
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Plus,
  Loader2,
  FileText,
  TrendingUp,
  CheckCircle,
  Euro,
  MoreVertical,
  Eye,
  Send,
  Edit,
  XCircle,
  Filter,
  Search,
} from 'lucide-react';

interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  clientName?: string;
  status: string;
  title: string;
  total: number;
  createdAt: any;
  sentAt?: any;
  validUntil: any;
  acceptedAt?: any;
  declinedAt?: any;
}

interface Stats {
  totalSent: number;
  acceptanceRate: number;
  totalValue: number;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Brouillon', variant: 'secondary' },
  sent: { label: 'Envoyé', variant: 'default' },
  viewed: { label: 'Vu', variant: 'outline' },
  accepted: { label: 'Accepté', variant: 'default' },
  declined: { label: 'Refusé', variant: 'destructive' },
  expired: { label: 'Expiré', variant: 'outline' },
  cancelled: { label: 'Annulé', variant: 'destructive' },
};

export default function QuotesListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // States
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSent: 0,
    acceptanceRate: 0,
    totalValue: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!authLoading && user) {
      loadQuotes();
    }
  }, [authLoading, user]);

  useEffect(() => {
    applyFilters();
  }, [quotes, statusFilter, searchQuery]);

  const loadQuotes = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Vérifier que l'utilisateur est un pro
      const proDoc = await getDoc(doc(db, 'pro_profiles', user.uid));
      if (!proDoc.exists()) {
        router.push('/dashboard/become-pro');
        return;
      }

      // Charger les devis du professionnel
      const quotesQuery = query(
        collection(db, 'quotes'),
        where('providerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(quotesQuery);
      const quotesData: Quote[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // Charger le nom du client
        let clientName = 'Client inconnu';
        try {
          const clientDoc = await getDoc(doc(db, 'users', data.clientId));
          if (clientDoc.exists()) {
            const clientData = clientDoc.data();
            clientName = clientData.displayName || clientData.email || 'Client';
          }
        } catch (err) {
          console.error('Erreur chargement client:', err);
        }

        quotesData.push({
          id: docSnap.id,
          quoteNumber: data.quoteNumber,
          clientId: data.clientId,
          clientName,
          status: data.status,
          title: data.title,
          total: data.total,
          createdAt: data.createdAt,
          sentAt: data.sentAt,
          validUntil: data.validUntil,
          acceptedAt: data.acceptedAt,
          declinedAt: data.declinedAt,
        });
      }

      setQuotes(quotesData);
      calculateStats(quotesData);
    } catch (err) {
      console.error('Erreur chargement devis:', err);
      setError('Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (quotesData: Quote[]) => {
    const sent = quotesData.filter((q) =>
      ['sent', 'viewed', 'accepted', 'declined', 'expired'].includes(q.status)
    ).length;

    const accepted = quotesData.filter((q) => q.status === 'accepted').length;

    const totalValue = quotesData
      .filter((q) => q.status === 'accepted')
      .reduce((sum, q) => sum + q.total, 0);

    setStats({
      totalSent: sent,
      acceptanceRate: sent > 0 ? Math.round((accepted / sent) * 100) : 0,
      totalValue,
    });
  };

  const applyFilters = () => {
    let filtered = [...quotes];

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }

    // Filtre par recherche (numéro, client, titre)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.quoteNumber.toLowerCase().includes(query) ||
          q.clientName?.toLowerCase().includes(query) ||
          q.title.toLowerCase().includes(query)
      );
    }

    setFilteredQuotes(filtered);
    setCurrentPage(1); // Reset à la page 1 lors du filtrage
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

  const handleViewQuote = (quoteId: string) => {
    router.push(`/dashboard/pro/quotes/${quoteId}`);
  };

  const handleEditQuote = (quoteId: string) => {
    // TODO: Implémenter la page d'édition
    router.push(`/dashboard/pro/quotes/${quoteId}/edit`);
  };

  // Pagination
  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuotes = filteredQuotes.slice(startIndex, endIndex);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mes devis</h1>
            <p className="text-muted-foreground mt-2">
              Gérez tous vos devis clients
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/pro/quotes/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis envoyés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent}</div>
            <p className="text-xs text-muted-foreground">Total des devis transmis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'acceptation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.acceptanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Devis acceptés / envoyés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur acceptée</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">Total TTC des devis acceptés</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher (numéro, client, titre)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Statut */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
                <SelectItem value="sent">Envoyés</SelectItem>
                <SelectItem value="viewed">Vus</SelectItem>
                <SelectItem value="accepted">Acceptés</SelectItem>
                <SelectItem value="declined">Refusés</SelectItem>
                <SelectItem value="expired">Expirés</SelectItem>
                <SelectItem value="cancelled">Annulés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table des devis */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredQuotes.length} devis
            {statusFilter !== 'all' && ` (${STATUS_LABELS[statusFilter]?.label})`}
          </CardTitle>
          <CardDescription>
            {filteredQuotes.length === 0
              ? 'Aucun devis trouvé'
              : `Page ${currentPage} sur ${totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun devis</h3>
              <p className="text-muted-foreground mb-4">
                {quotes.length === 0
                  ? 'Commencez par créer votre premier devis'
                  : 'Aucun devis ne correspond aux filtres'}
              </p>
              {quotes.length === 0 && (
                <Button onClick={() => router.push('/dashboard/pro/quotes/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un devis
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Montant TTC</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Validité</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">
                          {quote.quoteNumber}
                        </TableCell>
                        <TableCell>{quote.clientName}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {quote.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_LABELS[quote.status]?.variant || 'outline'}>
                            {STATUS_LABELS[quote.status]?.label || quote.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(quote.total)}
                        </TableCell>
                        <TableCell>{formatDate(quote.createdAt)}</TableCell>
                        <TableCell>
                          {formatDate(quote.validUntil)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewQuote(quote.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir le détail
                              </DropdownMenuItem>

                              {quote.status === 'draft' && (
                                <DropdownMenuItem
                                  onClick={() => handleEditQuote(quote.id)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                              )}

                              {(quote.status === 'sent' || quote.status === 'viewed') && (
                                <DropdownMenuItem>
                                  <Send className="mr-2 h-4 w-4" />
                                  Renvoyer
                                </DropdownMenuItem>
                              )}

                              {quote.status !== 'accepted' &&
                                quote.status !== 'cancelled' && (
                                  <DropdownMenuItem className="text-destructive">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Annuler
                                  </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
