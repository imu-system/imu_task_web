'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, DollarSign, CheckCircle, XCircle, MoreHorizontal, Eye, Clock, Shield, Calendar as CalendarIcon } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { BankAccount, BankAccountStatus, BankAccountStatusValues } from '@/types/payments';
import { collection, query, where, orderBy, limit, getDocs, startAfter, Timestamp, QueryDocumentSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';

interface Analytics {
    totalAccounts: number;
    pendingCount: number;
    verifiedCount: number;
    failedCount: number;
}

export default function AdminBankAccountsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminPaymentsPage.bankAccounts');
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [analytics, setAnalytics] = useState<Analytics>({
        totalAccounts: 0,
        pendingCount: 0,
        verifiedCount: 0,
        failedCount: 0,
    });
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<BankAccountStatus | 'all'>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    // Fetch bank accounts from Firestore
    const fetchAccounts = async (loadMore = false) => {
        try {
            setLoading(true);
            const accountsRef = collection(db, 'bankAccounts');
            let q = query(accountsRef, orderBy('createdAt', 'desc'), limit(25));

            // Apply filters
            if (statusFilter !== 'all') {
                q = query(accountsRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'), limit(25));
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

            if (loadMore) {
                setAccounts(prev => [...prev, ...accountList]);
            } else {
                setAccounts(accountList);
                calculateAnalytics(accountList);
            }

            setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setHasMore(querySnapshot.docs.length === 25);
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les comptes bancaires.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = (accountList: BankAccount[]) => {
        const totalAccounts = accountList.length;
        const pendingCount = accountList.filter(a => a.status === BankAccountStatusValues.pending).length;
        const verifiedCount = accountList.filter(a => a.status === BankAccountStatusValues.verified).length;
        const failedCount = accountList.filter(a => a.status === BankAccountStatusValues.failed).length;

        setAnalytics({
            totalAccounts,
            pendingCount,
            verifiedCount,
            failedCount,
        });
    };

    const filteredAccounts = useMemo(() => {
        return accounts.filter(account => {
            const matchesSearch = searchTerm ? 
                account.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                account.accountHolderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.last4.includes(searchTerm) : true;
            return matchesSearch;
        });
    }, [accounts, searchTerm]);

    const clearFilters = () => {
        setStatusFilter('all');
        setDateRange(undefined);
        setSearchTerm('');
    };

    const handleApproveAccount = async (accountId: string) => {
        if (!user) return;
        
        try {
            const accountRef = doc(db, 'bankAccounts', accountId);
            await updateDoc(accountRef, {
                status: BankAccountStatusValues.verified,
                isVerified: true,
                verifiedAt: Timestamp.now(),
                verificationMethod: 'manual',
                updatedAt: Timestamp.now(),
            });
            
            toast({
                title: "Compte approuvé",
                description: "Le compte bancaire a été vérifié avec succès.",
            });
            
            // Refresh list
            fetchAccounts();
        } catch (error) {
            console.error('Error approving account:', error);
            toast({
                title: "Erreur",
                description: "Impossible d'approuver le compte.",
                variant: "destructive",
            });
        }
    };

    const handleRejectAccount = async () => {
        if (!user || !selectedAccountId || !rejectionReason.trim()) {
            toast({
                title: "Erreur",
                description: "Veuillez fournir une raison de rejet.",
                variant: "destructive",
            });
            return;
        }
        
        try {
            const accountRef = doc(db, 'bankAccounts', selectedAccountId);
            await updateDoc(accountRef, {
                status: BankAccountStatusValues.failed,
                isVerified: false,
                metadata: {
                    rejectionReason: rejectionReason,
                    rejectedBy: user.uid,
                    rejectedAt: new Date().toISOString(),
                },
                updatedAt: Timestamp.now(),
            });
            
            toast({
                title: "Compte rejeté",
                description: "Le compte bancaire a été rejeté.",
            });
            
            setShowRejectDialog(false);
            setRejectionReason('');
            setSelectedAccountId(null);
            
            // Refresh list
            fetchAccounts();
        } catch (error) {
            console.error('Error rejecting account:', error);
            toast({
                title: "Erreur",
                description: "Impossible de rejeter le compte.",
                variant: "destructive",
            });
        }
    };

    const handleRevealIban = async (accountId: string) => {
        // Note: IBAN decryption requires a user-specific key derived from their password
        // For admin purposes, we display a message instead
        toast({
            title: "IBAN chiffré",
            description: "Les IBANs sont stockés chiffrés. Consultez Stripe pour les détails complets du compte.",
        });
    };

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && user.roles?.includes(UserRole.admin)) {
            fetchAccounts();
        }
    }, [statusFilter, dateRange]);

    if (authLoading || loading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const getStatusVariant = (status: BankAccountStatus): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case BankAccountStatusValues.verified: 
                return 'default';
            case BankAccountStatusValues.pending:
                return 'secondary';
            case BankAccountStatusValues.failed:
            case BankAccountStatusValues.disabled:
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
                    <Shield className="h-8 w-8 text-primary"/>
                    Comptes Bancaires
                </h1>
                <p className="text-muted-foreground">
                    Gestion et validation des comptes bancaires
                </p>
            </div>

            {/* Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Comptes</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalAccounts}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En attente</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.pendingCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vérifiés</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.verifiedCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Échoués</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.failedCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Liste des comptes bancaires</CardTitle>
                    <CardDescription>Validez ou rejetez les comptes bancaires enregistrés</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                placeholder="Rechercher par titulaire, banque, IBAN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BankAccountStatus | 'all')}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value={BankAccountStatusValues.pending}>En attente</SelectItem>
                                    <SelectItem value={BankAccountStatusValues.verified}>Vérifié</SelectItem>
                                    <SelectItem value={BankAccountStatusValues.failed}>Échoué</SelectItem>
                                    <SelectItem value={BankAccountStatusValues.disabled}>Désactivé</SelectItem>
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
                                <TableHead>Titulaire</TableHead>
                                <TableHead>Banque</TableHead>
                                <TableHead>IBAN</TableHead>
                                <TableHead>Pays</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Date création</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAccounts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        Aucun compte bancaire trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAccounts.map((account) => (
                                    <TableRow key={account.id}>
                                        <TableCell>
                                            <div className="font-medium">{account.accountHolderName}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {account.professionalId ? 'Professionnel' : 'Particulier'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{account.bankName}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs">{account.maskedIban}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => handleRevealIban(account.id)}
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                Derniers chiffres: {account.last4}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{account.country}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(account.status)}>
                                                {account.status}
                                            </Badge>
                                            {account.isDefault && (
                                                <Badge variant="outline" className="ml-1 text-[10px]">
                                                    Défaut
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {format(account.createdAt.toDate(), 'dd/MM/yyyy')}
                                            </div>
                                            {account.verifiedAt && (
                                                <div className="text-[10px] text-muted-foreground">
                                                    Vérifié: {format(account.verifiedAt.toDate(), 'dd/MM/yyyy')}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem 
                                                        disabled={account.status !== BankAccountStatusValues.pending}
                                                        onClick={() => handleApproveAccount(account.id)}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Approuver
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem 
                                                        disabled={account.status !== BankAccountStatusValues.pending}
                                                        onClick={() => {
                                                            setSelectedAccountId(account.id);
                                                            setShowRejectDialog(true);
                                                        }}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Rejeter
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
                                onClick={() => fetchAccounts(true)} 
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
                        <AlertDialogTitle>Rejeter le compte bancaire</AlertDialogTitle>
                        <AlertDialogDescription>
                            Veuillez indiquer la raison du rejet de ce compte bancaire.
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
                            setSelectedAccountId(null);
                        }}>
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleRejectAccount}
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
