/**
 * Composant Avis du Profil Public
 * 
 * Affiche les avis clients reçus par le prestataire:
 * - Résumé des notes
 * - Distribution des étoiles
 * - Liste des avis détaillés
 * - Pagination
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Review } from '@/types/reviews';
import { format } from 'date-fns';
import { fr, enUS, ja, type Locale } from 'date-fns/locale';

interface ProfileReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  locale?: string;
  className?: string;
}

const localeMap = {
  en: enUS,
  fr: fr,
  ja: ja,
};

export function ProfileReviews({ 
  reviews, 
  averageRating, 
  totalReviews,
  locale = 'fr',
  className 
}: ProfileReviewsProps) {
  const t = useTranslations('PublicProfile.reviews');
  const dateLocale = localeMap[locale as keyof typeof localeMap] || fr;
  const [showAll, setShowAll] = useState(false);

  // Nombre d'avis à afficher
  const displayedReviews = showAll ? reviews : reviews.slice(0, 6);

  // Calculer la distribution des étoiles
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => Math.round(r.rating) === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  if (totalReviews === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('noReviews')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Résumé des notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Note moyenne */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('basedOn', { count: totalReviews })}
              </p>
            </div>

            {/* Distribution des étoiles */}
            <div className="space-y-3">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16 text-sm">
                    <span>{stars}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={percentage} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des avis */}
      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            dateLocale={dateLocale}
          />
        ))}
      </div>

      {/* Bouton "Voir plus" */}
      {reviews.length > 6 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="min-w-[200px]"
          >
            {showAll ? t('showLess') : t('showMore', { count: reviews.length - 6 })}
          </Button>
        </div>
      )}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  dateLocale: Locale;
}

function ReviewCard({ review, dateLocale }: ReviewCardProps) {
  const t = useTranslations('PublicProfile.reviews');

  // Générer initiales pour l'avatar
  const initials = review.reviewerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          {/* Contenu */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold">{review.reviewerName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-sm text-muted-foreground">
                    {format(review.createdAt instanceof Date ? review.createdAt : new Date(review.createdAt), 'PPP', { locale: dateLocale })}
                  </span>
                </div>
              </div>

              {/* Badges */}
              {review.verified && (
                <Badge variant="secondary" className="gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {t('verified')}
                </Badge>
              )}
            </div>

            {/* Commentaire */}
            {review.comment && (
              <p className="text-sm leading-relaxed">{review.comment}</p>
            )}

            {/* Réponse du prestataire */}
            {review.response && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-semibold mb-2">{t('providerResponse')}</p>
                <p className="text-sm">{review.response.text}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(review.response.respondedAt instanceof Date ? review.response.respondedAt : new Date(review.response.respondedAt), 'PPP', { locale: dateLocale })}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
