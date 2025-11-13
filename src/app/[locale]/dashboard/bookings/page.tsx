'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { getClientBookings, getProviderBookings } from '@/lib/firestore-bookings';
import { getTask } from '@/lib/firestore-tasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  DollarSign,
  Eye,
  Filter,
  Package,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import type { Booking } from '@/lib/types';

type BookingWithTask = Booking & {
  taskTitle?: string;
  taskCategory?: string;
};

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
type SortOption = 'recent' | 'oldest' | 'amount_high' | 'amount_low';
type ViewMode = 'client' | 'provider';


export default function BookingsPage() {
  const t = useTranslations('Bookings');
  const { user } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingWithTask[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('client');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchBookings();
  }, [user, viewMode]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [bookings, filterStatus, sortBy]);

  const fetchBookings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const fetchedBookings =
        viewMode === 'client'
          ? await getClientBookings(user.uid)
          : await getProviderBookings(user.uid);

      // Fetch task titles for each booking
      const bookingsWithTasks = await Promise.all(
        fetchedBookings.map(async (booking) => {
          try {
            const task = await getTask(booking.taskId);
            return {
              ...booking,
              taskTitle: task?.title || 'Unknown task',
              taskCategory: task?.category || undefined,
            };
          } catch (error) {
            console.error(`Error fetching task ${booking.taskId}:`, error);
            return {
              ...booking,
              taskTitle: 'Unknown task',
            };
          }
        })
      );

      setBookings(bookingsWithTasks);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...bookings];

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter((booking) => booking.status === filterStatus);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount_high':
          return b.amount - a.amount;
        case 'amount_low':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    setFilteredBookings(result);
  };

  const getStatusBadge = (status: Booking['status']) => {
    const statusConfig = {
      pending: { label: t('statusPending'), variant: 'secondary' as const, icon: Clock },
      confirmed: { label: t('statusConfirmed'), variant: 'default' as const, icon: CheckCircle2 },
      in_progress: { label: t('statusInProgress'), variant: 'default' as const, icon: Package },
      completed: { label: t('statusCompleted'), variant: 'default' as const, icon: CheckCircle2 },
      cancelled: { label: t('statusCancelled'), variant: 'destructive' as const, icon: XCircle },
      disputed: { label: t('statusDisputed'), variant: 'destructive' as const, icon: AlertCircle },
    };

    // Cast status to the known keys of statusConfig so TypeScript can index safely,
    // and provide a fallback to 'pending' if the status is somehow unexpected.
    const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusCounts = () => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      in_progress: bookings.filter((b) => b.status === 'in_progress').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    };
  };

  const counts = getStatusCounts();

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="mb-6">
        <TabsList>
          <TabsTrigger value="client">
            <User className="mr-2 h-4 w-4" />
            {t('asClient')}
          </TabsTrigger>
          <TabsTrigger value="provider">
            <Package className="mr-2 h-4 w-4" />
            {t('asProvider')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Status Filter */}
        <Tabs
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as FilterStatus)}
          className="flex-1"
        >
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="all">
              {t('filterAll')} ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="pending">
              {t('statusPending')} ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              {t('statusConfirmed')} ({counts.confirmed})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              {t('statusInProgress')} ({counts.in_progress})
            </TabsTrigger>
            <TabsTrigger value="completed">
              {t('statusCompleted')} ({counts.completed})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              {t('statusCancelled')} ({counts.cancelled})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder={t('sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{t('sortRecent')}</SelectItem>
            <SelectItem value="oldest">{t('sortOldest')}</SelectItem>
            <SelectItem value="amount_high">{t('sortAmountHigh')}</SelectItem>
            <SelectItem value="amount_low">{t('sortAmountLow')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bookings List */}
      {!loading && filteredBookings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filterStatus === 'all' ? t('noBookingsTitle') : t('noBookingsFiltered')}
            </h3>
            <p className="text-muted-foreground text-center">
              {filterStatus === 'all' ? t('noBookingsDescription') : t('tryChangingFilters')}
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && filteredBookings.length > 0 && (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{booking.taskTitle}</CardTitle>
                    <CardDescription className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${booking.amount.toFixed(2)}
                      </span>
                      {booking.scheduledDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {t('scheduled')}: {new Date(booking.scheduledDate).toLocaleDateString()}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Notes */}
                  {booking.notes && (
                    <div>
                      <p className="text-sm font-medium mb-1">{t('notes')}:</p>
                      <p className="text-sm text-muted-foreground">{booking.notes}</p>
                    </div>
                  )}

                  {/* Cancellation Reason */}
                  {booking.status === 'cancelled' && booking.cancellationReason && (
                    <div>
                      <p className="text-sm font-medium mb-1">{t('cancellationReason')}:</p>
                      <p className="text-sm text-destructive">{booking.cancellationReason}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    {booking.startedAt && (
                      <span>
                        {t('started')}: {new Date(booking.startedAt).toLocaleString()}
                      </span>
                    )}
                    {booking.completedAt && (
                      <span>
                        {t('completed')}: {new Date(booking.completedAt).toLocaleString()}
                      </span>
                    )}
                    {booking.cancelledAt && (
                      <span>
                        {t('cancelled')}: {new Date(booking.cancelledAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/tasks/${booking.taskId}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t('viewTask')}
                    </Button>
                    {/* TODO: Add status-specific actions (confirm, cancel, mark progress, etc.) */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
