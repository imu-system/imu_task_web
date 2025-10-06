
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickSummaryProps {
    isProvider: boolean;
    isClient: boolean;
}

export default function QuickSummary({ isProvider, isClient }: QuickSummaryProps) {
    const t = useTranslations('WalletPage');

    return (
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
    );
}
