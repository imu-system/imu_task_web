'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Clock, TrendingUp, Heart } from 'lucide-react';
import { Link } from '@/navigation';
import Image from 'next/image';
import { type Task } from '@/lib/types';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { getCategoryById, TASK_CATEGORIES, getCategoryByFirestoreValue } from '@/lib/constants/categories';
import { useToggleFavorite } from '@/hooks/use-favorites';

// Unsplash images par catégorie (gratuites et de haute qualité)
const CATEGORY_IMAGES: Record<string, string> = {
  'aide_domicile': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80', // Cleaning
  'courses_livraisons': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80', // Grocery
  'aide_numerique': 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80', // Tech
  'demenagement': 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800&q=80', // Moving
  'accompagnement': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80', // Walking
  'jardinage': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80', // Gardening
  'animaux': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80', // Pets
  'evenements': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80', // Events
};

interface TaskCardModernProps {
  task: Task & {
    client?: {
      profile?: {
        displayName?: string;
        photoUrl?: string;
      };
    };
    averageRating?: number;
    reviewCount?: number;
    isNew?: boolean;
  };
  className?: string;
}

export function TaskCardModern({ task, className }: TaskCardModernProps) {
  const locale = useLocale();
  
  // Use existing toggle favorite hook with metadata
  const { isFavorited, toggle: toggleFavorite, loading: favoriteLoading } = useToggleFavorite(
    task.id,
    'task',
    {
      title: task.title,
      imageUrl: CATEGORY_IMAGES[task.category as string] || CATEGORY_IMAGES['aide_domicile'],
      category: task.category as string,
      location: typeof task.location === 'string' 
        ? task.location 
        : (task.location as any)?.city || (task.location as any)?.address,
    }
  );
  
  // Extract data
  const clientName = task.client?.profile?.displayName || 'Utilisateur';
  const clientAvatar = task.client?.profile?.photoUrl;
  const clientFallback = clientName.charAt(0).toUpperCase();

  // Get location
  const taskLocation = task.location;
  let locationLabel = 'Non spécifié';
  if (typeof taskLocation === 'string') {
    locationLabel = taskLocation;
  } else if (taskLocation && typeof taskLocation === 'object') {
    const loc = taskLocation as any;
    locationLabel = loc.city
      ? `${loc.city}${loc.country ? ', ' + loc.country : ''}`
      : loc.address || 'Non spécifié';
  }

  // Format budget
  const budgetDisplay = task.budget
    ? new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(task.budget)
    : 'À discuter';

  // Format date
  const dateDisplay = task.timeWindowStart
    ? new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
      }).format(new Date(task.timeWindowStart))
    : 'Flexible';

  // Category label
  const categoryLabel = typeof task.category === 'string' ? task.category : 'Catégorie';
  
  // Get category image
  const categoryImage = CATEGORY_IMAGES[categoryLabel] || CATEGORY_IMAGES['aide_domicile'];
  
  // Get category icon, color, and display name using Firestore value
  const categoryData = getCategoryByFirestoreValue(categoryLabel);
  
  // Debug log
  if (!categoryData) {
    console.log('⚠️ [TaskCard] No category match for Firestore value:', categoryLabel);
  }
  
  const CategoryIcon = categoryData?.icon;
  const categoryColor = categoryData?.color || '#3B82F6';
  
  // Format category display name (convert snake_case to readable text)
  const categoryDisplayName = categoryLabel
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Rating display
  const rating = task.averageRating || 0;
  const reviewCount = task.reviewCount || 0;
  
  // Handle favorite toggle
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    await toggleFavorite();
  };

  return (
    <Link 
      href={{
        pathname: '/tasks/[id]',
        params: { id: task.id }
      }}
    >
      <Card
        className={cn(
          'group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-0 bg-card',
          className
        )}
      >
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {/* Unsplash Image */}
          <Image
            src={categoryImage}
            alt={categoryLabel}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {task.isNew && (
              <Badge className="bg-primary text-primary-foreground shadow-md">
                <TrendingUp className="mr-1 h-3 w-3" />
                Nouveau
              </Badge>
            )}
            
            {/* Category Badge - Always visible */}
            <Badge 
              variant="secondary" 
              className="shadow-lg backdrop-blur-sm bg-white/95 text-gray-900 flex items-center gap-1.5 text-xs font-semibold"
              style={{ borderLeft: `3px solid ${categoryColor}` }}
            >
              {CategoryIcon ? (
                <span style={{ color: categoryColor }}>
                  <CategoryIcon className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: categoryColor }} />
              )}
              <span>{categoryDisplayName}</span>
            </Badge>
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-background/90 text-foreground shadow-md backdrop-blur-sm font-semibold text-base px-3 py-1">
              {budgetDisplay}
            </Badge>
          </div>
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-md"
            onClick={handleFavoriteClick}
            disabled={favoriteLoading}
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-all",
                isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )} 
            />
          </Button>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {task.title}
          </h3>

          {/* Location & Date */}
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{locationLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{dateDisplay}</span>
            </div>
          </div>

          {/* Client Info & Rating */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={clientAvatar} alt={clientName} />
                <AvatarFallback className="text-xs">{clientFallback}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate max-w-[100px]">
                {clientName}
              </span>
            </div>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
                {reviewCount > 0 && (
                  <span className="text-muted-foreground">({reviewCount})</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
