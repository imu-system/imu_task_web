'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User, MapPin, Star, Navigation, MessageSquare } from 'lucide-react';
import { getProvidersBySkill } from '@/lib/firestore-users';
import { calculateDistance, formatDistance } from '@/lib/geolocation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface TaskLocation {
  address?: string;
  city?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface ProviderSuggestionsProps {
  taskCategory: string;
  taskLocation: string | TaskLocation;
  currentUserId?: string;
}

interface ProviderWithDistance {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  skills: string[];
  rating?: number;
  completedTasks?: number;
  location?: string | TaskLocation;
  distance?: number;
}

export function ProviderSuggestions({
  taskCategory,
  taskLocation,
  currentUserId,
}: ProviderSuggestionsProps) {
  const [providers, setProviders] = useState<ProviderWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('TaskDetail');

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        
        // Fetch providers with matching skills
        const matchingProviders = await getProvidersBySkill(taskCategory, {
          onlyAvailable: true,
          maxResults: 6,
        });

        // Extract task coordinates
        let taskCoords: { lat: number; lng: number } | null = null;
        if (typeof taskLocation === 'object' && taskLocation.coordinates) {
          taskCoords = {
            lat: taskLocation.coordinates.latitude,
            lng: taskLocation.coordinates.longitude,
          };
        }

        // Calculate distances and sort by proximity
        const providersWithDistance = matchingProviders.map((provider: any) => {
          let distance: number | undefined;

          if (taskCoords && provider.location && typeof provider.location === 'object') {
            const providerCoords = provider.location.coordinates;
            if (providerCoords) {
              distance = calculateDistance(
                taskCoords.lat,
                taskCoords.lng,
                providerCoords.latitude,
                providerCoords.longitude
              );
            }
          }

          return {
            ...provider,
            distance,
          };
        });

        // Sort by distance (undefined distances go to the end)
        providersWithDistance.sort((a, b) => {
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });

        setProviders(providersWithDistance.slice(0, 6));
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [taskCategory, taskLocation]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('suggestedProviders', { default: 'Prestataires suggérés' })}
          </CardTitle>
          <CardDescription>
            {t('suggestedProvidersDesc', { default: 'Basés sur les compétences et la proximité' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (providers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('suggestedProviders', { default: 'Prestataires suggérés' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('noProvidersFound', { default: 'Aucun prestataire trouvé pour cette catégorie.' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          {t('suggestedProviders', { default: 'Prestataires suggérés' })}
        </CardTitle>
        <CardDescription>
          {t('suggestedProvidersDesc', { default: 'Basés sur les compétences et la proximité' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.map((provider) => {
          const initials = provider.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={provider.id}
              className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={provider.avatarUrl} alt={provider.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{provider.name}</h4>
                    
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      {provider.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{provider.rating.toFixed(1)}</span>
                        </div>
                      )}
                      
                      {provider.completedTasks !== undefined && (
                        <span>
                          {provider.completedTasks} {t('completedTasks', { default: 'tâches' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {provider.distance !== undefined && (
                    <Badge variant="outline" className="shrink-0">
                      <Navigation className="h-3 w-3 mr-1" />
                      {formatDistance(provider.distance)}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {provider.skills.slice(0, 3).map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {provider.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{provider.skills.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={`/providers/${provider.id}`}>
                      {t('viewProfile', { default: 'Voir profil' })}
                    </Link>
                  </Button>
                  
                  {currentUserId && currentUserId !== provider.id && (
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={`/messages?userId=${provider.id}`}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {t('contact', { default: 'Contacter' })}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
