
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ArrowLeft, Download, FileText, Banknote, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const mockYearlyData = {
    '2025': {
        totalRevenue: 12500,
        totalPayouts: 10800,
        totalFees: 1700,
        monthly: [
            { month: 'Janvier', revenue: 1000 },
            { month: 'Février', revenue: 850 },
            { month: 'Mars', revenue: 1200 },
            { month: 'Avril', revenue: 1100 },
            { month: 'Mai', revenue: 1300 },
            { month: 'Juin', revenue: 950 },
            { month: 'Juillet', revenue: 1400 },
            { month: 'Août', revenue: 1500 },
            { month: 'Septembre', revenue: 1050 },
            { month: 'Octobre', revenue: 900 },
            { month: 'Novembre', revenue: 750 },
            { month: 'Décembre', revenue: 500 },
        ]
    },
    '2024': {
        totalRevenue: 10200,
        totalPayouts: 8800,
        totalFees: 1400,
        monthly: [
            { month: 'Janvier', revenue: 900 },
            { month: 'Février', revenue: 750 },
            { month: 'Mars', revenue: 1100 },
            { month: 'Avril', revenue: 1000 },
            { month: 'Mai', revenue: 1200 },
            { month: 'Juin', revenue: 850 },
            { month: 'Juillet', revenue: 1300 },
            { month: 'Août', revenue: 1400 },
            { month: 'Septembre', revenue: 950 },
            { month: 'Octobre', revenue: 800 },
            { month: 'Novembre', revenue: 650 },
            { month: 'Décembre', revenue: 400 },
        ]
    }
}

export default function TaxSummaryPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('StatsPage.tax');
    const [selectedYear, setSelectedYear] = useState('2025');

    const data = mockYearlyData[selectedYear as keyof typeof mockYearlyData];

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p>Aucune donnée disponible pour l'année sélectionnée.</p>
                <Button asChild variant="outline">
                    <Link href="/dashboard/stats">{t('backToList')}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/stats">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('title')}
                    </h1>
                </div>
            </div>

            <Card>
                 <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>{t('card.title')}</CardTitle>
                            <CardDescription>{t('card.description', { year: selectedYear })}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2024">2024</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline"><Download className="mr-2"/>{t('card.exportButton')}</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground flex items-center gap-2"><Banknote className="h-4 w-4"/> {t('card.totalRevenue')}</p>
                            <p className="text-2xl font-semibold">{data.totalRevenue.toFixed(2)} €</p>
                        </div>
                         <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground flex items-center gap-2"><Download className="h-4 w-4"/> {t('card.payouts')}</p>
                            <p className="text-2xl font-semibold">{data.totalPayouts.toFixed(2)} €</p>
                        </div>
                         <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground flex items-center gap-2"><Landmark className="h-4 w-4"/> {t('card.fees')}</p>
                            <p className="text-2xl font-semibold">{data.totalFees.toFixed(2)} €</p>
                        </div>
                    </div>
                    <Separator/>
                     <div>
                        <h3 className="text-lg font-semibold mb-4">{t('card.monthlyList')}</h3>
                        <div className="space-y-2">
                            {data.monthly.map(item => (
                                <div key={item.month} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                                    <span className="font-medium">{item.month}</span>
                                    <span className="font-mono">{item.revenue.toFixed(2)} €</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center">
                <Button size="lg">
                    <FileText className="mr-2"/>
                    {t('card.downloadCertificate')}
                </Button>
            </div>
        </div>
    );
}
