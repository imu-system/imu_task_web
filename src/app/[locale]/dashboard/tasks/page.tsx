
'use client';

import TaskCard from '@/components/task-card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { Task } from '@/lib/types';
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
    // We don't fetch tasks until the user is loaded
    if (!user) {
        setLoading(true);
        return;
    };

    const q = query(collection(db, 'tasks'), where('status', '==', 'open'));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);
      const tasksData: Task[] = [];
      
      const userPromises = new Map<string, Promise<any>>();
      const getUser = (userId: string) => {
        if (!userPromises.has(userId)) {
          userPromises.set(userId, getDoc(doc(db, 'users', userId)));
        }
        return userPromises.get(userId)!;
      }

      for (const taskDoc of querySnapshot.docs) {
        const taskData = taskDoc.data();
        
        let clientData: any = null;
        if (taskData.clientId) {
          const userDoc = await getUser(taskData.clientId);
          if (userDoc.exists()) {
            clientData = { id: userDoc.id, ...userDoc.data() };
          }
        }
        
        const timeWindowStart = (taskData.timeWindowStart as Timestamp)?.toDate ? (taskData.timeWindowStart as Timestamp).toDate() : new Date();
        const timeWindowEnd = (taskData.timeWindowEnd as Timestamp)?.toDate ? (taskData.timeWindowEnd as Timestamp).toDate() : new Date();


        tasksData.push({
          id: taskDoc.id,
          ...taskData,
          timeWindowStart: timeWindowStart,
          timeWindowEnd: timeWindowEnd,
          client: clientData ? { id: clientData.id, email: clientData.email, profile: { displayName: clientData.displayName, photoUrl: clientData.photoURL || `https://i.pravatar.cc/150?u=${clientData.id}` }} : null,
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

