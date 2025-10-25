
'use client';

import TaskCard from '@/components/task-card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { Address, ServiceCategory, Task } from '@/lib/types';
import { collection, onSnapshot, query, where, doc, getDoc, Timestamp } from 'firebase/firestore';
import { PlusCircle, Loader2, LayoutGrid, List, Navigation } from 'lucide-react';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo, useCallback } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentPosition, sortTasksByDistance } from '@/lib/geolocation';
import { Badge } from '@/components/ui/badge';

/**
 * Helper function to extract localized text from string or Record<string, string>
 * @param text - The text field (can be string or Record<string, string>)
 * @param locale - Preferred locale (default: 'fr')
 * @returns Localized string
 */
function getLocalizedText(text: string | Record<string, string>, locale: string = 'fr'): string {
    if (typeof text === 'string') {
        return text;
    }
    // If it's a Record, try to get the locale, fallback to 'fr', then first available value
    return text[locale] || text.fr || text.en || Object.values(text)[0] || '';
}

export default function DashboardTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategoryEnum[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'distance' | 'budget'>('date');
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locating, setLocating] = useState(false);
  const t = useTranslations('MyTasksPage');
  const { user } = useAuth();
  const router = useRouter();

  // Get user's location
  const handleGetLocation = useCallback(async () => {
    setLocating(true);
    const position = await getCurrentPosition();
    if (position) {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setSortBy('distance'); // Auto-switch to distance sort
    }
    setLocating(false);
  }, []);

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
                    taskData.category = getLocalizedText(categoryData.name, 'fr'); // Store localized category name
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

  const filteredAndSortedTasks = useMemo(() => {
    // Filter tasks
    let filtered = tasks.filter(task => {
      // Text search filter
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategories.length === 0 || 
        (typeof task.category === 'string' && selectedCategories.includes(task.category as ServiceCategoryEnum));
      
      return matchesSearch && matchesCategory;
    });

    // Sort tasks
    switch (sortBy) {
      case 'distance':
        if (userLocation) {
          filtered = sortTasksByDistance(filtered, userLocation.lat, userLocation.lng);
        }
        break;
      case 'budget':
        filtered.sort((a, b) => (b.budget || 0) - (a.budget || 0));
        break;
      case 'date':
      default:
        filtered.sort((a, b) => {
          const dateA = a.timeWindowStart ? new Date(a.timeWindowStart).getTime() : 0;
          const dateB = b.timeWindowStart ? new Date(b.timeWindowStart).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    return filtered;
  }, [tasks, searchTerm, selectedCategories, sortBy, userLocation]);
  
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

        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex-1 w-full md:max-w-sm">
              <Input 
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Location button */}
              <Button
                variant={userLocation ? "default" : "outline"}
                size="sm"
                onClick={handleGetLocation}
                disabled={locating}
                className="flex-1 md:flex-initial"
              >
                {locating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4 mr-2" />
                )}
                {userLocation ? 'Position active' : 'Ma position'}
              </Button>

              {/* Sort selector */}
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Plus récentes</SelectItem>
                  <SelectItem value="budget">Budget (élevé)</SelectItem>
                  {userLocation && (
                    <SelectItem value="distance">Distance</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* View toggles */}
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
        
        {/* Results info */}
        {!loading && filteredAndSortedTasks.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{filteredAndSortedTasks.length} tâche{filteredAndSortedTasks.length > 1 ? 's' : ''}</span>
            {sortBy === 'distance' && userLocation && (
              <Badge variant="outline" className="text-xs">
                <Navigation className="h-3 w-3 mr-1" />
                Triées par distance
              </Badge>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        ) : filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12 rounded-lg border bg-card">
              <p className="text-muted-foreground">{searchTerm ? t('noSearchResults') : t('noTasks')}</p>
          </div>
        ) : (
          <>
              {view === 'grid' ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredAndSortedTasks.map((task) => (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onOpenSheet={handleOpenSheet}
                            showDistance={sortBy === 'distance' && !!userLocation}
                            distance={(task as any).distance}
                          />
                      ))}
                  </div>
              ) : (
                  <div className="space-y-4">
                      {filteredAndSortedTasks.map((task) => (
                          <TaskListCard 
                            key={task.id} 
                            task={task} 
                            onOpenSheet={handleOpenSheet}
                            showDistance={sortBy === 'distance' && !!userLocation}
                            distance={(task as any).distance}
                          />
                      ))}
                  </div>
              )}
          </>
        )}
      </div>
  );
}
