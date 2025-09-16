
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Loader2, Wallet, ArrowDownCircle, FileText } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/navigation';

export default function WalletPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('WalletPage');

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    const isProvider = user.roles.includes(UserRole.provider);
    const isClient = user.roles.includes(UserRole.client);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
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
                    <CardTitle>{t('balance.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t('balance.current')}</p>
                        <p className="text-5xl font-bold tracking-tight">120,00 €</p>
                    </div>

                    <div className="flex justify-center gap-4">
                        {isProvider && (
                            <Button asChild size="lg">
                                <Link href="/dashboard/wallet/withdraw">{t('balance.withdraw')}</Link>
                            </Button>
                        )}
                        {isClient && (
                            <Button size="lg" variant="outline">
                                <FileText className="mr-2"/>
                                {t('balance.viewInvoices')}
                            </Button>
                        )}
                    </div>
                     {isProvider && user.KYCStatus !== 'verified' && (
                        <p className="text-center text-xs text-amber-600 mt-4">
                           {t('payoutsPageKycRequired')}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('summary.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isProvider && (
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">{t('summary.earnedThisMonth')}</p>
                            <p className="text-2xl font-semibold">450,00 €</p>
                        </div>
                    )}
                    {isClient && (
                         <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">{t('summary.paidThisMonth')}</p>
                            <p className="text-2xl font-semibold">320,00 €</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <div className="text-center">
                <Button variant="link" asChild>
                    <Link href="/dashboard/wallet/transactions">{t('viewTransactions')}</Link>
                </Button>
            </div>
             <div className="text-center">
                <Button variant="link" asChild>
                    <Link href="/dashboard/wallet/payouts">{t('viewPayouts')}</Link>
                </Button>
            </div>
        </div>
    );
}
