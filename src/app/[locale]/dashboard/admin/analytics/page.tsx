/**
 * Page d'analytics - Admin
 * Statistiques et métriques de la plateforme
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  DollarSign,
  Calendar,
  Activity,
  CheckCircle,
} from 'lucide-react';

interface AnalyticsData {
  users: {
    total: number;
    clients: number;
    professionals: number;
    newThisMonth: number;
    trend: number;
  };
  quotes: {
    total: number;
    sent: number;
    accepted: number;
    declined: number;
    conversionRate: number;
    totalValue: number;
  };
  invoices: {
    total: number;
    validated: number;
    pending: number;
    rejected: number;
    totalAmount: number;
  };
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    upcoming: number;
  };
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('30');

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAccess();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (user && !loading) {
      loadAnalytics();
    }
  }, [period, user]);

  const checkAdminAccess = async () => {
    if (!user) {
      router.push('/dashboard');
      return;
    }

    const isAdmin = user.email?.includes('admin') || false;
    
    if (!isAdmin) {
      setError('Accès non autorisé. Vous devez être administrateur.');
      setTimeout(() => router.push('/dashboard'), 2000);
      return;
    }

    setLoading(false);
  };

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const daysAgo = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      const startTimestamp = Timestamp.fromDate(startDate);

      // Charger les utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const newUsersSnapshot = await getDocs(
        query(collection(db, 'users'), where('createdAt', '>=', startTimestamp))
      );
      const professionalUsers = usersSnapshot.docs.filter(
        (doc) => doc.data().isProfessional === true
      );

      // Charger les devis
      const quotesSnapshot = await getDocs(collection(db, 'quotes'));
      const quotesData = quotesSnapshot.docs.map((doc) => doc.data());
      const sentQuotes = quotesData.filter((q) => q.status === 'sent' || q.status === 'viewed');
      const acceptedQuotes = quotesData.filter((q) => q.status === 'accepted');
      const declinedQuotes = quotesData.filter((q) => q.status === 'declined');
      const totalQuoteValue = acceptedQuotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

      // Charger les factures
      const invoicesSnapshot = await getDocs(collection(db, 'invoices'));
      const invoicesData = invoicesSnapshot.docs.map((doc) => doc.data());
      const validatedInvoices = invoicesData.filter((i) => i.status === 'validated' || i.status === 'paid');
      const pendingInvoices = invoicesData.filter((i) => i.status === 'submitted' || i.status === 'draft');
      const rejectedInvoices = invoicesData.filter((i) => i.status === 'rejected');
      const totalInvoiceAmount = validatedInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);

      // Charger les réservations
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const bookingsData = bookingsSnapshot.docs.map((doc) => doc.data());
      const completedBookings = bookingsData.filter((b) => b.status === 'completed');
      const cancelledBookings = bookingsData.filter((b) => b.status === 'cancelled');
      const upcomingBookings = bookingsData.filter(
        (b) => b.status === 'confirmed' || b.status === 'in_progress'
      );

      const conversionRate =
        sentQuotes.length > 0
          ? Math.round((acceptedQuotes.length / sentQuotes.length) * 100)
          : 0;

      setAnalytics({
        users: {
          total: usersSnapshot.size,
          clients: usersSnapshot.size - professionalUsers.length,
          professionals: professionalUsers.length,
          newThisMonth: newUsersSnapshot.size,
          trend: newUsersSnapshot.size > 0 ? 12 : 0, // Simulé
        },
        quotes: {
          total: quotesSnapshot.size,
          sent: sentQuotes.length,
          accepted: acceptedQuotes.length,
          declined: declinedQuotes.length,
          conversionRate,
          totalValue: totalQuoteValue,
        },
        invoices: {
          total: invoicesSnapshot.size,
          validated: validatedInvoices.length,
          pending: pendingInvoices.length,
          rejected: rejectedInvoices.length,
          totalAmount: totalInvoiceAmount,
        },
        bookings: {
          total: bookingsSnapshot.size,
          completed: completedBookings.length,
          cancelled: cancelledBookings.length,
          upcoming: upcomingBookings.length,
        },
      });
    } catch (err) {
      console.error('Erreur chargement analytics:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Erreur de chargement'}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/admin')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/admin')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au dashboard admin
          </Button>

          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Statistiques et métriques de la plateforme
          </p>
        </div>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
            <SelectItem value="365">Année complète</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Utilisateurs */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Utilisateurs</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.users.total}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                +{analytics.users.trend}% ce mois
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.users.clients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Professionnels</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.users.professionals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nouveaux</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.users.newThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">Ce mois-ci</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Devis */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Devis</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.quotes.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.quotes.accepted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.quotes.conversionRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.quotes.totalValue)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Factures */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Factures</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.invoices.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validées</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.invoices.validated}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.invoices.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Montant total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.invoices.totalAmount)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Réservations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Réservations</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.bookings.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.bookings.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">À venir</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.bookings.upcoming}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annulées</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.bookings.cancelled}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
