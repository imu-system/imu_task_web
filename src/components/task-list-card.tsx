
'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { type Task, TaskStatus } from '@/lib/types';
import { type Task as FirestoreTask } from '@/lib/firestore-tasks';
import {
  Calendar,
  Eye,
  Navigation,
  MapPin,
} from 'lucide-react';
import { Link } from '@/navigation';
import { Button } from './ui/button';
import { useTranslations, useLocale } from 'next-intl';
import { Dialog, DialogTrigger, DialogContent } from './ui/dialog';
import { OfferForm } from './offer-form';
import { ServiceCategoryBadge } from './services/category-selector';
import { ServiceCategory } from '@/types/services';
import { useRouter } from 'next/navigation';
import { formatDistance } from '@/lib/geolocation';
import { TaskStatusBadge } from './task-detail/task-status-badge';

type TaskListCardProps = {
  task: Task;
  onOpenSheet?: (taskId: string) => void;
  showDistance?: boolean;
  distance?: number | null;
};

const getStatusVariant = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.published: return 'default';
        case TaskStatus.matched: return 'secondary';
        case TaskStatus.completed: return 'outline';
        case TaskStatus.cancelled: return 'destructive';
        default: return 'outline';
    }
}

export default function TaskListCard({ task, onOpenSheet, showDistance = false, distance = null }: TaskListCardProps) {
  const { title, category, timeWindowStart, budget, id, status } = task;
  const locale = useLocale();
  const t = useTranslations('MyTasksPage');
  const tCard = useTranslations('TaskCard');
  const tStatus = useTranslations('TaskStatusTimeline');
  const router = useRouter();

  const categoryLabel = typeof category === 'string' ? category : 'Catégorie';
  
  // Handle both old category (ServiceCategory from database) and new enum-based category
  const categoryFromCatalog = typeof category === 'string' && Object.values(ServiceCategory).includes(category as ServiceCategory) 
    ? category as ServiceCategory 
    : null;

  // Get location from new TaskLocation format or old format
  const taskLocation = task.location;
  let locationLabel = 'N/A';
  if (typeof taskLocation === 'string') {
    locationLabel = taskLocation;
  } else if (taskLocation && typeof taskLocation === 'object') {
    // New TaskLocation format
    locationLabel = (taskLocation as any).city 
      ? `${(taskLocation as any).city}${(taskLocation as any).country ? ', ' + (taskLocation as any).country : ''}`
      : (taskLocation as any).address || 'N/A';
  } else if ((task as any).address?.city) {
    // Old address format
    locationLabel = (task as any).address.city;
  }
  
  // Get distance from task (may have been added by sorting/filtering)
  const taskDistance = distance !== null ? distance : (task as any).distance;

  // Extract tags from task
  const taskTags = (task as any).tags || [];
  const displayTags = taskTags.slice(0, 3);
  const hasMoreTags = taskTags.length > 3;

  // Handle tag click
  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/tasks/search?tag=${tag}` as any);
  };
  
  return (
    <Card>
      <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
                {/* Status badge - support both Task types */}
                {status && typeof status === 'string' && ['open', 'assigned', 'in-progress', 'completed', 'cancelled'].includes(status) ? (
                  <TaskStatusBadge status={status as FirestoreTask['status']} size="sm" />
                ) : status ? (
                  <Badge variant={getStatusVariant(status as any)}>
                    {tStatus(status as any)}
                  </Badge>
                ) : null}
                {/* Use new catalog badge if category is from catalog, otherwise fallback */}
                {categoryFromCatalog ? (
                  <ServiceCategoryBadge category={categoryFromCatalog} showIcon={true} />
                ) : (
                  <Badge variant="outline">{categoryLabel}</Badge>
                )}
                {/* Distance badge */}
                {showDistance && taskDistance !== null && taskDistance !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    <Navigation className="h-3 w-3 mr-1" />
                    {formatDistance(taskDistance)}
                  </Badge>
                )}
            </div>
            <p className="font-semibold text-lg">{title}</p>
             <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">{locationLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timeWindowStart || new Date()))}</span>
                </div>
             </div>

             {/* Tags Section */}
             {displayTags.length > 0 && (
               <div className="flex flex-wrap gap-1 mt-2">
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
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="text-lg font-bold text-primary text-left md:text-right">
                {budget}€
            </div>
            <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onOpenSheet?.(id)}>
                    <Eye className="mr-2"/>
                    {t('view')}
                </Button>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm">{tCard('makeOffer')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <OfferForm task={task}/>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
