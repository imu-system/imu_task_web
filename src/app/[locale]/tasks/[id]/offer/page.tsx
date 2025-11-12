'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { getTaskById } from '@/lib/firestore-tasks';
import { OfferForm } from '@/components/offers/OfferForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Task } from '@/lib/firestore-tasks';

export default function OfferPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations('Offers');
  const taskId = params.id as string;
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchTask() {
      if (!user) return;

      try {
        setLoading(true);
        const fetchedTask = await getTaskById(taskId);
        
        if (!fetchedTask) {
          router.push('/tasks');
          return;
        }
        
        if (fetchedTask.status !== 'open') {
          router.push(`/tasks/${taskId}`);
          return;
        }
        
        setTask(fetchedTask);
      } catch (err: any) {
        console.error('Error fetching task:', err);
        setError(err.message || 'Failed to load task');
      } finally {
        setLoading(false);
      }
    }

    if (taskId && user) {
      fetchTask();
    }
  }, [taskId, user, router]);

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Alert>
          <AlertDescription>
            Vous devez être connecté pour soumettre une offre.{' '}
            <Link href="/auth/login" className="font-medium underline">
              Se connecter
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!task) {
    return null; // Will redirect
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('submitOfferTitle')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('submitOfferDescription')}
        </p>
      </div>

      <OfferForm
        taskId={taskId}
        taskBudget={task.budget ?? 0}
        taskTitle={task.title}
      />
    </div>
  );
}
