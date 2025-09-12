
'use client';

import TaskCard from '@/components/task-card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { Address, ServiceCategory, Task, TaskStatus } from '@/lib/types';
import { collection, onSnapshot, query, where, doc, getDoc, Timestamp } from 'firebase/firestore';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getTasks } from '@/lib/data';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('DashboardPage');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(true);
      return;
    }

    // Using mock data as Firestore is empty for now
    setLoading(true);
    const mockTasks = getTasks().filter(t => t.status === TaskStatus.published);
    setTasks(mockTasks);
    setLoading(false);

  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tasks/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('createTask')}
          </Link>
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
         <div className="text-center py-12">
            <p className="text-muted-foreground">{t('noTasks')}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
