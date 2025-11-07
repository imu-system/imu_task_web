'use client';

import { useTranslations } from 'next-intl';
import { Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ReviewStats, QualityBadgeType } from '@/types/reviews';

// ============================================================================
// BADGE DISPLAY COMPONENT
// ============================================================================

interface BadgeDisplayProps {
  type: QualityBadgeType;
  className?: string;
}

function BadgeDisplay({ type, className }: BadgeDisplayProps) {
  const t = useTranslations('Reviews.badges');

  const badgeConfig: Record<QualityBadgeType, { icon: string; variant: 'default' | 'secondary' | 'outline' }> = {
    top_rated: { icon: '⭐', variant: 'default' },
    excellent_service: { icon: '🏆', variant: 'default' },
    responsive: { icon: '⚡', variant: 'secondary' },
    verified_pro: { icon: '✓', variant: 'default' },
    rising_star: { icon: '🌟', variant: 'secondary' },
    reliable: { icon: '🛡️', variant: 'secondary' },
    great_communicator: { icon: '💬', variant: 'secondary' },
    punctual: { icon: '⏰', variant: 'secondary' },
    value_champion: { icon: '💎', variant: 'secondary' },
  };

  const config = badgeConfig[type];

  return (
    <Badge variant={config.variant} className={cn('gap-1', className)}>
      <span>{config.icon}</span>
      {t(type)}
    </Badge>
  );
}

// ============================================================================
// REVIEW STATS CARD COMPONENT
// ============================================================================

interface ReviewStatsCardProps {
  stats: ReviewStats;
  showBadges?: boolean;
  showDistribution?: boolean;
  showDetailedAverages?: boolean;
  className?: string;
}

export function ReviewStatsCard({
  stats,
  showBadges = true,
  showDistribution = true,
  showDetailedAverages = true,
  className,
}: ReviewStatsCardProps) {
  const t = useTranslations('Reviews.stats');

  // Calculate percentages for distribution
  const distributionPercentages = stats.totalReviews > 0
    ? {
        1: (stats.ratingDistribution[1] / stats.totalReviews) * 100,
        2: (stats.ratingDistribution[2] / stats.totalReviews) * 100,
        3: (stats.ratingDistribution[3] / stats.totalReviews) * 100,
        4: (stats.ratingDistribution[4] / stats.totalReviews) * 100,
        5: (stats.ratingDistribution[5] / stats.totalReviews) * 100,
      }
    : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <Card className={className} data-testid="review-stats-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          {t('title')}
        </CardTitle>
        <CardDescription>
          {t('basedOn', { count: stats.totalReviews })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Rating */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-primary" data-testid="stats-average-rating">
              {stats.averageRating.toFixed(1)}
            </p>
            <div className="flex items-center justify-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-4 w-4',
                    star <= Math.round(stats.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-muted text-muted-foreground'
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1" data-testid="stats-total-reviews">
              {t('totalReviews', { count: stats.totalReviews })}
            </p>
          </div>

          {/* Distribution Bars */}
          {showDistribution && (
            <div className="flex-1 space-y-2" data-testid="stats-distribution">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2" data-testid={`stats-distribution-${rating}`}>
                  <span className="text-xs font-medium w-4">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <Progress
                    value={distributionPercentages[rating as keyof typeof distributionPercentages]}
                    className="h-2 flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Averages */}
        {showDetailedAverages && stats.detailedAverages && (
          <div className="space-y-3 pt-4 border-t" data-testid="stats-detailed-averages">
            <h4 className="text-sm font-semibold">Detailed Ratings</h4>
            <div className="grid grid-cols-2 gap-3">
              {stats.detailedAverages.communication > 0 && (
                <div className="space-y-1" data-testid="stats-detailed-communication">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Communication</span>
                    <span className="font-medium">{stats.detailedAverages.communication.toFixed(1)}</span>
                  </div>
                  <Progress value={(stats.detailedAverages.communication / 5) * 100} className="h-1.5" />
                </div>
              )}
              {stats.detailedAverages.quality > 0 && (
                <div className="space-y-1" data-testid="stats-detailed-quality">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Quality</span>
                    <span className="font-medium">{stats.detailedAverages.quality.toFixed(1)}</span>
                  </div>
                  <Progress value={(stats.detailedAverages.quality / 5) * 100} className="h-1.5" />
                </div>
              )}
              {stats.detailedAverages.professionalism > 0 && (
                <div className="space-y-1" data-testid="stats-detailed-professionalism">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Professionalism</span>
                    <span className="font-medium">{stats.detailedAverages.professionalism.toFixed(1)}</span>
                  </div>
                  <Progress value={(stats.detailedAverages.professionalism / 5) * 100} className="h-1.5" />
                </div>
              )}
              {stats.detailedAverages.timeliness > 0 && (
                <div className="space-y-1" data-testid="stats-detailed-timeliness">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Timeliness</span>
                    <span className="font-medium">{stats.detailedAverages.timeliness.toFixed(1)}</span>
                  </div>
                  <Progress value={(stats.detailedAverages.timeliness / 5) * 100} className="h-1.5" />
                </div>
              )}
              {stats.detailedAverages.valueForMoney > 0 && (
                <div className="space-y-1" data-testid="stats-detailed-value">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Value</span>
                    <span className="font-medium">{stats.detailedAverages.valueForMoney.toFixed(1)}</span>
                  </div>
                  <Progress value={(stats.detailedAverages.valueForMoney / 5) * 100} className="h-1.5" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Response Rate (for providers) */}
        {stats.responseRate !== undefined && (
          <div className="pt-4 border-t" data-testid="stats-response-rate">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Response Rate</span>
              <span className="text-sm font-bold text-primary">{stats.responseRate.toFixed(0)}%</span>
            </div>
            <Progress value={stats.responseRate} className="h-2" />
          </div>
        )}

        {/* Quality Badges */}
        {showBadges && stats.badges && stats.badges.length > 0 && (
          <div className="space-y-3 pt-4 border-t" data-testid="stats-badges">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Quality Badges</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.badges
                .filter((badge) => badge.active)
                .map((badge) => (
                  <BadgeDisplay key={badge.type} type={badge.type} />
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
