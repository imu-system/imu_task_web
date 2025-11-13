
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, Calendar as CalendarIcon, DollarSign, Clock, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const comparisonData = [
  { name: 'Gains', periodA: 320, periodB: 350 },
  { name: 'Heures', periodA: 40, periodB: 42 },
  { name: 'Taux Accept.', periodA: 88, periodB: 92 },
  { name: 'Note Moy.', periodA: 4.7, periodB: 4.8 },
];

const KpiCompareCard = ({ title, valueA, valueB, unit = '' }: { title: string, valueA: number, valueB: number, unit?: string }) => {
    const diff = valueB - valueA;
    const percentageDiff = valueA !== 0 ? (diff / valueA) * 100 : 0;
    const isIncrease = diff > 0;
    const isDecrease = diff < 0;

    return (
        <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
                 <p className="text-2xl font-semibold">{valueB}{unit}</p>
                 <span className="text-sm text-muted-foreground">{valueA}{unit}</span>
                 <span className={`text-sm font-bold ${isIncrease ? 'text-green-600' : isDecrease ? 'text-red-600' : 'text-muted-foreground'}`}>
                    ({isIncrease ? '+' : ''}{diff.toFixed(unit === '€' || unit === '%' ? 2 : 1)}{unit}, {isIncrease ? '+' : ''}{percentageDiff.toFixed(1)}%)
                 </span>
            </div>
        </div>
    )
}

export default function CompareStatsPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('StatsPage.compare');
    const [periodA, setPeriodA] = useState<DateRange | undefined>();
    const [periodB, setPeriodB] = useState<DateRange | undefined>();

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
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
                    <CardTitle>{t('selection.title')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className="w-full md:w-[300px] justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {periodA?.from ? (periodA.to ? `${format(periodA.from, "LLL dd, y")} - ${format(periodA.to, "LLL dd, y")}` : format(periodA.from, "LLL dd, y")) : <span>{t('selection.periodA')}</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="range" selected={periodA} onSelect={setPeriodA} numberOfMonths={2}/>
                        </PopoverContent>
                    </Popover>
                     <span className="text-muted-foreground font-semibold">vs</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className="w-full md:w-[300px] justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {periodB?.from ? (periodB.to ? `${format(periodB.from, "LLL dd, y")} - ${format(periodB.to, "LLL dd, y")}` : format(periodB.from, "LLL dd, y")) : <span>{t('selection.periodB')}</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="range" selected={periodB} onSelect={setPeriodB} numberOfMonths={2}/>
                        </PopoverContent>
                    </Popover>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('results.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <KpiCompareCard title={t('results.earnings')} valueA={320} valueB={350} unit="€" />
                    <KpiCompareCard title={t('results.hours')} valueA={40} valueB={42} unit="h" />
                    <KpiCompareCard title={t('results.acceptance')} valueA={88} valueB={92} unit="%" />
                    <KpiCompareCard title={t('results.rating')} valueA={4.7} valueB={4.8} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('chart.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={comparisonData}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                            <Legend />
                            <Bar dataKey="periodA" name={t('selection.periodA')} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="periodB" name={t('selection.periodB')} fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

        </div>
    );
}

