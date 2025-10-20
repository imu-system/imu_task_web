'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTasks, type Task } from '@/lib/firestore-tasks';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  MapPin, 
  DollarSign, 
  Calendar,
  Loader2,
  FileText,
  Filter,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { ServiceCategorySelector, ServiceCategoryBadge } from '@/components/services/category-selector';
import { ServiceCategory, ServiceTags } from '@/types/services';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const statusColors = {
  open: 'bg-green-500',
  assigned: 'bg-blue-500',
  'in-progress': 'bg-yellow-500',
  completed: 'bg-purple-500',
  cancelled: 'bg-red-500',
};

const statusLabels = {
  open: 'Open',
  assigned: 'Assigned',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters state
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const userTasks = await getUserTasks(user.uid);
        setTasks(userTasks);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  // Filter and group tasks by category
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(task => 
        selectedCategories.includes(task.category as ServiceCategory)
      );
    }

    // Filter by price range
    filtered = filtered.filter(task => {
      const price = task.budget || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    return filtered;
  }, [tasks, selectedCategories, priceRange]);

  // Group tasks by category
  const tasksByCategory = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    filteredTasks.forEach(task => {
      const category = task.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(task);
    });

    return grouped;
  }, [filteredTasks]);

  // Calculate category statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; avgPrice: number; totalPrice: number }> = {};
    
    Object.entries(tasksByCategory).forEach(([category, categoryTasks]) => {
      const totalPrice = categoryTasks.reduce((sum, task) => sum + (task.budget || 0), 0);
      stats[category] = {
        count: categoryTasks.length,
        totalPrice,
        avgPrice: categoryTasks.length > 0 ? Math.round(totalPrice / categoryTasks.length) : 0,
      };
    });

    return stats;
  }, [tasksByCategory]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 100]);
  };

  const activeFiltersCount = selectedCategories.length + (priceRange[0] > 0 || priceRange[1] < 100 ? 1 : 0);

  // Not authenticated
  if (!user && !loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert>
          <AlertDescription>
            You must be{' '}
            <Link href="/auth/login" className="underline font-medium">
              logged in
            </Link>{' '}
            to view your tasks.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your posted tasks
          </p>
        </div>
        <Button asChild>
          <Link href="/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters Section */}
      {tasks.length > 0 && (
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="mb-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </CollapsibleTrigger>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                )}
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-0">
                {/* Category Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(ServiceCategory).map(cat => (
                      <Badge
                        key={cat}
                        variant={selectedCategories.includes(cat) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (selectedCategories.includes(cat)) {
                            setSelectedCategories(selectedCategories.filter(c => c !== cat));
                          } else {
                            setSelectedCategories([...selectedCategories, cat]);
                          }
                        }}
                      >
                        {cat.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Budget Range</Label>
                    <span className="text-sm text-muted-foreground">
                      ${priceRange[0]} - ${priceRange[1]}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              {tasks.length === 0 
                ? "You haven't created any tasks yet. Post your first task to get started!"
                : "No tasks match your current filters. Try adjusting your search criteria."
              }
            </p>
            {tasks.length === 0 ? (
              <Button asChild>
                <Link href="/tasks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Task
                </Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Tasks</CardDescription>
                <CardTitle className="text-3xl">{filteredTasks.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Open</CardDescription>
                <CardTitle className="text-3xl">
                  {filteredTasks.filter((t) => t.status === 'open').length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>In Progress</CardDescription>
                <CardTitle className="text-3xl">
                  {filteredTasks.filter((t) => t.status === 'in-progress').length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg Budget</CardDescription>
                <CardTitle className="text-3xl">
                  ${Math.round(filteredTasks.reduce((sum, t) => sum + (t.budget || 0), 0) / filteredTasks.length || 0)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Tasks Grouped by Category */}
          {Object.entries(tasksByCategory).map(([category, categoryTasks]) => {
            const stats = categoryStats[category];
            const serviceCategory = category as ServiceCategory;
            const isValidCategory = Object.values(ServiceCategory).includes(serviceCategory);

            return (
              <div key={category} className="mb-8">
                {/* Category Header with Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {isValidCategory ? (
                      <ServiceCategoryBadge category={serviceCategory} showIcon={true} />
                    ) : (
                      <Badge variant="outline">{category}</Badge>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{stats.count} tasks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Avg ${stats.avgPrice}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/tasks/search?category=${category}`}>
                      View All →
                    </Link>
                  </Button>
                </div>

                {/* Tasks Grid for this Category */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {categoryTasks.map((task) => (
                    <Card key={task.id} className="flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="line-clamp-2 text-lg">
                            {task.title}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className={`${statusColors[task.status.toLowerCase().replace(' ', '-') as keyof typeof statusColors] || 'bg-gray-500'} text-white shrink-0`}
                          >
                            {task.status}
                          </Badge>
                        </div>
                        {isValidCategory && (
                          <div className="pt-2">
                            <ServiceCategoryBadge category={serviceCategory} showIcon={false} />
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {task.description}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">
                              {typeof task.location === 'string' ? task.location : (task.location as any).address || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-semibold text-green-600">
                            <DollarSign className="h-4 w-4" />
                            <span>${task.budget}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Posted {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/tasks/${task.id}` as any}>View Details</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
