
'use client';

import { useTranslations } from 'next-intl';
import { KYCStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { FileText } from 'lucide-react';

interface BalanceCardProps {
    isProvider: boolean;
    isClient: boolean;
    kycStatus: KYCStatus;
}

export default function BalanceCard({ isProvider, isClient, kycStatus }: BalanceCardProps) {
    const t = useTranslations('WalletPage');
    
    return (
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
                        <Button asChild size="lg" variant="outline">
                            <Link href="/dashboard/wallet/transactions">
                                <FileText className="mr-2"/>
                                {t('balance.viewInvoices')}
                            </Link>
                        </Button>
                    )}
                </div>
                {isProvider && kycStatus !== 'verified' && (
                    <p className="text-center text-xs text-amber-600 mt-4">
                        {t('payoutsPageKycRequired')}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
