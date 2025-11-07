'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star, ThumbsUp, Flag, MessageSquare, CheckCircle2, ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Review } from '@/types/reviews';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import PhotoGallery from './photo-gallery';

// ============================================================================
// STAR DISPLAY COMPONENT
// ============================================================================

interface StarDisplayProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

function StarDisplay({ rating, size = 'sm', showValue = false, className }: StarDisplayProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted-foreground'
          )}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// REVIEW CARD COMPONENT
// ============================================================================

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  onRespond?: (reviewId: string) => void;
  canRespond?: boolean;
  currentUserId?: string;
  locale?: string;
  className?: string;
}

export function ReviewCard({
  review,
  onHelpful,
  onReport,
  onRespond,
  canRespond = false,
  currentUserId,
  locale = 'en',
  className,
}: ReviewCardProps) {
  const t = useTranslations('Reviews.card');
  const [isExpanded, setIsExpanded] = useState(false);

  const dateLocale = locale === 'fr' ? fr : enUS;
  const createdAt = review.createdAt instanceof Date 
    ? review.createdAt 
    : new Date(review.createdAt);

  const timeAgo = formatDistanceToNow(createdAt, { 
    addSuffix: true,
    locale: dateLocale,
  });

  const hasVotedHelpful = currentUserId && review.helpfulVoters?.includes(currentUserId);
  const commentLength = review.comment?.length || 0;
  const shouldTruncate = commentLength > 300;
  const displayComment = shouldTruncate && !isExpanded
    ? review.comment?.substring(0, 300) + '...'
    : review.comment;

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)} data-testid="review-card" data-review-id={review.id}>
      <CardContent className="pt-6">
        {/* Header: Avatar + Name + Date */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.reviewerAvatar} />
              <AvatarFallback>
                {review.reviewerName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{review.reviewerName}</p>
                {review.verified && (
                  <Badge variant="secondary" className="gap-1" data-testid={`review-badge-verified-${review.id}`}>
                    <CheckCircle2 className="h-3 w-3" />
                    {t('verified')}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{timeAgo}</p>
            </div>
          </div>

          {/* Overall Rating */}
          <div data-testid="review-rating">
            <StarDisplay rating={review.rating} size="md" showValue />
          </div>
        </div>

        {/* Detailed Ratings */}
        {review.detailedRatings && (
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
            {review.detailedRatings.communication && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Communication</span>
                <StarDisplay rating={review.detailedRatings.communication} size="sm" />
              </div>
            )}
            {review.detailedRatings.quality && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Quality</span>
                <StarDisplay rating={review.detailedRatings.quality} size="sm" />
              </div>
            )}
            {review.detailedRatings.professionalism && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Professionalism</span>
                <StarDisplay rating={review.detailedRatings.professionalism} size="sm" />
              </div>
            )}
            {review.detailedRatings.timeliness && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Timeliness</span>
                <StarDisplay rating={review.detailedRatings.timeliness} size="sm" />
              </div>
            )}
            {review.detailedRatings.valueForMoney && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Value</span>
                <StarDisplay rating={review.detailedRatings.valueForMoney} size="sm" />
              </div>
            )}
          </div>
        )}

        {/* Comment */}
        {review.comment && (
          <div className="mb-4" data-testid="review-comment">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {displayComment || t('noComment')}
            </p>
            {shouldTruncate && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0 h-auto mt-1"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </Button>
            )}
          </div>
        )}

        {/* Photos Gallery */}
        {review.photos && review.photos.length > 0 && (
          <div className="mb-4" data-testid="photo-gallery">
            <PhotoGallery photos={review.photos} />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {onHelpful && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onHelpful(review.id!)}
              className={cn(
                'gap-1',
                hasVotedHelpful && 'bg-primary/10 border-primary text-primary'
              )}
              data-testid={`helpful-button-${review.id}`}
            >
              <ThumbsUp className="h-3 w-3" />
              {t('helpful')}
              {review.helpfulCount && review.helpfulCount > 0 ? (
                <span className="text-xs" data-testid={`helpful-count-${review.id}`}>({review.helpfulCount})</span>
              ) : null}
            </Button>
          )}

          {canRespond && onRespond && !review.response && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRespond(review.id!)}
              className="gap-1"
              data-testid={`respond-button-${review.id}`}
            >
              <MessageSquare className="h-3 w-3" />
              {t('respond')}
            </Button>
          )}

          {onReport && currentUserId !== review.reviewerId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReport(review.id!)}
              className="gap-1 text-muted-foreground"
              data-testid={`report-button-${review.id}`}
            >
              <Flag className="h-3 w-3" />
              {t('report')}
            </Button>
          )}
        </div>

        {/* Provider Response */}
        {review.response && (
          <>
            <Separator className="my-4" />
            <div className="bg-muted/30 rounded-lg p-4" data-testid="review-response">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">{t('response')}</p>
                {review.response.respondedAt && (
                  <span className="text-xs text-muted-foreground">
                    {t('respondedOn', {
                      date: new Date(review.response.respondedAt).toLocaleDateString(locale),
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {review.response.text}
              </p>
            </div>
          </>
        )}

        {/* Helpful Count (if no actions) */}
        {!onHelpful && review.helpfulCount && review.helpfulCount > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            {t('helpfulCount', { count: review.helpfulCount })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
