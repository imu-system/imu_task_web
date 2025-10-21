'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, MoreHorizontal, Eye, X, Calendar as CalendarIcon, ExternalLink, Wallet } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Payout, PayoutStatus, PayoutStatusValues, formatAmount } from '@/types/payments';
import { collection, query, where, orderBy, limit, getDocs, startAfter, Timestamp, QueryDocumentSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';

interface Analytics {
    totalPayouts: number;
    pendingAmount: number;
    approvedThisMonth: number;
    paidThisMonth: number;
    pendingCount: number;
}

export default function AdminPayoutsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminPaymentsPage.payouts');
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [analytics, setAnalytics] = useState<Analytics>({
        totalPayouts: 0,
        pendingAmount: 0,
        approvedThisMonth: 0,
        paidThisMonth: 0,
        pendingCount: 0,
    });
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'all'>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    // Fetch payouts from Firestore
    const fetchPayouts = async (loadMore = false) => {
        try {
            setLoading(true);
            const payoutsRef = collection(db, 'payouts');
            let q = query(payoutsRef, orderBy('createdAt', 'desc'), limit(25));

            // Apply filters
            if (statusFilter !== 'all') {
                q = query(payoutsRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'), limit(25));
            }
            if (dateRange?.from) {
                const fromTimestamp = Timestamp.fromDate(dateRange.from);
                q = query(q, where('createdAt', '>=', fromTimestamp));
            }
            if (dateRange?.to) {
                const toTimestamp = Timestamp.fromDate(dateRange.to);
                q = query(q, where('createdAt', '<=', toTimestamp));
            }

            // Pagination
            if (loadMore && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const payoutData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
                approvedAt: doc.data().approvedAt?.toDate?.(),
                rejectedAt: doc.data().rejectedAt?.toDate?.(),
                scheduledAt: doc.data().scheduledAt?.toDate?.(),
                processedAt: doc.data().processedAt?.toDate?.(),
                paidAt: doc.data().paidAt?.toDate?.(),
                failedAt: doc.data().failedAt?.toDate?.(),
            })) as Payout[];

            if (loadMore) {
                setPayouts(prev => [...prev, ...payoutData]);
            } else {
                setPayouts(payoutData);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === 25);

            // Calculate analytics
            calculateAnalytics(loadMore ? [...payouts, ...payoutData] : payoutData);
        } catch (error) {
            console.error('Error fetching payouts:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les virements.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = (payoutList: Payout[]) => {
        const totalPayouts = payoutList.reduce((sum, p) => sum + p.netAmount, 0);
        const pendingAmount = payoutList
            .filter(p => p.status === PayoutStatusValues.pending)
            .reduce((sum, p) => sum + p.netAmount, 0);
        const pendingCount = payoutList.filter(p => p.status === PayoutStatusValues.pending).length;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const approvedThisMonth = payoutList
            .filter(p => p.status === PayoutStatusValues.approved && p.approvedAt && p.approvedAt.toDate() >= startOfMonth)
            .reduce((sum, p) => sum + p.netAmount, 0);

        const paidThisMonth = payoutList
            .filter(p => p.status === PayoutStatusValues.paid && p.paidAt && p.paidAt.toDate() >= startOfMonth)
            .reduce((sum, p) => sum + p.netAmount, 0);

        setAnalytics({
            totalPayouts,
            pendingAmount,
            approvedThisMonth,
            paidThisMonth,
            pendingCount,
        });
    };

    const filteredPayouts = useMemo(() => {
        return payouts.filter(payout => {
            const matchesSearch = searchTerm ? 
                payout.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                payout.professionalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payout.stripePayoutId?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            return matchesSearch;
        });
    }, [payouts, searchTerm]);

    const clearFilters = () => {
        setStatusFilter('all');
        setDateRange(undefined);
        setSearchTerm('');
    };

    const handleApprovePayout = async (payoutId: string) => {
        if (!user) return;
        
        try {
            const payoutRef = doc(db, 'payouts', payoutId);
            await updateDoc(payoutRef, {
                status: PayoutStatusValues.approved,
                approvedBy: user.uid,
                approvedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
            
            toast({
                title: "Payout approuvé",
                description: "Le paiement a été approuvé avec succès.",
            });
            
            // Refresh list
            fetchPayouts();
        } catch (error) {
            console.error('Error approving payout:', error);
            toast({
                title: "Erreur",
                description: "Impossible d'approuver le paiement.",
                variant: "destructive",
            });
        }
    };

    const handleRejectPayout = async () => {
        if (!user || !selectedPayoutId || !rejectionReason.trim()) {
            toast({
                title: "Erreur",
                description: "Veuillez fournir une raison de rejet.",
                variant: "destructive",
            });
            return;
        }
        
        try {
            const payoutRef = doc(db, 'payouts', selectedPayoutId);
            await updateDoc(payoutRef, {
                status: PayoutStatusValues.rejected,
                rejectedBy: user.uid,
                rejectedAt: Timestamp.now(),
                rejectionReason: rejectionReason,
                updatedAt: Timestamp.now(),
            });
            
            toast({
                title: "Payout rejeté",
                description: "Le paiement a été rejeté.",
            });
            
            setShowRejectDialog(false);
            setRejectionReason('');
            setSelectedPayoutId(null);
            
            // Refresh list
            fetchPayouts();
        } catch (error) {
            console.error('Error rejecting payout:', error);
            toast({
                title: "Erreur",
                description: "Impossible de rejeter le paiement.",
                variant: "destructive",
            });
        }
    };

    const handleInitiateStripePayout = async (payoutId: string) => {
        try {
            const response = await fetch('/api/stripe/payout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payoutId }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to initiate payout');
            }
            
            toast({
                title: "Payout initié",
                description: "Le transfert vers Stripe a été lancé.",
            });
            
            // Refresh list
            fetchPayouts();
        } catch (error) {
            console.error('Error initiating payout:', error);
            toast({
                title: "Erreur",
                description: "Impossible d'initier le transfert Stripe.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && user.roles?.includes(UserRole.admin)) {
            fetchPayouts();
        }
    }, [statusFilter, dateRange]);

    if (authLoading || loading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const getStatusVariant = (status: PayoutStatus): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case PayoutStatusValues.paid: 
                return 'default';
            case PayoutStatusValues.pending:
            case PayoutStatusValues.approved:
            case PayoutStatusValues.processing:
                return 'secondary';
            case PayoutStatusValues.failed:
            case PayoutStatusValues.rejected:
            case PayoutStatusValues.cancelled:
                return 'destructive';
            default: 
                return 'outline';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Wallet className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>

            {/* Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(analytics.totalPayouts)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En attente</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(analytics.pendingAmount)}</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.pendingCount} payout{analytics.pendingCount > 1 ? 's' : ''}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approuvés ce mois</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(analytics.approvedThisMonth)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Payés ce mois</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(analytics.paidThisMonth)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Table */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('table.title')}</CardTitle>
                    <CardDescription>{t('table.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                placeholder="Rechercher par ID, professionnel..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PayoutStatus | 'all')}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value={PayoutStatusValues.pending}>En attente</SelectItem>
                                    <SelectItem value={PayoutStatusValues.approved}>Approuvé</SelectItem>
                                    <SelectItem value={PayoutStatusValues.processing}>En cours</SelectItem>
                                    <SelectItem value={PayoutStatusValues.paid}>Payé</SelectItem>
                                    <SelectItem value={PayoutStatusValues.failed}>Échoué</SelectItem>
                                    <SelectItem value={PayoutStatusValues.rejected}>Rejeté</SelectItem>
                                    <SelectItem value={PayoutStatusValues.cancelled}>Annulé</SelectItem>
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "dd/MM/yyyy")
                                            )
                                        ) : (
                                            <span>Période</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                            {(statusFilter !== 'all' || dateRange || searchTerm) && (
                                <Button variant="ghost" onClick={clearFilters}>
                                    Réinitialiser
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID Payout</TableHead>
                                <TableHead>Professionnel</TableHead>
                                <TableHead>Montant Net</TableHead>
                                <TableHead>Commission</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayouts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        Aucun payout trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPayouts.map((payout) => (
                                    <TableRow key={payout.id}>
                                        <TableCell>
                                            <div className="font-mono text-xs">{payout.id.substring(0, 12)}...</div>
                                            {payout.stripePayoutId && (
                                                <div className="font-mono text-[10px] text-muted-foreground">
                                                    {payout.stripePayoutId.substring(0, 12)}...
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{payout.professionalId.substring(0, 12)}...</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{formatAmount(payout.netAmount)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-muted-foreground">{formatAmount(payout.platformFee)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(payout.status)}>
                                                {payout.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {payout.paidAt 
                                                    ? format(payout.paidAt.toDate(), 'dd/MM/yyyy')
                                                    : payout.scheduledAt 
                                                    ? format(payout.scheduledAt.toDate(), 'dd/MM/yyyy')
                                                    : format(payout.createdAt.toDate(), 'dd/MM/yyyy')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {payout.stripePayoutId && (
                                                        <>
                                                            <DropdownMenuItem asChild>
                                                                <a 
                                                                    href={`https://dashboard.stripe.com/test/payouts/${payout.stripePayoutId}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center"
                                                                >
                                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                                    Voir sur Stripe
                                                                </a>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                        </>
                                                    )}
                                                    
                                                    <DropdownMenuItem 
                                                        disabled={payout.status !== PayoutStatusValues.pending}
                                                        onClick={() => handleApprovePayout(payout.id)}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Approuver
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem 
                                                        disabled={payout.status !== PayoutStatusValues.pending}
                                                        onClick={() => {
                                                            setSelectedPayoutId(payout.id);
                                                            setShowRejectDialog(true);
                                                        }}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Rejeter
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        disabled={payout.status !== PayoutStatusValues.approved}
                                                        onClick={() => handleInitiateStripePayout(payout.id)}
                                                    >
                                                        <DollarSign className="mr-2 h-4 w-4" />
                                                        Initier transfert Stripe
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Load More */}
                    {hasMore && (
                        <div className="flex justify-center mt-6">
                            <Button 
                                onClick={() => fetchPayouts(true)} 
                                disabled={loading}
                                variant="outline"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Chargement...
                                    </>
                                ) : (
                                    'Charger plus'
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reject Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rejeter le payout</AlertDialogTitle>
                        <AlertDialogDescription>
                            Veuillez indiquer la raison du rejet de ce paiement.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        placeholder="Raison du rejet..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setRejectionReason('');
                            setSelectedPayoutId(null);
                        }}>
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleRejectPayout}
                            disabled={!rejectionReason.trim()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Rejeter
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

