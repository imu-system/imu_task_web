'use client';

import * as React from 'react';
import { useState } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import type { FavoriteItemType } from '@/lib/firestore-favorites';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Heart, ExternalLink, MapPin, Calendar, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, ja } from 'date-fns/locale';
import { useLocale } from 'next-intl';

const locales = { fr, en: enUS, ja };

/**
 * Favorites Page Component
 * 
 * Displays user's favorite tasks and providers with filters.
 * Features:
 * - Tab navigation (all/tasks/providers)
 * - Grid layout with cards
 * - Quick remove action
 * - Empty states
 * - Loading states
 */
export function FavoritesPage() {
  const t = useTranslations('Favorites');
  const locale = useLocale() as keyof typeof locales;
  const dateLocale = locales[locale] || locales.fr;
  
  const [activeTab, setActiveTab] = useState<'all' | 'task' | 'provider'>('all');
  
  const itemType: FavoriteItemType | undefined = 
    activeTab === 'all' ? undefined : activeTab === 'task' ? 'task' : 'provider';
  
  const { favorites, loading, removeFromFavorites } = useFavorites(itemType);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all" data-testid="tab-all">
            {t('all')} ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="task" data-testid="tab-tasks">
            {t('tasks')} ({favorites.filter(f => f.itemType === 'task').length})
          </TabsTrigger>
          <TabsTrigger value="provider" data-testid="tab-providers">
            {t('providers')} ({favorites.filter(f => f.itemType === 'provider').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <FavoritesList 
            favorites={favorites} 
            onRemove={removeFromFavorites}
            locale={dateLocale}
            t={t}
          />
        </TabsContent>

        <TabsContent value="task" className="mt-6">
          <FavoritesList 
            favorites={favorites.filter(f => f.itemType === 'task')} 
            onRemove={removeFromFavorites}
            locale={dateLocale}
            t={t}
          />
        </TabsContent>

        <TabsContent value="provider" className="mt-6">
          <FavoritesList 
            favorites={favorites.filter(f => f.itemType === 'provider')} 
            onRemove={removeFromFavorites}
            locale={dateLocale}
            t={t}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface FavoritesListProps {
  favorites: any[];
  onRemove: (id: string) => void;
  locale: any;
  t: any;
}

function FavoritesList({ favorites, onRemove, locale, t }: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('noFavorites')}</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            {t('noFavoritesDesc')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {favorites.map((favorite) => (
        <Card key={favorite.id} className="group hover:shadow-lg transition-shadow">
          <CardHeader className="relative">
            {favorite.metadata?.imageUrl && (
              <div className="relative w-full h-40 mb-4 rounded-md overflow-hidden">
                <Image
                  src={favorite.metadata.imageUrl}
                  alt={favorite.metadata.title || 'Image'}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2">
                  {favorite.metadata?.title || `${favorite.itemType} #${favorite.itemId.slice(0, 8)}`}
                </CardTitle>
                {favorite.metadata?.category && (
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {favorite.metadata.category}
                    </span>
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Metadata */}
            <div className="space-y-2 text-sm text-muted-foreground">
              {favorite.metadata?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{favorite.metadata.location}</span>
                </div>
              )}
              
              {favorite.metadata?.providerName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{favorite.metadata.providerName}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(favorite.createdAt, { 
                    addSuffix: true,
                    locale 
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button asChild variant="default" size="sm" className="flex-1">
                <Link href={`/${favorite.itemType === 'task' ? 'tasks' : 'providers'}/${favorite.itemId}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {favorite.itemType === 'task' ? t('viewTask') : t('viewProvider')}
                </Link>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemove(favorite.id)}
                className="hover:bg-destructive hover:text-destructive-foreground"
                data-testid="remove-favorite"
              >
                {t('removeButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
