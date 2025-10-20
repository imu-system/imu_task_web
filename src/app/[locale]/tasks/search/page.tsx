'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ServiceCategoryFilter } from '@/components/services/category-selector';
import { 
  ServiceCategory, 
  SERVICE_CATEGORIES, 
  ServiceTags 
} from '@/types/services';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task, TaskStatus } from '@/lib/types';
import TaskListCard from '@/components/task-list-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchTasksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // State pour les filtres
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>(() => {
    const categoryParam = searchParams.get('category');
    return categoryParam ? [categoryParam as ServiceCategory] : [];
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 480]); // 0-8h
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tagParam = searchParams.get('tag');
    return tagParam ? [tagParam] : [];
  });
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'duration'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [taskSheetOpen, setTaskSheetOpen] = useState<string | null>(null);

  // State pour les tâches
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les tâches
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasksRef = collection(db, 'tasks');
        const q = query(
          tasksRef,
          where('status', '==', TaskStatus.published),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const tasksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Tags disponibles basés sur les catégories sélectionnées
  const availableTags = useMemo(() => {
    if (selectedCategories.length === 0) {
      // Tous les tags si aucune catégorie sélectionnée
      return Object.values(ServiceTags).flat();
    }
    // Tags des catégories sélectionnées uniquement
    return selectedCategories.flatMap((cat) => ServiceTags[cat] || []);
  }, [selectedCategories]);

  // Filtrage des tâches
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Recherche textuelle
      const matchesSearch =
        !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtre catégorie
      const taskCategory = typeof task.category === 'string' ? task.category : null;
      const matchesCategory =
        selectedCategories.length === 0 ||
        (taskCategory && selectedCategories.includes(taskCategory as ServiceCategory));

      // Filtre prix
      const taskPrice = task.budget || 0;
      const matchesPrice = taskPrice >= priceRange[0] && taskPrice <= priceRange[1];

      // Filtre durée (utiliser 120min par défaut si non spécifié)
      const taskDuration = (task as any).estimatedDuration || 120;
      const matchesDuration =
        taskDuration >= durationRange[0] && taskDuration <= durationRange[1];

      // Filtre tags
      const taskTags = (task as any).tags || [];
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => taskTags.includes(tag));

      return (
        matchesSearch && matchesCategory && matchesPrice && matchesDuration && matchesTags
      );
    });
  }, [tasks, searchQuery, selectedCategories, priceRange, durationRange, selectedTags]);

  // Tri des tâches
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks];
    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => (a.budget || 0) - (b.budget || 0));
      case 'duration':
        return sorted.sort(
          (a, b) => 
            ((a as any).estimatedDuration || 120) - ((b as any).estimatedDuration || 120)
        );
      case 'date':
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [filteredTasks, sortBy]);

  // Toggle tag
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange([0, 100]);
    setDurationRange([0, 480]);
    setSelectedTags([]);
    setSortBy('date');
  };

  // Nombre de filtres actifs
  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    selectedCategories.length +
    (priceRange[0] > 0 || priceRange[1] < 100 ? 1 : 0) +
    (durationRange[0] > 0 || durationRange[1] < 480 ? 1 : 0) +
    selectedTags.length;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Recherche avancée</h1>
        <p className="text-muted-foreground">
          Trouvez la mission parfaite parmi {tasks.length} tâches disponibles
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filtres avancés */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Filtres avancés</CardTitle>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filtre catégories */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Catégories de services</label>
                <ServiceCategoryFilter
                  value={selectedCategories}
                  onChange={setSelectedCategories}
                />
              </div>

              {/* Filtre prix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Budget</label>
                  <span className="text-sm text-muted-foreground">
                    {priceRange[0]}€ - {priceRange[1]}€
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

              {/* Filtre durée */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Durée estimée</label>
                  <span className="text-sm text-muted-foreground">
                    {Math.floor(durationRange[0] / 60)}h
                    {durationRange[0] % 60 > 0 ? `${durationRange[0] % 60}min` : ''} -{' '}
                    {Math.floor(durationRange[1] / 60)}h
                    {durationRange[1] % 60 > 0 ? `${durationRange[1] % 60}min` : ''}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={480}
                  step={30}
                  value={durationRange}
                  onValueChange={(value) => setDurationRange(value as [number, number])}
                  className="w-full"
                />
              </div>

              {/* Filtre tags */}
              {availableTags.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Tags spécifiques {selectedTags.length > 0 && `(${selectedTags.length})`}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Barre de résultats et tri */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sortedTasks.length} résultat{sortedTasks.length > 1 ? 's' : ''} trouvé
          {sortedTasks.length > 1 ? 's' : ''}
        </p>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Trier par..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Plus récentes</SelectItem>
            <SelectItem value="price">Prix croissant</SelectItem>
            <SelectItem value="duration">Durée croissante</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des résultats */}
      <div className="space-y-4">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : sortedTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Aucune tâche ne correspond à vos critères de recherche.
              </p>
              <Button variant="link" onClick={resetFilters} className="mt-2">
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedTasks.map((task) => (
            <TaskListCard 
              key={task.id} 
              task={task} 
              onOpenSheet={() => setTaskSheetOpen(task.id)} 
            />
          ))
        )}
      </div>
    </div>
  );
}
