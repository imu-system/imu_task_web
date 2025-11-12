'use client';

import { useState, useMemo, useCallback } from 'react';
import { Link } from '@/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTasksOptimized } from '@/hooks/useTasksOptimized';
import { type Task, type TaskLocation } from '@/lib/firestore-tasks';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, 
  MapPin, 
  DollarSign, 
  Calendar,
  Filter,
  Navigation,
  X,
  RefreshCw,
} from 'lucide-react';
import { ServiceCategoryFilter, ServiceCategoryBadge } from '@/components/services/category-selector';
import { ServiceCategory } from '@/types/services';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { InfiniteScrollTrigger } from '@/components/tasks/infinite-scroll-trigger';
import { TasksLoadingSkeleton } from '@/components/tasks/tasks-loading-skeleton';
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
  open: 'Ouvert',
  assigned: 'Assigné',
  'in-progress': 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export default function TasksPage() {
  const { user } = useAuth();
  
  // Filters state
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['open']);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Geolocation state
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  // Sorting state
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'date'>('date');

  // Use optimized hook with Firestore pagination
  const {
    tasks,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  } = useTasksOptimized({
    pageSize: 12,
    filters: {
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      minBudget: priceRange[0],
      maxBudget: priceRange[1],
    },
    sortField: sortBy === 'price' ? 'budget' : 'createdAt',
    sortDirection: sortBy === 'date' ? 'desc' : 'asc',
    enableCache: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  });

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
        setSortBy('distance');
      } else {
        setLocationError('Impossible d\'obtenir votre position. Vérifiez les permissions.');
      }
    } catch (err) {
      setLocationError('Erreur lors de la récupération de la position.');
    } finally {
      setLocating(false);
    }
  }, []);

  // Client-side filtering and sorting for distance and search
  const processedTasks = useMemo(() => {
    let processed = [...tasks];

    // Search filter (client-side)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      processed = processed.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    // Apply distance filter if user location is available
    if (userLocation) {
      processed = filterTasksByDistance(
        processed,
        userLocation.lat,
        userLocation.lng,
        maxDistance
      );
    }

    // Sort by distance (client-side) if selected
    if (sortBy === 'distance' && userLocation) {
      processed = sortTasksByDistance(processed, userLocation.lat, userLocation.lng);
    }

    return processed;
  }, [tasks, userLocation, maxDistance, sortBy, searchQuery]);

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
    setSearchQuery('');
  };

  const activeFiltersCount = 
    selectedCategories.length + 
    (selectedStatuses.length !== 1 || selectedStatuses[0] !== 'open' ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0) +
    (userLocation ? 1 : 0);

  // Helper to get display address
  const getDisplayAddress = (task: Task): string => {
    if (typeof task.location === 'string') return task.location;
    const loc = task.location as TaskLocation;
    return loc.city ? `${loc.city}, ${loc.country || ''}` : loc.address;
  };

  // Helper to get task coordinates
  const getTaskCoordinates = (task: Task): { lat: number; lng: number } | null => {
    if (typeof task.location === 'string') return null;
    const loc = task.location as TaskLocation;
    if (!loc.coordinates) return null;
    return {
      lat: loc.coordinates.latitude,
      lng: loc.coordinates.longitude,
    };
  };

  // Initial loading state
  if (loading && tasks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Explorer les tâches</h1>
            <p className="text-muted-foreground mt-1">Chargement des tâches...</p>
          </div>
        </div>
        <TasksLoadingSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explorer les tâches</h1>
          <p className="text-muted-foreground mt-1">
            Trouvez des tâches près de chez vous et commencez à travailler
          </p>
        </div>
        <div className="flex gap-2">
          {user && (
            <Button asChild variant="outline">
              <Link href="/dashboard/tasks">
                Mes tâches
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/dashboard/tasks/create">
              <Plus className="mr-2 h-4 w-4" />
              Publier une tâche
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

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Tâches totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Ouvertes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.avgBudget}€</div>
            <p className="text-xs text-muted-foreground">Budget moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <Input
          placeholder="Rechercher une tâche par titre ou description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Filters Section */}
      <Card className="mb-6">
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-6">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <span className="text-lg font-semibold">Filtres & Tri</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-0">
              {/* Category Filter */}
              <div className="space-y-2">
                <ServiceCategoryFilter
                  value={selectedCategories}
                  onChange={setSelectedCategories}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={selectedStatuses[0] || 'open'}
                  onValueChange={(value) => setSelectedStatuses([value])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Ouvert</SelectItem>
                    <SelectItem value="assigned">Assigné</SelectItem>
                    <SelectItem value="in-progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label>Budget ({priceRange[0]}€ - {priceRange[1]}€)</Label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={0}
                  max={500}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Distance Filter */}
              {userLocation && (
                <div className="space-y-2">
                  <Label>Distance maximale ({maxDistance} km)</Label>
                  <Slider
                    value={[maxDistance]}
                    onValueChange={(value) => setMaxDistance(value[0])}
                    min={1}
                    max={100}
                    step={1}
                  />
                </div>
              )}

              {/* Sorting */}
              <div className="space-y-2">
                <Label>Trier par</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date (plus récent)</SelectItem>
                    <SelectItem value="price">Prix (croissant)</SelectItem>
                    {userLocation && <SelectItem value="distance">Distance</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className="flex-1"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  {locating ? 'Localisation...' : 'Ma position'}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
                <Button
                  variant="outline"
                  onClick={refresh}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualiser
                </Button>
              </div>

              {locationError && (
                <Alert variant="destructive">
                  <AlertDescription>{locationError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Tasks Grid */}
      {processedTasks.length === 0 && !loading ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Aucune tâche ne correspond à vos critères
            </p>
            <Button onClick={resetFilters} variant="outline">
              Réinitialiser les filtres
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {processedTasks.map((task) => {
              const coords = getTaskCoordinates(task);
              const distance = userLocation && coords
                ? formatDistance(
                    calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      coords.lat,
                      coords.lng
                    )
                  )
                : null;

              return (
                <Card key={task.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2">{task.title}</CardTitle>
                      <Badge className={statusColors[task.status]}>
                        {statusLabels[task.status]}
                      </Badge>
                    </div>
                    {task.category && (
                      <ServiceCategoryBadge category={task.category as ServiceCategory} />
                    )}
                  </CardHeader>

                  <CardContent className="flex-1">
                    <CardDescription className="line-clamp-3 mb-4">
                      {task.description}
                    </CardDescription>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{getDisplayAddress(task)}</span>
                        {distance && (
                          <Badge variant="outline" className="ml-auto">
                            {distance}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4 flex-shrink-0" />
                        <span className="font-semibold text-foreground">
                          {task.budget}€
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {new Date(task.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/tasks/${task.id}`}>
                        Voir les détails
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Infinite Scroll Trigger */}
          <InfiniteScrollTrigger
            onLoadMore={loadMore}
            loading={loadingMore}
            hasMore={hasMore}
            threshold={400}
            loadingText="Chargement de plus de tâches..."
          />
        </>
      )}
    </div>
  );
}

// Helper function for distance calculation (if not in geolocation lib)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
