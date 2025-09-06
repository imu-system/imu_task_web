

'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRole } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Activity, CreditCard, DollarSign, Users, FileQuestion, BadgeAlert, PlusCircle, ExternalLink, ShieldQuestion, Users2, Eye, ListOrdered, Handshake, CalendarCheck, Wallet, Star, Bell } from "lucide-react";

const kpiData = [
  { title: "Revenus (Mensuel)", value: "€4,231.89", change: "+20.1% vs mois dernier", icon: <DollarSign className="h-4 w-4 text-muted-foreground" /> },
  { title: "Utilisateurs Actifs", value: "+2350", change: "+180.1% vs mois dernier", icon: <Users className="h-4 w-4 text-muted-foreground" /> },
  { title: "Missions (Aujourd'hui)", value: "+573", change: "+19% vs hier", icon: <CreditCard className="h-4 w-4 text-muted-foreground" /> },
  { title: "Taux d'acceptation", value: "82.5%", change: "+2.5% vs semaine dernière", icon: <Activity className="h-4 w-4 text-muted-foreground" /> },
];

const conversionData = [
  { name: "Published", value: 456 },
  { name: "Offers", value: 380 },
  { name: "Matched", value: 212 },
  { name: "Completed", value: 187 },
];

const priorityQueue = [
    { id: 'KYC001', type: 'KYC en attente', user: 'Jean Dupont', date: '2023-10-26', icon: <ShieldQuestion className="h-5 w-5 text-yellow-500"/>, href: '/dashboard/admin/kyc'},
    { id: 'DIS042', type: 'Litige ouvert', user: 'Marie Curie', date: '2023-10-25', icon: <BadgeAlert className="h-5 w-5 text-red-500"/>, href: '/dashboard/admin/disputes'},
    { id: 'PAY314', type: 'Paiement en échec', user: 'Pierre Martin', date: '2023-10-25', icon: <CreditCard className="h-5 w-5 text-blue-500"/>, href: '#'},
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

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>{t('conversionTitle')}</CardTitle>
                    <CardDescription>{t('conversionDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                     <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={conversionData}>
                            <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            />
                            <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                            />
                            <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-8">
                <Card>
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
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('quickActionsTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/admin/users"><Users2 className="mr-2"/>{t('quickActionUsers')}</Link>
                        </Button>
                        <Button variant="outline" asChild>
                           <Link href="/dashboard/admin/services/categories"><PlusCircle className="mr-2"/>{t('quickActionCategory')}</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/admin/tasks"><ListOrdered className="mr-2"/>{t('quickActionTasks')}</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/admin/offers"><Handshake className="mr-2"/>{t('quickActionOffers')}</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/admin/bookings"><CalendarCheck className="mr-2"/>{t('quickActionBookings')}</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/admin/payments/transactions"><Wallet className="mr-2"/>{t('quickActionPayments')}</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/admin/reviews"><Star className="mr-2"/>{t('quickActionReviews')}</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/admin/disputes"><BadgeAlert className="mr-2"/>{t('quickActionDisputes')}</Link>
                        </Button>
                         <Button variant="outline" asChild>
                            <Link href="/dashboard/admin/notifications"><Bell className="mr-2"/>{t('quickActionNotifications')}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
