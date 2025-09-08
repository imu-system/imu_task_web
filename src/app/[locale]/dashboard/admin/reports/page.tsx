
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Loader2, LineChart, Users, ListOrdered, CalendarCheck, Euro } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const kpiData = [
  { titleKey: "kpi.totalRevenue", value: "€12,450.00", icon: <Euro /> },
  { titleKey: "kpi.completedTasks", value: "312", icon: <ListOrdered /> },
  { titleKey: "kpi.totalUsers", value: "2,890", icon: <Users /> },
  { titleKey: "kpi.activeBookings", value: "42", icon: <CalendarCheck /> },
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

const taskStatusData = [
    { name: 'Published', value: 400 },
    { name: 'Matched', value: 300 },
    { name: 'Completed', value: 240 },
    { name: 'Canceled', value: 80 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminReportsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminReportsPage');
    const tTaskStatus = useTranslations('AdminTasksPage.status');

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

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                 <Card className="lg:col-span-2">
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
                        <CardTitle>{t('charts.taskStatus.title')}</CardTitle>
                         <CardDescription>{t('charts.taskStatus.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie data={taskStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {taskStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [value, tTaskStatus(name.toLowerCase() as any)]}/>
                                <Legend formatter={(value) => tTaskStatus(value.toLowerCase() as any)}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>

        </div>
    );
}
