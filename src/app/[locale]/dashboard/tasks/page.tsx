
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

export default function DashboardTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('DashboardPage');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(true);
      return;
    }

    const q = query(collection(db, 'tasks'), where('status', '==', TaskStatus.published));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);
      const tasksData: Task[] = [];
      
      // Caching fetched documents
      const cache = new Map<string, any>();
      const getCachedDoc = async (collectionName: string, id: string) => {
        const key = `${collectionName}:${id}`;
        if (cache.has(key)) {
          return cache.get(key);
        }
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        const data = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        cache.set(key, data);
        return data;
      };

      for (const taskDoc of querySnapshot.docs) {
        const taskData = taskDoc.data();
        
        const client = await getCachedDoc('users', taskData.clientId);
        const category = await getCachedDoc('serviceCategories', taskData.categoryId);
        const address = await getCachedDoc('addresses', taskData.addressId);
        
        tasksData.push({
          id: taskDoc.id,
          ...taskData,
          timeWindowStart: (taskData.timeWindowStart as Timestamp)?.toDate(),
          timeWindowEnd: (taskData.timeWindowEnd as Timestamp)?.toDate(),
          client: client ? { id: client.id, email: client.email, profile: { displayName: client.displayName, photoUrl: client.photoURL || `https://i.pravatar.cc/150?u=${client.id}` }} : null,
          category: category as ServiceCategory | null,
          address: address as Address | null,
        } as Task);
      }
      
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
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
