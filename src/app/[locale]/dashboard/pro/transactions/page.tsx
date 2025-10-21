'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, DollarSign, TrendingUp, Calendar as CalendarIcon, Download, FileText, Receipt } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Transaction, TransactionStatus, TransactionStatusValues, formatAmount } from '@/types/payments';
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

interface Analytics {
    totalRevenue: number;
    revenueThisMonth: number;
    totalCommission: number;
    netEarnings: number;
}

export default function ProTransactionsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('ProDashboard.transactions');
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [analytics, setAnalytics] = useState<Analytics>({
        totalRevenue: 0,
        revenueThisMonth: 0,
        totalCommission: 0,
        netEarnings: 0,
    });
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [exportLoading, setExportLoading] = useState(false);

    // Fetch transactions from Firestore
    const fetchTransactions = async (loadMore = false) => {
        if (!user?.uid) return;
        
        try {
            setLoading(true);
            const transactionsRef = collection(db, 'transactions');
            let q = query(
                transactionsRef, 
                where('professionalId', '==', user.uid),
                orderBy('createdAt', 'desc'), 
                limit(25)
            );

            // Apply filters
            if (statusFilter !== 'all') {
                q = query(
                    transactionsRef, 
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
            const transactionList: Transaction[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                transactionList.push({
                    id: doc.id,
                    userId: data.userId,
                    professionalId: data.professionalId,
                    bookingId: data.bookingId,
                    quoteId: data.quoteId,
                    invoiceId: data.invoiceId,
                    amount: data.amount,
                    currency: data.currency,
                    status: data.status,
                    type: data.type,
                    paymentMethod: data.paymentMethod,
                    description: data.description,
                    stripePaymentIntentId: data.stripePaymentIntentId,
                    stripeChargeId: data.stripeChargeId,
                    stripeTransferId: data.stripeTransferId,
                    stripePayoutId: data.stripePayoutId,
                    platformFee: data.platformFee,
                    stripeFee: data.stripeFee,
                    netAmount: data.netAmount,
                    fromUserId: data.fromUserId,
                    toUserId: data.toUserId,
                    errorCode: data.errorCode,
                    errorMessage: data.errorMessage,
                    refundedAmount: data.refundedAmount,
                    refundReason: data.refundReason,
                    parentTransactionId: data.parentTransactionId,
                    metadata: data.metadata,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    processedAt: data.processedAt,
                    failedAt: data.failedAt,
                    refundedAt: data.refundedAt,
                } as Transaction);
            });

            if (loadMore) {
                setTransactions(prev => [...prev, ...transactionList]);
            } else {
                setTransactions(transactionList);
                calculateAnalytics(transactionList);
            }

            setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setHasMore(querySnapshot.docs.length === 25);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les transactions.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = (transactionList: Transaction[]) => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const completedTransactions = transactionList.filter(t => 
            t.status === TransactionStatusValues.succeeded
        );

        const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        const revenueThisMonth = completedTransactions
            .filter(t => t.processedAt && t.processedAt.toDate() >= startOfMonth)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalCommission = completedTransactions.reduce((sum, t) => sum + (t.platformFee || 0), 0);
        
        const netEarnings = completedTransactions.reduce((sum, t) => sum + (t.netAmount || t.amount - (t.platformFee || 0)), 0);

        setAnalytics({
            totalRevenue,
            revenueThisMonth,
            totalCommission,
            netEarnings,
        });
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            const matchesSearch = searchTerm ? 
                transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            return matchesSearch;
        });
    }, [transactions, searchTerm]);

    const clearFilters = () => {
        setStatusFilter('all');
        setDateRange(undefined);
        setSearchTerm('');
    };

    const handleExportCSV = () => {
        setExportLoading(true);
        try {
            // Prepare CSV data
            const headers = ['Date', 'ID Transaction', 'Client', 'Montant', 'Commission', 'Net', 'Statut', 'Type'];
            const rows = filteredTransactions.map(t => [
                t.createdAt.toDate().toLocaleDateString(),
                t.id,
                t.description || t.bookingId || 'N/A',
                formatAmount(t.amount),
                formatAmount(t.platformFee || 0),
                formatAmount(t.netAmount || t.amount - (t.platformFee || 0)),
                t.status,
                t.type,
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Export réussi",
                description: "Les transactions ont été exportées en CSV.",
            });
        } catch (error) {
            console.error('Error exporting CSV:', error);
            toast({
                title: "Erreur",
                description: "Impossible d'exporter les transactions.",
                variant: "destructive",
            });
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportPDF = () => {
        toast({
            title: "Bientôt disponible",
            description: "L'export PDF sera disponible prochainement.",
        });
    };

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.provider))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && user.roles?.includes(UserRole.provider)) {
            fetchTransactions();
        }
    }, [statusFilter, dateRange, user]);

    if (authLoading || loading || !user || !user.roles?.includes(UserRole.provider)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const getStatusVariant = (status: TransactionStatus): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case TransactionStatusValues.succeeded: 
                return 'default';
            case TransactionStatusValues.pending:
            case TransactionStatusValues.processing:
                return 'secondary';
            case TransactionStatusValues.failed:
            case TransactionStatusValues.canceled:
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
                    <Receipt className="h-8 w-8 text-primary"/>
                    Mes Transactions
                </h1>
                <p className="text-muted-foreground">
                    Consultez vos revenus et exportez vos données
                </p>
            </div>

            {/* Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenu total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(analytics.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Transactions complétées</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(analytics.revenueThisMonth)}</div>
                        <p className="text-xs text-muted-foreground">Revenus du mois</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commission totale</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">-{formatAmount(analytics.totalCommission)}</div>
                        <p className="text-xs text-muted-foreground">Frais plateforme</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gains nets</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{formatAmount(analytics.netEarnings)}</div>
                        <p className="text-xs text-muted-foreground">Après commission</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Historique des transactions</CardTitle>
                            <CardDescription>Liste de vos paiements reçus</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={handleExportCSV}
                                disabled={exportLoading || filteredTransactions.length === 0}
                            >
                                {exportLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                )}
                                CSV
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={handleExportPDF}
                                disabled={filteredTransactions.length === 0}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                placeholder="Rechercher par ID, client..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TransactionStatus | 'all')}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value={TransactionStatusValues.succeeded}>Réussie</SelectItem>
                                    <SelectItem value={TransactionStatusValues.pending}>En attente</SelectItem>
                                    <SelectItem value={TransactionStatusValues.processing}>En cours</SelectItem>
                                    <SelectItem value={TransactionStatusValues.failed}>Échouée</SelectItem>
                                    <SelectItem value={TransactionStatusValues.canceled}>Annulée</SelectItem>
                                    <SelectItem value={TransactionStatusValues.refunded}>Remboursée</SelectItem>
                                    <SelectItem value={TransactionStatusValues.partially_refunded}>Partiellement remboursée</SelectItem>
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
                                <TableHead>Client</TableHead>
                                <TableHead>Réservation</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Commission</TableHead>
                                <TableHead>Net</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                        Aucune transaction trouvée
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            <div className="text-sm">
                                                {format(transaction.createdAt.toDate(), 'dd/MM/yyyy')}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {format(transaction.createdAt.toDate(), 'HH:mm')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">
                                                {transaction.userId}
                                            </div>
                                            {transaction.description && (
                                                <div className="text-[10px] text-muted-foreground">
                                                    {transaction.description}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.bookingId ? (
                                                <div className="text-sm text-primary">
                                                    #{transaction.bookingId.substring(0, 8)}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{formatAmount(transaction.amount)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-muted-foreground">
                                                -{formatAmount(transaction.platformFee || 0)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-primary">
                                                {formatAmount(transaction.netAmount || transaction.amount - (transaction.platformFee || 0))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(transaction.status)}>
                                                {transaction.status}
                                            </Badge>
                                            {transaction.refundedAt && (
                                                <div className="text-[10px] text-destructive mt-1">
                                                    Remboursée: {formatAmount(transaction.refundedAmount || 0)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.invoiceId && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    title="Voir la facture"
                                                >
                                                    <Receipt className="h-4 w-4" />
                                                </Button>
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
                                onClick={() => fetchTransactions(true)} 
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
