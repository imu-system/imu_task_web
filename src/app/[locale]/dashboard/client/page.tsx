
'use client';

import TaskCard from '@/components/task-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getTasks } from '@/lib/data';
import { Task, TaskStatus } from '@/lib/types';
import { BookMarked, Handshake, LayoutGrid, Loader2, PlusCircle, UserCheck, Star, Navigation } from 'lucide-react';
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

const mockServicePacks = [
  { id: 'sp1', name: 'Nettoyage Airbnb 2h', price: 40, providerName: 'Marie Dupont', providerRating: 4.9 },
  { id: 'sp2', name: 'Assistance numérique - PC lent', price: 25, providerName: 'Yuki Tanaka', providerRating: 4.7 },
];

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locating, setLocating] = useState(false);
  const t = useTranslations('DashboardPage');
  const { user } = useAuth();
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            {t('welcome', { name: user?.profile?.displayName || user?.email })}
          </h1>
          <p className="text-muted-foreground">{t('welcomeSubtitle')}</p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => router.push('/tasks/create' as any)}>
          <PlusCircle className="h-5 w-5" />
          Poster une tâche
        </Button>
      </div>

      {/* KPIs simplifiés pour particuliers - Focus tâches */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title={t('kpi.activeTasks')} value="3" icon={<BookMarked />} />
        <KpiCard title={t('kpi.pendingOffers')} value="5" icon={<Handshake />} />
        <KpiCard title={t('kpi.completedMissions')} value="12" icon={<UserCheck />} />
      </div>

      {/* Section Mes Tâches Postées */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight font-headline">
            Mes tâches postées
          </h2>
          <Button variant="outline" onClick={() => router.push('/dashboard/tasks' as any)}>
            Voir tout
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Placeholder - à remplacer par les vraies tâches de l'utilisateur */}
          <div className="p-6 border rounded-lg bg-card">
            <p className="text-muted-foreground">Vous n'avez pas encore posté de tâche</p>
            <Button variant="link" className="p-0 mt-2" onClick={() => router.push('/tasks/create' as any)}>
              Créer ma première tâche →
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold tracking-tight font-headline flex items-center gap-2">
               {userLocation && <Navigation className="h-6 w-6 text-primary" />}
               Trouver de l'aide près de chez moi
             </h2>
             {locating && (
               <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
             )}
           </div>
           {userLocation && (
             <Alert>
               <Navigation className="h-4 w-4" />
               <AlertDescription>
                 Prestataires disponibles dans votre secteur
               </AlertDescription>
             </Alert>
           )}
            
            {/* Service Packs populaires */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400 h-5 w-5"/>
                    Services populaires
                </h3>
                <div className="space-y-4">
                    {mockServicePacks.map(pack => (
                        <ServicePackCard key={pack.id} pack={pack} />
                    ))}
                </div>
                <Button variant="outline" className="w-full" onClick={() => router.push('/market' as any)}>
                  Voir tous les services →
                </Button>
            </div>

            {/* Prestataires favoris */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Star className="text-primary h-5 w-5" />
                Mes prestataires favoris
              </h3>
              <div className="p-6 border rounded-lg bg-card text-center">
                <p className="text-muted-foreground">Aucun favori pour le moment</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Marquez des prestataires en favoris pour les retrouver facilement
                </p>
              </div>
            </div>
        </div>
        <div className="space-y-8">
            <UpcomingBookings />
            <RecentNotifications />
        </div>
      </div>
    </div>
  );
}
