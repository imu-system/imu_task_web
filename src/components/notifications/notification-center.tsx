// src/components/notifications/notification-center.tsx
/**
 * Notification Center Component
 * Full notification management interface with filters and actions
 */

'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useNotificationManager } from '@/hooks/use-notification-manager';
import { NotificationCategory } from '@/lib/types/notifications';
import { NotificationList } from './notification-list';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CheckCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationCenterProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    locale?: 'fr' | 'en' | 'es' | 'de' | 'ja';
}

export function NotificationCenter({
    open,
    onOpenChange,
    locale = 'en',
}: NotificationCenterProps) {
    const t = useTranslations('notifications');
    
    const {
        notifications,
        totalUnreadCount,
        unreadCountByCategory,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    } = useNotificationManager();

    const [selectedCategory, setSelectedCategory] = useState<'all' | NotificationCategory>('all');

    // Filter notifications by category
    const filteredNotifications = useMemo(() => {
        if (selectedCategory === 'all') {
            return notifications;
        }
        return notifications.filter(n => n.category === selectedCategory);
    }, [notifications, selectedCategory]);

    // Sort notifications (unread first, then by date)
    const sortedNotifications = useMemo(() => {
        return [...filteredNotifications].sort((a, b) => {
            if (a.read !== b.read) {
                return a.read ? 1 : -1;
            }
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
    }, [filteredNotifications]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>
                        {t('title')}
                        {totalUnreadCount > 0 && (
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                ({t('unread', { count: totalUnreadCount })})
                            </span>
                        )}
                    </SheetTitle>
                    <SheetDescription>
                        {t('description', { defaultMessage: 'Manage your notifications and stay updated' })}
                    </SheetDescription>
                </SheetHeader>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                        disabled={totalUnreadCount === 0 || loading}
                        className="flex-1"
                    >
                        <CheckCheck className="h-4 w-4 mr-2" />
                        {t('markAllAsRead')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAll}
                        disabled={notifications.length === 0 || loading}
                        className="flex-1"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('clearAll')}
                    </Button>
                </div>

                {/* Category Tabs */}
                <Tabs
                    value={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value as 'all' | NotificationCategory)}
                    className="mt-6"
                >
                    <TabsList className="w-full justify-start overflow-x-auto">
                        <TabsTrigger value="all" className="relative">
                            {t('categories.all')}
                            {totalUnreadCount > 0 && (
                                <span className="ml-1 text-xs">({totalUnreadCount})</span>
                            )}
                        </TabsTrigger>
                        {Object.entries(NotificationCategory).map(([key, value]) => {
                            const count = unreadCountByCategory[value] || 0;
                            const categoryKey = value.toLowerCase() as Lowercase<NotificationCategory>;
                            return (
                                <TabsTrigger key={value} value={value} className="relative">
                                    {t(`categories.${categoryKey}`)}
                                    {count > 0 && (
                                        <span className="ml-1 text-xs">({count})</span>
                                    )}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    {/* Notification List */}
                    <div className="mt-4 overflow-y-auto max-h-[calc(100vh-16rem)]">
                        <NotificationList
                            notifications={sortedNotifications}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                            loading={loading}
                            locale={locale}
                            emptyMessage={
                                selectedCategory === 'all'
                                    ? t('emptyStates.all')
                                    : t(`emptyStates.${selectedCategory.toLowerCase() as Lowercase<NotificationCategory>}`)
                            }
                        />
                    </div>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
