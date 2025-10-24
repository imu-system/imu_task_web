'use client';

import { Task } from '@/lib/firestore-tasks';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PlayCircle, 
  Package 
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface TaskStatusBadgeProps {
  status: Task['status'];
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TaskStatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md',
  className 
}: TaskStatusBadgeProps) {
  const t = useTranslations('TaskStatusBadge');

  const statusConfig: Record<Task['status'], {
    label: string;
    icon: any;
    className: string;
  }> = {
    'open': {
      label: t('open'),
      icon: Package,
      className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    },
    'assigned': {
      label: t('assigned'),
      icon: Clock,
      className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    },
    'in-progress': {
      label: t('inProgress'),
      icon: PlayCircle,
      className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    },
    'completed': {
      label: t('completed'),
      icon: CheckCircle2,
      className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    },
    'cancelled': {
      label: t('cancelled'),
      icon: XCircle,
      className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-semibold border transition-colors',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size], 'mr-1.5')} />}
      {config.label}
    </Badge>
  );
}
