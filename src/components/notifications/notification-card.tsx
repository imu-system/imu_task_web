/**
 * Notification Card Component
 * 
 * Displays a single notification with actions
 */

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Info,
  MessageSquare,
  User,
  XCircle,
} from 'lucide-react';
import { Link } from '@/navigation';
import type { NotificationWithId } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDismiss,
  onDelete,
}: NotificationCardProps) {
  const { id, title, body, read, priority, createdAt, actionUrl, category } = notification;

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    normal: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
  };

  const categoryEmojis: Record<NotificationCategory, string> = {
    [NotificationCategory.TASKS]: '📋',
    [NotificationCategory.MESSAGES]: '💬',
    [NotificationCategory.PROPOSALS]: '💼',
    [NotificationCategory.BOOKINGS]: '📅',
    [NotificationCategory.PAYMENTS]: '💰',
    [NotificationCategory.REVIEWS]: '⭐',
    [NotificationCategory.PROFILE]: '👤',
    [NotificationCategory.SYSTEM]: '⚙️',
  };

  return (
    <div
      className={cn(
        'group relative rounded-2xl border p-4 transition-all hover:border-primary/50',
        !read && 'bg-primary/5 border-primary/20'
      )}
    >
      {/* Unread indicator */}
      {!read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-2xl">
          {categoryEmojis[category] || '📌'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={cn('text-sm font-semibold', !read && 'font-bold')}>
              {title}
            </h4>
            <Badge
              variant="secondary"
              className={cn('text-xs', priorityColors[priority])}
            >
              {priority}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {body}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(createdAt, { addSuffix: true, locale: fr })}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!read && onMarkAsRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onMarkAsRead(id)}
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}

              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onDismiss(id)}
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => onDelete(id)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              {actionUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  asChild
                >
                  <Link href={actionUrl} title="View details">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
