/**
 * Page de validation KYB - Admin
 * Permet aux admins de valider ou rejeter les soumissions KYB des professionnels
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Calendar,
  MapPin,
} from 'lucide-react';

interface KYBSubmission {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  siret: string;
  companyName: string;
  legalName: string;
  address: string;
  city: string;
  postalCode: string;
  activity: string;
  status: string;
  submittedAt: any;
  validatedAt?: any;
  rejectedAt?: any;
  rejectionReason?: string;
  validatedBy?: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'secondary' },
  approved: { label: 'Approuvé', variant: 'default' },
  rejected: { label: 'Rejeté', variant: 'destructive' },
};

export default function KYBValidationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<KYBSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('pending');

  // Dialog states
  const [selectedSubmission, setSelectedSubmission] = useState<KYBSubmission | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAccess();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (user && !loading) {
      loadSubmissions();
    }
  }, [currentTab, user]);

  const checkAdminAccess = async () => {
    if (!user) {
      router.push('/dashboard');
      return;
    }

    // Vérifier les permissions admin
    const isAdmin = user.email?.includes('admin') || false;
    
    if (!isAdmin) {
      setError('Accès non autorisé. Vous devez être administrateur.');
      setTimeout(() => router.push('/dashboard'), 2000);
      return;
    }

    setLoading(false);
  };

  const loadSubmissions = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let q;
      if (currentTab === 'all') {
        q = query(
          collection(db, 'kyb_submissions'),
          orderBy('submittedAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'kyb_submissions'),
          where('status', '==', currentTab),
          orderBy('submittedAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const submissionsData: KYBSubmission[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // Charger les infos utilisateur
        let userName = 'Utilisateur inconnu';
        let userEmail = '';
        try {
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userName = userData.displayName || userData.email || 'Utilisateur';
            userEmail = userData.email || '';
          }
        } catch (err) {
          console.error('Erreur chargement utilisateur:', err);
        }

        submissionsData.push({
          id: docSnap.id,
          ...data,
          userName,
          userEmail,
        } as KYBSubmission);
      }

      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Erreur chargement soumissions:', err);
      setError('Erreur lors du chargement des soumissions KYB');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;

    setActionInProgress(true);
    setError(null);

    try {
      const updateKYBStatus = httpsCallable(functions, 'updateKYBStatus');
      await updateKYBStatus({
        submissionId: selectedSubmission.id,
        status: 'approved',
      });

      setShowApproveDialog(false);
      setSelectedSubmission(null);
      await loadSubmissions();
    } catch (err: any) {
      console.error('Erreur approbation:', err);
      setError(err.message || 'Erreur lors de l\'approbation de la soumission');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !rejectionReason.trim()) {
      setError('Veuillez fournir une raison pour le rejet');
      return;
    }

    setActionInProgress(true);
    setError(null);

    try {
      const updateKYBStatus = httpsCallable(functions, 'updateKYBStatus');
      await updateKYBStatus({
        submissionId: selectedSubmission.id,
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
      });

      setShowRejectDialog(false);
      setSelectedSubmission(null);
      setRejectionReason('');
      await loadSubmissions();
    } catch (err: any) {
      console.error('Erreur rejet:', err);
      setError(err.message || 'Erreur lors du rejet de la soumission');
    } finally {
      setActionInProgress(false);
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

  const getPendingCount = () => submissions.filter((s) => s.status === 'pending').length;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && submissions.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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
          <h1 className="text-3xl font-bold">Validation KYB</h1>
          <p className="text-muted-foreground mt-2">
            Validez ou rejetez les soumissions SIRET des professionnels
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="pending">
            En attente
            {getPendingCount() > 0 && (
              <Badge variant="destructive" className="ml-2">
                {getPendingCount()}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approuvées</TabsTrigger>
          <TabsTrigger value="rejected">Rejetées</TabsTrigger>
          <TabsTrigger value="all">Toutes</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-6">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune soumission</h3>
                  <p className="text-muted-foreground">
                    {currentTab === 'pending'
                      ? 'Aucune soumission en attente de validation'
                      : `Aucune soumission ${STATUS_LABELS[currentTab]?.label?.toLowerCase()}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Entreprise</TableHead>
                        <TableHead>SIRET</TableHead>
                        <TableHead>Adresse</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{submission.userName}</p>
                              <p className="text-sm text-muted-foreground">
                                {submission.userEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{submission.companyName}</p>
                              <p className="text-sm text-muted-foreground">
                                {submission.legalName}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {submission.siret}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{submission.address}</p>
                              <p className="text-muted-foreground">
                                {submission.postalCode} {submission.city}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(submission.submittedAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={STATUS_LABELS[submission.status]?.variant || 'outline'}>
                              {STATUS_LABELS[submission.status]?.label || submission.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {submission.status === 'pending' ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setShowApproveDialog(true);
                                  }}
                                >
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Approuver
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <XCircle className="mr-1 h-4 w-4" />
                                  Rejeter
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {submission.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Approbation */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver la soumission KYB</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir approuver cette soumission ?
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="py-4 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedSubmission.companyName}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.legalName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">
                  {selectedSubmission.address}, {selectedSubmission.postalCode} {selectedSubmission.city}
                </p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">SIRET:</span>{' '}
                <span className="font-mono">{selectedSubmission.siret}</span>
              </div>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Le professionnel sera notifié et pourra accéder aux fonctionnalités pro.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={actionInProgress}
            >
              Annuler
            </Button>
            <Button onClick={handleApprove} disabled={actionInProgress}>
              {actionInProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer l'approbation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejet */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la soumission KYB</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ex: Informations incomplètes, SIRET invalide..."
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
              disabled={actionInProgress}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionInProgress || !rejectionReason.trim()}
            >
              {actionInProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
