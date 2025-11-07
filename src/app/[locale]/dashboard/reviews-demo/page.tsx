'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ReviewsList, ReviewStatsCard } from '@/features/reviews/components';
import { getUserReviews, getReviewStats, markReviewHelpful, unmarkReviewHelpful } from '@/lib/firestore-reviews';
import type { Review, ReviewStats } from '@/types/reviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

/**
 * DEMO PAGE: Reviews with Helpful Votes Integration
 * 
 * This page demonstrates:
 * - ReviewsList component with onHelpful handler
 * - markReviewHelpful() / unmarkReviewHelpful() backend functions
 * - ReviewStatsCard with quality badges
 * - Tabbed interface (Received vs Given)
 * 
 * TODO: Replace /dashboard/reviews page.tsx with this implementation
 */
export default function ReviewsDemoPage() {
  const { user } = useAuth();
  const t = useTranslations('ReviewsPage');
  const { toast } = useToast();

  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [givenReviews, setGivenReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');

  // Fetch reviews and stats
  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch received reviews (where user is the reviewedUser)
        const received = await getUserReviews(user.uid, { sortBy: 'recent' });
        
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
        
        const userStats = await getReviewStats(user.uid);

        setReceivedReviews(received);
        setGivenReviews(given);
        setStats(userStats);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast({
          title: 'Error',
          description: 'Failed to load reviews. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.uid, toast]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleHelpful = async (reviewId: string) => {
    if (!user?.uid) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to mark reviews as helpful',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Find review to check if user already voted
      const allReviews = [...receivedReviews, ...givenReviews];
      const review = allReviews.find((r) => r.id === reviewId);

      if (!review) {
        throw new Error('Review not found');
      }

      const hasVoted = review.helpfulVoters?.includes(user.uid);

      if (hasVoted) {
        // Unmark as helpful
        await unmarkReviewHelpful(reviewId, user.uid);
        toast({
          title: 'Vote removed',
          description: 'You unmarked this review as helpful',
        });
      } else {
        // Mark as helpful
        await markReviewHelpful(reviewId, user.uid);
        toast({
          title: 'Thank you!',
          description: 'You marked this review as helpful',
        });
      }

            // Optimistic update: refresh reviews
      const received = await getUserReviews(user.uid, { sortBy: 'recent' });
      
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
      
      setReceivedReviews(received);
      setGivenReviews(given);
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleReport = async (reviewId: string) => {
    // TODO: Implement reportReview() from firestore-reviews.ts
    toast({
      title: 'Report submitted',
      description: 'We will review this content. Thank you for helping keep our community safe.',
    });
  };

  const handleRespond = async (reviewId: string) => {
    // TODO: Open RespondToReviewDialog
    toast({
      title: 'Feature coming soon',
      description: 'Provider response functionality will be available soon',
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Please sign in to view reviews</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Reviews Demo</h1>
        <p className="text-muted-foreground">
          Complete review system with helpful votes, stats, and filters
        </p>
      </div>

      {/* Stats Card */}
      {stats && (
        <ReviewStatsCard
          stats={stats}
          className="mb-6"
        />
      )}

      {/* Tabs: Received vs Given */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'received' | 'given')}>
        <TabsList>
          <TabsTrigger value="received">
            Received ({receivedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="given">
            Given ({givenReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviews I Received</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewsList
                reviews={receivedReviews}
                onHelpful={handleHelpful}
                onReport={handleReport}
                onRespond={handleRespond}
                canRespond={true}
                currentUserId={user.uid}
                locale="en"
                showFilters={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="given" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviews I Gave</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewsList
                reviews={givenReviews}
                onHelpful={handleHelpful}
                onReport={handleReport}
                canRespond={false}
                currentUserId={user.uid}
                locale="en"
                showFilters={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
