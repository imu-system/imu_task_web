
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, Wallet, ExternalLink, MoreHorizontal, Eye, Download, Undo2, X, CalendarIcon } from 'lucide-react';
import { UserRole, PaymentStatus } from '@/lib/types';
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
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';


const mockTransactions = [
    { id: 'pi_3PjY3fLqgLzJ7fV01Z6A3f9a', bookingId: 'booking1', amount: 2000, currency: 'eur', feesPlatform: 200, feesStripe: 85, status: PaymentStatus.authorized, createdAt: '2024-08-17T10:00:00Z' },
    { id: 'pi_3PjY4oLqgLzJ7fV01A4B9c8d', bookingId: 'booking2', amount: 1500, currency: 'eur', feesPlatform: 150, feesStripe: 70, status: PaymentStatus.captured, createdAt: '2024-08-19T14:00:00Z' },
    { id: 'pi_3PkZ5tLqgLzJ7fV01B5C6d7e', bookingId: 'booking3', amount: 3500, currency: 'eur', feesPlatform: 350, feesStripe: 120, status: PaymentStatus.captured, createdAt: '2024-08-21T11:00:00Z' },
    { id: 'pi_3PlA6uLqgLzJ7fV01C6D7e8f', bookingId: 'booking4', amount: 5000, currency: 'eur', feesPlatform: 500, feesStripe: 150, status: PaymentStatus.refunded, createdAt: '2024-08-22T16:30:00Z' },
    { id: 'pi_3PmB7vLqgLzJ7fV01D7E8f9g', bookingId: 'booking5', amount: 1000, currency: 'eur', feesPlatform: 100, feesStripe: 65, status: PaymentStatus.failed, createdAt: '2024-08-23T09:00:00Z' },
];

export default function AdminTransactionsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminPaymentsPage.transactions');
    
    const [loading, setLoading] = useState(false);
    const [exportDate, setExportDate] = useState<Date | undefined>(undefined);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
    const [dateFilter, setDateFilter] = useState<DateRange | undefined>({
      from: subDays(new Date(), 30),
      to: new Date(),
    });

    const filteredTransactions = useMemo(() => {
        return mockTransactions.filter(tx => {
            const txDate = new Date(tx.createdAt);
            const matchesSearch = searchTerm ? tx.id.includes(searchTerm) || tx.bookingId.includes(searchTerm) : true;
            const matchesStatus = statusFilter !== 'all' ? tx.status === statusFilter : true;
            const matchesDate = dateFilter?.from && dateFilter?.to ? (txDate >= dateFilter.from && txDate <= dateFilter.to) : true;

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [searchTerm, statusFilter, dateFilter]);
    
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFilter(undefined);
    }


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
    
    const getStatusVariant = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.captured: return 'default';
            case PaymentStatus.authorized: return 'secondary';
            case PaymentStatus.refunded: return 'outline';
            case PaymentStatus.failed:
            case PaymentStatus.canceled:
                return 'destructive';
            default: return 'outline';
        }
    }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                <Wallet className="h-8 w-8 text-primary"/>
                {t('title')}
            </h1>
            <p className="text-muted-foreground">
            {t('subtitle')}
            </p>
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t('actions.exportDialog.dateFrom')}</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start">
                                                        {exportDate ? format(exportDate, 'PPP') : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={exportDate} onSelect={setExportDate} />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('actions.exportDialog.dateTo')}</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start">
                                                        {exportDate ? format(exportDate, 'PPP') : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={exportDate} onSelect={setExportDate} />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
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
                                    <AlertDialogAction>{t('actions.exportDialog.confirm')}</AlertDialogAction>
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
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaymentStatus | 'all')}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('filters.status')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                            {Object.values(PaymentStatus).map(status => (
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
                            <CalendarIcon className="mr-2 h-4 w-4" />
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
                                        <Link href={`/dashboard/admin/bookings/${tx.bookingId}`}>{tx.bookingId}</Link>
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{(tx.amount / 100).toFixed(2)} {t('currency')}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <div>{t('table.feesPlatform')}: {(tx.feesPlatform / 100).toFixed(2)} {t('currency')}</div>
                                        <div className="text-muted-foreground">{t('table.feesStripe')}: {(tx.feesStripe / 100).toFixed(2)} {t('currency')}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(tx.status)}>{t(`status.${tx.status}`)}</Badge>
                                </TableCell>
                                <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                             <DropdownMenuItem asChild>
                                                <Link href={`https://dashboard.stripe.com/test/payments/${tx.id}`} target="_blank">
                                                    <ExternalLink className="mr-2"/>
                                                    {t('actions.viewOnStripe')}
                                                </Link>
                                             </DropdownMenuItem>
                                             <DropdownMenuSeparator/>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Undo2 className="mr-2"/>
                                                        {t('actions.refund')}
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('actions.refundDialog.title')}</AlertDialogTitle>
                                                        <AlertDialogDescription>{t('actions.refundDialog.description', { amount: (tx.amount / 100).toFixed(2) })}</AlertDialogDescription>
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
                                                        <AlertDialogAction>{t('actions.refundDialog.confirm')}</AlertDialogAction>
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
            </CardContent>
        </Card>
    </div>
  );
}
