
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Loader2, LineChart, Users, ListOrdered, CalendarCheck, Euro } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

const kpiData = [
  { titleKey: "kpi.totalRevenue", value: "€12,450.00", icon: <Euro /> },
  { titleKey: "kpi.completedTasks", value: "312", icon: <ListOrdered /> },
  { titleKey: "kpi.totalUsers", value: "2,890", icon: <Users /> },
  { titleKey: "kpi.activeBookings", value: "42", icon: <CalendarCheck /> },
];

const conversionData = [
  { name: "Publiées", value: 456 },
  { name: "Offres", value: 380 },
  { name: "Assignées", value: 212 },
  { name: "Terminées", value: 187 },
];

const newUsersData = [
  { month: "Jan", users: 65 },
  { month: "Feb", users: 59 },
  { month: "Mar", users: 80 },
  { month: "Apr", users: 81 },
  { month: "May", users: 56 },
  { month: "Jun", users: 55 },
  { month: "Jul", users: 40 },
  { month: "Aug", users: 62 },
];


export default function AdminReportsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminReportsPage');

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    if (authLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <LineChart className="h-8 w-8 text-primary"/>
                    {t('kpi.title')}
                </h1>
                <p className="text-muted-foreground">
                {t('kpi.subtitle')}
                </p>
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
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('charts.newUsers.title')}</CardTitle>
                        <CardDescription>{t('charts.newUsers.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={newUsersData}>
                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                                <Legend />
                                <Bar dataKey="users" name={t('charts.newUsers.legend')} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>{t('charts.conversionFunnel.title')}</CardTitle>
                         <CardDescription>{t('charts.conversionFunnel.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                         <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={conversionData} layout="vertical">
                                <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                                <Legend />
                                <Bar dataKey="value" name={t('charts.conversionFunnel.legend')} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>

        </div>
    );
}
