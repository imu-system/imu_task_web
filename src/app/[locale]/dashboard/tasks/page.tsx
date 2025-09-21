
'use client';

import TaskCard from '@/components/task-card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { Address, ServiceCategory, Task } from '@/lib/types';
import { collection, onSnapshot, query, where, doc, getDoc, Timestamp } from 'firebase/firestore';
import { PlusCircle, Loader2, LayoutGrid, List } from 'lucide-react';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import TaskListCard from '@/components/task-list-card';

export default function DashboardTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const t = useTranslations('MyTasksPage');
  const { user } = useAuth();
  const router = useRouter();

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
            
            if (taskData.timeWindowStart instanceof Timestamp) {
                taskData.timeWindowStart = taskData.timeWindowStart.toDate();
            }
            if (taskData.timeWindowEnd instanceof Timestamp) {
                taskData.timeWindowEnd = taskData.timeWindowEnd.toDate();
            }

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

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);
  
  const handleOpenSheet = (taskId: string) => {
    router.push(`?taskId=${taskId}`, { scroll: false });
  };

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
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
            <Input 
              placeholder={t('searchPlaceholder')}
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')}>
                      <LayoutGrid className="h-4 w-4" />
                      <span className="sr-only">{t('viewGrid')}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('viewGrid')}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}>
                      <List className="h-4 w-4" />
                      <span className="sr-only">{t('viewList')}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('viewList')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 rounded-lg border bg-card">
              <p className="text-muted-foreground">{searchTerm ? t('noSearchResults') : t('noTasks')}</p>
          </div>
        ) : (
          <>
              {view === 'grid' ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredTasks.map((task) => (
                          <TaskCard key={task.id} task={task} onOpenSheet={handleOpenSheet} />
                      ))}
                  </div>
              ) : (
                  <div className="space-y-4">
                      {filteredTasks.map((task) => (
                          <TaskListCard key={task.id} task={task} onOpenSheet={handleOpenSheet}/>
                      ))}
                  </div>
              )}
          </>
        )}
      </div>
  );
}
