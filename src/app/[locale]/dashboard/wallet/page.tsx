
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Loader2, Wallet } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import BalanceCard from '@/components/wallet/balance-card';
import QuickSummary from '@/components/wallet/quick-summary';

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

            <BalanceCard isProvider={isProvider} isClient={isClient} kycStatus={user.KYCStatus} />

            <QuickSummary isProvider={isProvider} isClient={isClient} />
            
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
