
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title={t('kpi.activeTasks')} value="3" icon={<BookMarked />} />
        <KpiCard title={t('kpi.pendingOffers')} value="5" icon={<Handshake />} />
        <KpiCard title={t('kpi.completedMissions')} value="12" icon={<UserCheck />} />
        <KpiCard title={t('kpi.walletBalance')} value="€125.50" icon={<LayoutGrid />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold tracking-tight font-headline flex items-center gap-2">
               {userLocation && <Navigation className="h-6 w-6 text-primary" />}
               {userLocation ? t('nearbyTasks', { default: 'Tâches à proximité' }) : t('recommendedTasks.title')}
             </h2>
             {locating && (
               <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
             )}
           </div>
           {userLocation && (
             <Alert>
               <Navigation className="h-4 w-4" />
               <AlertDescription>
                 Affichage des tâches les plus proches de votre position
               </AlertDescription>
             </Alert>
           )}
            {tasks.length > 0 ? (
                 <div className="grid gap-6 md:grid-cols-2">
                    {tasks.slice(0, 4).map((task) => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onOpenSheet={handleOpenSheet}
                            showDistance={!!userLocation}
                            distance={(task as any).distance}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 rounded-lg bg-card border">
                    <p className="text-muted-foreground">{t('noTasks')}</p>
                </div>
            )}
            {tasks.length > 4 && (
              <div className="text-center">
                <Button variant="outline" onClick={() => router.push('/tasks' as any)}>
                  Voir toutes les tâches →
                </Button>
              </div>
            )}

            <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400"/>
                    {t('popularPacks.title')}
                </h2>
                <div className="space-y-4">
                    {mockServicePacks.map(pack => (
                        <ServicePackCard key={pack.id} pack={pack} />
                    ))}
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
