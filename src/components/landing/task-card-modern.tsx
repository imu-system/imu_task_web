'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Star, Clock, TrendingUp } from 'lucide-react';
import { Link } from '@/navigation';
import Image from 'next/image';
import { type Task } from '@/lib/types';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

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

  // Rating display
  const rating = task.averageRating || 0;
  const reviewCount = task.reviewCount || 0;

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
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
          {/* Placeholder image with category icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl opacity-20">
              {/* You can add category-specific icons here */}
              📋
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {task.isNew && (
              <Badge className="bg-primary text-primary-foreground shadow-md">
                <TrendingUp className="mr-1 h-3 w-3" />
                Nouveau
              </Badge>
            )}
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-background/90 text-foreground shadow-md backdrop-blur-sm font-semibold text-base px-3 py-1">
              {budgetDisplay}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category Badge */}
          <Badge variant="outline" className="mb-2 text-xs">
            {categoryLabel}
          </Badge>

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
