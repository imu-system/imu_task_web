'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getTasksWithFilters, type Task, type TaskLocation } from '@/lib/firestore-tasks';
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
  Navigation,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ServiceCategorySelector, ServiceCategoryBadge } from '@/components/services/category-selector';
import { ServiceCategory, ServiceTags } from '@/types/services';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getCurrentPosition, 
  filterTasksByDistance, 
  sortTasksByDistance,
  formatDistance 
} from '@/lib/geolocation';

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
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['open']); // Par défaut: tâches ouvertes
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [maxDistance, setMaxDistance] = useState<number>(50); // km
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Geolocation state
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  // Sorting state
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'date'>('date');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 12;

  // Fetch tasks (all public tasks, not just user's tasks)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch tasks with basic filters
        const filters = {
          status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
          category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
          minBudget: priceRange[0],
          maxBudget: priceRange[1],
        };
        
        const fetchedTasks = await getTasksWithFilters(filters);
        setTasks(fetchedTasks);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [selectedCategories, selectedStatuses, priceRange]);

  // Get user's current location
  const handleGetLocation = useCallback(async () => {
    setLocating(true);
    setLocationError('');
    
    try {
      const position = await getCurrentPosition();
      if (position) {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSortBy('distance'); // Auto-sort by distance when location is obtained
      } else {
        setLocationError('Unable to get your location. Please check your browser permissions.');
      }
    } catch (err) {
      setLocationError('Error getting location. Please try again.');
    } finally {
      setLocating(false);
    }
  }, []);

  // Filter, sort and paginate tasks
  const processedTasks = useMemo(() => {
    let processed = [...tasks];

    // Apply distance filter if user location is available
    if (userLocation) {
      processed = filterTasksByDistance(
        processed,
        userLocation.lat,
        userLocation.lng,
        maxDistance
      );
    }

    // Sort tasks
    switch (sortBy) {
      case 'distance':
        if (userLocation) {
          processed = sortTasksByDistance(processed, userLocation.lat, userLocation.lng);
        }
        break;
      case 'price':
        processed.sort((a, b) => (a.budget || 0) - (b.budget || 0));
        break;
      case 'date':
      default:
        processed.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return processed;
  }, [tasks, userLocation, maxDistance, sortBy]);

  // Pagination
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    return processedTasks.slice(startIndex, endIndex);
  }, [processedTasks, currentPage]);

  const totalPages = Math.ceil(processedTasks.length / tasksPerPage);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: processedTasks.length,
      open: processedTasks.filter(t => t.status === 'open').length,
      inProgress: processedTasks.filter(t => t.status === 'in-progress').length,
      avgBudget: processedTasks.length > 0
        ? Math.round(processedTasks.reduce((sum, t) => sum + (t.budget || 0), 0) / processedTasks.length)
        : 0,
    };
  }, [processedTasks]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses(['open']);
    setPriceRange([0, 500]);
    setMaxDistance(50);
    setUserLocation(null);
    setSortBy('date');
    setCurrentPage(1);
  };

  const activeFiltersCount = 
    selectedCategories.length + 
    (selectedStatuses.length !== 1 || selectedStatuses[0] !== 'open' ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0) +
    (userLocation ? 1 : 0);

  // Helper to extract location coordinates
  const getTaskCoordinates = (task: Task): { lat: number; lng: number } | null => {
    if (typeof task.location === 'string') return null;
    const loc = task.location as TaskLocation;
    if (!loc.coordinates) return null;
    return {
      lat: loc.coordinates.latitude,
      lng: loc.coordinates.longitude,
    };
  };

  // Helper to get display address
  const getDisplayAddress = (task: Task): string => {
    if (typeof task.location === 'string') return task.location;
    const loc = task.location as TaskLocation;
    return loc.city ? `${loc.city}, ${loc.country || ''}` : loc.address;
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Find tasks near you and start working
          </p>
        </div>
        <div className="flex gap-2">
          {user && (
            <Button asChild variant="outline">
              <Link href="/dashboard/tasks">
                My Tasks
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/dashboard/tasks/create">
              <Plus className="mr-2 h-4 w-4" />
              Post Task
            </Link>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Filters & Sorting</h2>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount} active</Badge>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location & Distance Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Distance</Label>
              {userLocation && (
                <Badge variant="outline" className="text-xs">
                  <Navigation className="h-3 w-3 mr-1" />
                  Within {maxDistance} km
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={userLocation ? "default" : "outline"}
                size="sm"
                onClick={handleGetLocation}
                disabled={locating}
                className="flex-1"
              >
                {locating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting location...
                  </>
                ) : userLocation ? (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Location active
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Use my location
                  </>
                )}
              </Button>
              {userLocation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUserLocation(null);
                    setSortBy('date');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {locationError && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">{locationError}</AlertDescription>
              </Alert>
            )}
            {userLocation && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Max distance</span>
                  <span className="font-medium">{maxDistance} km</span>
                </div>
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[maxDistance]}
                  onValueChange={(value) => setMaxDistance(value[0])}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Categories</Label>
            <div className="flex flex-wrap gap-2">
              {Object.values(ServiceCategory).map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategories.includes(cat) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setCurrentPage(1);
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

          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusLabels).map(([status, label]) => (
                <Badge
                  key={status}
                  variant={selectedStatuses.includes(status) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setCurrentPage(1);
                    if (selectedStatuses.includes(status)) {
                      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                    } else {
                      setSelectedStatuses([...selectedStatuses, status]);
                    }
                  }}
                >
                  {label}
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
              max={500}
              step={10}
              value={priceRange}
              onValueChange={(value) => {
                setCurrentPage(1);
                setPriceRange(value as [number, number]);
              }}
              className="w-full"
            />
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sort By</Label>
            <Select
              value={sortBy}
              onValueChange={(value: any) => {
                setCurrentPage(1);
                setSortBy(value);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Latest First</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                {userLocation && (
                  <SelectItem value="distance">Distance: Nearest First</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      {processedTasks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tasks</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Open</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.open}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.inProgress}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Budget</CardDescription>
              <CardTitle className="text-3xl">${stats.avgBudget}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Tasks Grid */}
      {paginatedTasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {tasks.length === 0 ? 'No tasks available' : 'No matching tasks'}
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              {tasks.length === 0 
                ? "No tasks have been posted yet. Be the first to post a task!"
                : "No tasks match your current filters. Try adjusting your search criteria."
              }
            </p>
            {tasks.length === 0 ? (
              <Button asChild>
                <Link href="/dashboard/tasks/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Post a Task
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
          {/* Tasks Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {paginatedTasks.map((task) => {
              const serviceCategory = task.category as ServiceCategory;
              const isValidCategory = Object.values(ServiceCategory).includes(serviceCategory);
              const taskCoords = getTaskCoordinates(task);
              const distance = userLocation && taskCoords && (task as any).distance
                ? (task as any).distance
                : null;

              return (
                <Card key={task.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="line-clamp-2 text-lg">
                        {task.title}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[task.status] || 'bg-gray-500'} text-white shrink-0`}
                      >
                        {statusLabels[task.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {isValidCategory && (
                        <ServiceCategoryBadge category={serviceCategory} showIcon={false} />
                      )}
                      {distance !== null && (
                        <Badge variant="outline" className="text-xs">
                          <Navigation className="h-3 w-3 mr-1" />
                          {formatDistance(distance)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {task.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-1">
                          {getDisplayAddress(task)}
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
                      <Link href={`/tasks/${task.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
