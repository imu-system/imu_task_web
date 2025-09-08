
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, LineChart, Users, ListOrdered, CalendarCheck, Euro, Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

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
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

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

            <Card>
                <CardHeader>
                    <CardTitle>{t('filters.title')}</CardTitle>
                    <CardDescription>{t('filters.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('filters.dateRange')}</label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className="w-[300px] justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                    ) : (
                                    <span>{t('filters.pickDate')}</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('filters.category')}</label>
                            <Select>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder={t('filters.allCategories')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('filters.allCategories')}</SelectItem>
                                    <SelectItem value="gardening">Jardinage</SelectItem>
                                    <SelectItem value="cleaning">Ménage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('filters.city')}</label>
                            <Input placeholder="e.g. Paris" className="w-[180px]" />
                        </div>
                        <Button>
                            <Filter className="mr-2 h-4 w-4"/>
                            {t('filters.apply')}
                        </Button>
                         <Button variant="ghost">
                            <X className="mr-2 h-4 w-4"/>
                            {t('filters.reset')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Separator/>


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
                                <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                                <Bar dataKey="value" name={t('charts.conversionFunnel.legend')} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>

        </div>
    );
}
