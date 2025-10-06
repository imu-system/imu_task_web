

'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, LineChart, Line, Legend, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRole } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Activity, CreditCard, DollarSign, Users, FileQuestion, BadgeAlert, PlusCircle, ExternalLink, ShieldQuestion, Users2, Eye, ListOrdered, Handshake, CalendarCheck, Wallet, Star, Bell, FileText, SlidersHorizontal, LineChart as LineChartIcon, History, Shield, ShieldCheck, LayoutList } from "lucide-react";

const kpiData = [
  { title: "Revenus (Mensuel)", value: "€4,231.89", change: "+20.1% vs mois dernier", icon: <DollarSign className="h-4 w-4 text-muted-foreground" /> },
  { title: "Utilisateurs Actifs", value: "+2350", change: "+180.1% vs mois dernier", icon: <Users className="h-4 w-4 text-muted-foreground" /> },
  { title: "Missions (Aujourd'hui)", value: "+573", change: "+19% vs hier", icon: <CreditCard className="h-4 w-4 text-muted-foreground" /> },
  { title: "Taux d'acceptation", value: "82.5%", change: "+2.5% vs semaine dernière", icon: <Activity className="h-4 w-4 text-muted-foreground" /> },
];

const priorityQueue = [
    { id: 'KYC001', type: 'KYC en attente', user: 'Jean Dupont', date: '2023-10-26', icon: <ShieldQuestion className="h-5 w-5 text-yellow-500"/>, href: '/dashboard/admin/kyc'},
    { id: 'DIS042', type: 'Litige ouvert', user: 'Marie Curie', date: '2023-10-25', icon: <BadgeAlert className="h-5 w-5 text-red-500"/>, href: '/dashboard/admin/disputes'},
    { id: 'PAY314', type: 'Paiement en échec', user: 'Pierre Martin', date: '2023-10-25', icon: <CreditCard className="h-5 w-5 text-blue-500"/>, href: '#'},
];

const clientProviderData = [
  { month: "Jan", clients: 40, providers: 24 },
  { month: "Feb", clients: 30, providers: 22 },
  { month: "Mar", clients: 20, providers: 49 },
  { month: "Apr", clients: 27, providers: 38 },
  { month: "May", clients: 18, providers: 48 },
  { month: "Jun", clients: 23, providers: 34 },
  { month: "Jul", clients: 34, providers: 44 },
];

export default function AdminDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminDashboard');
    const tNav = useTranslations('DashboardNav');
    
    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    if (authLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return <div>Chargement...</div>;
    }

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">{tNav('admin')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        {kpi.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <p className="text-xs text-muted-foreground">{kpi.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                 <CardHeader>
                    <CardTitle>{t('clientProviderChart.title')}</CardTitle>
                    <CardDescription>{t('clientProviderChart.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={clientProviderData}>
                            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                            <Legend />
                            <Line type="monotone" dataKey="clients" name={t('clientProviderChart.clients')} stroke="hsl(var(--chart-2))" />
                            <Line type="monotone" dataKey="providers" name={t('clientProviderChart.providers')} stroke="hsl(var(--chart-1))" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>{t('priorityQueueTitle')}</CardTitle>
                    <CardDescription>{t('priorityQueueDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {priorityQueue.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {item.icon}
                                            <span className="font-medium">{item.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.user}</TableCell>
                                    <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                            <Link href={item.href}><Eye className="h-4 w-4"/></Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

         <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('quickActionsTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <Button variant="outline" asChild><Link href="/dashboard/admin/reports"><LineChartIcon className="mr-2"/>{tNav('reports')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/users"><Users2 className="mr-2"/>{tNav('users')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/services/categories"><LayoutList className="mr-2"/>{tNav('categories')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/tasks"><ListOrdered className="mr-2"/>{tNav('tasks')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/offers"><Handshake className="mr-2"/>{tNav('offers')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/bookings"><CalendarCheck className="mr-2"/>{tNav('bookings')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/kyc"><ShieldCheck className="mr-2"/>{tNav('kycVerification')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/payments/transactions"><Wallet className="mr-2"/>{tNav('payments')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/pricing/fees"><DollarSign className="mr-2"/>{tNav('pricing')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/reviews"><Star className="mr-2"/>{tNav('reviews')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/disputes"><BadgeAlert className="mr-2"/>{tNav('disputes')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/notifications"><Bell className="mr-2"/>{tNav('notifications')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/cms/pages"><FileText className="mr-2"/>{tNav('cms')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/settings"><SlidersHorizontal className="mr-2"/>{tNav('settings')}</Link></Button>
                        <Button variant="outline" asChild><Link href="/dashboard/admin/audit"><History className="mr-2"/>{tNav('auditLog')}</Link></Button>
                    </CardContent>
                </Card>
            </div>
    </div>
  );
}
