
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { type Task } from '@/lib/types';
import {
  Calendar,
  MapPin,
  Eye,
} from 'lucide-react';
import { Link } from '@/navigation';
import { Button } from './ui/button';
import { useTranslations, useLocale } from 'next-intl';
import { ServiceCategoryBadge } from './services/category-selector';
import { ServiceCategory } from '@/types/services';
import { useRouter } from '@/navigation';


type TaskCardProps = {
  task: Task;
  onOpenSheet?: (taskId: string) => void;
};

export default function TaskCard({ task, onOpenSheet }: TaskCardProps) {
  const { title, category, timeWindowStart, budget, id } = task;
  const locale = useLocale();
  const t = useTranslations('TaskCard');
  const router = useRouter();

  // Access extended properties via type assertion
  const client = (task as any).client;
  const clientName = client?.profile?.displayName || 'Utilisateur';
  const clientAvatarUrl = client?.profile?.photoUrl;
  const clientFallback = clientName ? clientName.charAt(0) : 'U';
  
  // Handle both old category (ServiceCategory from database) and new enum-based category
  const categoryFromCatalog = typeof category === 'string' && Object.values(ServiceCategory).includes(category as ServiceCategory) 
    ? category as ServiceCategory 
    : null;
  
  const categoryLabel = typeof category === 'string' ? category : 'Catégorie';
  const locationLabel = (task as any).address?.city || task.location;

  // Extract tags from task (may not exist in type but can exist in data)
  const taskTags = (task as any).tags || [];
  const displayTags = taskTags.slice(0, 3); // Show first 3 tags
  const hasMoreTags = taskTags.length > 3;

  // Handle tag click - navigate to search with tag filter
  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/tasks/search?tag=${tag}` as any);
  };

  const detailButton = onOpenSheet ? (
    <Button variant="outline" size="sm" onClick={() => onOpenSheet(id)}>
        <Eye className="mr-2"/>
        {t('viewTask')}
    </Button>
  ) : (
    <Button asChild variant="outline" size="sm">
        <Link href={`/dashboard/tasks/${id}` as any}>
            <Eye className="mr-2"/>
            {t('viewTask')}
        </Link>
    </Button>
  );

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            {/* Use new catalog badge if category is from catalog, otherwise fallback */}
            {categoryFromCatalog ? (
              <ServiceCategoryBadge category={categoryFromCatalog} showIcon={true} />
            ) : (
              <Badge variant="secondary">
                <span>{categoryLabel}</span>
              </Badge>
            )}
            <span className="text-xl font-bold text-primary">{budget}€</span>
        </div>
        <CardTitle className="pt-2 font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{locationLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timeWindowStart))}</span>
          </div>
        </div>

        {/* Tags Section */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {displayTags.map((tag: string) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-secondary"
                onClick={(e) => handleTagClick(tag, e)}
              >
                {tag.replace(/_/g, ' ')}
              </Badge>
            ))}
            {hasMoreTags && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{taskTags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={clientAvatarUrl || undefined} alt={clientName} />
            <AvatarFallback>{clientFallback}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{clientName}</span>
        </div>
        <div className="flex gap-2">
           {detailButton}
        </div>
      </CardFooter>
    </Card>
  );
}
