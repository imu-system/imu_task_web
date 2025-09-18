
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Loader2, LineChart as LineChartIcon, Settings, Download, DollarSign, Clock, CheckCircle, Star, Columns, FileText, Target } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, AreaChart, Area, LineChart, Line } from "recharts";
import { Link } from '@/navigation';

const kpiData = [
  { titleKey: "kpi.totalEarnings", value: "350 €", change: "+15% vs last period", icon: <DollarSign /> },
  { titleKey: "kpi.hoursWorked", value: "42h", icon: <Clock /> },
  { titleKey: "kpi.acceptanceRate", value: "92%", icon: <CheckCircle /> },
  { titleKey: "kpi.averageRating", value: "4.8/5", icon: <Star /> },
];

const earningsData = [
  { name: 'Lun', gains: 30 },
  { name: 'Mar', gains: 50 },
  { name: 'Mer', gains: 45 },
  { name: 'Jeu', gains: 60 },
  { name: 'Ven', gains: 80 },
  { name: 'Sam', gains: 75 },
  { name: 'Dim', gains: 10 },
];

const categoryData = [
  { name: 'Courses', heures: 15 },
  { name: 'Nettoyage', heures: 10 },
  { name: 'Jardinage', heures: 8 },
  { name: 'Numérique', heures: 9 },
];

export default function StatsPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('StatsPage');

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user.roles.includes(UserRole.provider)) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold">{t('notProvider.title')}</h2>
                <p className="text-muted-foreground mt-2">{t('notProvider.description')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <LineChartIcon className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Select defaultValue="7d">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">{t('filters.last7days')}</SelectItem>
                            <SelectItem value="30d">{t('filters.last30days')}</SelectItem>
                            <SelectItem value="90d">{t('filters.last90days')}</SelectItem>
                        </SelectContent>
                    </Select>
                     <Button variant="outline" asChild>
                        <Link href="/dashboard/stats/goals">
                            <Target className="mr-2"/>
                            {t('myGoals')}
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/stats/compare">
                            <Columns className="mr-2"/>
                            {t('comparePeriods')}
                        </Link>
                    </Button>
                    <Button variant="outline"><Download className="mr-2"/>{t('exportCsv')}</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 {kpiData.map((kpi, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t(kpi.titleKey as any)}</CardTitle>
                            <div className="text-muted-foreground">{kpi.icon}</div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpi.value}</div>
                            {kpi.change && <p className="text-xs text-muted-foreground">{kpi.change}</p>}
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="flex justify-between items-center">
                 <Button variant="link" asChild>
                    <Link href="/dashboard/stats/missions">{t('viewMissionDetails')}</Link>
                </Button>
                <Button variant="link" asChild>
                    <Link href="/dashboard/stats/tax">
                        <FileText className="mr-2"/>
                        {t('tax.link')}
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('charts.earnings.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                             <LineChart data={earningsData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`}/>
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(value) => `€${value}`}/>
                                <Line type="monotone" dataKey="gains" name={t('charts.earnings.legend')} stroke="hsl(var(--primary))" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('charts.time.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(value) => `${value}h`}/>
                                <Bar dataKey="heures" name={t('charts.time.legend')} fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
