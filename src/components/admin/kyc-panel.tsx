/**
 * Panel Admin - Gestion des demandes KYC
 * Permet d'approuver/rejeter les demandes KYC et d'attribuer le rôle provider
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Eye, FileText } from 'lucide-react';

interface KYCDocument {
    type: string;
    url: string;
    uploadedAt: Date;
    verified: boolean;
}

interface KYCSubmission {
    id: string;
    userId: string;
    status: string;
    documents: KYCDocument[];
    submittedAt: Date;
    userEmail: string;
    userDisplayName: string;
}

export function AdminKYCPanel() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [notes, setNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const isAdmin = user?.roles?.includes(UserRole.admin) ?? false;

    useEffect(() => {
        if (isAdmin) {
            loadSubmissions();
        }
    }, [isAdmin]);

    const loadSubmissions = async () => {
        setLoading(true);
        setError(null);

        try {
            const listKYCSubmissions = httpsCallable(functions, 'listKYCSubmissions');
            const result = await listKYCSubmissions({ status: 'pending' });
            const data = result.data as any;

            if (data.success) {
                setSubmissions(data.submissions);
            }
        } catch (err: any) {
            console.error('Error loading KYC submissions:', err);
            setError(err.message || 'Failed to load KYC submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedSubmission) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const approveKYC = httpsCallable(functions, 'approveKYC');
            const result = await approveKYC({
                submissionId: selectedSubmission.id,
                notes,
            });

            const data = result.data as any;

            if (data.success) {
                setSuccess(`KYC approved for ${selectedSubmission.userDisplayName}`);
                setSelectedSubmission(null);
                setActionType(null);
                setNotes('');
                await loadSubmissions();
            }
        } catch (err: any) {
            console.error('Error approving KYC:', err);
            setError(err.message || 'Failed to approve KYC');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedSubmission || !rejectionReason) {
            setError('Rejection reason is required');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const rejectKYC = httpsCallable(functions, 'rejectKYC');
            const result = await rejectKYC({
                submissionId: selectedSubmission.id,
                reason: rejectionReason,
            });

            const data = result.data as any;

            if (data.success) {
                setSuccess(`KYC rejected for ${selectedSubmission.userDisplayName}`);
                setSelectedSubmission(null);
                setActionType(null);
                setRejectionReason('');
                await loadSubmissions();
            }
        } catch (err: any) {
            console.error('Error rejecting KYC:', err);
            setError(err.message || 'Failed to reject KYC');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-100">En attente</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-100">Approuvé</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejeté</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (!isAdmin) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Accès refusé
                    </CardTitle>
                    <CardDescription>
                        Vous devez être administrateur pour accéder à ce panel.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Demandes KYC en attente
                    </CardTitle>
                    <CardDescription>
                        Validez les documents des utilisateurs pour leur attribuer le rôle prestataire
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="mb-4 border-green-500">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!loading && submissions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            Aucune demande KYC en attente
                        </div>
                    )}

                    {!loading && submissions.length > 0 && (
                        <div className="space-y-3">
                            {submissions.map((submission) => (
                                <div
                                    key={submission.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">
                                                {submission.userDisplayName}
                                            </p>
                                            {getStatusBadge(submission.status)}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {submission.userEmail}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Soumis le {new Date(submission.submittedAt).toLocaleDateString()}
                                        </p>
                                        <div className="flex gap-1 mt-2">
                                            {submission.documents.map((doc, idx) => (
                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                    {doc.type}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedSubmission(submission);
                                                setActionType('approve');
                                            }}
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Approuver
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedSubmission(submission);
                                                setActionType('reject');
                                            }}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Rejeter
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={loadSubmissions}
                        disabled={loading}
                    >
                        Actualiser
                    </Button>
                </CardContent>
            </Card>

            {/* Dialog d'approbation */}
            <Dialog open={actionType === 'approve'} onOpenChange={() => setActionType(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approuver la demande KYC</DialogTitle>
                        <DialogDescription>
                            Approuver la demande de {selectedSubmission?.userDisplayName} et lui attribuer le rôle prestataire ?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Notes (optionnel)</label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ajoutez des notes sur cette validation..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionType(null)}>
                            Annuler
                        </Button>
                        <Button onClick={handleApprove} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Traitement...
                                </>
                            ) : (
                                'Approuver'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de rejet */}
            <Dialog open={actionType === 'reject'} onOpenChange={() => setActionType(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rejeter la demande KYC</DialogTitle>
                        <DialogDescription>
                            Rejeter la demande de {selectedSubmission?.userDisplayName} ?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Raison du rejet *</label>
                            <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Expliquez pourquoi cette demande est rejetée..."
                                rows={3}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionType(null)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Traitement...
                                </>
                            ) : (
                                'Rejeter'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
