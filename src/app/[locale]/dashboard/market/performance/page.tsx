
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { CheckCircle, Clock, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from '@/navigation';

const performanceData = [
  { subject: 'Taux Accept.', user: 92, average: 78, fullMark: 100 },
  { subject: 'Note Moy.', user: 96, average: 90, fullMark: 100 }, // Scaled to 100
  { subject: 'Délai Réponse', user: 80, average: 60, fullMark: 100 }, // Inverted scale: lower is better
  { subject: 'Fiabilité', user: 95, average: 85, fullMark: 100 },
  { subject: 'Répétition', user: 70, average: 60, fullMark: 100 },
];

const KpiCard = ({ title, userValue, averageValue, unit = '' }: { title: string, userValue: string, averageValue: string, unit?: string }) => {
    const userNum = parseFloat(userValue.replace(',', '.'));
    const avgNum = parseFloat(averageValue.replace(',', '.'));
    const isBetter = title.includes('Délai') ? userNum < avgNum : userNum > avgNum;
    
    return (
        <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{userValue}{unit}</p>
            <div className={`flex items-center gap-1 text-xs ${isBetter ? 'text-green-600' : 'text-red-600'}`}>
                {isBetter ? <TrendingUp className="h-4 w-4"/> : <TrendingDown className="h-4 w-4"/>}
                <span>vs {averageValue}{unit} (moyenne)</span>
            </div>
        </div>
    )
}

export default function MarketPerformancePage() {
    const t = useTranslations('MarketInsightsPage.performance');

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('kpi.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <KpiCard title={t('kpi.acceptanceRate')} userValue="92" averageValue="78" unit="%"/>
                   <KpiCard title={t('kpi.averageRating')} userValue="4,8" averageValue="4,5"/>
                   <KpiCard title={t('kpi.responseTime')} userValue="5" averageValue="15" unit=" min"/>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('radar.title')}</CardTitle>
                    <CardDescription>{t('radar.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                         <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    background: 'hsl(var(--card))',
                                    borderColor: 'hsl(var(--border))',
                                }}
                            />
                            <Legend />
                            <Radar name={t('radar.you')} dataKey="user" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                            <Radar name={t('radar.average')} dataKey="average" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

             <div className="text-center">
                <Button asChild size="lg">
                    <Link href="/dashboard/reviews">{t('improveButton')}</Link>
                </Button>
            </div>
        </div>
    )
}
