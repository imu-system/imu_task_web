'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useUserProposals } from '@/hooks/use-user-proposals';
import { useUserBookings } from '@/hooks/use-user-bookings';
import { useConversations } from '@/hooks/use-conversations';
import {
  ArrowUpRight,
  DollarSign,
  Briefcase,
  Clock,
  CheckCircle2,
  Search,
  Loader2,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { Link } from '@/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RevenueChart } from '@/components/analytics/revenue-chart';
import { ActivityMetricsCard } from '@/components/analytics/activity-metrics-card';
import { ExportReports } from '@/components/analytics/export-reports';
import { 
  getProviderEarnings, 
  getRevenueOverTime, 
  getActivityMetrics,
  type ProviderEarnings,
  type RevenueData,
  type ActivityMetrics
} from '@/lib/analytics/dashboard-analytics';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task } from '@/lib/firestore-tasks';

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('Dashboard.provider');
  const { proposals, loading: proposalsLoading } = useUserProposals(user?.uid || null);
  const { bookings, loading: bookingsLoading } = useUserBookings(user?.uid, 'provider');
  const { conversations, totalUnreadCount, loading: conversationsLoading } = useConversations(user?.uid || '');
  
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Analytics state
  const [earnings, setEarnings] = useState<ProviderEarnings | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [activityMetrics, setActivityMetrics] = useState<ActivityMetrics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.uid) return;
      
      try {
        setAnalyticsLoading(true);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [earningsData, revenueHistory, activityData] = await Promise.all([
          getProviderEarnings(user.uid),
          getRevenueOverTime(user.uid, 'provider', thirtyDaysAgo, now),
          getActivityMetrics(user.uid, 'provider'),
        ]);

        setEarnings(earningsData);
        setRevenueData(revenueHistory);
        setActivityMetrics(activityData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.uid]);

  // Fetch available tasks (open tasks)
  useEffect(() => {
    const fetchAvailableTasks = async () => {
      try {
        setLoading(true);
        const tasksRef = collection(db, 'tasks');
        const q = query(
          tasksRef,
          where('status', '==', 'open'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const snapshot = await getDocs(q);
        const tasksData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            deadline: data.deadline?.toDate() || null,
          } as Task;
        });
        
        setAvailableTasks(tasksData);
      } catch (err) {
        console.error('Error fetching available tasks:', err);
        setError('Failed to load available tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTasks();
  }, []);

  // Calculate provider stats
  const stats = {
    totalProposals: proposals.length,
    pendingProposals: proposals.filter((p) => p.status === 'pending').length,
    acceptedProposals: proposals.filter((p) => p.status === 'accepted').length,
    availableTasks: availableTasks.length,
    activeBookings: bookings.filter((b) => 
      b.status === 'confirmed' || b.status === 'in_progress'
    ).length,
    completedBookings: bookings.filter((b) => b.status === 'completed').length,
    totalEarnings: bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.amount, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date?: string | Date | null) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  };

  // Loading state
  if (loading || proposalsLoading || bookingsLoading || conversationsLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('availableTasks')}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableTasks}</div>
            <p className="text-xs text-muted-foreground">
              {t('openTasksToBid')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('myProposals')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProposals}</div>
            <p className="text-xs text-muted-foreground">
              {t('pendingResponse', { count: stats.pendingProposals })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('activeBookings') || 'Active Bookings'}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">
              {t('confirmedInProgress') || 'Confirmed & in progress'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalEarnings') || 'Total Earnings'}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('fromCompletedBookings') || `From ${stats.completedBookings} completed bookings`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Metrics */}
      {activityMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ActivityMetricsCard metrics={activityMetrics} role="provider" />
        </div>
      )}

      {/* Revenue Chart */}
      {revenueData.length > 0 && (
        <RevenueChart 
          data={revenueData} 
          title="Revenus des 30 derniers jours" 
          type="area" 
          showCount={false}
        />
      )}

      {/* Export Reports */}
      {user?.uid && (
        <ExportReports userId={user.uid} role="provider" />
      )}

      {/* Messages Stats */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnreadCount}</div>
            <p className="text-xs text-muted-foreground">
              {conversations.length} total conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.slice(0, 5).length}</div>
            <p className="text-xs text-muted-foreground">
              Last 5 active chats
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('quickActions')}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <Button onClick={() => router.push('/tasks')} className="gap-2">
            <Search className="h-4 w-4" />
            {t('browseAvailableTasks')}
          </Button>
          <Button variant="outline" onClick={() => router.push('/offers')} className="gap-2">
            {t('viewMyProposals')}
            <ArrowUpRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => router.push('/bookings')} className="gap-2">
            <Calendar className="h-4 w-4" />
            {t('viewBookings') || 'View My Bookings'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/messages')} className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
            {totalUnreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">{totalUnreadCount}</Badge>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>{t('recentBookings') || 'Recent Bookings'}</CardTitle>
              <CardDescription>
                {t('bookingsDescription') || 'Your latest bookings and their status'}
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/bookings">
                {t('viewAll') || 'View All'}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('booking') || 'Booking'}</TableHead>
                  <TableHead>{t('status') || 'Status'}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('amount') || 'Amount'}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('date') || 'Date'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.slice(0, 5).map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-medium">#{booking.id.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === 'completed'
                            ? 'default'
                            : booking.status === 'cancelled'
                            ? 'destructive'
                            : booking.status === 'in_progress'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatCurrency(booking.amount)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(booking.createdAt)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Available Tasks */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>{t('availableTasksTitle')}</CardTitle>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/tasks">
                {t('view')}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {availableTasks.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('noAvailableTasks')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('checkBackLater')}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('task')}</TableHead>
                    <TableHead className="hidden xl:table-cell">
                      {t('category')}
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      {t('posted')}
                    </TableHead>
                    <TableHead className="hidden md:table-cell">{t('budget')}</TableHead>
                    <TableHead className="text-right">{t('action')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableTasks.slice(0, 5).map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="font-medium">{task.title}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {typeof task.location === 'string'
                            ? task.location
                            : task.location.address}
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <Badge variant="outline">{task.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(task.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatCurrency(task.budget)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/tasks/${task.id}`}>{t('view')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* My Proposals */}
        <Card>
          <CardHeader>
            <CardTitle>{t('myProposalsTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {proposals.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  {t('noProposalsYet')}
                </p>
                <Button size="sm" onClick={() => router.push('/tasks')}>
                  {t('browseTasks')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.slice(0, 4).map((proposal) => (
                  <div
                    key={proposal.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{t('proposalId', { id: proposal.id?.slice(0, 8) || '' })}</p>
                      <Badge
                        variant={
                          proposal.status === 'accepted'
                            ? 'default'
                            : proposal.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {proposal.status === 'accepted' ? t('statusAccepted') : proposal.status === 'rejected' ? t('statusRejected') : t('statusPending')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(proposal.amount)}</div>
                    </div>
                  </div>
                ))}
                {proposals.length > 4 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/offers">{t('viewAllProposals')}</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
