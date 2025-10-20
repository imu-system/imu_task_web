/**
 * Dashboard ImuPro - Vue professionnelle avec stats, revenus, agenda
 */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/navigation';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
} from 'lucide-react';
import Link from 'next/link';

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

    const [loading, setLoading] = useState(true);
    const [proProfile, setProProfile] = useState<ProProfile | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const loadProDashboard = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Vérifier le profil pro
                const proProfileRef = doc(db, 'pro_profiles', user.uid);
                const proProfileSnap = await getDoc(proProfileRef);

                if (!proProfileSnap.exists()) {
                    // Pas encore professionnel
                    setError('not_pro');
                    return;
                }

                const profileData = proProfileSnap.data() as ProProfile;

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

                setProProfile(profileData);
                setQuotes(quotesData);
                setNotifications(notificationsData);
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
            <div className="container max-w-4xl py-8">
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
            <div className="container max-w-4xl py-8">
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
            <div className="container max-w-4xl py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'Impossible de charger votre dashboard professionnel'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const stats = proProfile.stats;
    const revenueGrowth =
        stats.revenue.lastMonth > 0
            ? ((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100
            : 0;

    return (
        <div className="container py-8 space-y-6">
            {/* En-tête avec badge vérifié */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Dashboard ImuPro
                        </h1>
                        {proProfile.badges.verified && (
                            <Badge variant="default" className="bg-green-500">
                                <ShieldCheck className="mr-1 h-3 w-3" />
                                Vérifié
                            </Badge>
                        )}
                        {proProfile.badges.topRated && (
                            <Badge variant="secondary">
                                <Star className="mr-1 h-3 w-3" />
                                Top Rated
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground">
                        {proProfile.businessInfo.businessName}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/pro/portfolio">
                            <Award className="mr-2 h-4 w-4" />
                            Portfolio
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/pro/${user?.uid}`}>
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Voir mon profil public
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Notifications non lues */}
            {notifications.length > 0 && (
                <Alert>
                    <Bell className="h-4 w-4" />
                    <AlertDescription>
                        Vous avez <strong>{notifications.length}</strong> notification(s) non lue(s).{' '}
                        <Link href="/dashboard/notifications" className="underline">
                            Voir tout
                        </Link>
                    </AlertDescription>
                </Alert>
            )}

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Revenus du mois */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus ce mois</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.revenue.thisMonth.toLocaleString()} €
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {revenueGrowth >= 0 ? (
                                <>
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">
                                        +{revenueGrowth.toFixed(1)}%
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-red-500">
                                        {revenueGrowth.toFixed(1)}%
                                    </span>
                                </>
                            )}{' '}
                            vs mois dernier
                        </p>
                    </CardContent>
                </Card>

                {/* Missions actives */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Missions actives</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalJobs - stats.completedJobs - stats.cancelledJobs}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.completedJobs} terminées au total
                        </p>
                    </CardContent>
                </Card>

                {/* Note moyenne */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-1">
                            {stats.averageRating.toFixed(1)}
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Sur {stats.totalReviews} avis
                        </p>
                    </CardContent>
                </Card>

                {/* Taux d'acceptation */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taux d&apos;acceptation</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.acceptanceRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Temps de réponse : {stats.responseTime}h
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs : Devis, Missions, Analyses */}
            <Tabs defaultValue="quotes" className="space-y-4">
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
                                    <span className="text-sm font-medium">Moyenne / mois</span>
                                    <span className="font-bold text-lg">
                                        {Math.round(stats.revenue.total / 12).toLocaleString()} €
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                            Graphiques de revenus détaillés bientôt disponibles. Vous pourrez visualiser vos
                            performances mois par mois.
                        </AlertDescription>
                    </Alert>
                </TabsContent>
            </Tabs>

            {/* Actions rapides */}
            <Card>
                <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                    <CardDescription>
                        Gérez votre activité professionnelle ImuPro
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Button variant="outline" className="h-auto py-4" asChild>
                            <Link href="/dashboard/pro/portfolio" className="flex flex-col items-start">
                                <Award className="h-5 w-5 mb-2" />
                                <span className="font-semibold">Portfolio</span>
                                <span className="text-xs text-muted-foreground">
                                    Gérer mes réalisations
                                </span>
                            </Link>
                        </Button>

                        <Button variant="outline" className="h-auto py-4" asChild>
                            <Link href="/dashboard/pro/quotes" className="flex flex-col items-start">
                                <FileText className="h-5 w-5 mb-2" />
                                <span className="font-semibold">Devis</span>
                                <span className="text-xs text-muted-foreground">
                                    Créer et gérer des devis
                                </span>
                            </Link>
                        </Button>

                        <Button variant="outline" className="h-auto py-4" asChild>
                            <Link href="/dashboard/pro/calendar" className="flex flex-col items-start">
                                <Calendar className="h-5 w-5 mb-2" />
                                <span className="font-semibold">Agenda</span>
                                <span className="text-xs text-muted-foreground">
                                    Planning et disponibilités
                                </span>
                            </Link>
                        </Button>

                        <Button variant="outline" className="h-auto py-4" asChild>
                            <Link href="/dashboard/messages" className="flex flex-col items-start">
                                <MessageSquare className="h-5 w-5 mb-2" />
                                <span className="font-semibold">Messages</span>
                                <span className="text-xs text-muted-foreground">
                                    {notifications.filter((n) => n.type === 'message').length} non lu(s)
                                </span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Abonnement */}
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
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/pro/subscription">
                                Gérer mon abonnement
                            </Link>
                        </Button>
                    </div>

                    {proProfile.subscription.tier === 'basic' && (
                        <Alert>
                            <TrendingUp className="h-4 w-4" />
                            <AlertDescription>
                                Passez au forfait <strong>Premium</strong> pour débloquer plus de
                                fonctionnalités : mise en avant dans les résultats, badges supplémentaires,
                                statistiques avancées...
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
