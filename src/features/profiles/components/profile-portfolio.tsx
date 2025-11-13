/**
 * Composant Portfolio du Profil Public
 * 
 * Affiche la galerie de réalisations du prestataire:
 * - Images, vidéos, liens
 * - Lightbox pour agrandir
 * - Filtrage par catégorie
 * - Grille responsive
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { 
  ExternalLink, 
  Play, 
  X,
  Filter,
  Grid3x3,
  List
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PortfolioItem } from '@/types/public-profile';

interface ProfilePortfolioProps {
  items: PortfolioItem[];
  className?: string;
}

export function ProfilePortfolio({ items, className }: ProfilePortfolioProps) {
  const t = useTranslations('PublicProfile.portfolio');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtrer les items
  const filteredItems = items.filter(item => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  // Trier par ordre et featured
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return (a.order || 0) - (b.order || 0);
  });

  // Extraire les catégories uniques
  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Grid3x3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('noItems')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className={className}>
        {/* Header with filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Category Filter */}
            {categories.length > 0 && (
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category!}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* View Mode Toggle */}
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Portfolio Grid/List */}
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'flex flex-col gap-4'
        )}>
          {sortedItems.map(item => (
            <PortfolioCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <DialogTitle className="text-2xl">{selectedItem.title}</DialogTitle>
                    {selectedItem.category && (
                      <Badge variant="secondary">{selectedItem.category}</Badge>
                    )}
                  </div>
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Media Display */}
                {selectedItem.type === 'image' && selectedItem.mediaUrl && (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={selectedItem.mediaUrl}
                      alt={selectedItem.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}

                {selectedItem.type === 'video' && selectedItem.mediaUrl && (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
                    <video
                      src={selectedItem.mediaUrl}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                )}

                {selectedItem.type === 'link' && selectedItem.externalUrl && (
                  <div className="p-6 border rounded-lg text-center space-y-4">
                    <ExternalLink className="h-12 w-12 mx-auto text-muted-foreground" />
                    <Button asChild>
                      <a 
                        href={selectedItem.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        {t('viewLink')}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}

                {/* Description */}
                {selectedItem.description && (
                  <div className="prose prose-sm max-w-none">
                    <p>{selectedItem.description}</p>
                  </div>
                )}

                {/* Tags */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface PortfolioCardProps {
  item: PortfolioItem;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

function PortfolioCard({ item, viewMode, onClick }: PortfolioCardProps) {
  const t = useTranslations('PublicProfile.portfolio');

  return (
    <Card 
      className={cn(
        "group cursor-pointer overflow-hidden transition-all hover:shadow-lg",
        viewMode === 'list' && "flex flex-row"
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className={cn(
        "relative bg-muted",
        viewMode === 'grid' ? "aspect-video" : "w-48 flex-shrink-0"
      )}>
        {item.type === 'image' && item.thumbnailUrl && (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        )}

        {item.type === 'video' && item.thumbnailUrl && (
          <>
            <Image
              src={item.thumbnailUrl}
              alt={item.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="h-6 w-6 text-black ml-1" />
              </div>
            </div>
          </>
        )}

        {item.type === 'link' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ExternalLink className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {/* Featured Badge */}
        {item.featured && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-yellow-500 text-white">
              {t('featured')}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className={cn(
        "p-4",
        viewMode === 'list' && "flex-1"
      )}>
        <h3 className="font-semibold line-clamp-2 mb-2">{item.title}</h3>
        
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          {item.category && (
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
