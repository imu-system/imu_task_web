'use client';

/**
 * FavoriteProvidersList Component
 * 
 * Phase 9 - Dashboard Analytics: Affichage riche des prestataires favoris
 * avec données réelles (nom, photo, rating, stats)
 */

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, Star, MessageCircle, CheckCircle } from 'lucide-react';
import { Link } from '@/navigation';
import { ShimmerCard } from '@/components/ui/animated';

interface Provider {
  id: string;
  displayName: string;
  photoURL?: string;
  rating: number;
  completedBookings: number;
  reviewCount: number;
  category?: string;
}

interface FavoriteProvidersListProps {
  favoriteIds: string[];
  limit?: number;
  onToggleFavorite?: (providerId: string) => void;
}

export function FavoriteProvidersList({ 
  favoriteIds, 
  limit = 3,
  onToggleFavorite 
}: FavoriteProvidersListProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderData = async () => {
      if (favoriteIds.length === 0) {
        setProviders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Firestore limite 'in' queries à 10 éléments
        const batchSize = 10;
        const batches = [];
        
        for (let i = 0; i < favoriteIds.length; i += batchSize) {
          const batch = favoriteIds.slice(i, i + batchSize);
          batches.push(batch);
        }

        const allProviders: Provider[] = [];

        for (const batch of batches) {
          const usersQuery = query(
            collection(db, 'users'),
            where(documentId(), 'in', batch)
          );

          const snapshot = await getDocs(usersQuery);

          snapshot.docs.forEach(doc => {
            const data = doc.data();
            const profile = data.profile || {};
            
            allProviders.push({
              id: doc.id,
              displayName: profile.displayName || data.email?.split('@')[0] || 'Prestataire',
              photoURL: profile.photoURL,
              rating: profile.rating || 0,
              completedBookings: profile.completedBookings || 0,
              reviewCount: profile.reviewCount || 0,
              category: profile.category
            });
          });
        }

        setProviders(allProviders.slice(0, limit));
      } catch (error) {
        console.error('Error fetching provider data:', error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [favoriteIds, limit]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium mb-1">Aucun favori</p>
        <p className="text-sm text-muted-foreground">
          Marquez des prestataires en favoris pour les retrouver facilement
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {providers.map(provider => (
        <Card 
          key={provider.id} 
          className="hover:shadow-md transition-all hover:border-primary/50"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {/* Photo */}
                {provider.photoURL ? (
                  <img 
                    src={provider.photoURL} 
                    alt={provider.displayName}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-lg ring-2 ring-primary/20">
                    {provider.displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/providers/${provider.id}`}
                    className="font-medium hover:text-primary transition-colors truncate block"
                  >
                    {provider.displayName}
                  </Link>
                  
                  <div className="flex items-center gap-3 mt-1">
                    {/* Rating */}
                    {provider.rating > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{provider.rating.toFixed(1)}</span>
                        {provider.reviewCount > 0 && (
                          <span>({provider.reviewCount})</span>
                        )}
                      </div>
                    )}

                    {/* Missions complétées */}
                    {provider.completedBookings > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        <span>{provider.completedBookings} missions</span>
                      </div>
                    )}
                  </div>

                  {/* Catégorie */}
                  {provider.category && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {provider.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Contact button */}
                <Link href={`/messages?providerId=${provider.id}`}>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </Link>

                {/* Remove from favorites */}
                {onToggleFavorite && (
                  <ShimmerCard>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleFavorite(provider.id)}
                      className="hover:bg-red-50 hover:text-red-500"
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </ShimmerCard>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
