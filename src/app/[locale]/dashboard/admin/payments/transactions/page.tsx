
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, Wallet, ExternalLink, MoreHorizontal, Eye } from 'lucide-react';
import { UserRole, PaymentStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
    
    const [transactions, setTransactions] = useState(mockTransactions);
    const [loading, setLoading] = useState(false);

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
                <CardTitle>{t('table.title')}</CardTitle>
                <CardDescription>{t('table.description')}</CardDescription>
            </CardHeader>
            <CardContent>
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
                        {transactions.map((tx) => (
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
