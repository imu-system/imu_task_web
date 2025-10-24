'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getTasksWithFilters, Task } from '@/lib/firestore-tasks';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, SlidersHorizontal, MapIcon, ListIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Task categories matching your system
const TASK_CATEGORIES = [
  'home_services',
  'delivery',
  'tutoring',
  'digital_help',
  'gardening',
  'pet_care',
  'event_help',
  'moving',
] as const;

type SortOption = 'newest' | 'oldest' | 'budget_low' | 'budget_high';
type ViewMode = 'list' | 'map';

export default function BrowseTasksPage() {
  const t = useTranslations('BrowseTasks');
  const tCategories = useTranslations('TaskCategories');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const isProvider = user?.roles?.includes(UserRole.provider) ?? false;

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minBudget, setMinBudget] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Redirect non-providers
  useEffect(() => {
    if (!authLoading && (!user || !isProvider)) {
      router.push('/');
    }
  }, [user, isProvider, authLoading, router]);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters: any = {
          status: 'open',
        };

        if (selectedCategory !== 'all') {
          filters.category = selectedCategory;
        }

        if (minBudget) {
          filters.minBudget = parseFloat(minBudget);
        }

        if (maxBudget) {
          filters.maxBudget = parseFloat(maxBudget);
        }

        const fetchedTasks = await getTasksWithFilters(filters);
        setTasks(fetchedTasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(t('errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    if (user && isProvider) {
      fetchTasks();
    }
  }, [user, isProvider, selectedCategory, minBudget, maxBudget, t]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'budget_low':
        filtered.sort((a, b) => a.budget - b.budget);
        break;
      case 'budget_high':
        filtered.sort((a, b) => b.budget - a.budget);
        break;
    }

    return filtered;
  }, [tasks, searchQuery, sortBy]);

  // Check if task is new (< 24h)
  const isNewTask = (createdAt: Date) => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return createdAt > oneDayAgo;
  };

  if (authLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user || !isProvider) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.availableTasks')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAndSortedTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.newToday')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredAndSortedTasks.filter((task) => isNewTask(task.createdAt)).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.avgBudget')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredAndSortedTasks.length > 0
                ? `€${Math.round(
                    filteredAndSortedTasks.reduce((sum, task) => sum + task.budget, 0) /
                      filteredAndSortedTasks.length
                  )}`
                : '€0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('sort.newest')}</SelectItem>
                <SelectItem value="oldest">{t('sort.oldest')}</SelectItem>
                <SelectItem value="budget_high">{t('sort.budget_high')}</SelectItem>
                <SelectItem value="budget_low">{t('sort.budget_low')}</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('map')}
                disabled
                title={t('view.map')}
              >
                <MapIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full md:w-auto"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {showFilters ? t('search.hideFilters') : t('search.showFilters')}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">{t('filters.category')}</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allCategories')}</SelectItem>
                    {TASK_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {tCategories(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="minBudget">{t('filters.minBudget')}</Label>
                <Input
                  id="minBudget"
                  type="number"
                  placeholder="€0"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  min="0"
                  step="10"
                />
              </div>

              <div>
                <Label htmlFor="maxBudget">{t('filters.maxBudget')}</Label>
                <Input
                  id="maxBudget"
                  type="number"
                  placeholder="€1000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  min="0"
                  step="10"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{t('messages.error')}: {error}</p>
          </CardContent>
        </Card>
      ) : filteredAndSortedTasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-lg font-medium mb-2">{t('messages.noTasks')}</p>
              <p className="text-muted-foreground mb-4">{t('messages.noTasksMessage')}</p>
              <Button variant="outline" onClick={() => {
                setSelectedCategory('all');
                setMinBudget('');
                setMaxBudget('');
                setSearchQuery('');
              }}>
                {t('messages.clearFilters')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTasks.map((task) => (
            <div key={task.id} className="relative">
              {isNewTask(task.createdAt) && (
                <Badge className="absolute -top-2 -right-2 z-10 bg-emerald-500">
                  {t('badge.new')}
                </Badge>
              )}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" onClick={() => router.push(`/tasks/${task.id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{task.title}</CardTitle>
                    <Badge variant="outline">{tCategories(task.category)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">{task.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="mr-1">📍</span>
                    <span className="line-clamp-1">{typeof task.location === 'string' ? task.location : task.location.address}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-lg font-bold text-primary">
                      €{task.budget.toFixed(2)}
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {task.status === 'open' ? 'Ouvert' : task.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
