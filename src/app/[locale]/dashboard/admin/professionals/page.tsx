/**
 * Page de gestion des professionnels - Admin
 * Liste et gestion des comptes professionnels
 */

'use client';

import { useRouter } from '@/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Users,
  Search,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Star,
} from 'lucide-react';

interface ProfessionalProfile {
  id: string;
  userId: string;
  displayName?: string;
  email?: string;
  companyName: string;
  siret: string;
  kybStatus: string;
  servicesOffered: string[];
  averageRating?: number;
  totalReviews?: number;
  createdAt: any;
  lastActive?: any;
  isActive: boolean;
}

const KYB_STATUS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'secondary' },
  approved: { label: 'Approuvé', variant: 'default' },
  rejected: { label: 'Rejeté', variant: 'destructive' },
};

export default function ProfessionalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<ProfessionalProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAccess();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (user && !loading) {
      loadProfessionals();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortProfessionals();
  }, [professionals, searchTerm, statusFilter, sortBy]);

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

  const loadProfessionals = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'pro_profiles'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const professionalsData: ProfessionalProfile[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        professionalsData.push({
          id: docSnap.id,
          ...data,
        } as ProfessionalProfile);
      }

      setProfessionals(professionalsData);
    } catch (err) {
      console.error('Erreur chargement professionnels:', err);
      setError('Erreur lors du chargement des professionnels');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProfessionals = () => {
    let filtered = [...professionals];

    // Filtrer par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (pro) =>
          pro.companyName?.toLowerCase().includes(term) ||
          pro.displayName?.toLowerCase().includes(term) ||
          pro.email?.toLowerCase().includes(term) ||
          pro.siret?.includes(term)
      );
    }

    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter((pro) => pro.kybStatus === statusFilter);
    }

    // Trier
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return b.createdAt?.seconds - a.createdAt?.seconds;
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'reviews':
          return (b.totalReviews || 0) - (a.totalReviews || 0);
        case 'company':
          return (a.companyName || '').localeCompare(b.companyName || '');
        default:
          return 0;
      }
    });

    setFilteredProfessionals(filtered);
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

  const getStats = () => {
    const total = professionals.length;
    const approved = professionals.filter((p) => p.kybStatus === 'approved').length;
    const pending = professionals.filter((p) => p.kybStatus === 'pending').length;
    const active = professionals.filter((p) => p.isActive).length;

    return { total, approved, pending, active };
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="container mx-auto py-8 px-4">
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
          <h1 className="text-3xl font-bold">Gestion des Professionnels</h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble et gestion des comptes professionnels
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut KYB" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvés</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Plus récents</SelectItem>
                <SelectItem value="rating">Meilleure note</SelectItem>
                <SelectItem value="reviews">Plus d'avis</SelectItem>
                <SelectItem value="company">Nom entreprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredProfessionals.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun professionnel</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Aucun résultat pour cette recherche'
                  : 'Aucun professionnel enregistré'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>SIRET</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Statut KYB</TableHead>
                    <TableHead>Date création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessionals.map((pro) => (
                    <TableRow key={pro.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pro.companyName}</p>
                          <p className="text-sm text-muted-foreground">{pro.displayName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{pro.siret}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {pro.servicesOffered?.slice(0, 2).join(', ')}
                          {pro.servicesOffered?.length > 2 && (
                            <span className="text-muted-foreground">
                              {' '}
                              +{pro.servicesOffered.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {pro.averageRating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{pro.averageRating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">
                              ({pro.totalReviews || 0})
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Aucun avis</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={KYB_STATUS[pro.kybStatus]?.variant || 'outline'}>
                          {KYB_STATUS[pro.kybStatus]?.label || pro.kybStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(pro.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/dashboard/pro/${pro.userId}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
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
