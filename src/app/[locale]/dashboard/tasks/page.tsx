
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
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import TaskListCard from '@/components/task-list-card';
import { ServiceCategoryFilter } from '@/components/services/category-selector';
import { ServiceCategory as ServiceCategoryEnum } from '@/types/services';

export default function DashboardTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategoryEnum[]>([]);
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
                    const categoryData = categorySnap.data() as ServiceCategory;
                    taskData.category = categoryData.name; // Store category name as string
                }
            }
            if (taskData.id) {
                const addressRef = doc(db, 'addresses', taskData.id);
                const addressSnap = await getDoc(addressRef);
                if (addressSnap.exists()) {
                    taskData.adresse = addressSnap.data() as Address;
                }
            }
             // Skip client data fetching - Task type doesn't include client property
             // Client info can be fetched separately if needed in TaskCard component

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
    return tasks.filter(task => {
      // Text search filter
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategories.length === 0 || 
        (typeof task.category === 'string' && selectedCategories.includes(task.category as ServiceCategoryEnum));
      
      return matchesSearch && matchesCategory;
    });
  }, [tasks, searchTerm, selectedCategories]);
  
  const handleOpenSheet = (taskId: string) => {
    // Navigate to task detail page
    router.push(`/dashboard/tasks/${taskId}` as any);
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
          <Button asChild>
            <Link href="/dashboard/tasks/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('createTask')}
            </Link>
          </Button>
        </div>

        {/* Filters Section */}
        <div className="space-y-4">
          <ServiceCategoryFilter
            value={selectedCategories}
            onChange={setSelectedCategories}
          />
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
