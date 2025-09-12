
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
  const t = useTranslations('MyTasksPage');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(true);
      return;
    }
    
    setLoading(true);
    const q = query(collection(db, 'tasks'), where('clientId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const tasksData: Task[] = [];
        for (const taskDoc of querySnapshot.docs) {
            const taskData = { id: taskDoc.id, ...taskDoc.data() } as Task;
            
            // Convert Timestamps
            if (taskData.timeWindowStart instanceof Timestamp) {
                taskData.timeWindowStart = taskData.timeWindowStart.toDate();
            }
            if (taskData.timeWindowEnd instanceof Timestamp) {
                taskData.timeWindowEnd = taskData.timeWindowEnd.toDate();
            }

            // Fetch related data
            if (taskData.categoryId) {
                const categoryRef = doc(db, 'serviceCategories', taskData.categoryId);
                const categorySnap = await getDoc(categoryRef);
                if (categorySnap.exists()) {
                    taskData.category = categorySnap.data() as ServiceCategory;
                }
            }
            if (taskData.addressId) {
                 const addressRef = doc(db, 'addresses', taskData.addressId);
                 const addressSnap = await getDoc(addressRef);
                 if (addressSnap.exists()) {
                     taskData.address = addressSnap.data() as Address;
                 }
            }
             if (taskData.clientId) {
                const clientRef = doc(db, 'users', taskData.clientId);
                const clientSnap = await getDoc(clientRef);
                if (clientSnap.exists()) {
                     const profileRef = doc(db, 'profiles', taskData.clientId);
                     const profileSnap = await getDoc(profileRef);
                     taskData.client = {
                         id: clientSnap.id,
                         ...clientSnap.data(),
                         profile: profileSnap.exists() ? profileSnap.data() : undefined
                     } as any;
                }
            }

            tasksData.push(taskData);
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
         <div className="text-center py-12 rounded-lg border bg-card">
            <p className="text-muted-foreground">{t('noTasks')}</p>
             <Button asChild variant="link">
              <Link href="/dashboard/tasks/new">{t('createFirstTask')}</Link>
            </Button>
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
