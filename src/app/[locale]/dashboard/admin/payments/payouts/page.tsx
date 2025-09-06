
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, Wallet, MoreHorizontal, ExternalLink } from 'lucide-react';
import { UserRole, PayoutStatus, type Payout } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getPayouts } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const mockPayouts: Payout[] = getPayouts();

export default function AdminPayoutsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminPaymentsPage.payouts');
    
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPayouts = useMemo(() => {
        return mockPayouts.filter(payout => {
            return searchTerm 
                ? payout.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  payout.payoutId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  payout.provider?.profile?.displayName.toLowerCase().includes(searchTerm.toLowerCase())
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
    
    const getStatusVariant = (status: PayoutStatus) => {
        switch (status) {
            case PayoutStatus.paid: return 'default';
            case PayoutStatus.pending:
            case PayoutStatus.in_transit:
                 return 'secondary';
            case PayoutStatus.failed:
            case PayoutStatus.canceled:
                return 'destructive';
            default: return 'outline';
        }
    }

  return (
    <div className="space-y-8">
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
                            <TableHead>{t('table.header.payoutId')}</TableHead>
                            <TableHead>{t('table.header.provider')}</TableHead>
                            <TableHead>{t('table.header.amount')}</TableHead>
                            <TableHead>{t('table.header.status')}</TableHead>
                            <TableHead>{t('table.header.arrivalDate')}</TableHead>
                            <TableHead><span className="sr-only">{t('table.header.actions')}</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayouts.map((payout) => (
                            <TableRow key={payout.id}>
                                <TableCell>
                                    <div className="font-mono text-xs">{payout.payoutId.substring(0,12)}...</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={payout.provider?.profile?.photoUrl} />
                                            <AvatarFallback>{payout.provider?.profile?.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{payout.provider?.profile?.displayName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{(payout.amount / 100).toFixed(2)} {t('currency')}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(payout.status)}>{t(`status.${payout.status}`)}</Badge>
                                </TableCell>
                                <TableCell>{new Date(payout.arrivalDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                             <DropdownMenuItem asChild>
                                                <a href={`https://dashboard.stripe.com/test/payouts/${payout.payoutId}`} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-2"/>
                                                    {t('actions.viewOnStripe')}
                                                </a>
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

    