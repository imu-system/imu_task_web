
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, Wallet, ExternalLink, MoreHorizontal, Eye, Download, Undo2, X, CalendarIcon as CalendarIconLucide, DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Transaction, TransactionStatus, TransactionStatusValues, TransactionType, PaymentMethod, formatAmount } from '@/types/payments';
import { collection, query, where, orderBy, limit, getDocs, startAfter, Timestamp, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';

interface Analytics {
    totalVolume: number;
    totalCount: number;
    successRate: number;
    failedCount: number;
    platformRevenue: number;
    avgAmount: number;
}

export default function AdminTransactionsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminPaymentsPage.transactions');
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [analytics, setAnalytics] = useState<Analytics>({
        totalVolume: 0,
        totalCount: 0,
        successRate: 0,
        failedCount: 0,
        platformRevenue: 0,
        avgAmount: 0,
    });
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [exportDateRange, setExportDateRange] = useState<DateRange | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
    const [dateFilter, setDateFilter] = useState<DateRange | undefined>(undefined);

    // Fetch transactions from Firestore
    const fetchTransactions = async (loadMore = false) => {
        try {
            setLoading(true);
            const transactionsRef = collection(db, 'transactions');
            let q = query(transactionsRef, orderBy('createdAt', 'desc'), limit(25));

            // Apply filters
            if (statusFilter !== 'all') {
                q = query(transactionsRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'), limit(25));
            }
            if (dateFilter?.from) {
                const fromTimestamp = Timestamp.fromDate(dateFilter.from);
                q = query(q, where('createdAt', '>=', fromTimestamp));
            }
            if (dateFilter?.to) {
                const toTimestamp = Timestamp.fromDate(dateFilter.to);
                q = query(q, where('createdAt', '<=', toTimestamp));
            }

            // Pagination
            if (loadMore && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const txData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as Transaction[];

            if (loadMore) {
                setTransactions(prev => [...prev, ...txData]);
            } else {
                setTransactions(txData);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === 25);

            // Calculate analytics
            calculateAnalytics(loadMore ? [...transactions, ...txData] : txData);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les transactions.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = (txs: Transaction[]) => {
        const totalVolume = txs.reduce((sum, tx) => sum + tx.amount, 0);
        const totalCount = txs.length;
        const successCount = txs.filter(tx => tx.status === TransactionStatusValues.succeeded).length;
        const failedCount = txs.filter(tx => tx.status === TransactionStatusValues.failed).length;
        const platformRevenue = txs.reduce((sum, tx) => sum + (tx.platformFee || 0), 0);
        const avgAmount = totalCount > 0 ? totalVolume / totalCount : 0;
        const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

        setAnalytics({
            totalVolume,
            totalCount,
            successRate,
            failedCount,
            platformRevenue,
            avgAmount,
        });
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const matchesSearch = searchTerm ? 
                tx.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                tx.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.stripePaymentIntentId?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            return matchesSearch;
        });
    }, [transactions, searchTerm]);
    
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFilter(undefined);
    }
    
    const handleRefund = async (txId: string) => {
        try {
            const response = await fetch('/api/stripe/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId: txId }),
            });

            if (!response.ok) throw new Error('Refund failed');

            toast({
                title: t('actions.refundDialog.toastSuccessTitle'),
                description: t('actions.refundDialog.toastSuccessDescription', { txId }),
            });

            // Refresh transactions
            fetchTransactions();
        } catch (error) {
            console.error('Error processing refund:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de traiter le remboursement.',
                variant: 'destructive',
            });
        }
    }

    const handleExport = async () => {
        try {
            setLoading(true);
            const transactionsRef = collection(db, 'transactions');
            let q = query(transactionsRef, orderBy('createdAt', 'desc'));

            if (exportDateRange?.from) {
                q = query(q, where('createdAt', '>=', Timestamp.fromDate(exportDateRange.from)));
            }
            if (exportDateRange?.to) {
                q = query(q, where('createdAt', '<=', Timestamp.fromDate(exportDateRange.to)));
            }

            const snapshot = await getDocs(q);
            const allTxs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            })) as Transaction[];

            // Generate CSV
            const headers = ['ID', 'Booking ID', 'Amount', 'Currency', 'Platform Fee', 'Stripe Fee', 'Status', 'Type', 'Method', 'Created At'];
            const rows = allTxs.map(tx => [
                tx.id,
                tx.bookingId || '',
                formatAmount(tx.amount),
                tx.currency,
                formatAmount(tx.platformFee || 0),
                formatAmount(tx.stripeFee || 0),
                tx.status,
                tx.type,
                tx.paymentMethod,
                (tx.createdAt instanceof Date ? tx.createdAt : new Date()).toISOString(),
            ]);

            const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `transactions-${new Date().toISOString()}.csv`;
            link.click();

            toast({
                title: 'Export réussi',
                description: `${allTxs.length} transactions exportées.`,
            });
        } catch (error) {
            console.error('Error exporting:', error);
            toast({
                title: 'Erreur',
                description: "Impossible d'exporter les transactions.",
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user && user.roles?.includes(UserRole.admin)) {
            fetchTransactions();
        }
    }, [statusFilter, dateFilter, authLoading, user]);


    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    if (authLoading || loading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const getStatusVariant = (status: TransactionStatus): "default" | "secondary" | "outline" | "destructive" => {
        switch (status) {
            case TransactionStatusValues.succeeded: return 'default';
            case TransactionStatusValues.pending: return 'secondary';
            case TransactionStatusValues.refunded: return 'outline';
            case TransactionStatusValues.failed:
            case TransactionStatusValues.canceled:
                return 'destructive';
            default: return 'outline';
        }
    }

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                {t('title')}
            </h1>
            <p className="text-muted-foreground">
            {t('subtitle')}
            </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatAmount(analytics.totalVolume)}</div>
                    <p className="text-xs text-muted-foreground">{analytics.totalCount} transactions</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analytics.successRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">{analytics.failedCount} échecs</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenus Plateforme</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatAmount(analytics.platformRevenue)}</div>
                    <p className="text-xs text-muted-foreground">Montant moyen: {formatAmount(analytics.avgAmount)}</p>
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                     <div className="flex-1">
                        <CardTitle>{t('table.title')}</CardTitle>
                        <CardDescription>{t('table.description')}</CardDescription>
                     </div>
                     <div className="flex items-center gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline"><Download className="mr-2"/>{t('actions.export')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('actions.exportDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('actions.exportDialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label>{t('actions.exportDialog.dateRange')}</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIconLucide className="mr-2 h-4 w-4" />
                                                {exportDateRange?.from ? (
                                                exportDateRange.to ? (
                                                    <>
                                                    {format(exportDateRange.from, "LLL dd, y")} -{" "}
                                                    {format(exportDateRange.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(exportDateRange.from, "LLL dd, y")
                                                )
                                                ) : (
                                                <span>{t('filters.pickDate')}</span>
                                                )}
                                            </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={exportDateRange?.from}
                                                selected={exportDateRange}
                                                onSelect={setExportDateRange}
                                                numberOfMonths={2}
                                            />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="format">{t('actions.exportDialog.format')}</Label>
                                        <Select defaultValue="csv">
                                            <SelectTrigger id="format"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="csv">CSV</SelectItem>
                                                <SelectItem value="pdf">PDF</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="include-invoices"/>
                                        <Label htmlFor="include-invoices">{t('actions.exportDialog.includeInvoices')}</Label>
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('actions.exportDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleExport}>{t('actions.exportDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <Input 
                        placeholder={t('filters.searchPlaceholder')} 
                        className="max-w-xs"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TransactionStatus | 'all')}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('filters.status')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                            {Object.values(TransactionStatusValues).map(status => (
                                <SelectItem key={status} value={status}>{t(`status.${status}`)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className="w-[300px] justify-start text-left font-normal"
                        >
                            <CalendarIconLucide className="mr-2 h-4 w-4" />
                            {dateFilter?.from ? (
                            dateFilter.to ? (
                                <>
                                {format(dateFilter.from, "LLL dd, y")} -{" "}
                                {format(dateFilter.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateFilter.from, "LLL dd, y")
                            )
                            ) : (
                            <span>{t('filters.pickDate')}</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateFilter?.from}
                            selected={dateFilter}
                            onSelect={setDateFilter}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                    <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                        <X className="mr-2"/>
                        {t('filters.clear')}
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.header.transactionId')}</TableHead>
                            <TableHead>{t('table.header.booking')}</TableHead>
                            <TableHead>{t('table.header.amount')}</TableHead>
                            <TableHead>{t('table.header.fees')}</TableHead>
                            <TableHead>{t('table.header.status')}</TableHead>
                            <TableHead>{t('table.header.date')}</TableHead>
                            <TableHead><span className="sr-only">{t('table.header.actions')}</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell>
                                    <div className="font-mono text-xs">{tx.id.substring(0,12)}...</div>
                                </TableCell>
                                <TableCell>
                                    <Button variant="link" asChild className="p-0 h-auto">
                                        <Link href={`/dashboard/admin/bookings/${tx.bookingId}` as any}>{tx.bookingId}</Link>
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{formatAmount(tx.amount)}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <div>{t('table.feesPlatform')}: {formatAmount(tx.platformFee || 0)}</div>
                                        <div className="text-muted-foreground">{t('table.feesStripe')}: {formatAmount(tx.stripeFee || 0)}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(tx.status)}>{t(`status.${tx.status}`)}</Badge>
                                </TableCell>
                                <TableCell>
                                    {tx.createdAt instanceof Date 
                                        ? tx.createdAt.toLocaleString() 
                                        : tx.createdAt.toDate ? tx.createdAt.toDate().toLocaleString() : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                             <DropdownMenuItem asChild>
                                                <a href={`https://dashboard.stripe.com/test/payments/${tx.id}`} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-2"/>
                                                    {t('actions.viewOnStripe')}
                                                </a>
                                             </DropdownMenuItem>
                                             <DropdownMenuSeparator/>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={tx.status !== TransactionStatusValues.succeeded}>
                                                        <Undo2 className="mr-2"/>
                                                        {t('actions.refund')}
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('actions.refundDialog.title')}</AlertDialogTitle>
                                                        <AlertDialogDescription>{t('actions.refundDialog.description', { amount: formatAmount(tx.amount) })}</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="refund-amount">{t('actions.refundDialog.amountLabel')}</Label>
                                                            <Input id="refund-amount" type="number" defaultValue={(tx.amount / 100).toFixed(2)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="refund-reason">{t('actions.refundDialog.reasonLabel')}</Label>
                                                            <Select defaultValue="client_request">
                                                                <SelectTrigger id="refund-reason"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="client_request">{t('actions.refundDialog.reasons.clientRequest')}</SelectItem>
                                                                    <SelectItem value="goodwill">{t('actions.refundDialog.reasons.goodwill')}</SelectItem>
                                                                    <SelectItem value="dispute">{t('actions.refundDialog.reasons.dispute')}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                         <div className="space-y-2">
                                                            <Label htmlFor="refund-note">{t('actions.refundDialog.noteLabel')}</Label>
                                                            <Textarea id="refund-note" placeholder={t('actions.refundDialog.notePlaceholder')} />
                                                        </div>
                                                    </div>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{t('actions.refundDialog.cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRefund(tx.id)}>{t('actions.refundDialog.confirm')}</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                             </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {hasMore && (
                    <div className="mt-4 flex justify-center">
                        <Button 
                            variant="outline" 
                            onClick={() => fetchTransactions(true)}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Charger plus
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}



    

    
