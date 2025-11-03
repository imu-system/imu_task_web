'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { getTask, type Task } from '@/lib/firestore-tasks';
import { getTaskProposals, type Proposal } from '@/lib/firestore-proposals';
import { ProposalList } from '@/components/proposals/proposal-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, TrendingDown, TrendingUp, Clock, Star, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type SortOption = 'price_low' | 'price_high' | 'recent' | 'oldest';
type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

export default function TaskProposalsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('TaskProposals');
  const tCommon = useTranslations('Common');

  const taskId = params?.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [sortBy, setSortBy] = useState<SortOption>('price_low');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (!taskId) {
      setError('Task ID is missing');
      setLoading(false);
      return;
    }

    fetchData();
  }, [taskId, user]);

  // Apply filters and sorting when proposals or filters change
  useEffect(() => {
    applyFiltersAndSort();
  }, [proposals, sortBy, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch task
      const fetchedTask = await getTask(taskId);
      if (!fetchedTask) {
        setError('Task not found');
        return;
      }

      // Check if user is task owner
      if (fetchedTask.clientId !== user?.uid) {
        setError('You are not authorized to view proposals for this task');
        return;
      }

      setTask(fetchedTask);

      // Fetch proposals
      const fetchedProposals = await getTaskProposals(taskId);
      setProposals(fetchedProposals);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...proposals];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.amount - b.amount;
        case 'price_high':
          return b.amount - a.amount;
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredProposals(filtered);
  };

  const handleProposalAccepted = () => {
    // Refresh data after acceptance
    fetchData();
  };

  const handleBack = () => {
    router.back();
  };

  // Statistics
  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
    avgPrice: proposals.length > 0
      ? Math.round(proposals.reduce((sum, p) => sum + p.amount, 0) / proposals.length)
      : 0,
    minPrice: proposals.length > 0
      ? Math.min(...proposals.map(p => p.amount))
      : 0,
    maxPrice: proposals.length > 0
      ? Math.max(...proposals.map(p => p.amount))
      : 0,
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">{t('errorTitle', { defaultValue: 'Error' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tCommon('back', { defaultValue: 'Go Back' })}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-4"
          data-testid="back-button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {tCommon('back', { defaultValue: 'Back' })}
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="page-title">
              {t('title', { defaultValue: 'Proposals Received' })}
            </h1>
            <p className="text-muted-foreground">
              {t('subtitle', { taskTitle: task.title, defaultValue: `For task: ${task.title}` })}
            </p>
          </div>
          <Badge variant="secondary" className="text-base px-4 py-2">
            {stats.total} {t('proposals', { defaultValue: 'proposals' })}
          </Badge>
        </div>
      </div>

      {/* Task Summary Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Badge variant="outline">{task.category || 'General'}</Badge>
            {task.budget && (
              <span className="text-sm">• {t('budget', { defaultValue: 'Budget' })}: {task.budget}€</span>
            )}
          </CardDescription>
        </CardHeader>
        {task.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Statistics */}
      {proposals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">{t('pendingProposals', { defaultValue: 'Pending' })}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">{stats.minPrice}€</p>
                </div>
                <p className="text-sm text-muted-foreground">{t('lowestOffer', { defaultValue: 'Lowest Offer' })}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.avgPrice}€</p>
                <p className="text-sm text-muted-foreground">{t('averageOffer', { defaultValue: 'Average' })}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <p className="text-2xl font-bold text-orange-600">{stats.maxPrice}€</p>
                </div>
                <p className="text-sm text-muted-foreground">{t('highestOffer', { defaultValue: 'Highest Offer' })}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Sort */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                {t('filterByStatus', { defaultValue: 'Filter by Status' })}
              </label>
              <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">{t('all', { defaultValue: 'All' })} ({stats.total})</TabsTrigger>
                  <TabsTrigger value="pending">{t('pending', { defaultValue: 'Pending' })} ({stats.pending})</TabsTrigger>
                  <TabsTrigger value="accepted">{t('accepted', { defaultValue: 'Accepted' })} ({stats.accepted})</TabsTrigger>
                  <TabsTrigger value="rejected">{t('rejected', { defaultValue: 'Rejected' })} ({stats.rejected})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="sm:w-64">
              <label className="text-sm font-medium mb-2 block">
                {t('sortBy', { defaultValue: 'Sort by' })}
              </label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_low">{t('priceLowToHigh', { defaultValue: 'Price: Low to High' })}</SelectItem>
                  <SelectItem value="price_high">{t('priceHighToLow', { defaultValue: 'Price: High to Low' })}</SelectItem>
                  <SelectItem value="recent">{t('mostRecent', { defaultValue: 'Most Recent' })}</SelectItem>
                  <SelectItem value="oldest">{t('oldest', { defaultValue: 'Oldest First' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {t('noProposalsTitle', { defaultValue: 'No proposals found' })}
            </h3>
            <p className="text-muted-foreground">
              {filterStatus !== 'all'
                ? t('noProposalsFiltered', { defaultValue: 'Try changing your filters' })
                : t('noProposalsYet', { defaultValue: 'No providers have submitted proposals yet' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ProposalList
          taskId={taskId}
          isTaskOwner={true}
          currentUserId={user?.uid || ''}
          onProposalAccepted={handleProposalAccepted}
        />
      )}
    </div>
  );
}
