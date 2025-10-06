
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, ArrowRight, Edit } from 'lucide-react';
import { Link } from '@/navigation';

export default function MarketPricingPage() {
    const t = useTranslations('MarketInsightsPage.pricing');

    // Mock data
    const averagePrice = 18;
    const optimalMin = 16;
    const optimalMax = 20;
    const userPrice = 14;
    const recommendation = 2;
    const isBelow = userPrice < optimalMin;
    const isAbove = userPrice > optimalMax;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">{t('averagePrice')}</p>
                            <p className="text-2xl font-bold">{averagePrice} €/h</p>
                        </div>
                        <div className="p-4 bg-green-100/60 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 font-medium">{t('optimalRange')}</p>
                            <p className="text-2xl font-bold text-green-900">{optimalMin} - {optimalMax} €/h</p>
                        </div>
                        <div className={`p-4 rounded-lg ${isBelow ? 'bg-red-100/60 border border-red-200' : 'bg-muted'}`}>
                            <p className={`text-sm font-medium ${isBelow ? 'text-red-800' : 'text-muted-foreground'}`}>{t('yourRate')}</p>
                            <p className={`text-2xl font-bold ${isBelow ? 'text-red-900' : ''}`}>{userPrice} €/h</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20 text-center">
                <CardHeader>
                    <CardTitle>{t('recommendation.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-lg">
                        {isBelow ? t('recommendation.increase', { amount: recommendation }) : t('recommendation.onPoint')}
                    </p>
                     <Button asChild>
                        <Link href="/dashboard/profile">
                            <Edit className="mr-2"/>
                            {t('updateRateButton')}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
