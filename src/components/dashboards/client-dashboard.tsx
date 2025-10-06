'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useUserTasks } from '@/hooks/use-user-tasks';
import { useUserStats } from '@/hooks/use-user-stats';
import { useUserBookings } from '@/hooks/use-user-bookings';
import { useConversations } from '@/hooks/use-conversations';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  DollarSign,
  Plus,
  ArrowRight,
  Loader2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { RevenueChart } from '@/components/analytics/revenue-chart';
import { TaskStatsChart } from '@/components/analytics/task-stats-chart';
import { ActivityMetricsCard } from '@/components/analytics/activity-metrics-card';
import { ExportReports } from '@/components/analytics/export-reports';
import { 
  getClientSpending, 
  getClientTaskStatistics, 
  getActivityMetrics,
  type ClientSpending,
  type TaskStatistics,
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('Dashboard.client');
  const { tasks, loading, error } = useUserTasks(user?.uid || null);
  const { bookings, loading: bookingsLoading } = useUserBookings(user?.uid, 'client');
  const { conversations, totalUnreadCount, loading: conversationsLoading } = useConversations(user?.uid || '');
  const stats = useUserStats(tasks);

  // Analytics state
  const [spending, setSpending] = useState<ClientSpending | null>(null);
  const [taskStats, setTaskStats] = useState<TaskStatistics | null>(null);
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

        const [spendingData, taskStatsData, activityData] = await Promise.all([
          getClientSpending(user.uid),
          getClientTaskStatistics(user.uid),
          getActivityMetrics(user.uid, 'client'),
        ]);

        setSpending(spendingData);
        setTaskStats(taskStatsData);
        setActivityMetrics(activityData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.uid]);

  // Loading state
  if (loading || bookingsLoading || conversationsLoading) {
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
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

  // Get recent tasks (last 5)
  const recentTasks = tasks
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      open: 'default',
      assigned: 'secondary',
      'in-progress': 'outline',
      completed: 'default',
      cancelled: 'destructive',
    };

    const labels: Record<string, string> = {
      open: t('open'),
      assigned: t('assigned'),
      'in-progress': t('inProgressStatus'),
      completed: t('completedStatus'),
      cancelled: t('cancelled'),
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalTasks')}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {t('currentlyOpen', { count: stats.openTasks })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('inProgress')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.assignedTasks + stats.inProgressTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('activeTasks')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activeBookings') || 'Active Bookings'}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('confirmedInProgress') || 'Confirmed & in progress'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSpent') || 'Total Spent'}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                bookings
                  .filter((b) => b.status === 'completed')
                  .reduce((sum, b) => sum + b.amount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('fromCompletedBookings') || `From ${bookings.filter(b => b.status === 'completed').length} completed bookings`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Metrics */}
      {activityMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ActivityMetricsCard metrics={activityMetrics} role="client" />
        </div>
      )}

      {/* Analytics Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {taskStats && (
          <TaskStatsChart stats={taskStats} type="category" />
        )}
        {taskStats && (
          <TaskStatsChart stats={taskStats} type="status" />
        )}
      </div>

      {/* Export Reports */}
      {user?.uid && (
        <ExportReports userId={user.uid} role="client" />
      )}

      {/* Messages Stats */}
      <div className="grid gap-4 md:grid-cols-2">
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
          <Button onClick={() => router.push('/tasks/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('createNewTask')}
          </Button>
          <Button variant="outline" onClick={() => router.push('/tasks')} className="gap-2">
            {t('viewAllTasks')}
            <ArrowRight className="h-4 w-4" />
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
                {t('bookingsDescription') || 'Your latest service bookings'}
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/bookings">
                {t('viewAll') || 'View All'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">#{booking.id.slice(0, 8)}</p>
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
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(booking.amount)}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(booking.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('recentTasks')}</CardTitle>
          </div>
          {tasks.length > 0 && (
            <Button variant="ghost" asChild>
              <Link href="/tasks" className="gap-2">
                {t('viewAllTasks')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('noTasksYet')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('createFirstTask')}
              </p>
              <Button onClick={() => router.push('/tasks/new')} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('createTask')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/tasks/${task.id}`)}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold truncate">{task.title}</h4>
                      {getStatusBadge(task.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{task.category}</span>
                      <span>•</span>
                      <span>{formatDate(task.createdAt)}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(task.budget)}</div>
                      <div className="text-xs text-muted-foreground">Budget</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Breakdown */}
      {tasks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('statusBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('open')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${stats.totalTasks > 0 ? (stats.openTasks / stats.totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">
                    {stats.openTasks}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('assigned')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${stats.totalTasks > 0 ? (stats.assignedTasks / stats.totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">
                    {stats.assignedTasks}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('inProgressStatus')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{
                        width: `${stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">
                    {stats.inProgressTasks}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('completedStatus')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">
                    {stats.completedTasks}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('cancelled')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{
                        width: `${stats.totalTasks > 0 ? (stats.cancelledTasks / stats.totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">
                    {stats.cancelledTasks}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('budgetOverview')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-sm font-medium">{t('totalBudgetLabel')}</span>
                <span className="text-lg font-bold">
                  {formatCurrency(stats.totalBudget)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-sm font-medium">{t('averagePerTask')}</span>
                <span className="text-lg font-bold">
                  {formatCurrency(stats.averageBudget)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-sm font-medium">{t('activeTasksBudget')}</span>
                <span className="text-lg font-bold">
                  {formatCurrency(
                    tasks
                      .filter((t) => ['open', 'assigned', 'in-progress'].includes(t.status))
                      .reduce((sum, t) => sum + t.budget, 0)
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
