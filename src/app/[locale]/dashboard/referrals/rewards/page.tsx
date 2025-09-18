
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { ArrowLeft, Gift, Ticket, Banknote, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockRewards = [
    { id: 'r1', nameKey: 'rewards.uber', value: 10 },
    { id: 'r2', nameKey: 'rewards.imutask', value: 5 },
    { id: 'r3', nameKey: 'rewards.amazon', value: 20 },
];

export default function RewardsCataloguePage() {
    const t = useTranslations('ReferralsPage.rewards');
    const { toast } = useToast();

    const handleExchange = (rewardName: string) => {
        toast({
            title: t('toast.successTitle'),
            description: t('toast.successDescription', { rewardName }),
        });
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/referrals">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Gift className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('balance.title')}</CardTitle>
                    <CardDescription className="text-4xl font-bold tracking-tight">60,00 €</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('options.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockRewards.map(reward => (
                        <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Ticket className="h-6 w-6 text-primary"/>
                                <div>
                                    <p className="font-semibold">{t(reward.nameKey as any)}</p>
                                    <p className="text-sm text-muted-foreground">{reward.value.toFixed(2)} €</p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => handleExchange(t(reward.nameKey as any))}>
                                <ExternalLink className="mr-2"/>
                                {t('options.exchange')}
                            </Button>
                        </div>
                    ))}
                     <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <Banknote className="h-6 w-6 text-primary"/>
                            <div>
                                <p className="font-semibold">{t('rewards.payout')}</p>
                                <p className="text-sm text-muted-foreground">{t('rewards.payoutMin')}</p>
                            </div>
                        </div>
                        <Button asChild>
                           <Link href="/dashboard/wallet/withdraw">
                             <ExternalLink className="mr-2"/>
                             {t('options.request')}
                           </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center">
                <Button variant="link" asChild>
                    <Link href="/dashboard/referrals/history">{t('historyLink')}</Link>
                </Button>
            </div>
        </div>
    );
}
