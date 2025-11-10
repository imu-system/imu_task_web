/**
 * Dashboard Provider - Vue du prestataire avec données réelles
 * Phase 9: Connexion données réelles - Stats provider depuis Firestore
 */
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, DollarSign, Briefcase, Star, TrendingUp, Clock, Award, Heart } from 'lucide-react';
import { useProviderStats } from '@/hooks/use-dashboard-data';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { useFavorites } from '@/hooks/use-favorites';
import { Link } from '@/navigation';

export default function ProviderDashboardPage() {
    const { user } = useAuth();
    const { data: stats, loading, error } = useProviderStats(user?.uid);
    const { favorites: userFavorites } = useFavorites();

    const isProvider = user?.roles?.includes(UserRole.provider) ?? false;

    if (!isProvider) {
        return (
            <div className="container py-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Accès refusé</CardTitle>
                        <CardDescription>
                            Vous devez être inscrit comme prestataire pour accéder à cette page.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="container py-12" data-testid="provider-dashboard">
                <h1 className="text-3xl font-bold mb-6">Tableau de bord prestataire</h1>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-24 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container py-12" data-testid="provider-dashboard">
                <h1 className="text-3xl font-bold mb-6">Tableau de bord prestataire</h1>
                
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Erreur de chargement</CardTitle>
                        <CardDescription>
                            Impossible de charger vos statistiques. Veuillez réessayer plus tard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{error.message}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-12" data-testid="provider-dashboard">
            <h1 className="text-3xl font-bold mb-6">Tableau de bord prestataire</h1>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Welcome Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Bienvenue !
                        </CardTitle>
                        <CardDescription>
                            Vous êtes maintenant un prestataire ImuTask
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Vous pouvez maintenant recevoir des offres de missions et gérer votre activité.
                        </p>
                    </CardContent>
                </Card>

                {/* Active Bookings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-blue-500" />
                            Missions actives
                        </CardTitle>
                        <CardDescription>En cours ou acceptées</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.activeBookings || 0}</p>
                    </CardContent>
                </Card>

                {/* Available Balance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            Solde disponible
                        </CardTitle>
                        <CardDescription>Prêt à retirer</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.availableBalance.toFixed(2) || '0.00'} €</p>
                    </CardContent>
                </Card>

                {/* Pending Earnings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            Revenus en attente
                        </CardTitle>
                        <CardDescription>En cours de traitement</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.pendingEarnings.toFixed(2) || '0.00'} €</p>
                    </CardContent>
                </Card>

                {/* Total Earnings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                            Revenus totaux
                        </CardTitle>
                        <CardDescription>Depuis le début</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.totalEarnings.toFixed(2) || '0.00'} €</p>
                    </CardContent>
                </Card>

                {/* Average Rating */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            Note moyenne
                        </CardTitle>
                        <CardDescription>{stats?.reviewCount || 0} avis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold">{stats?.averageRating.toFixed(1) || '0.0'}</p>
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* Completed Bookings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-green-500" />
                            Missions complétées
                        </CardTitle>
                        <CardDescription>Taux: {stats?.completionRate || 0}%</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.completedBookings || 0}</p>
                    </CardContent>
                </Card>

                {/* Response Rate */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Taux de réponse
                        </CardTitle>
                        <CardDescription>Propositions acceptées</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.responseRate || 0}%</p>
                    </CardContent>
                </Card>

                {/* Favorites */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-pink-500" />
                            Mes Favoris
                        </CardTitle>
                        <CardDescription>Tâches sauvegardées</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{userFavorites.length}</p>
                        {userFavorites.length > 0 && (
                            <Link href="/dashboard/favorites" className="text-sm text-primary hover:underline mt-2 inline-block">
                                Voir mes favoris →
                            </Link>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart - Full width */}
            {user?.uid && (
                <div className="mt-6">
                    <RevenueChart userId={user.uid} monthsBack={6} />
                </div>
            )}
        </div>
    );
}

