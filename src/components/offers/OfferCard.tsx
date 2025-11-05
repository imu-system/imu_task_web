'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Clock, 
  Star,
  MapPin,
  Award
} from 'lucide-react';
import type { OfferWithDetails } from '@/types/offer';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, ja } from 'date-fns/locale';

interface OfferCardProps {
  offer: OfferWithDetails;
  isTaskOwner: boolean;
  currentLocale?: string;
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  onMessage?: (providerId: string) => void;
  accepting?: boolean;
  rejecting?: boolean;
}

const localeMap = {
  fr,
  en: enUS,
  ja,
};

export function OfferCard({
  offer,
  isTaskOwner,
  currentLocale = 'fr',
  onAccept,
  onReject,
  onMessage,
  accepting = false,
  rejecting = false,
}: OfferCardProps) {
  const t = useTranslations('OfferCard');
  const [expanded, setExpanded] = useState(false);

  const locale = localeMap[currentLocale as keyof typeof localeMap] || fr;
  
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    pending: t('statusPending'),
    accepted: t('statusAccepted'),
    rejected: t('statusRejected'),
    withdrawn: t('statusWithdrawn'),
  };

  // Calcul du prix par rapport au budget
  const priceDiff = offer.proposedPrice - offer.taskBudget;
  const pricePercent = Math.round((offer.proposedPrice / offer.taskBudget) * 100 - 100);
  const isPriceGood = offer.proposedPrice <= offer.taskBudget;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          {/* Provider info */}
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={offer.providerAvatar} alt={offer.providerName} />
              <AvatarFallback>
                {offer.providerName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">{offer.providerName}</h3>
                
                {/* Rating */}
                {offer.providerRating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{offer.providerRating.toFixed(1)}</span>
                    {offer.providerReviewCount && (
                      <span className="text-muted-foreground">
                        ({offer.providerReviewCount})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Badges */}
              {offer.providerBadges && offer.providerBadges.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {offer.providerBadges.slice(0, 3).map((badge, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs gap-1">
                      <Award className="h-3 w-3" />
                      {badge}
                    </Badge>
                  ))}
                  {offer.providerBadges.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{offer.providerBadges.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status badge */}
          <Badge className={statusColors[offer.status]}>
            {statusLabels[offer.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price highlight */}
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('proposedPrice')}</p>
              <p className="text-3xl font-bold text-primary">{offer.proposedPrice} €</p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t('vsBudget')}</p>
              <p className={`text-lg font-semibold ${isPriceGood ? 'text-green-600' : 'text-orange-600'}`}>
                {priceDiff > 0 ? '+' : ''}{priceDiff}€ ({pricePercent > 0 ? '+' : ''}{pricePercent}%)
              </p>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Estimated duration */}
          {offer.estimatedDuration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t('duration')}</p>
                <p className="font-medium">{offer.estimatedDuration}h</p>
              </div>
            </div>
          )}

          {/* Created date */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{t('submitted')}</p>
              <p className="font-medium">
                {formatDistanceToNow(offer.createdAt.toDate(), {
                  addSuffix: true,
                  locale,
                })}
              </p>
            </div>
          </div>

          {/* Availability */}
          {offer.availableFrom && offer.availableTo && (
            <div className="col-span-2 flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">{t('availability')}</p>
                <p className="font-medium">
                  {offer.availableFrom.toDate().toLocaleDateString(currentLocale)} -{' '}
                  {offer.availableTo.toDate().toLocaleDateString(currentLocale)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Message */}
        <div>
          <p className="text-sm font-medium mb-2">{t('providerMessage')}</p>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className={`text-sm whitespace-pre-wrap ${!expanded && 'line-clamp-3'}`}>
              {offer.message}
            </p>
            {offer.message.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary hover:underline mt-1"
              >
                {expanded ? t('showLess') : t('showMore')}
              </button>
            )}
          </div>
        </div>
      </CardContent>

      {/* Actions (only for task owner on pending offers) */}
      {isTaskOwner && offer.status === 'pending' && (
        <CardFooter className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => onMessage?.(offer.providerId)}
          >
            <MessageSquare className="h-4 w-4" />
            {t('message')}
          </Button>

          <Button
            variant="outline"
            className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onReject?.(offer.id)}
            disabled={rejecting}
          >
            <XCircle className="h-4 w-4" />
            {rejecting ? t('rejecting') : t('reject')}
          </Button>

          <Button
            className="gap-2"
            onClick={() => onAccept?.(offer.id)}
            disabled={accepting}
          >
            <CheckCircle2 className="h-4 w-4" />
            {accepting ? t('accepting') : t('accept')}
          </Button>
        </CardFooter>
      )}

      {/* Accepted/Rejected status footer */}
      {offer.status !== 'pending' && (
        <CardFooter className="pt-4 border-t">
          <div className="w-full text-center text-sm text-muted-foreground">
            {offer.status === 'accepted' && offer.acceptedAt && (
              <p>
                {t('acceptedOn')}{' '}
                {offer.acceptedAt.toDate().toLocaleDateString(currentLocale)}
              </p>
            )}
            {offer.status === 'rejected' && offer.rejectedAt && (
              <p>
                {t('rejectedOn')}{' '}
                {offer.rejectedAt.toDate().toLocaleDateString(currentLocale)}
              </p>
            )}
            {offer.status === 'withdrawn' && (
              <p>{t('providerWithdrew')}</p>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
