'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, Star, MapPin, Calendar, Award, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReviewStatsCard } from '@/features/reviews/components/review-stats-card';
import { ReviewsList } from '@/features/reviews/components/reviews-list';
import { getUserReviews, getReviewStats } from '@/lib/firestore-reviews';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Review, ReviewStats } from '@/types/reviews';
import { useToast } from '@/hooks/use-toast';
import { formatDistance } from 'date-fns';
import { fr, enUS, ja } from 'date-fns/locale';

const localeMap = {
  en: enUS,
  fr: fr,
  ja: ja,
};

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  accountType?: 'client' | 'provider' | 'both';
  isProvider?: boolean;
  bio?: string;
  location?: string;
  skills?: string[];
  createdAt?: Date;
  verified?: boolean;
}

export default function PublicProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const t = useTranslations('ProfilePage');
  const locale = params.locale as string;
  const { toast } = useToast();
  
  const userId = params.userId as string;
  const defaultTab = searchParams?.get('tab') || 'about';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile and reviews
  useEffect(() => {
    async function fetchData() {
      if (!userId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
          setError(t('errors.userNotFound'));
          return;
        }

        const userData = userDoc.data();
        setProfile({
          uid: userId,
          displayName: userData.displayName || 'Anonymous',
          email: userData.email || '',
          photoURL: userData.photoURL,
          accountType: userData.accountType,
          isProvider: userData.isProvider || userData.accountType === 'provider' || userData.accountType === 'both',
          bio: userData.bio,
          location: userData.location,
          skills: userData.skills,
          createdAt: userData.createdAt?.toDate(),
          verified: userData.verified,
        });

        // Fetch reviews (received only, for public profile)
        const userReviews = await getUserReviews(userId, { sortBy: 'recent' });
        setReviews(userReviews);

        // Fetch review stats
        const stats = await getReviewStats(userId);
        setReviewStats(stats);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : t('errors.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId, t]);

  // Handle helpful vote (optional for public profile)
  const handleHelpful = async () => {
    toast({
      title: t('pleaseSignIn'),
    });
  };

  // Handle report (optional for public profile)
  const handleReport = async () => {
    toast({
      title: t('pleaseSignIn'),
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error || t('errors.loadFailed')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.photoURL} alt={profile.displayName} />
                <AvatarFallback className="text-2xl">
                  {profile.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                  {profile.verified && (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {t('verified')}
                    </Badge>
                  )}
                  {profile.isProvider && (
                    <Badge variant="default" className="gap-1">
                      <Award className="h-3 w-3" />
                      {t('provider')}
                    </Badge>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-muted-foreground mt-2">{profile.bio}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                {profile.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {t('memberSince', {
                      date: formatDistance(profile.createdAt, new Date(), {
                        addSuffix: true,
                        locale: localeMap[locale as keyof typeof localeMap] || enUS,
                      }),
                    })}
                  </div>
                )}
              </div>

              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.slice(0, 5).map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                  {profile.skills.length > 5 && (
                    <Badge variant="outline">+{profile.skills.length - 5}</Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full" data-testid="profile-tabs">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="about">{t('tabs.about')}</TabsTrigger>
          <TabsTrigger value="reviews" data-testid="profile-reviews-tab">
            {t('tabs.reviews')} ({reviews.length})
          </TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('tabs.about')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.bio ? (
                <p className="text-muted-foreground">{profile.bio}</p>
              ) : (
                <p className="text-muted-foreground italic">{t('noBio')}</p>
              )}

              {profile.isProvider && profile.skills && profile.skills.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">{t('skills')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-6 space-y-6" data-testid="profile-reviews-section">
          {/* Review Stats */}
          {reviewStats && <ReviewStatsCard stats={reviewStats} />}

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {t('reviewsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewsList
                reviews={reviews}
                onHelpful={handleHelpful}
                onReport={handleReport}
                currentUserId={undefined} // Public profile, no current user
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
