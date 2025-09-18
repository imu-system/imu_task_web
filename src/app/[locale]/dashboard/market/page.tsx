
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ListOrdered } from 'lucide-react';

// Mock data for the chart
const demandData = [
  { month: 'Juin', missions: 120 },
  { month: 'Juillet', missions: 180 },
  { month: 'Août', missions: 250 },
];

const topServices = [
  { rank: 1, name: 'Nettoyage Airbnb' },
  { rank: 2, name: 'Ménage ponctuel' },
  { rank: 3, name: 'Repassage' },
];

export default function MarketTrendsPage() {
    const t = useTranslations('MarketInsightsPage.trends');

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('demandChart.title')}</CardTitle>
                    <CardDescription>{t('demandChart.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={demandData}>
                            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                            <Bar dataKey="missions" name={t('demandChart.legend')} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ListOrdered className="h-5 w-5 text-primary"/>
                        {t('topServices.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="space-y-3">
                        {topServices.map((service) => (
                            <li key={service.rank} className="flex items-center gap-4 text-lg">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">{service.rank}</span>
                                <span className="font-medium">{service.name}</span>
                            </li>
                        ))}
                    </ul>
                    <Button variant="outline">{t('topServices.actionButton')}</Button>
                </CardContent>
            </Card>
        </div>
    );
}
