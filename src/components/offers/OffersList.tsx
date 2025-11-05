'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { OfferCard } from './OfferCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Inbox, 
  ArrowUpDown, 
  DollarSign, 
  Star, 
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import type { OfferWithDetails } from '@/types/offer';

interface OffersListProps {
  offers: OfferWithDetails[];
  taskId: string;
  isTaskOwner: boolean;
  currentUserId?: string;
  currentLocale?: string;
  onAcceptOffer?: (offerId: string) => Promise<void>;
  onRejectOffer?: (offerId: string) => Promise<void>;
}

type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'recent' | 'duration';
type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

export function OffersList({
  offers,
  taskId,
  isTaskOwner,
  currentUserId,
  currentLocale = 'fr',
  onAcceptOffer,
  onRejectOffer,
}: OffersListProps) {
  const t = useTranslations('OffersList');
  const router = useRouter();
  
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Filtrer par statut
  const filteredOffers = useMemo(() => {
    if (filterStatus === 'all') return offers;
    return offers.filter(offer => offer.status === filterStatus);
  }, [offers, filterStatus]);

  // Trier
  const sortedOffers = useMemo(() => {
    const sorted = [...filteredOffers];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.proposedPrice - b.proposedPrice);
      case 'price-desc':
        return sorted.sort((a, b) => b.proposedPrice - a.proposedPrice);
      case 'rating':
        return sorted.sort((a, b) => {
          const ratingA = a.providerRating || 0;
          const ratingB = b.providerRating || 0;
          return ratingB - ratingA;
        });
      case 'duration':
        return sorted.sort((a, b) => {
          const durA = a.estimatedDuration || 999;
          const durB = b.estimatedDuration || 999;
          return durA - durB;
        });
      case 'recent':
      default:
        return sorted.sort((a, b) => {
          return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
        });
    }
  }, [filteredOffers, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const pending = offers.filter(o => o.status === 'pending').length;
    const accepted = offers.filter(o => o.status === 'accepted').length;
    const rejected = offers.filter(o => o.status === 'rejected').length;
    
    const prices = offers.map(o => o.proposedPrice);
    const avgPrice = prices.length > 0 
      ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
      : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return {
      pending,
      accepted,
      rejected,
      avgPrice,
      minPrice,
      maxPrice,
    };
  }, [offers]);

  const handleAccept = async (offerId: string) => {
    if (!onAcceptOffer) return;
    
    setAcceptingId(offerId);
    try {
      await onAcceptOffer(offerId);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (offerId: string) => {
    if (!onRejectOffer) return;
    
    setRejectingId(offerId);
    try {
      await onRejectOffer(offerId);
    } finally {
      setRejectingId(null);
    }
  };

  const handleMessage = (providerId: string) => {
    // Rediriger vers la page de messages avec le provider
    router.push(`/messages?userId=${providerId}&taskId=${taskId}`);
  };

  if (offers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('noOffers')}</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {t('noOffersDescription')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats cards (task owner only) */}
      {isTaskOwner && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('totalOffers')}</p>
                  <p className="text-2xl font-bold">{offers.length}</p>
                </div>
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('avgPrice')}</p>
                  <p className="text-2xl font-bold">{stats.avgPrice}€</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('minPrice')}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.minPrice}€</p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('maxPrice')}</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.maxPrice}€</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Status tabs */}
        <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
          <TabsList>
            <TabsTrigger value="all">
              {t('all')} <Badge variant="secondary" className="ml-2">{offers.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              {t('pending')} <Badge variant="secondary" className="ml-2">{stats.pending}</Badge>
            </TabsTrigger>
            {isTaskOwner && (
              <>
                <TabsTrigger value="accepted">
                  {t('accepted')} <Badge variant="secondary" className="ml-2">{stats.accepted}</Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  {t('rejected')} <Badge variant="secondary" className="ml-2">{stats.rejected}</Badge>
                </TabsTrigger>
              </>
            )}
          </TabsList>
        </Tabs>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t('sortRecent')}
                </div>
              </SelectItem>
              <SelectItem value="price-asc">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  {t('sortPriceLow')}
                </div>
              </SelectItem>
              <SelectItem value="price-desc">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('sortPriceHigh')}
                </div>
              </SelectItem>
              <SelectItem value="rating">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  {t('sortRating')}
                </div>
              </SelectItem>
              <SelectItem value="duration">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t('sortDuration')}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Offers grid */}
      {sortedOffers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">{t('noOffersInFilter')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {sortedOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              isTaskOwner={isTaskOwner}
              currentLocale={currentLocale}
              onAccept={handleAccept}
              onReject={handleReject}
              onMessage={handleMessage}
              accepting={acceptingId === offer.id}
              rejecting={rejectingId === offer.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
