'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, DollarSign, TrendingUp, Clock, CheckCircle, Calendar as CalendarIcon, Wallet, CreditCard, Plus } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Payout, PayoutStatus, PayoutStatusValues, BankAccount, formatAmount } from '@/types/payments';
import { collection, query, where, orderBy, limit, getDocs, startAfter, Timestamp, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Analytics {
    totalEarnings: number;
    pendingAmount: number;
    paidThisMonth: number;
    nextPayoutAmount: number;
}

export default function ProPayoutsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('ProDashboard.payouts');
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [analytics, setAnalytics] = useState<Analytics>({
        totalEarnings: 0,
        pendingAmount: 0,
        paidThisMonth: 0,
        nextPayoutAmount: 0,
    });
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'all'>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    // Fetch payouts from Firestore
    const fetchPayouts = async (loadMore = false) => {
        if (!user?.uid) return;
        
        try {
            setLoading(true);
            const payoutsRef = collection(db, 'payouts');
            let q = query(
                payoutsRef, 
                where('professionalId', '==', user.uid),
                orderBy('createdAt', 'desc'), 
                limit(25)
            );

            // Apply filters
            if (statusFilter !== 'all') {
                q = query(
                    payoutsRef, 
                    where('professionalId', '==', user.uid),
                    where('status', '==', statusFilter), 
                    orderBy('createdAt', 'desc'), 
                    limit(25)
                );
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

            const querySnapshot = await getDocs(q);
            const payoutList: Payout[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                payoutList.push({
                    id: doc.id,
                    professionalId: data.professionalId,
                    userId: data.userId,
                    grossAmount: data.grossAmount,
                    platformFee: data.platformFee,
                    netAmount: data.netAmount,
                    currency: data.currency,
                    status: data.status,
                    frequency: data.frequency,
                    bankAccountId: data.bankAccountId,
                    iban: data.iban,
                    bankName: data.bankName,
                    stripePayoutId: data.stripePayoutId,
                    stripeAccountId: data.stripeAccountId,
                    transactionIds: data.transactionIds || [],
                    transactionsCount: data.transactionsCount,
                    approvedBy: data.approvedBy,
                    approvedAt: data.approvedAt,
                    rejectedBy: data.rejectedBy,
                    rejectedAt: data.rejectedAt,
                    rejectionReason: data.rejectionReason,
                    fraudScore: data.fraudScore,
                    fraudFlags: data.fraudFlags,
                    isReviewed: data.isReviewed,
                    reviewedBy: data.reviewedBy,
                    errorCode: data.errorCode,
                    errorMessage: data.errorMessage,
                    failedAt: data.failedAt,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    scheduledAt: data.scheduledAt,
                    processedAt: data.processedAt,
                    paidAt: data.paidAt,
                } as Payout);
            });

            if (loadMore) {
                setPayouts(prev => [...prev, ...payoutList]);
            } else {
                setPayouts(payoutList);
                calculateAnalytics(payoutList);
            }

            setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setHasMore(querySnapshot.docs.length === 25);
        } catch (error) {
            console.error('Error fetching payouts:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les virements.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch bank accounts
    const fetchBankAccounts = async () => {
        if (!user?.uid) return;
        
        try {
            const accountsRef = collection(db, 'bankAccounts');
            const q = query(
                accountsRef,
                where('professionalId', '==', user.uid),
                orderBy('isDefault', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const accountList: BankAccount[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                accountList.push({
                    id: doc.id,
                    userId: data.userId,
                    professionalId: data.professionalId,
                    type: data.type,
                    status: data.status,
                    iban: data.iban,
                    bic: data.bic,
                    accountHolderName: data.accountHolderName,
                    bankName: data.bankName,
                    country: data.country,
                    last4: data.last4,
                    maskedIban: data.maskedIban,
                    stripeBankAccountId: data.stripeBankAccountId,
                    isVerified: data.isVerified,
                    verifiedAt: data.verifiedAt,
                    verificationMethod: data.verificationMethod,
                    isDefault: data.isDefault,
                    metadata: data.metadata,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    lastUsedAt: data.lastUsedAt,
                } as BankAccount);
            });

            setBankAccounts(accountList);
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
        }
    };

    const calculateAnalytics = (payoutList: Payout[]) => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalEarnings = payoutList
            .filter(p => p.status === PayoutStatusValues.paid)
            .reduce((sum, p) => sum + p.netAmount, 0);

        const pendingAmount = payoutList
            .filter(p => p.status === PayoutStatusValues.pending || p.status === PayoutStatusValues.approved)
            .reduce((sum, p) => sum + p.netAmount, 0);

        const paidThisMonth = payoutList
            .filter(p => p.status === PayoutStatusValues.paid && p.paidAt && p.paidAt.toDate() >= startOfMonth)
            .reduce((sum, p) => sum + p.netAmount, 0);

        const nextPayoutAmount = payoutList
            .filter(p => p.status === PayoutStatusValues.approved)
            .reduce((sum, p) => sum + p.netAmount, 0);

        setAnalytics({
            totalEarnings,
            pendingAmount,
            paidThisMonth,
            nextPayoutAmount,
        });
    };

    const filteredPayouts = useMemo(() => {
        return payouts.filter(payout => {
            const matchesSearch = searchTerm ? 
                payout.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                payout.stripePayoutId?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            return matchesSearch;
        });
    }, [payouts, searchTerm]);

    const clearFilters = () => {
        setStatusFilter('all');
        setDateRange(undefined);
        setSearchTerm('');
    };

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.provider))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && user.roles?.includes(UserRole.provider)) {
            fetchPayouts();
            fetchBankAccounts();
        }
    }, [statusFilter, dateRange, user]);

    if (authLoading || loading || !user || !user.roles?.includes(UserRole.provider)) {
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

    const defaultBankAccount = bankAccounts.find(acc => acc.isDefault);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Wallet className="h-8 w-8 text-primary"/>
                    Mes Virements
                </h1>
                <p className="text-muted-foreground">
                    Suivez vos paiements et gérez vos comptes bancaires
                </p>
            </div>

            {/* Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(analytics.totalEarnings)}</div>
                        <p className="text-xs text-muted-foreground">Virements payés</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En attente</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(analytics.pendingAmount)}</div>
                        <p className="text-xs text-muted-foreground">En cours de traitement</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(analytics.paidThisMonth)}</div>
                        <p className="text-xs text-muted-foreground">Reçus ce mois</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Prochain virement</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(analytics.nextPayoutAmount)}</div>
                        <p className="text-xs text-muted-foreground">Approuvés</p>
                    </CardContent>
                </Card>
            </div>

            {/* Bank Account Card */}
            {defaultBankAccount && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Compte bancaire par défaut</CardTitle>
                                <CardDescription>Vos virements seront envoyés sur ce compte</CardDescription>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/settings">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Gérer
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{defaultBankAccount.bankName}</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                    {defaultBankAccount.maskedIban}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {defaultBankAccount.accountHolderName}
                                </p>
                            </div>
                            <Badge variant={defaultBankAccount.isVerified ? "default" : "secondary"}>
                                {defaultBankAccount.isVerified ? "Vérifié" : "En attente"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!defaultBankAccount && (
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle>Aucun compte bancaire</CardTitle>
                        <CardDescription>Ajoutez un compte bancaire pour recevoir vos virements</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/dashboard/settings">
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter un compte
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Payouts Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Historique des virements</CardTitle>
                    <CardDescription>Liste de vos paiements et leur statut</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                placeholder="Rechercher par ID..."
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
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
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
                                <TableHead>Date</TableHead>
                                <TableHead>Montant brut</TableHead>
                                <TableHead>Commission</TableHead>
                                <TableHead>Montant net</TableHead>
                                <TableHead>Transactions</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayouts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        Aucun virement trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPayouts.map((payout) => (
                                    <TableRow key={payout.id}>
                                        <TableCell>
                                            <div className="text-sm">
                                                {payout.paidAt 
                                                    ? format(payout.paidAt.toDate(), 'dd/MM/yyyy')
                                                    : payout.scheduledAt 
                                                    ? format(payout.scheduledAt.toDate(), 'dd/MM/yyyy')
                                                    : format(payout.createdAt.toDate(), 'dd/MM/yyyy')}
                                            </div>
                                            {payout.scheduledAt && !payout.paidAt && (
                                                <div className="text-[10px] text-muted-foreground">
                                                    Prévu: {format(payout.scheduledAt.toDate(), 'dd/MM/yyyy')}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{formatAmount(payout.grossAmount)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-muted-foreground">-{formatAmount(payout.platformFee)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-primary">{formatAmount(payout.netAmount)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{payout.transactionsCount} transaction(s)</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(payout.status)}>
                                                {payout.status}
                                            </Badge>
                                            {payout.rejectionReason && (
                                                <p className="text-xs text-destructive mt-1">
                                                    {payout.rejectionReason}
                                                </p>
                                            )}
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
        </div>
    );
}
