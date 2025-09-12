
'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { type Task, TaskStatus } from '@/lib/types';
import {
  Calendar,
  MapPin,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { Link } from '@/navigation';
import { Button } from './ui/button';
import { useTranslations, useLocale } from 'next-intl';

type TaskListCardProps = {
  task: Task;
};

const getStatusVariant = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.published: return 'default';
        case TaskStatus.matched: return 'secondary';
        case TaskStatus.completed: return 'outline';
        case TaskStatus.canceled: return 'destructive';
        default: return 'outline';
    }
}

export default function TaskListCard({ task }: TaskListCardProps) {
  const { title, category, timeWindowStart, priceOffered, id, status } = task;
  const locale = useLocale();
  const t = useTranslations('MyTasksPage');
  const tStatus = useTranslations('TaskStatusTimeline');

  const categoryLabel = category?.name?.[locale as keyof typeof category.name] || category?.slug || 'Catégorie';
  
  return (
    <Card>
      <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
                <Badge variant={getStatusVariant(status)}>
                    {tStatus(status as any)}
                </Badge>
                <Badge variant="outline">{categoryLabel}</Badge>
            </div>
            <p className="font-semibold text-lg">{title}</p>
             <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timeWindowStart))}</span>
                </div>
             </div>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="text-lg font-bold text-primary text-left md:text-right">
                {priceOffered}€
            </div>
            <Button asChild size="sm">
                <Link href={`/dashboard/tasks/${id}`}>
                    <Eye className="mr-2"/>
                    {t('view')}
                </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
