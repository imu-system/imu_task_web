
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, ArrowLeft, Download, Banknote, Calendar as CalendarIcon, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const mockPayouts = [
    { id: 'po_1', date: new Date('2025-09-01'), amount: 50.00, status: 'paid', provider: 'Stripe' },
    { id: 'po_2', date: new Date('2025-08-15'), amount: 120.00, status: 'in_progress', provider: 'Paypal' },
    { id: 'po_3', date: new Date('2025-07-30'), amount: 75.50, status: 'paid', provider: 'Stripe' },
    { id: 'po_4', date: new Date('2025-07-15'), amount: 90.00, status: 'failed', provider: 'Stripe' },
];

export default function PayoutsPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('PayoutsPage');

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const getStatusVariant = (status: string) => {
        switch(status) {
            case 'paid': return 'default';
            case 'in_progress': return 'secondary';
            case 'failed': return 'destructive';
            default: return 'outline';
        }
    }

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'paid': return <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />;
            case 'in_progress': return <Clock className="h-4 w-4 mr-2 text-yellow-500" />;
            case 'failed': return <AlertCircle className="h-4 w-4 mr-2 text-red-500" />;
            default: return null;
        }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/wallet">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Download className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('schedule.title')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{t('schedule.nextPayout')}</p>
                        <p className="text-xl font-semibold flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-primary"/>
                            18 sept. 2025 (via Stripe)
                        </p>
                    </div>
                    <Separator orientation="vertical" className="h-12 hidden md:block"/>
                    <div className="space-y-1 md:text-right">
                        <p className="text-sm text-muted-foreground">{t('schedule.amount')}</p>
                        <p className="text-xl font-semibold flex items-center gap-2">
                             <Banknote className="h-5 w-5 text-primary"/>
                            75,00 €
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('history.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('history.table.date')}</TableHead>
                                <TableHead>{t('history.table.amount')}</TableHead>
                                <TableHead>{t('history.table.status')}</TableHead>
                                <TableHead>{t('history.table.provider')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockPayouts.map((payout) => (
                                <TableRow key={payout.id}>
                                    <TableCell>{payout.date.toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{payout.amount.toFixed(2)} €</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(payout.status)} className="flex items-center w-fit">
                                            {getStatusIcon(payout.status)}
                                            {t(`history.status.${payout.status}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{payout.provider}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <div className="flex justify-center">
                <Button size="lg" disabled={user.kycStatus !== 'approved'}>
                    <Banknote className="mr-2"/>
                    {t('requestPayout')}
                </Button>
            </div>
             {user.kycStatus !== 'approved' && (
                <p className="text-center text-sm text-muted-foreground">
                    {t('kycRequired')} <Link href="/dashboard/profile" className="underline text-primary">Vérifiez votre identité</Link>.
                </p>
            )}

        </div>
    );
}
