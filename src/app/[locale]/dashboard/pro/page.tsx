/**
 * Dashboard ImuPro - Vue professionnelle avec stats, revenus, agenda
 * Version modernisée avec animations et analytics
 */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/navigation';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AccountType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Loader2,
    AlertCircle,
    TrendingUp,
    DollarSign,
    Calendar,
    FileText,
    Users,
    Star,
    Award,
    ShieldCheck,
    Clock,
    CheckCircle2,
    XCircle,
    Euro,
    Briefcase,
    MessageSquare,
    ArrowUpRight,
    Bell,
    TrendingDown,
    Heart,
} from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import { 
  AnimatedDiv, 
  AnimatedList, 
  AnimatedListItem, 
  AnimatedCard,
  GradientBackground,
  GlowCard,
  ShimmerCard
} from '@/components/ui/animated';
import { 
  logDashboardPageView, 
  logKpiCardClick,
  logTabChange,
  logGlowCardClick,
  logGradientSectionView,
  logAnimatedElementInteraction
} from '@/lib/analytics';
import { getMonthlyRevenue, getMonthlyMissions, getProviderStats } from '@/lib/firestore-analytics';
import { useFavorites } from '@/hooks/use-favorites';
import { useProviderStats as useProviderAnalyticsStats, useProviderMonthlyRevenue, useProviderMonthlyMissions } from '@/hooks/use-analytics';

interface ProProfile {
    userId: string;
    businessInfo: {
        businessName: string;
        siret: string;
        businessType: string;
    };
    verificationStatus: string;
    badges: {
        verified: boolean;
        topRated?: boolean;
        responsive?: boolean;
        reliable?: boolean;
    };
    subscription: {
        tier: 'basic' | 'premium' | 'enterprise';
        startDate: Date;
    };
    stats: {
        totalJobs: number;
        completedJobs: number;
        cancelledJobs: number;
        averageRating: number;
        totalReviews: number;
        responseTime: number;
        acceptanceRate: number;
        revenue: {
            total: number;
            thisMonth: number;
            lastMonth: number;
        };
    };
}

interface Quote {
    id: string;
    clientId: string;
    proId: string;
    status: string;
    amount: number;
    createdAt: Date;
    validUntil: Date;
    clientName?: string;
}

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

export default function ProDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const t = useTranslations('Breadcrumbs');
    const { favorites: userFavorites } = useFavorites();

    const [loading, setLoading] = useState(true);
    const [proProfile, setProProfile] = useState<ProProfile | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Phase 9: Analytics hooks avec React Query (caching + auto-refetch)
    const { data: providerStats, isLoading: loadingStats } = useProviderAnalyticsStats(user?.uid);
    const { data: monthlyRevenue, isLoading: loadingRevenue } = useProviderMonthlyRevenue(user?.uid, 6);
    const { data: monthlyMissions, isLoading: loadingMissions } = useProviderMonthlyMissions(user?.uid, 6);
    useEffect(() => {
        if (!user) return;

        const loadProDashboard = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Vérifier le accountType dans users/{uid}/profile
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    setError('no_user');
                    return;
                }

                const userData = userSnap.data();
                const accountType = userData?.profile?.accountType as AccountType | undefined;

                // Vérifier si accountType === 'professional'
                if (accountType !== AccountType.professional) {
                    // Fallback: vérifier ancien système pro_profiles
                    const proProfileRef = doc(db, 'pro_profiles', user.uid);
                    const proProfileSnap = await getDoc(proProfileRef);

                    if (!proProfileSnap.exists()) {
                        setError('not_pro');
                        return;
                    }

                    const profileData = proProfileSnap.data() as ProProfile;
                    setProProfile(profileData);
                } else {
                    // Nouveau système: accountType === 'professional'
                    // Charger depuis pro_profiles ou créer un profil par défaut
                    const proProfileRef = doc(db, 'pro_profiles', user.uid);
                    const proProfileSnap = await getDoc(proProfileRef);

                    if (proProfileSnap.exists()) {
                        const profileData = proProfileSnap.data() as ProProfile;
                        setProProfile(profileData);
                    } else {
                        // Créer un profil pro par défaut
                        const defaultProfile: ProProfile = {
                            userId: user.uid,
                            businessInfo: {
                                businessName: userData?.profile?.professionalInfo?.companyName || 'Mon Entreprise',
                                siret: userData?.profile?.professionalInfo?.siret || '',
                                businessType: 'services',
                            },
                            verificationStatus: userData?.profile?.professionalInfo?.isVerified ? 'verified' : 'pending',
                            badges: {
                                verified: userData?.profile?.professionalInfo?.isVerified || false,
                            },
                            subscription: {
                                tier: 'basic',
                                startDate: new Date(),
                            },
                            stats: {
                                totalJobs: 0,
                                completedJobs: 0,
                                cancelledJobs: 0,
                                averageRating: 0,
                                totalReviews: 0,
                                responseTime: 0,
                                acceptanceRate: 0,
                                revenue: {
                                    total: 0,
                                    thisMonth: 0,
                                    lastMonth: 0,
                                },
                            },
                        };
                        setProProfile(defaultProfile);
                    }
                }

                // 2. Charger les devis récents
                const quotesRef = collection(db, 'quotes');
                const quotesQuery = query(
                    quotesRef,
                    where('proId', '==', user.uid),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
                const quotesSnap = await getDocs(quotesQuery);
                const quotesData = quotesSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                    validUntil: doc.data().validUntil?.toDate(),
                })) as Quote[];

                // 3. Charger les notifications récentes
                const notificationsRef = collection(db, 'notifications');
                const notificationsQuery = query(
                    notificationsRef,
                    where('userId', '==', user.uid),
                    where('read', '==', false),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
                const notificationsSnap = await getDocs(notificationsQuery);
                const notificationsData = notificationsSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                })) as Notification[];

                setQuotes(quotesData);
                setNotifications(notificationsData);

                // 4. Log analytics après chargement réussi
                logDashboardPageView(AccountType.professional, 'professional');
                logGradientSectionView('pro_header', AccountType.professional);
            } catch (err: any) {
                console.error('Erreur chargement dashboard pro:', err);
                setError(err.message || 'Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };

        loadProDashboard();
    }, [user]);

    // Redirection si pas pro
    if (error === 'not_pro') {
        return (
            <div className="container py-8">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Vous n&apos;avez pas encore de profil professionnel ImuPro.{' '}
                        <Link href="/dashboard/become-pro" className="underline">
                            Devenir ImuPro
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Vérification en attente
    if (proProfile?.verificationStatus === 'pending') {
        return (
            <div className="container py-8">
                <Alert>
                    <Clock className="h-4 w-4 animate-pulse" />
                    <AlertDescription>
                        Votre demande ImuPro est en cours de vérification. Vous serez notifié sous 24-48h.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !proProfile) {
        return (
            <div className="container py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'Impossible de charger votre dashboard professionnel'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Stats du profil pro (contient averageRating, acceptanceRate, etc.)
    const stats = proProfile.stats;
    const revenueGrowth =
        stats.revenue.lastMonth > 0
            ? ((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100
            : 0;

    return (
        <div className="container py-8 space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumbs 
                items={[
                    { label: t('dashboard'), href: '/dashboard/pro' }
                ]}
            />
            
            {/* Header moderne avec DashboardHeader */}
            <DashboardHeader 
                accountType={AccountType.professional}
                title="Dashboard ImuPro"
                showSearch={true}
            />

            {/* QuickActions pour professionnels */}
            <QuickActions accountType={AccountType.professional} />

            {/* Filters Section */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Desktop: Card variant */}
                <div className="hidden lg:block lg:w-80 flex-shrink-0">
                    <DashboardFilters 
                        userId={user?.uid}
                        variant="card"
                    />
                </div>
                
                {/* Mobile: Sheet variant (button) */}
                <div className="lg:hidden">
                    <DashboardFilters 
                        userId={user?.uid}
                        variant="sheet"
                    />
                </div>
            </div>

            {/* En-tête avec badge vérifié et gradient animé */}
            <GradientBackground 
                className="rounded-2xl p-8 -mx-4 md:mx-0"
                colors={['#667eea', '#764ba2', '#f093fb']}
            >
                <AnimatedDiv variant="fadeInUp" className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                                    {proProfile.businessInfo.businessName}
                                </h1>
                                {proProfile.badges.verified && (
                                    <Badge variant="default" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                        <ShieldCheck className="mr-1 h-3 w-3" />
                                        Vérifié
                                    </Badge>
                                )}
                                {proProfile.badges.topRated && (
                                    <Badge variant="secondary" className="bg-yellow-400/90 text-yellow-900 border-yellow-500">
                                        <Star className="mr-1 h-3 w-3" />
                                        Top Rated
                                    </Badge>
                                )}
                            </div>
                            <p className="text-white/90 text-lg">
                                Tableau de bord professionnel ImuTask
                            </p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            <ShimmerCard>
                                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm" asChild>
                                    <Link href="/dashboard/pro/portfolio">
                                        <Award className="mr-2 h-4 w-4" />
                                        Portfolio
                                    </Link>
                                </Button>
                            </ShimmerCard>
                            <ShimmerCard>
                                <Button className="bg-white text-primary hover:bg-white/90" asChild>
                                    <Link href={`/pro/${user?.uid}`}>
                                        <ArrowUpRight className="mr-2 h-4 w-4" />
                                        Profil public
                                    </Link>
                                </Button>
                            </ShimmerCard>
                        </div>
                    </div>
                </AnimatedDiv>
            </GradientBackground>

            {/* Notifications non lues */}
            {notifications.length > 0 && (
                <AnimatedDiv variant="fadeInUp">
                    <Alert className="border-primary/50 bg-primary/5">
                        <Bell className="h-4 w-4 text-primary" />
                        <AlertDescription>
                            Vous avez <strong className="text-primary">{notifications.length}</strong> notification(s) non lue(s).{' '}
                            <Link href="/dashboard/notifications" className="underline text-primary hover:text-primary/80">
                                Voir tout
                            </Link>
                        </AlertDescription>
                    </Alert>
                </AnimatedDiv>
            )}

            {/* KPI Cards avec animations */}
            <AnimatedList className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {/* Revenus du mois */}
                <AnimatedListItem>
                    <GlowCard glowColor="rgba(34, 197, 94, 0.5)">
                        <AnimatedCard 
                            clickable 
                            onClick={() => {
                                logKpiCardClick(AccountType.professional, 'revenue', stats.revenue.thisMonth);
                                logGlowCardClick('kpi_revenue_pro', stats.revenue.thisMonth);
                            }}
                        >
                            <Card className="border-2 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Revenus ce mois</CardTitle>
                                    <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                        {stats.revenue.thisMonth.toLocaleString()} €
                                    </div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        {revenueGrowth >= 0 ? (
                                            <>
                                                <TrendingUp className="h-3 w-3 text-green-500" />
                                                <span className="text-green-500">
                                                    +{revenueGrowth.toFixed(1)}%
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <TrendingDown className="h-3 w-3 text-red-500" />
                                                <span className="text-red-500">
                                                    {revenueGrowth.toFixed(1)}%
                                                </span>
                                            </>
                                        )} vs mois dernier
                                    </p>
                                </CardContent>
                            </Card>
                        </AnimatedCard>
                    </GlowCard>
                </AnimatedListItem>

                {/* Missions actives */}
                <AnimatedListItem>
                    <GlowCard glowColor="rgba(59, 130, 246, 0.5)">
                        <AnimatedCard 
                            clickable 
                            onClick={() => {
                                const activeMissions = stats.totalJobs - stats.completedJobs - stats.cancelledJobs;
                                logKpiCardClick(AccountType.professional, 'active_missions', activeMissions);
                                logGlowCardClick('kpi_active_missions_pro', activeMissions);
                            }}
                        >
                            <Card className="border-2 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Missions actives</CardTitle>
                                    <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {stats.totalJobs - stats.completedJobs - stats.cancelledJobs}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.completedJobs} terminées au total
                                    </p>
                                </CardContent>
                            </Card>
                        </AnimatedCard>
                    </GlowCard>
                </AnimatedListItem>

                {/* Note moyenne */}
                <AnimatedListItem>
                    <GlowCard glowColor="rgba(251, 191, 36, 0.5)">
                        <AnimatedCard 
                            clickable 
                            onClick={() => {
                                logKpiCardClick(AccountType.professional, 'average_rating', stats.averageRating);
                                logGlowCardClick('kpi_rating_pro', stats.averageRating);
                            }}
                        >
                            <Card className="border-2 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950 dark:to-background">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
                                    <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold flex items-center gap-1 text-yellow-700 dark:text-yellow-300">
                                        {stats.averageRating.toFixed(1)}
                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Sur {stats.totalReviews} avis
                                    </p>
                                </CardContent>
                            </Card>
                        </AnimatedCard>
                    </GlowCard>
                </AnimatedListItem>

                {/* Taux d'acceptation */}
                <AnimatedListItem>
                    <GlowCard glowColor="rgba(139, 92, 246, 0.5)">
                        <AnimatedCard 
                            clickable 
                            onClick={() => {
                                logKpiCardClick(AccountType.professional, 'acceptance_rate', stats.acceptanceRate);
                                logGlowCardClick('kpi_acceptance_pro', stats.acceptanceRate);
                            }}
                        >
                            <Card className="border-2 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-background">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Taux d&apos;acceptation</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                        {stats.acceptanceRate}%
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Temps de réponse : {stats.responseTime}h
                                    </p>
                                </CardContent>
                            </Card>
                        </AnimatedCard>
                    </GlowCard>
                </AnimatedListItem>

                {/* Mes Favoris */}
                <AnimatedListItem>
                    <GlowCard glowColor="rgba(236, 72, 153, 0.5)">
                        <AnimatedCard 
                            clickable 
                            onClick={() => {
                                if (userFavorites.length > 0) {
                                    logKpiCardClick(AccountType.professional, 'favorites', userFavorites.length);
                                    logGlowCardClick('kpi_favorites_pro', userFavorites.length);
                                    router.push('/dashboard/favorites');
                                }
                            }}
                        >
                            <Card className="border-2 bg-gradient-to-br from-pink-50 to-white dark:from-pink-950 dark:to-background">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Mes Favoris</CardTitle>
                                    <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-pink-700 dark:text-pink-300">
                                        {userFavorites.length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Tâches sauvegardées
                                    </p>
                                </CardContent>
                            </Card>
                        </AnimatedCard>
                    </GlowCard>
                </AnimatedListItem>
            </AnimatedList>

            {/* Tabs : Devis, Missions, Analyses */}
            <Tabs 
                defaultValue="quotes" 
                className="space-y-4"
                onValueChange={(value) => {
                    logTabChange(AccountType.professional, 'pro_dashboard_tabs', value);
                }}
            >
                <TabsList>
                    <TabsTrigger value="quotes">Devis récents</TabsTrigger>
                    <TabsTrigger value="missions">Missions</TabsTrigger>
                    <TabsTrigger value="revenue">Revenus</TabsTrigger>
                </TabsList>

                {/* Devis récents */}
                <TabsContent value="quotes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Devis en attente
                            </CardTitle>
                            <CardDescription>
                                Gérez vos devis et répondez aux demandes clients
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {quotes.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Aucun devis récent
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {quotes.map((quote) => (
                                        <div
                                            key={quote.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-medium">Devis #{quote.id.slice(0, 8)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Client : {quote.clientName || 'Anonyme'}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    Créé le {quote.createdAt.toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <div className="text-lg font-bold">
                                                    {quote.amount.toLocaleString()} €
                                                </div>
                                                <Badge
                                                    variant={
                                                        quote.status === 'accepted'
                                                            ? 'default'
                                                            : quote.status === 'rejected'
                                                            ? 'destructive'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {quote.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-center">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/pro/quotes">
                                Voir tous les devis
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </TabsContent>

                {/* Missions */}
                <TabsContent value="missions" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Total</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats.totalJobs}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Terminées
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">
                                    {stats.completedJobs}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium flex items-center gap-1">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    Annulées
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">
                                    {stats.cancelledJobs}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Cette section sera bientôt disponible avec le détail de toutes vos missions.
                        </AlertDescription>
                    </Alert>
                </TabsContent>

                {/* Revenus */}
                <TabsContent value="revenue" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Euro className="h-5 w-5" />
                                    Revenus totaux
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">
                                    {stats.revenue.total.toLocaleString()} €
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Depuis votre inscription ImuPro
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Répartition mensuelle</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Mois en cours</span>
                                    <span className="font-semibold">
                                        {stats.revenue.thisMonth.toLocaleString()} €
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Mois dernier</span>
                                    <span className="font-semibold">
                                        {stats.revenue.lastMonth.toLocaleString()} €
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <span className="text-sm font-medium">Évolution</span>
                                    <span className={`font-bold text-lg flex items-center gap-1 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {revenueGrowth >= 0 ? (
                                            <TrendingUp className="h-4 w-4" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4" />
                                        )}
                                        {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Graphique des revenus */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Évolution des revenus (6 derniers mois)</CardTitle>
                            <CardDescription>
                                Suivez vos performances mensuelles en temps réel
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingRevenue ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : monthlyRevenue && monthlyRevenue.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={monthlyRevenue}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip 
                                            formatter={(value: number) => [`${value.toLocaleString()} €`, 'Revenus']}
                                            contentStyle={{ borderRadius: '8px' }}
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="hsl(var(--primary))" 
                                            strokeWidth={2}
                                            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-muted-foreground">
                                    Aucune donnée de revenus disponible
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Graphique des missions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Nombre de missions par mois</CardTitle>
                            <CardDescription>
                                Visualisez votre activité sur les 6 derniers mois
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingMissions ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : monthlyMissions && monthlyMissions.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={monthlyMissions}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip 
                                            formatter={(value: number) => [`${value}`, 'Missions']}
                                            contentStyle={{ borderRadius: '8px' }}
                                        />
                                        <Legend />
                                        <Bar 
                                            dataKey="missions" 
                                            fill="hsl(var(--primary))" 
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-muted-foreground">
                                    Aucune donnée de missions disponible
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Actions rapides avec animations */}
            <AnimatedDiv variant="fadeInUp">
                <Card>
                    <CardHeader>
                        <CardTitle>Actions rapides</CardTitle>
                        <CardDescription>
                            Gérez votre activité professionnelle ImuPro
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <ShimmerCard>
                                <Button 
                                    variant="outline" 
                                    className="h-auto py-4 w-full" 
                                    asChild
                                    onClick={() => logAnimatedElementInteraction('shimmer_button', 'shimmer', 'pro_portfolio')}
                                >
                                    <Link href="/dashboard/pro/portfolio" className="flex flex-col items-start">
                                        <Award className="h-5 w-5 mb-2" />
                                        <span className="font-semibold">Portfolio</span>
                                        <span className="text-xs text-muted-foreground">
                                            Gérer mes réalisations
                                        </span>
                                    </Link>
                                </Button>
                            </ShimmerCard>

                            <ShimmerCard>
                                <Button 
                                    variant="outline" 
                                    className="h-auto py-4 w-full" 
                                    asChild
                                    onClick={() => logAnimatedElementInteraction('shimmer_button', 'shimmer', 'pro_quotes')}
                                >
                                    <Link href="/dashboard/pro/quotes" className="flex flex-col items-start">
                                        <FileText className="h-5 w-5 mb-2" />
                                        <span className="font-semibold">Devis</span>
                                        <span className="text-xs text-muted-foreground">
                                            Créer et gérer des devis
                                        </span>
                                    </Link>
                                </Button>
                            </ShimmerCard>

                            <ShimmerCard>
                                <Button 
                                    variant="outline" 
                                    className="h-auto py-4 w-full" 
                                    asChild
                                    onClick={() => logAnimatedElementInteraction('shimmer_button', 'shimmer', 'pro_calendar')}
                                >
                                    <Link href="/dashboard/pro/calendar" className="flex flex-col items-start">
                                        <Calendar className="h-5 w-5 mb-2" />
                                        <span className="font-semibold">Agenda</span>
                                        <span className="text-xs text-muted-foreground">
                                            Planning et disponibilités
                                        </span>
                                    </Link>
                                </Button>
                            </ShimmerCard>

                            <ShimmerCard>
                                <Button 
                                    variant="outline" 
                                    className="h-auto py-4 w-full" 
                                    asChild
                                    onClick={() => logAnimatedElementInteraction('shimmer_button', 'shimmer', 'pro_messages')}
                                >
                                    <Link href="/dashboard/messages" className="flex flex-col items-start">
                                        <MessageSquare className="h-5 w-5 mb-2" />
                                        <span className="font-semibold">Messages</span>
                                        <span className="text-xs text-muted-foreground">
                                            {notifications.filter((n) => n.type === 'message').length} non lu(s)
                                        </span>
                                    </Link>
                                </Button>
                            </ShimmerCard>
                        </div>
                    </CardContent>
                </Card>
            </AnimatedDiv>

            {/* Abonnement */}
            <AnimatedDiv variant="fadeInUp">
                <Card>
                    <CardHeader>
                        <CardTitle>Votre abonnement ImuPro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-lg capitalize">
                                    Forfait {proProfile.subscription.tier}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Actif depuis le{' '}
                                    {new Date(proProfile.subscription.startDate).toLocaleDateString()}
                                </p>
                            </div>
                            <ShimmerCard>
                                <Button variant="outline" asChild>
                                    <Link href="/dashboard/pro/subscription">
                                        Gérer mon abonnement
                                    </Link>
                                </Button>
                            </ShimmerCard>
                        </div>

                        {proProfile.subscription.tier === 'basic' && (
                            <Alert className="border-primary/50 bg-primary/5">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <AlertDescription>
                                    Passez au forfait <strong>Premium</strong> pour débloquer plus de
                                    fonctionnalités : mise en avant dans les résultats, badges supplémentaires,
                                    statistiques avancées...
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </AnimatedDiv>
        </div>
    );
}
