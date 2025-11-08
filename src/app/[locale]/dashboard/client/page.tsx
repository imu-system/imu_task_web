
'use client';

import TaskCard from '@/components/task-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getTasks } from '@/lib/data';
import { Task, TaskStatus, AccountType } from '@/lib/types';
import { BookMarked, Handshake, LayoutGrid, Loader2, PlusCircle, UserCheck, Star, Navigation, Heart, TrendingUp, Clock } from 'lucide-react';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useCallback } from 'react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { UpcomingBookings } from '@/components/dashboard/upcoming-bookings';
import { RecentNotifications } from '@/components/dashboard/recent-notifications';
import ServicePackCard from '@/components/service-pack-card';
import { getTasksWithFilters } from '@/lib/firestore-tasks';
import { getCurrentPosition, sortTasksByDistance } from '@/lib/geolocation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getClientProposals } from '@/lib/firestore-proposals';
import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import { 
  logDashboardPageView, 
  logKpiCardClick, 
  logTaskCardAction, 
  logTabChange,
  logServiceCardClick,
  logFavoriteToggle,
  logGlowCardClick,
  logShimmerButtonClick,
  logGradientSectionView,
  logAnimatedElementInteraction
} from '@/lib/analytics';
import { 
  AnimatedDiv, 
  AnimatedList, 
  AnimatedListItem, 
  AnimatedCard,
  GradientBackground,
  GlowCard,
  RainbowText,
  ShimmerCard
} from '@/components/ui/animated';
import { ClientSpendingChart } from '@/components/dashboard/client-spending-chart';
import { TaskCategoryChart } from '@/components/dashboard/task-category-chart';

interface ServicePack {
  id: string;
  name: string;
  price: number;
  providerName: string;
  providerRating: number;
  providerId?: string;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myPostedTasks, setMyPostedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMyTasks, setLoadingMyTasks] = useState(true);
  const [loadingServicePacks, setLoadingServicePacks] = useState(true);
  const [servicePacks, setServicePacks] = useState<ServicePack[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locating, setLocating] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stats, setStats] = useState({
    activeTasks: 0,
    pendingOffers: 0,
    completedMissions: 0
  });
  const t = useTranslations('DashboardPage');
  const tBreadcrumbs = useTranslations('Breadcrumbs');
  const { user } = useAuth();
  const router = useRouter();

  // Fetch user's posted tasks from Firestore
  useEffect(() => {
    const fetchMyTasks = async () => {
      if (!user?.uid) {
        setLoadingMyTasks(false);
        return;
      }
      
      setLoadingMyTasks(true);
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(4)
        );
        
        const snapshot = await getDocs(tasksQuery);
        const userTasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
        
        setMyPostedTasks(userTasks);
        
        // Calculate stats
        const active = userTasks.filter(t => t.status === 'open' || t.status === 'in_progress').length;
        const completed = userTasks.filter(t => t.status === 'completed').length;
        
        // Fetch pending proposals count
        let pendingCount = 0;
        try {
          const proposals = await getClientProposals(user.uid);
          pendingCount = proposals.filter(p => p.status === 'pending').length;
        } catch (error) {
          console.error('Error fetching proposals:', error);
        }
        
        setStats({
          activeTasks: active,
          pendingOffers: pendingCount,
          completedMissions: completed
        });
      } catch (error) {
        console.error('Error fetching user tasks:', error);
      } finally {
        setLoadingMyTasks(false);
      }
    };

    fetchMyTasks();
  }, [user]);

  // Fetch popular service packs
  useEffect(() => {
    const fetchServicePacks = async () => {
      setLoadingServicePacks(true);
      try {
        const packsQuery = query(
          collection(db, 'service_packages'),
          where('active', '==', true),
          orderBy('bookingCount', 'desc'),
          limit(2)
        );
        
        const snapshot = await getDocs(packsQuery);
        const packs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Service',
            price: data.price || 0,
            providerName: data.providerName || 'Prestataire',
            providerRating: data.providerRating || 4.5,
            providerId: data.providerId
          };
        }) as ServicePack[];
        
        setServicePacks(packs);
      } catch (error) {
        console.error('Error fetching service packs:', error);
        // Fallback to empty array
        setServicePacks([]);
      } finally {
        setLoadingServicePacks(false);
      }
    };

    fetchServicePacks();
  }, []);

  // Load favorites from localStorage (TODO: migrate to Firestore)
  useEffect(() => {
    if (user?.uid) {
      const savedFavorites = localStorage.getItem(`favorites_${user.uid}`);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    }
  }, [user]);

  // Analytics: Log page view
  useEffect(() => {
    if (user) {
      logDashboardPageView(AccountType.individual, 'client');
      // Log gradient section view for visual effects tracking
      logGradientSectionView('welcome_header', AccountType.individual);
    }
  }, [user]);

  // Fetch nearby open tasks from Firestore
  useEffect(() => {
    const fetchNearbyTasks = async () => {
      setLoading(true);
      try {
        // Fetch open tasks
        const openTasks = await getTasksWithFilters({ status: 'open' });
        
        // Sort by distance if location available
        if (userLocation) {
          const sortedTasks = sortTasksByDistance(openTasks as any, userLocation.lat, userLocation.lng);
          setTasks(sortedTasks.slice(0, 6) as any); // Show top 6 nearest tasks
        } else {
          setTasks(openTasks.slice(0, 6) as any); // Show first 6 tasks
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // Fallback to mock data if Firestore fails
        const mockTasks = getTasks();
        setTasks(mockTasks.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNearbyTasks();
    } else {
      setLoading(false);
    }
  }, [user, userLocation]);

  // Get user's location on mount
  useEffect(() => {
    const getLocation = async () => {
      setLocating(true);
      const position = await getCurrentPosition();
      if (position) {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      }
      setLocating(false);
    };
    
    if (user) {
      getLocation();
    }
  }, [user]);

  const handleOpenSheet = (taskId: string) => {
    // This is now possible because the sheet state is in the parent layout
    const currentPath = window.location.pathname;
    window.history.pushState({}, '', `${currentPath}?taskId=${taskId}`);
  };

  const toggleFavorite = (providerId: string) => {
    if (!user?.uid) return;
    
    setFavorites(prev => {
      const newFavorites = prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId];
      
      // Save to localStorage (TODO: sync to Firestore)
      localStorage.setItem(`favorites_${user.uid}`, JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  if (loading || loadingMyTasks) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4 p-4">
        <ShimmerCard className="w-full max-w-md p-8 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-lg font-medium text-muted-foreground">Chargement de votre dashboard...</p>
          </div>
        </ShimmerCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header moderne avec recherche */}
      <DashboardHeader accountType={AccountType.individual} title="Dashboard" showSearch={true} />

      <div className="container py-6 space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: tBreadcrumbs('dashboard'), href: '/dashboard/client' }
          ]}
        />

        {/* Filters Section */}
        <div className="flex gap-4">
          {/* Mobile: Sheet variant (button) */}
          <div className="lg:hidden">
            <DashboardFilters 
              userId={user?.uid}
              variant="sheet"
            />
          </div>
        </div>
        
        {/* Section de bienvenue moderne avec dégradé animé */}
        <GradientBackground className="rounded-2xl p-8 -mx-4 md:mx-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-white">
              <h1 className="text-4xl font-bold tracking-tight font-headline">
                {t('welcome', { name: user?.profile?.displayName || user?.email })}
              </h1>
              <p className="text-lg opacity-90 mt-1">{t('welcomeSubtitle')}</p>
            </div>
          </div>
        </GradientBackground>

        {/* Actions rapides */}
        <AnimatedDiv variant="fadeInUp" delay={0.1}>
          <QuickActions accountType={AccountType.individual} />
        </AnimatedDiv>

        {/* KPIs modernes avec animations et effets de lueur */}
        <AnimatedList className="grid gap-4 md:grid-cols-3">
          <AnimatedListItem>
            <GlowCard glowColor="rgba(102, 126, 234, 0.5)">
              <AnimatedCard 
                clickable
                onClick={() => {
                  if (stats.activeTasks > 0) {
                    logKpiCardClick(AccountType.individual, 'active_tasks', stats.activeTasks);
                    logGlowCardClick('kpi_active_tasks', stats.activeTasks);
                    router.push('/dashboard/tasks');
                  }
                }}
              >
                <Card className="border-2 h-full cursor-pointer bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tâches actives</CardTitle>
                    <BookMarked className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{stats.activeTasks}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tâches en cours et ouvertes
                    </p>
                    {stats.activeTasks > 0 && (
                      <div className="mt-2">
                        <Link href="/dashboard/tasks">
                          <Button variant="link" size="sm" className="px-0 h-auto">
                            Voir les détails →
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>
            </GlowCard>
          </AnimatedListItem>

          <AnimatedListItem>
            <GlowCard glowColor="rgba(249, 115, 22, 0.5)">
              <AnimatedCard 
                clickable
                onClick={() => {
                  if (stats.pendingOffers > 0) {
                    logKpiCardClick(AccountType.individual, 'pending_offers', stats.pendingOffers);
                    logGlowCardClick('kpi_pending_offers', stats.pendingOffers);
                    router.push('/dashboard/proposals');
                  }
                }}
              >
                <Card className="border-2 h-full cursor-pointer bg-gradient-to-br from-orange-50 to-white dark:from-slate-900 dark:to-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Propositions reçues</CardTitle>
                    <Handshake className="h-5 w-5 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-500">{stats.pendingOffers}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      En attente de votre réponse
                    </p>
                    {stats.pendingOffers > 0 && (
                      <div className="mt-2">
                        <Link href="/dashboard/proposals">
                          <Button variant="link" size="sm" className="px-0 h-auto">
                            Consulter →
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>
            </GlowCard>
          </AnimatedListItem>

          <AnimatedListItem>
            <GlowCard glowColor="rgba(34, 197, 94, 0.5)">
              <AnimatedCard 
                clickable
                onClick={() => {
                  logGlowCardClick('kpi_completed_missions', stats.completedMissions);
                }}
              >
                <Card className="border-2 h-full bg-gradient-to-br from-green-50 to-white dark:from-slate-900 dark:to-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Missions terminées</CardTitle>
                    <UserCheck className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">{stats.completedMissions}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Avec succès
                    </p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </GlowCard>
          </AnimatedListItem>
        </AnimatedList>

        {/* Section Mes Tâches Postées avec onglets */}
        <AnimatedDiv variant="fadeInUp" delay={0.2}>
          <Tabs 
            defaultValue="active" 
            className="space-y-4"
            onValueChange={(value) => {
              logTabChange(AccountType.individual, value === 'active' ? 'all' : 'active', value);
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight font-headline">
                Mes tâches
              </h2>
            <TabsList>
              <TabsTrigger value="active">Actives</TabsTrigger>
              <TabsTrigger value="all">Toutes</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="space-y-4">
            {loadingMyTasks ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : myPostedTasks.filter(t => t.status !== 'completed').length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {myPostedTasks.filter(t => t.status !== 'completed').map(task => (
                  <Card key={task.id} className="hover:shadow-lg transition-all hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">{task.title}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {task.description}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={
                            task.status === 'in_progress' ? 'default' :
                            task.status === 'open' ? 'secondary' :
                            'outline'
                          }
                          className="ml-2"
                        >
                          {task.status === 'open' ? '🔵 Ouverte' :
                           task.status === 'in_progress' ? '🟡 En cours' :
                           task.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <LayoutGrid className="h-4 w-4" />
                            {task.category}
                          </span>
                          <span className="font-semibold text-primary">
                            {task.budget}€
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/tasks/${task.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Voir les détails
                            </Button>
                          </Link>
                          {task.status === 'open' && (
                            <Link href={`/tasks/${task.id}/edit`} className="flex-1">
                              <Button variant="default" size="sm" className="w-full">
                                Modifier
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Aucune tâche active</p>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                    Vous n'avez aucune tâche en cours. Postez une nouvelle tâche pour trouver des prestataires.
                  </p>
                  <ShimmerCard>
                    <Link href="/tasks/create">
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-primary to-primary/80"
                        onClick={() => logShimmerButtonClick('Poster une tâche', 'create_task')}
                      >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Poster une tâche
                      </Button>
                    </Link>
                  </ShimmerCard>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {loadingMyTasks ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : myPostedTasks.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {myPostedTasks.map(task => (
                  <Card key={task.id} className="hover:shadow-lg transition-all hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">{task.title}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {task.description}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={
                            task.status === 'completed' ? 'default' :
                            task.status === 'in_progress' ? 'secondary' :
                            'outline'
                          }
                          className="ml-2"
                        >
                          {task.status === 'open' ? '🔵 Ouverte' :
                           task.status === 'in_progress' ? '🟡 En cours' :
                           task.status === 'completed' ? '✅ Terminée' :
                           task.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <LayoutGrid className="h-4 w-4" />
                            {task.category}
                          </span>
                          <span className="font-semibold text-primary">
                            {task.budget ? `${task.budget}€` : 'Budget à définir'}
                          </span>
                        </div>
                        <Link href={`/tasks/${task.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            Voir les détails
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookMarked className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Aucune tâche trouvée</p>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                    Commencez par poster votre première tâche pour trouver des prestataires qualifiés.
                  </p>
                  <ShimmerCard>
                    <Link href="/tasks/create">
                      <Button onClick={() => logShimmerButtonClick('Poster ma première tâche', 'create_first_task')}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Poster ma première tâche
                      </Button>
                    </Link>
                  </ShimmerCard>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </AnimatedDiv>

        {/* Section Découvrir des services */}
        <AnimatedDiv variant="fadeInUp" delay={0.3}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight font-headline flex items-center gap-2">
                {userLocation && <Navigation className="h-6 w-6 text-primary" />}
                Services recommandés
              </h2>
              {locating && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {userLocation && (
              <Alert className="border-primary/50 bg-primary/5">
                <Navigation className="h-4 w-4 text-primary" />
                <AlertDescription>
                  Prestataires disponibles dans votre secteur
                </AlertDescription>
              </Alert>
            )}
            
            {/* Service Packs populaires */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="text-yellow-400 fill-yellow-400 h-5 w-5"/>
                  Services populaires
                </CardTitle>
                <CardDescription>
                  Les plus demandés par la communauté
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingServicePacks ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : servicePacks.length > 0 ? (
                  <>
                    {servicePacks.map(pack => (
                      <ServicePackCard key={pack.id} pack={pack} />
                    ))}
                    <ShimmerCard>
                      <Button 
                        variant="outline" 
                        className="w-full border-2 hover:border-primary/50 hover:bg-primary/5" 
                        onClick={() => {
                          logAnimatedElementInteraction('discover_services', 'shimmer', 'client_market_navigation');
                          router.push('/market' as any);
                        }}
                      >
                        Découvrir tous les services →
                      </Button>
                    </ShimmerCard>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">Aucun service disponible</p>
                    <p className="text-sm text-muted-foreground">
                      Les services populaires apparaîtront ici
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prestataires favoris */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="text-red-500 fill-red-500 h-5 w-5" />
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                    Mes prestataires favoris
                  </span>
                </CardTitle>
                <CardDescription>
                  Accès rapide à vos prestataires préférés
                </CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length > 0 ? (
                  <div className="space-y-3">
                    {favorites.slice(0, 3).map(providerId => (
                      <Card key={providerId} className="hover:shadow-md transition-all hover:border-primary/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold">
                                {providerId.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">Prestataire {providerId.slice(0, 8)}</p>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>4.8/5</span>
                                </div>
                              </div>
                            </div>
                            <ShimmerCard>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  toggleFavorite(providerId);
                                  logFavoriteToggle('remove', providerId, `Prestataire ${providerId.slice(0, 8)}`);
                                  logAnimatedElementInteraction('favorite_button', 'shimmer', 'remove_favorite');
                                }}
                              >
                                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                              </Button>
                            </ShimmerCard>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {favorites.length > 3 && (
                      <ShimmerCard>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          size="sm"
                          onClick={() => {
                            logAnimatedElementInteraction('view_all_favorites', 'shimmer', 'client_favorites_expand');
                            router.push('/dashboard/favorites' as any);
                          }}
                        >
                          Voir tous mes favoris ({favorites.length})
                        </Button>
                      </ShimmerCard>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">Aucun favori</p>
                    <p className="text-sm text-muted-foreground">
                      Marquez des prestataires en favoris pour les retrouver facilement
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
              {/* Phase 9: Connexion données réelles - Props ajoutées */}
              <UpcomingBookings userId={user?.uid || ''} role="client" limit={5} />
              <RecentNotifications userId={user?.uid || ''} limit={3} />
          </div>
        </div>

        {/* Phase 9 Option C: Client Analytics Charts */}
        {user?.uid && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ClientSpendingChart userId={user.uid} monthsBack={6} />
            <TaskCategoryChart userId={user.uid} />
          </div>
        )}

        </AnimatedDiv>
      </div>
    </div>
  );
}
