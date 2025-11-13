'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReviewStatsCard } from '@/features/reviews/components/review-stats-card';
import { ReviewsList } from '@/features/reviews/components/reviews-list';
import { getUserReviews, getReviewStats, markReviewHelpful, unmarkReviewHelpful } from '@/lib/firestore-reviews';
import type { Review, ReviewStats } from '@/types/reviews';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

export default function ReviewsPage() {
  const { user, loading } = useAuth();
  const t = useTranslations('Reviews');
  const { toast } = useToast();
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [givenReviews, setGivenReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews data
  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch received reviews (where user is the reviewedUser)
        const received = await getUserReviews(user.uid, { sortBy: 'recent' });
        setReceivedReviews(received);

        // Fetch given reviews (where user is the reviewer)
        const givenQuery = query(
          collection(db, 'reviews'),
          where('reviewerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const givenSnapshot = await getDocs(givenQuery);
        const given = givenSnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        })) as Review[];
        setGivenReviews(given);

        // Fetch review stats
        const stats = await getReviewStats(user.uid);
        setReviewStats(stats);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user?.uid]);

  // Handle helpful vote toggle
  const handleHelpful = async (reviewId: string) => {
    if (!user?.uid) {
      toast({
        title: t('errors.notAuthenticated'),
        variant: 'destructive',
      });
      return;
    }

    try {
      // Find review to check if user already voted
      const allReviews = [...receivedReviews, ...givenReviews];
      const review = allReviews.find((r) => r.id === reviewId);
      
      if (!review) return;
      
      const currentUserHasVoted = review.helpfulVoters?.includes(user.uid);

      if (currentUserHasVoted) {
        // Unmark as helpful
        await unmarkReviewHelpful(reviewId, user.uid);
        
        // Optimistic update
        const updateReviews = (reviews: Review[]) =>
          reviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  helpfulCount: (r.helpfulCount || 0) - 1,
                  helpfulVoters: (r.helpfulVoters || []).filter((id) => id !== user.uid),
                }
              : r
          );
        
        setReceivedReviews(updateReviews);
        setGivenReviews(updateReviews);
        
        toast({
          title: t('helpfulVoteRemoved'),
        });
      } else {
        // Mark as helpful
        await markReviewHelpful(reviewId, user.uid);
        
        // Optimistic update
        const updateReviews = (reviews: Review[]) =>
          reviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  helpfulCount: (r.helpfulCount || 0) + 1,
                  helpfulVoters: [...(r.helpfulVoters || []), user.uid],
                }
              : r
          );
        
        setReceivedReviews(updateReviews);
        setGivenReviews(updateReviews);
        
        toast({
          title: t('helpfulVoteAdded'),
        });
      }
    } catch (err) {
      console.error('Error toggling helpful vote:', err);
      toast({
        title: t('errors.helpfulVoteFailed'),
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
    }
  };

  // Handle report review
  const handleReport = async (reviewId: string) => {
    if (!user?.uid) {
      toast({
        title: t('errors.notAuthenticated'),
        variant: 'destructive',
      });
      return;
    }

    try {
      // TODO: Implement reportReview function
      console.log('Report review:', reviewId);
      toast({
        title: t('reviewReported'),
      });
    } catch (err) {
      console.error('Error reporting review:', err);
      toast({
        title: t('errors.reportFailed'),
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-auto" data-testid="reviews-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
          <Star className="h-8 w-8 text-primary" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Review Stats Card */}
      {reviewStats && <ReviewStatsCard stats={reviewStats} />}

      {/* Tabs: Received vs Given Reviews */}
      <Tabs defaultValue="received" className="w-full" data-testid="reviews-tabs">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" data-testid="reviews-tab-received">
            {t('tabs.received')} ({receivedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="given" data-testid="reviews-tab-given">
            {t('tabs.given')} ({givenReviews.length})
          </TabsTrigger>
        </TabsList>

        {/* Received Reviews Tab */}
        <TabsContent value="received" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('tabs.received')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewsList
                reviews={receivedReviews}
                onHelpful={handleHelpful}
                onReport={handleReport}
                currentUserId={user?.uid}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Given Reviews Tab */}
        <TabsContent value="given" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('tabs.given')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewsList
                reviews={givenReviews}
                onHelpful={handleHelpful}
                onReport={handleReport}
                currentUserId={user?.uid}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
