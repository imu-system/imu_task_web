'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getOffersForTaskWithDetails, acceptOffer, rejectOffer } from '@/lib/firebase/offers';
import { getTaskById } from '@/lib/tasks';
import type { OfferWithDetails } from '@/types/offer';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Star, 
  Clock, 
  Euro,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

export default function TaskOffersPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('Offers');
  const taskId = params?.id as string;
  const locale = params?.locale as string;

  const [task, setTask] = useState<Task | null>(null);
  const [offers, setOffers] = useState<OfferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_low' | 'price_high' | 'rating' | 'recent'>('recent');

  useEffect(() => {
    if (!taskId) return;

    const fetchData = async () => {
      try {
        // Récupérer la tâche
        const taskData = await getTaskById(taskId);
        if (!taskData) {
          setError('Task not found');
          return;
        }
        setTask(taskData);

        // Vérifier que l'utilisateur est le client
        if (taskData.createdBy !== user?.uid) {
          setError('Unauthorized');
          return;
        }

        // Récupérer les offres
        const offersData = await getOffersForTaskWithDetails(taskId);
        setOffers(offersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load offers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, user?.uid]);

  const handleAcceptOffer = async (offerId: string) => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      await acceptOffer(offerId, user.uid);
      
      // Recharger les offres
      const updatedOffers = await getOffersForTaskWithDetails(taskId);
      setOffers(updatedOffers);
      
      // Rediriger vers les bookings après 2s
      setTimeout(() => {
        router.push('/dashboard/bookings');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept offer');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      await rejectOffer(offerId, user.uid);
      
      // Recharger les offres
      const updatedOffers = await getOffersForTaskWithDetails(taskId);
      setOffers(updatedOffers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject offer');
    } finally {
      setLoading(false);
    }
  };

  const handleContactProvider = (providerId: string) => {
    router.push(`/messages?userId=${providerId}`);
  };

  // Tri des offres
  const sortedOffers = [...offers].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.proposedPrice - b.proposedPrice;
      case 'price_high':
        return b.proposedPrice - a.proposedPrice;
      case 'rating':
        return (b.providerRating || 0) - (a.providerRating || 0);
      case 'recent':
      default:
        return new Date(b.createdAt.toDate()).getTime() - new Date(a.createdAt.toDate()).getTime();
    }
  });

  const pendingOffers = sortedOffers.filter(o => o.status === 'pending');
  const acceptedOffers = sortedOffers.filter(o => o.status === 'accepted');
  const rejectedOffers = sortedOffers.filter(o => o.status === 'rejected');

  const getPriceDiff = (offerPrice: number, budget: number) => {
    const diff = offerPrice - budget;
    const percent = ((diff / budget) * 100).toFixed(0);
    
    if (diff > 0) {
      return { icon: TrendingUp, text: `+${percent}%`, color: 'text-orange-600' };
    } else if (diff < 0) {
      return { icon: TrendingDown, text: `${percent}%`, color: 'text-green-600' };
    } else {
      return { icon: Minus, text: '±0%', color: 'text-gray-600' };
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="p-6 bg-destructive/10">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => router.back()} className="mt-4">
            {t('goBack')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('offersReceivedTitle')}</h1>
        <p className="text-muted-foreground">
          {t('taskTitle')}: <strong>{task?.title}</strong>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {t('budgetIndicated')}: <strong>{task?.budget}€</strong>
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold">{pendingOffers.length}</div>
          <div className="text-sm text-muted-foreground">{t('pendingOffers')}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{acceptedOffers.length}</div>
          <div className="text-sm text-muted-foreground">{t('acceptedOffers')}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {pendingOffers.length > 0
              ? `${Math.min(...pendingOffers.map(o => o.proposedPrice))}€`
              : '-'}
          </div>
          <div className="text-sm text-muted-foreground">{t('lowestOffer')}</div>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={sortBy === 'recent' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('recent')}
        >
          {t('sortRecent')}
        </Button>
        <Button
          variant={sortBy === 'price_low' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('price_low')}
        >
          {t('sortPriceLow')}
        </Button>
        <Button
          variant={sortBy === 'price_high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('price_high')}
        >
          {t('sortPriceHigh')}
        </Button>
        <Button
          variant={sortBy === 'rating' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('rating')}
        >
          {t('sortRating')}
        </Button>
      </div>

      {/* Liste des offres */}
      <div className="space-y-4">
        {/* Offres acceptées */}
        {acceptedOffers.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3 text-green-600">{t('acceptedOffersSection')}</h2>
            {acceptedOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                taskBudget={task?.budget || 0}
                onAccept={handleAcceptOffer}
                onReject={handleRejectOffer}
                onContact={handleContactProvider}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        )}

        {/* Offres en attente */}
        {pendingOffers.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">{t('pendingOffersSection')}</h2>
            {pendingOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                taskBudget={task?.budget || 0}
                onAccept={handleAcceptOffer}
                onReject={handleRejectOffer}
                onContact={handleContactProvider}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        )}

        {/* Offres rejetées */}
        {rejectedOffers.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              {t('showRejected')} ({rejectedOffers.length})
            </summary>
            <div className="mt-3 space-y-3">
              {rejectedOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  taskBudget={task?.budget || 0}
                  onAccept={handleAcceptOffer}
                  onReject={handleRejectOffer}
                  onContact={handleContactProvider}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          </details>
        )}

        {/* Aucune offre */}
        {offers.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">{t('noOffersYet')}</p>
            <p className="text-sm text-muted-foreground mt-2">{t('noOffersHint')}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

interface OfferCardProps {
  offer: OfferWithDetails;
  taskBudget: number;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string) => void;
  onContact: (providerId: string) => void;
  locale: string;
  t: (key: string) => string;
}

function OfferCard({ offer, taskBudget, onAccept, onReject, onContact, locale, t }: OfferCardProps) {
  const priceDiff = offer.proposedPrice - taskBudget;
  const priceDiffInfo = (() => {
    const diff = offer.proposedPrice - taskBudget;
    const percent = ((diff / taskBudget) * 100).toFixed(0);
    
    if (diff > 0) {
      return { icon: TrendingUp, text: `+${percent}%`, color: 'text-orange-600' };
    } else if (diff < 0) {
      return { icon: TrendingDown, text: `${percent}%`, color: 'text-green-600' };
    } else {
      return { icon: Minus, text: '±0%', color: 'text-gray-600' };
    }
  })();

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: t('statusPending') },
    accepted: { color: 'bg-green-100 text-green-800', label: t('statusAccepted') },
    rejected: { color: 'bg-red-100 text-red-800', label: t('statusRejected') },
    withdrawn: { color: 'bg-gray-100 text-gray-800', label: t('statusWithdrawn') },
  };

  return (
    <Card className="p-6 mb-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Provider Info */}
        <div className="flex items-start gap-4 lg:w-1/3">
          <Avatar className="h-16 w-16">
            <AvatarImage src={offer.providerAvatar} />
            <AvatarFallback>{offer.providerName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{offer.providerName}</h3>
            
            {/* Rating */}
            {offer.providerRating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{offer.providerRating.toFixed(1)}</span>
                {offer.providerReviewCount && (
                  <span className="text-sm text-muted-foreground">
                    ({offer.providerReviewCount} {t('reviews')})
                  </span>
                )}
              </div>
            )}

            {/* Badges */}
            {offer.providerBadges && offer.providerBadges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {offer.providerBadges.slice(0, 3).map((badge, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator orientation="vertical" className="hidden lg:block" />

        {/* Offer Details */}
        <div className="flex-1 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <Badge className={statusConfig[offer.status].color}>
              {statusConfig[offer.status].label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDistance(offer.createdAt.toDate(), new Date(), {
                addSuffix: true,
                locale: locale === 'fr' ? fr : enUS,
              })}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold">{offer.proposedPrice}€</div>
            <div className={`flex items-center gap-1 ${priceDiffInfo.color}`}>
              <priceDiffInfo.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{priceDiffInfo.text}</span>
            </div>
          </div>

          {/* Estimated Duration */}
          {offer.estimatedDuration && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{t('estimatedDuration')}: {offer.estimatedDuration}h</span>
            </div>
          )}

          {/* Message */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('providerMessage')}:</p>
            <p className="text-sm">{offer.message}</p>
          </div>

          {/* Availability */}
          {offer.availableFrom && offer.availableTo && (
            <div className="text-sm text-muted-foreground">
              <span>{t('availableFrom')}: </span>
              <span className="font-medium">
                {offer.availableFrom.toDate().toLocaleDateString(locale)}
              </span>
              <span> {t('to')} </span>
              <span className="font-medium">
                {offer.availableTo.toDate().toLocaleDateString(locale)}
              </span>
            </div>
          )}

          {/* Actions */}
          {offer.status === 'pending' && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => onAccept(offer.id)}
                className="flex-1 sm:flex-none"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t('acceptOffer')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(offer.id)}
                className="flex-1 sm:flex-none"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t('rejectOffer')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onContact(offer.providerId)}
                className="flex-1 sm:flex-none"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('contactProvider')}
              </Button>
            </div>
          )}

          {offer.status === 'accepted' && (
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-sm text-green-700">{t('offerAcceptedMessage')}</p>
            </div>
          )}

          {offer.status === 'rejected' && offer.rejectionReason && (
            <div className="bg-red-50 p-3 rounded-md">
              <p className="text-sm text-red-700">
                {t('rejectionReason')}: {offer.rejectionReason}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
