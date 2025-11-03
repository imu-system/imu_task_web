'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/navigation';
import { getOpenTasks, type Task } from '@/lib/firestore-tasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TasksMap } from '@/components/tasks/tasks-map';
import { 
  MapIcon, 
  ListIcon, 
  Search, 
  SlidersHorizontal,
  Loader2,
  Navigation,
  Calendar,
  DollarSign,
  MapPin,
  Send
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  getCurrentPosition, 
  filterTasksByDistance, 
  sortTasksByDistance,
  formatDistance,
  calculateDistance
} from '@/lib/geolocation';

// Service categories (matching your system)
const SERVICE_CATEGORIES = [
  'home_services',
  'delivery',
  'digital_help',
  'moving',
  'companionship',
  'gardening',
  'pet_care',
  'events',
] as const;

// Helper function to extract location string from Task
const getLocationString = (location: string | any): string => {
  if (typeof location === 'string') {
    return location;
  }
  if (location && typeof location === 'object') {
    return location.address || location.city || 'Location not specified';
  }
  return 'Location not specified';
};

export default function BrowseTasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('BrowseTasks');
  const tCommon = useTranslations('Common');

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // View mode: list or map
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(500);
  const [maxDistance, setMaxDistance] = useState(50); // km
  const [sortBy, setSortBy] = useState<'date' | 'distance' | 'budget'>('date');
  const [showFilters, setShowFilters] = useState(false);

  // Geolocation
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locating, setLocating] = useState(false);

  // Check if user is provider
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // Check if user has provider role
    const hasProviderRole = user.roles?.includes('provider' as any);
    const isProvider = (user.profile as any)?.accountType === 'professional' || hasProviderRole;

    if (!isProvider) {
      // Redirect non-providers to dashboard
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch open tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError('');

      try {
        const openTasks = await getOpenTasks();
        setTasks(openTasks);
        setFilteredTasks(openTasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(t('errorLoading') || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user, t]);

  // Get user location
  const handleGetLocation = async () => {
    setLocating(true);
    try {
      const position = await getCurrentPosition();
      setUserLocation({ lat: position.coords.latitude, lng: position?.coords.longitude });
      setSortBy('distance'); // Auto-switch to distance sort
    } catch (err) {
      console.error('Error getting location:', err);
    }
    setLocating(false);
  };

  // Apply filters
  useEffect(() => {
    let result = [...tasks];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(task => 
        task.category && selectedCategories.includes(task.category)
      );
    }

    // Budget filter
    result = result.filter(task => {
      const budget = task.budget || 0;
      return budget >= minBudget && budget <= maxBudget;
    });

    // Distance filter (if location available)
    if (userLocation && maxDistance < 50) {
      result = filterTasksByDistance(
        result as any, 
        userLocation.lat, 
        userLocation.lng, 
        maxDistance
      ) as Task[];
    }

    // Sorting
    if (sortBy === 'date') {
      result.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    } else if (sortBy === 'budget') {
      result.sort((a, b) => (b.budget || 0) - (a.budget || 0));
    } else if (sortBy === 'distance' && userLocation) {
      result = sortTasksByDistance(
        result as any,
        userLocation.lat,
        userLocation.lng
      ) as Task[];
    }

    setFilteredTasks(result);
  }, [tasks, searchQuery, selectedCategories, minBudget, maxBudget, maxDistance, sortBy, userLocation]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setMinBudget(0);
    setMaxBudget(500);
    setMaxDistance(50);
    setSortBy('date');
  };

  // Handle task click from map
  const handleTaskClick = (task: Task) => {
    router.push(`/dashboard/tasks/${task.id}` as any);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 px-4" data-testid="browse-tasks-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="page-title">
          {t('title') || 'Découvrir les tâches'}
        </h1>
        <p className="text-muted-foreground" data-testid="page-description">
          {t('description') || 'Parcourez les tâches disponibles et soumettez vos offres'}
        </p>
      </div>

      {/* Filters Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder') || 'Rechercher une tâche...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  data-testid="toggle-filters-button"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>

                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  data-testid="view-list-button"
                >
                  <ListIcon className="h-4 w-4" />
                </Button>

                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('map')}
                  data-testid="view-map-button"
                >
                  <MapIcon className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleGetLocation}
                  disabled={locating}
                  data-testid="get-location-button"
                >
                  {locating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t" data-testid="advanced-filters">
                {/* Category Filter */}
                <div>
                  <Label>{t('category') || 'Catégorie'}</Label>
                  <Select
                    value={selectedCategories[0] || 'all'}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setSelectedCategories([]);
                      } else {
                        setSelectedCategories([value]);
                      }
                    }}
                  >
                    <SelectTrigger data-testid="category-filter">
                      <SelectValue placeholder={t('allCategories') || 'Toutes'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allCategories') || 'Toutes les catégories'}</SelectItem>
                      {SERVICE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {tCommon(`categories.${cat}` as any) || cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Range */}
                <div>
                  <Label>{t('budgetRange') || 'Budget'}: {minBudget}€ - {maxBudget}€</Label>
                  <div className="flex gap-2 items-center pt-2">
                    <Input
                      type="number"
                      value={minBudget}
                      onChange={(e) => setMinBudget(Number(e.target.value))}
                      min={0}
                      className="w-20"
                      data-testid="min-budget-input"
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      min={minBudget}
                      className="w-20"
                      data-testid="max-budget-input"
                    />
                  </div>
                </div>

                {/* Distance Filter */}
                <div>
                  <Label>{t('maxDistance') || 'Distance max'}: {maxDistance} km</Label>
                  <Slider
                    value={[maxDistance]}
                    onValueChange={([value]) => setMaxDistance(value)}
                    min={5}
                    max={50}
                    step={5}
                    className="pt-2"
                    data-testid="distance-slider"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <Label>{t('sortBy') || 'Trier par'}</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger data-testid="sort-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">{t('sortDate') || 'Date'}</SelectItem>
                      <SelectItem value="budget">{t('sortBudget') || 'Budget'}</SelectItem>
                      <SelectItem value="distance" disabled={!userLocation}>
                        {t('sortDistance') || 'Distance'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Button */}
                <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                  <Button variant="outline" onClick={handleResetFilters} data-testid="reset-filters-button">
                    {t('resetFilters') || 'Réinitialiser les filtres'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground" data-testid="results-count">
        {filteredTasks.length} {t('tasksFound') || 'tâche(s) trouvée(s)'}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="loading-skeleton">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive" data-testid="error-message">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTasks.length === 0 && (
        <Card data-testid="empty-state">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              {t('noTasksFound') || 'Aucune tâche trouvée avec ces critères'}
            </p>
            <Button variant="outline" onClick={handleResetFilters}>
              {t('resetFilters') || 'Réinitialiser les filtres'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tasks List View */}
      {!loading && !error && viewMode === 'list' && filteredTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="tasks-list">
          {filteredTasks.map(task => {
            const distance = userLocation && task.adresse?.latitude && task.adresse?.longitude
              ? calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  task.adresse.latitude,
                  task.adresse.longitude
                )
              : null;

            return (
              <Card key={task.id} className="hover:shadow-lg transition-shadow" data-testid={`task-card-${task.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-1">{task.title}</CardTitle>
                    {task.category && (
                      <Badge variant="outline" data-testid={`task-category-${task.id}`}>
                        {tCommon(`categories.${task.category}` as any) || task.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {task.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    {task.budget && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">{task.budget}€</span>
                      </div>
                    )}

                    {task.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-muted-foreground">{getLocationString(task.location)}</span>
                      </div>
                    )}

                    {distance !== null && (
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-purple-600" />
                        <span className="text-muted-foreground">{formatDistance(distance)}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-muted-foreground">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline"
                      className="flex-1" 
                      onClick={() => router.push(`/dashboard/tasks/${task.id}` as any)}
                      data-testid={`view-task-button-${task.id}`}
                    >
                      {t('viewDetails') || 'Voir les détails'}
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={() => router.push(`/dashboard/tasks/${task.id}/submit-offer` as any)}
                      data-testid={`submit-offer-button-${task.id}`}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {t('submitOffer') || 'Faire une offre'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Map View */}
      {!loading && !error && viewMode === 'map' && (
        <TasksMap 
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
          center={userLocation || undefined}
        />
      )}
    </div>
  );
}
