

'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, LineChart, Line, Legend, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRole } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Activity, CreditCard, DollarSign, Users, FileQuestion, BadgeAlert, PlusCircle, ExternalLink, ShieldQuestion, Users2, Eye, ListOrdered, Handshake, CalendarCheck, Wallet, Star, Bell, FileText, SlidersHorizontal, LineChart as LineChartIcon, History, Shield, ShieldCheck, LayoutList } from "lucide-react";
import { AdminUserRolesPanel } from "@/components/admin/user-roles-panel";
import { AdminKYCPanel } from "@/components/admin/kyc-panel";
import { AdminStatsCards } from "@/components/dashboard/admin-stats-cards";
import { GMVChart } from "@/components/dashboard/gmv-chart";
import { UserGrowthChart } from "@/components/dashboard/user-growth-chart";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";

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
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">{tNav('admin')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
            
            {/* Filters Button - Mobile variant (Sheet) */}
            <div className="lg:hidden">
                <DashboardFilters 
                    userId={user.uid}
                    variant="sheet"
                />
            </div>
        </div>

        {/* Filters Card - Desktop variant */}
        <div className="hidden lg:block">
            <DashboardFilters 
                userId={user.uid}
                variant="card"
            />
        </div>

        {/* Real-time KPI Cards - Connected to Firestore */}
        <AdminStatsCards />

        {/* Real-time Charts - Connected to Firestore */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {/* GMV & Platform Revenue Chart */}
            <GMVChart monthsBack={6} commissionRate={0.15} />

            {/* User Growth Chart */}
            <UserGrowthChart monthsBack={6} />
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             <Card className="lg:col-span-2">
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
                                            <Link href={item.href as any}><Eye className="h-4 w-4"/></Link>
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
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/reports" as any}><LineChartIcon className="mr-2"/>{tNav('reports')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/users" as any}><Users2 className="mr-2"/>{tNav('users')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/services/categories" as any}><LayoutList className="mr-2"/>{tNav('categories')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/tasks" as any}><ListOrdered className="mr-2"/>{tNav('tasks')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/offers" as any}><Handshake className="mr-2"/>{tNav('offers')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/bookings" as any}><CalendarCheck className="mr-2"/>{tNav('bookings')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/kyc" as any}><ShieldCheck className="mr-2"/>{tNav('kycVerification')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/payments/transactions" as any}><Wallet className="mr-2"/>{tNav('payments')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/pricing/fees" as any}><DollarSign className="mr-2"/>{tNav('pricing')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/reviews" as any}><Star className="mr-2"/>{tNav('reviews')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/disputes" as any}><BadgeAlert className="mr-2"/>{tNav('disputes')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/notifications" as any}><Bell className="mr-2"/>{tNav('notifications')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/cms/pages" as any}><FileText className="mr-2"/>{tNav('cms')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/settings" as any}><SlidersHorizontal className="mr-2"/>{tNav('settings')}</Link></Button>
                        <Button variant="outline" asChild><Link href={"/dashboard/admin/audit" as any}><History className="mr-2"/>{tNav('auditLog')}</Link></Button>
                    </CardContent>
                </Card>

                {/* Panel de gestion des rôles utilisateurs */}
                <AdminUserRolesPanel />

                {/* Panel de gestion des demandes KYC */}
                <AdminKYCPanel />
            </div>
    </div>
  );
}
