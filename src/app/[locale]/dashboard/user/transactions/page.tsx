'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, DollarSign, TrendingDown, Calendar as CalendarIcon, CreditCard, Receipt, Download } from 'lucide-react';
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
    totalSpent: number;
    spentThisMonth: number;
    transactionCount: number;
    avgTransactionAmount: number;
}

export default function UserTransactionsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('UserDashboard.transactions');
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [analytics, setAnalytics] = useState<Analytics>({
        totalSpent: 0,
        spentThisMonth: 0,
        transactionCount: 0,
        avgTransactionAmount: 0,
    });
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    // Fetch transactions from Firestore
    const fetchTransactions = async (loadMore = false) => {
        if (!user?.uid) return;
        
        try {
            setLoading(true);
            const transactionsRef = collection(db, 'transactions');
            let q = query(
                transactionsRef, 
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'), 
                limit(25)
            );

            // Apply filters
            if (statusFilter !== 'all') {
                q = query(
                    transactionsRef, 
                    where('userId', '==', user.uid),
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

        // Only count payment type transactions (not refunds)
        const paymentTransactions = transactionList.filter(t => 
            t.type === 'payment' && (t.status === TransactionStatusValues.succeeded || t.status === TransactionStatusValues.processing)
        );

        const totalSpent = paymentTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        const spentThisMonth = paymentTransactions
            .filter(t => t.createdAt.toDate() >= startOfMonth)
            .reduce((sum, t) => sum + t.amount, 0);

        const transactionCount = paymentTransactions.length;
        
        const avgTransactionAmount = transactionCount > 0 ? totalSpent / transactionCount : 0;

        setAnalytics({
            totalSpent,
            spentThisMonth,
            transactionCount,
            avgTransactionAmount,
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

    const handleDownloadReceipt = async (transactionId: string) => {
        try {
            // Placeholder for receipt download
            // In production, this would call a backend API to generate PDF receipt
            toast({
                title: "Reçu disponible",
                description: "Le téléchargement du reçu sera bientôt disponible.",
            });
        } catch (error) {
            console.error('Error downloading receipt:', error);
            toast({
                title: "Erreur",
                description: "Impossible de télécharger le reçu.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (user) {
            fetchTransactions();
        }
    }, [statusFilter, dateRange, user]);

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        router.push('/sign-in');
        return null;
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
            case TransactionStatusValues.refunded:
            case TransactionStatusValues.partially_refunded:
                return 'outline';
            default: 
                return 'outline';
        }
    };

    const getStatusLabel = (status: TransactionStatus): string => {
        switch (status) {
            case TransactionStatusValues.succeeded: 
                return 'Réussie';
            case TransactionStatusValues.pending:
                return 'En attente';
            case TransactionStatusValues.processing:
                return 'En cours';
            case TransactionStatusValues.failed:
                return 'Échouée';
            case TransactionStatusValues.canceled:
                return 'Annulée';
            case TransactionStatusValues.refunded:
                return 'Remboursée';
            case TransactionStatusValues.partially_refunded:
                return 'Partiellement remboursée';
            default: 
                return status;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <CreditCard className="h-8 w-8 text-primary"/>
                    Mes Paiements
                </h1>
                <p className="text-muted-foreground">
                    Consultez votre historique de transactions et téléchargez vos reçus
                </p>
            </div>

            {/* Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total dépensé</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(analytics.totalSpent)}</div>
                        <p className="text-xs text-muted-foreground">{analytics.transactionCount} transaction(s)</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(analytics.spentThisMonth)}</div>
                        <p className="text-xs text-muted-foreground">Dépenses du mois</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.transactionCount}</div>
                        <p className="text-xs text-muted-foreground">Paiements effectués</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Montant moyen</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(analytics.avgTransactionAmount)}</div>
                        <p className="text-xs text-muted-foreground">Par transaction</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Historique des paiements</CardTitle>
                            <CardDescription>Liste de vos transactions</CardDescription>
                        </div>
                        <Button 
                            variant="outline"
                            onClick={() => toast({
                                title: "Bientôt disponible",
                                description: "L'export sera disponible prochainement.",
                            })}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Exporter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                placeholder="Rechercher par ID, description..."
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
                                <TableHead>Description</TableHead>
                                <TableHead>Réservation</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Méthode</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Reçu</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
                                            <div className="text-sm font-medium max-w-[200px] truncate">
                                                {transaction.description || 'Paiement'}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                ID: {transaction.id.substring(0, 8)}...
                                            </div>
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
                                            <div className="font-medium">
                                                {transaction.type === 'refund' ? '-' : ''}
                                                {formatAmount(transaction.amount)}
                                            </div>
                                            {transaction.refundedAt && transaction.refundedAmount && (
                                                <div className="text-[10px] text-destructive">
                                                    Remboursé: {formatAmount(transaction.refundedAmount)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm capitalize">
                                                {transaction.paymentMethod === 'card' ? 'Carte' :
                                                 transaction.paymentMethod === 'bank_transfer' ? 'Virement' :
                                                 transaction.paymentMethod === 'wallet' ? 'Portefeuille' :
                                                 transaction.paymentMethod}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(transaction.status)}>
                                                {getStatusLabel(transaction.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {(transaction.status === TransactionStatusValues.succeeded || 
                                              transaction.status === TransactionStatusValues.refunded) && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleDownloadReceipt(transaction.id)}
                                                    title="Télécharger le reçu"
                                                >
                                                    <Download className="h-4 w-4" />
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
