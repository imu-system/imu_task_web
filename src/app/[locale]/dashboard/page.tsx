
'use client';

import TaskCard from '@/components/task-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getTasks } from '@/lib/data';
import { Task, TaskStatus } from '@/lib/types';
import { BookMarked, Handshake, LayoutGrid, Loader2, PlusCircle, UserCheck, Star } from 'lucide-react';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { UpcomingBookings } from '@/components/dashboard/upcoming-bookings';
import { RecentNotifications } from '@/components/dashboard/recent-notifications';
import ServicePackCard from '@/components/service-pack-card';

const mockServicePacks = [
  { id: 'sp1', name: 'Nettoyage Airbnb 2h', price: 40, providerName: 'Marie Dupont', providerRating: 4.9 },
  { id: 'sp2', name: 'Assistance numérique - PC lent', price: 25, providerName: 'Yuki Tanaka', providerRating: 4.7 },
];

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('DashboardPage');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setLoading(true);
      return;
    }

    setLoading(true);
    const mockTasks = getTasks().filter(t => t.status === TaskStatus.published);
    setTasks(mockTasks);
    setLoading(false);
  }, [user]);

  const handleOpenSheet = (taskId: string) => {
    // This is now possible because the sheet state is in the parent layout
    router.push(`?taskId=${taskId}`, { scroll: false });
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
           <h2 className="text-2xl font-bold tracking-tight font-headline">
                {t('recommendedTasks.title')}
            </h2>
            {tasks.length > 0 ? (
                 <div className="grid gap-6 md:grid-cols-2">
                    {tasks.slice(0, 2).map((task) => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onOpenSheet={handleOpenSheet}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 rounded-lg bg-card border">
                    <p className="text-muted-foreground">{t('noTasks')}</p>
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
