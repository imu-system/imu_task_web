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
import { slugToFirestoreCategory, FIRESTORE_CATEGORIES } from '@/lib/constants/categories';

interface TasksGridProps {
  maxTasks?: number;
  showViewAll?: boolean;
  filterByStatus?: string;
  selectedCategory?: string | null;
}

export function TasksGrid({ 
  maxTasks = 8, 
  showViewAll = true,
  filterByStatus = 'open',
  selectedCategory = null
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
        console.log('🏷️ [TasksGrid] Frontend selected category (slug):', selectedCategory);

        // Query tasks from Firestore
        const tasksRef = collection(db, 'tasks');
        
        // Convert frontend slug to Firestore category value
        const firestoreCategory = selectedCategory ? slugToFirestoreCategory(selectedCategory) : null;
        console.log('🔄 [TasksGrid] Firestore category (mapped):', firestoreCategory);
        
        // Build query with conditional category filter
        let tasksQuery = query(
          tasksRef,
          where('status', '==', filterByStatus),
          orderBy('createdAt', 'desc'),
          limit(maxTasks)
        );

        // Add category filter if selected
        if (firestoreCategory === 'OTHER_CATEGORIES') {
          // Special case: "Autres" shows tasks NOT in the main categories
          console.log('🎯 [TasksGrid] Filtering for "autres" (excluding main categories)');
          // Firestore doesn't support "not in" with multiple values easily
          // So we'll fetch all and filter client-side for now
          tasksQuery = query(
            tasksRef,
            where('status', '==', filterByStatus),
            orderBy('createdAt', 'desc'),
            limit(maxTasks * 3) // Fetch more to compensate for filtering
          );
        } else if (firestoreCategory) {
          // Normal category filter
          tasksQuery = query(
            tasksRef,
            where('status', '==', filterByStatus),
            where('category', '==', firestoreCategory),
            orderBy('createdAt', 'desc'),
            limit(maxTasks)
          );
        }

        console.log('📊 [TasksGrid] Executing Firestore query...');
        const querySnapshot = await getDocs(tasksQuery);
        let tasksData: Task[] = [];

        querySnapshot.forEach((doc) => {
          const taskData = {
            id: doc.id,
            ...doc.data(),
          } as Task;
          
          // Filter out main categories for "autres"
          if (firestoreCategory === 'OTHER_CATEGORIES') {
            if (!FIRESTORE_CATEGORIES.includes(taskData.category as any)) {
              tasksData.push(taskData);
            }
          } else {
            tasksData.push(taskData);
          }
        });
        
        // Limit to maxTasks after filtering
        tasksData = tasksData.slice(0, maxTasks);

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
  }, [maxTasks, filterByStatus, selectedCategory]);

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
      <div className="w-full py-8 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">
              {error || (selectedCategory 
                ? `Aucune mission dans la catégorie "${selectedCategory}" pour le moment` 
                : t('noTasks')
              )}
            </p>
            {selectedCategory && (
              <p className="text-xs text-muted-foreground/60 mt-2">
                🔍 Catégorie recherchée : "{selectedCategory}"
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
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
              <Link href="/tasks">
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
              <Link href="/tasks">
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
