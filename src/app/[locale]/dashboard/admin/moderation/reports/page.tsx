
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getModerationStats } from '@/lib/firestore-reviews';
import type { Review } from '@/types/reviews';
import ModerationQueue from '@/features/reviews/components/moderation-queue';
import ReviewModerationForm from '@/features/reviews/components/review-moderation-form';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, XCircle, AlertCircleIcon } from 'lucide-react';

interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  approvedReviews: number;
  removedReviews: number;
  dismissedReports: number;
}

export default function AdminModerationReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('Admin.moderation');

  const [stats, setStats] = useState<ModerationStats>({
    totalReports: 0,
    pendingReports: 0,
    approvedReviews: 0,
    removedReviews: 0,
    dismissedReports: 0,
  });
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
    // TODO: Add proper admin role check
    // if (!authLoading && user && !user.roles?.includes('admin')) {
    //   router.push('/dashboard');
    // }
  }, [user, authLoading, router]);

  // Fetch moderation stats
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const data = await getModerationStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching moderation stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleSelectReview = (review: Review) => {
    setSelectedReview(review);
  };

  const handleModerationSuccess = () => {
    // Refresh stats after moderation action
    const fetchStats = async () => {
      try {
        const data = await getModerationStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching moderation stats:', error);
      }
    };
    fetchStats();
    setSelectedReview(null);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('page.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('page.description')}</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalReports')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.pending')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.approved')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedReviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.removed')}</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.removedReviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.dismissed')}</CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dismissedReports}</div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Queue on the left */}
        <ModerationQueue onSelectReview={handleSelectReview} />

        {/* Form on the right */}
        {selectedReview ? (
          <ReviewModerationForm
            review={selectedReview}
            adminId={user.uid}
            onSuccess={handleModerationSuccess}
            onCancel={() => setSelectedReview(null)}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('form.selectReview.title')}
              </CardTitle>
              <CardDescription>{t('form.selectReview.description')}</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
