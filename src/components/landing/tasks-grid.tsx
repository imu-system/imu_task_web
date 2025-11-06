'use client';

import { useState, useEffect } from 'react';
import { TaskCardModern } from './task-card-modern';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Task } from '@/lib/types';

interface TasksGridProps {
  maxTasks?: number;
  showViewAll?: boolean;
  filterByStatus?: string;
}

export function TasksGrid({ 
  maxTasks = 8, 
  showViewAll = true,
  filterByStatus = 'open'
}: TasksGridProps) {
  const t = useTranslations('LandingPage.tasksGrid');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 [TasksGrid] Fetching tasks with status:', filterByStatus);

        // Query tasks from Firestore
        const tasksRef = collection(db, 'tasks');
        const tasksQuery = query(
          tasksRef,
          where('status', '==', filterByStatus),
          orderBy('createdAt', 'desc'),
          limit(maxTasks)
        );

        console.log('📊 [TasksGrid] Executing Firestore query...');
        const querySnapshot = await getDocs(tasksQuery);
        const tasksData: Task[] = [];

        querySnapshot.forEach((doc) => {
          tasksData.push({
            id: doc.id,
            ...doc.data(),
          } as Task);
        });

        console.log(`✅ [TasksGrid] Found ${tasksData.length} tasks:`, tasksData);
        setTasks(tasksData);
      } catch (err) {
        console.error('❌ [TasksGrid] Error fetching tasks:', err);
        setError('Erreur lors du chargement des tâches');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [maxTasks, filterByStatus]);

  if (loading) {
    return (
      <div className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error || tasks.length === 0) {
    return (
      <div className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl font-headline mb-4">
            {t('title')}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">
              {error || t('noTasks')}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button asChild size="lg" className="rounded-3xl">
                <Link href="/signup">
                  {t('signupToPoster')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-3xl">
                <Link href="/login">
                  {t('login')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-2">
              {t('title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {t('subtitle')}
            </p>
          </div>
          {showViewAll && (
            <Button asChild variant="outline" className="mt-4 md:mt-0" size="lg">
              <Link href="/tasks/browse">
                {t('viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tasks.map((task) => (
            <TaskCardModern key={task.id} task={task} />
          ))}
        </div>

        {/* Bottom CTA (mobile) */}
        {showViewAll && (
          <div className="mt-12 text-center md:hidden">
            <Button asChild size="lg">
              <Link href="/tasks/browse">
                {t('viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
