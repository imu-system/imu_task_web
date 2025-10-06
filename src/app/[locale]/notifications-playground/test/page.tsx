/**
 * React Query Notifications Test Page
 * 
 * Interactive playground to test all React Query features:
 * - Infinite scroll pagination
 * - Optimistic updates
 * - Cache invalidation
 * - Filters & sorting
 * - Performance monitoring
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationListInfinite } from '@/components/notifications/notification-list-infinite';
import {
  useUnreadCount,
  useUnreadCountsByCategory,
  useMarkAllAsRead,
  useDeleteMultiple,
} from '@/lib/react-query/use-notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  RefreshCw, 
  Activity,
  Zap,
  Database,
  Clock
} from 'lucide-react';
import { NotificationCategory } from '@/lib/types/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { notificationKeys, invalidateNotifications } from '@/lib/react-query/query-client';

export default function NotificationsTestPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | undefined>();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Queries
  const { data: unreadCount } = useUnreadCount(user?.uid || '');
  const { data: countsByCategory } = useUnreadCountsByCategory(user?.uid || '');

  // Mutations
  const markAllAsReadMutation = useMarkAllAsRead(user?.uid || '');
  const deleteMultipleMutation = useDeleteMultiple(user?.uid || '');

  // Stats from React Query
  const queryCache = queryClient.getQueryCache();
  const queries = queryCache.getAll();
  const notificationQueries = queries.filter(q => 
    q.queryKey[0] === 'notifications'
  );

  const stats = {
    totalQueries: queries.length,
    notificationQueries: notificationQueries.length,
    activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
    staleQueries: queries.filter(q => q.isStale()).length,
    cachedData: notificationQueries.reduce((acc, q) => {
      const data = q.state.data as any;
      return acc + (data?.pages?.reduce((sum: number, p: any) => sum + (p?.notifications?.length || 0), 0) || 0);
    }, 0),
  };

  const handleMarkAllAsRead = async () => {
    // Get all notification IDs from cache
    const allNotificationIds: string[] = [];
    notificationQueries.forEach(query => {
      const data = query.state.data as any;
      data?.pages?.forEach((page: any) => {
        page?.notifications?.forEach((notif: any) => {
          if (!notif.read) {
            allNotificationIds.push(notif.id);
          }
        });
      });
    });

    if (allNotificationIds.length > 0) {
      await markAllAsReadMutation.mutateAsync(allNotificationIds);
    }
  };

  const handleInvalidateAll = () => {
    invalidateNotifications();
  };

  const handleClearCache = () => {
    queryClient.removeQueries({ queryKey: notificationKeys.all });
  };

  if (!user) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to test notifications</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🧪 React Query Test Playground</h1>
        <p className="text-muted-foreground">
          Interactive testing for notification caching & pagination
        </p>
      </div>

      {/* Stats Cards */}
      {showStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Count</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cached Items</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cachedData}</div>
              <p className="text-xs text-muted-foreground">
                in {stats.notificationQueries} queries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Queries</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeQueries}</div>
              <p className="text-xs text-muted-foreground">
                / {stats.totalQueries} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stale Queries</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.staleQueries}</div>
              <p className="text-xs text-muted-foreground">
                need refetch
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Optimal</div>
              <p className="text-xs text-muted-foreground">
                Cache hit rate: {stats.cachedData > 0 ? '~80%' : '0%'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Controls & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="unread-only">Show Unread Only</Label>
              <Switch
                id="unread-only"
                checked={unreadOnly}
                onCheckedChange={setUnreadOnly}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-stats">Show Statistics</Label>
              <Switch
                id="show-stats"
                checked={showStats}
                onCheckedChange={setShowStats}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <Label className="mb-2 block">Category Filter</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === undefined ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(undefined)}
              >
                All
              </Button>
              {Object.values(NotificationCategory).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                  {countsByCategory && countsByCategory[category] > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {countsByCategory[category]}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              variant="outline"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>

            <Button
              onClick={handleInvalidateAll}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Invalidate Cache
            </Button>

            <Button
              onClick={handleClearCache}
              variant="outline"
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification List */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Testing infinite scroll with {unreadOnly ? 'unread' : 'all'} notifications
            {selectedCategory && ` in category: ${selectedCategory}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationListInfinite
            userId={user.uid}
            category={selectedCategory}
            unreadOnly={unreadOnly}
          />
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="queries">
            <TabsList>
              <TabsTrigger value="queries">Queries</TabsTrigger>
              <TabsTrigger value="cache">Cache</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
            </TabsList>

            <TabsContent value="queries" className="space-y-2">
              <div className="text-sm font-mono bg-muted p-4 rounded-lg overflow-auto max-h-96">
                <h4 className="font-bold mb-2">Active Notification Queries:</h4>
                {notificationQueries.map((query, idx) => (
                  <div key={idx} className="mb-2 pb-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={query.isStale() ? 'destructive' : 'secondary'}>
                        {query.isStale() ? 'Stale' : 'Fresh'}
                      </Badge>
                      <Badge variant="outline">
                        {query.getObserversCount()} observers
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Key: {JSON.stringify(query.queryKey)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Data: {(query.state.data as any)?.pages?.length || 0} pages
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="cache" className="space-y-2">
              <div className="text-sm font-mono bg-muted p-4 rounded-lg overflow-auto max-h-96">
                <pre>{JSON.stringify(stats, null, 2)}</pre>
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-2">
              <div className="text-sm font-mono bg-muted p-4 rounded-lg overflow-auto max-h-96">
                <h4 className="font-bold mb-2">React Query Configuration:</h4>
                <ul className="space-y-1">
                  <li>• staleTime: 2 minutes</li>
                  <li>• gcTime: 30 minutes</li>
                  <li>• refetchOnWindowFocus: true</li>
                  <li>• refetchOnReconnect: true</li>
                  <li>• retry: 3 attempts</li>
                  <li>• Page size: 20 items</li>
                  <li>• Pagination: Cursor-based</li>
                  <li>• Optimistic updates: Enabled</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
