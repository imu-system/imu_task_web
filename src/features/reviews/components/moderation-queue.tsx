'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, CheckCircle, XCircle, Eye, Loader2, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getReportedReviews } from '@/lib/firestore-reviews';
import type { Review } from '@/types/reviews';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

// ============================================================================
// TYPES
// ============================================================================

type ModerationStatus = 'all' | 'pending' | 'approved' | 'removed' | 'dismissed';

interface ModerationQueueProps {
  onSelectReview?: (review: Review) => void;
  locale?: string;
  className?: string;
}

// ============================================================================
// MODERATION QUEUE COMPONENT
// ============================================================================

export default function ModerationQueue({
  onSelectReview,
  locale = 'en',
  className,
}: ModerationQueueProps) {
  const t = useTranslations('Admin.moderation');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ModerationStatus>('pending');

  const dateLocale = locale === 'fr' ? fr : enUS;

  // Fetch reported reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        if (filter === 'all') {
          // Fetch all reported reviews
          const allReviews = await getReportedReviews();
          setReviews(allReviews);
        } else {
          // Fetch by status
          const filteredReviews = await getReportedReviews(filter as any);
          setReviews(filteredReviews);
        }
      } catch (error) {
        console.error('Error fetching reported reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [filter]);

  // Get status badge variant
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t('status.pending')}
        </Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-500">
          <CheckCircle className="h-3 w-3" />
          {t('status.approved')}
        </Badge>;
      case 'removed':
        return <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          {t('status.removed')}
        </Badge>;
      case 'dismissed':
        return <Badge variant="outline" className="gap-1">
          <Eye className="h-3 w-3" />
          {t('status.dismissed')}
        </Badge>;
      default:
        return <Badge variant="secondary">{t('status.pending')}</Badge>;
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('queue.title')}</CardTitle>
            <CardDescription>{t('queue.description')}</CardDescription>
          </div>
          
          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(value) => setFilter(value as ModerationStatus)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('queue.filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.all')}</SelectItem>
                <SelectItem value="pending">{t('filters.pending')}</SelectItem>
                <SelectItem value="approved">{t('filters.approved')}</SelectItem>
                <SelectItem value="removed">{t('filters.removed')}</SelectItem>
                <SelectItem value="dismissed">{t('filters.dismissed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!loading && reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg font-semibold">{t('queue.empty.title')}</p>
            <p className="text-sm text-muted-foreground">{t('queue.empty.description')}</p>
          </div>
        )}

        {/* Reviews List */}
        {!loading && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review, index) => {
              const createdAt = review.createdAt instanceof Date 
                ? review.createdAt 
                : new Date(review.createdAt);
              const timeAgo = formatDistanceToNow(createdAt, { 
                addSuffix: true,
                locale: dateLocale,
              });

              const reportCount = (review as any).moderation?.reportCount || 1;
              const moderationStatus = (review as any).moderation?.status || 'pending';

              return (
                <div key={review.id || index}>
                  <div 
                    className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => onSelectReview?.(review)}
                  >
                    {/* Left: Review Info */}
                    <div className="flex-1 space-y-3">
                      {/* Reviewer */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.reviewerAvatar} />
                          <AvatarFallback>
                            {review.reviewerName?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{review.reviewerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('queue.reviewedUser')}: {review.reviewedUserName}
                          </p>
                        </div>
                      </div>

                      {/* Comment Preview */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {review.comment || t('queue.noComment')}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{timeAgo}</span>
                        <span>•</span>
                        <span>{t('queue.rating')}: {review.rating}/5</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {t('queue.reports', { count: reportCount })}
                        </span>
                      </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(moderationStatus)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReview?.(review);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('queue.review')}
                      </Button>
                    </div>
                  </div>

                  {index < reviews.length - 1 && <Separator className="my-4" />}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
