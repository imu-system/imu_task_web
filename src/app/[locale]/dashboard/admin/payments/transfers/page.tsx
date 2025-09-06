
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, MoreHorizontal, ExternalLink } from 'lucide-react';
import { UserRole, TransferStatus, type Transfer } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getTransfers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const mockTransfers: Transfer[] = getTransfers();

export default function AdminTransfersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminPaymentsPage.transfers');
    
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTransfers = useMemo(() => {
        return mockTransfers.filter(tr => {
            return searchTerm 
                ? tr.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  tr.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  tr.provider?.profile?.displayName.toLowerCase().includes(searchTerm.toLowerCase())
                : true;
        });
    }, [searchTerm]);

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
    
    const getStatusVariant = (status: TransferStatus) => {
        switch (status) {
            case TransferStatus.succeeded: return 'default';
            case TransferStatus.pending: return 'secondary';
            case TransferStatus.failed:
            case TransferStatus.canceled:
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
        
        <Card>
            <CardHeader>
                <CardTitle>{t('table.title')}</CardTitle>
                <CardDescription>{t('table.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center py-4">
                    <Input
                        placeholder={t('filters.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.header.transferId')}</TableHead>
                            <TableHead>{t('table.header.booking')}</TableHead>
                            <TableHead>{t('table.header.provider')}</TableHead>
                            <TableHead>{t('table.header.amount')}</TableHead>
                            <TableHead>{t('table.header.status')}</TableHead>
                            <TableHead>{t('table.header.date')}</TableHead>
                            <TableHead><span className="sr-only">{t('table.header.actions')}</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransfers.map((tr) => (
                            <TableRow key={tr.id}>
                                <TableCell>
                                    <div className="font-mono text-xs">{tr.id.substring(0,12)}...</div>
                                </TableCell>
                                <TableCell>
                                    <Button variant="link" asChild className="p-0 h-auto">
                                        <Link href={`/dashboard/admin/bookings/${tr.bookingId}`}>{tr.bookingId}</Link>
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={tr.provider?.profile?.photoUrl} />
                                            <AvatarFallback>{tr.provider?.profile?.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{tr.provider?.profile?.displayName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{(tr.amount / 100).toFixed(2)} {t('currency')}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(tr.status)}>{t(`status.${tr.status}`)}</Badge>
                                </TableCell>
                                <TableCell>{new Date(tr.createdAt).toLocaleString()}</TableCell>
                                <TableCell>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                             <DropdownMenuItem asChild>
                                                <Link href={`https://dashboard.stripe.com/test/transfers/${tr.transferId}`} target="_blank">
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
