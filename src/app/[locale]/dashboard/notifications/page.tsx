
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, Bell, CheckCheck, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Handshake,
  MessageSquare,
  Star as StarIcon,
  CreditCard,
  Circle,
  CircleDot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/navigation';
import { useState } from 'react';

const mockUserNotifications = [
    { id: 'n1', type: 'offer', textKey: 'mock.offer', params: { task: "Nettoyage d'appartement" }, date: new Date(Date.now() - 3600000), read: false, icon: <Handshake className="h-5 w-5"/>, link: '/dashboard/tasks/task1' },
    { id: 'n2', type: 'message', textKey: 'mock.message', params: { user: 'Client X' }, date: new Date(Date.now() - 7200000), read: false, icon: <MessageSquare className="h-5 w-5"/>, link: '/dashboard/messages/thread1' },
    { id: 'n3', type: 'payment', textKey: 'mock.payment', params: { amount: '45,00 €' }, date: new Date(Date.now() - 86400000), read: true, icon: <CreditCard className="h-5 w-5"/>, link: '/dashboard/wallet/transactions' },
    { id: 'n4', type: 'review', textKey: 'mock.review', params: { user: 'Client Y' }, date: new Date(Date.now() - 172800000), read: true, icon: <StarIcon className="h-5 w-5"/>, link: '/dashboard/reviews' },
];

export default function UserNotificationsPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('UserNotificationsPage');
    const [notifications, setNotifications] = useState(mockUserNotifications);

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };


    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Bell className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={markAllAsRead}>
                        <CheckCheck className="mr-2 h-4 w-4"/>
                        {t('markAllAsRead')}
                    </Button>
                     <Button variant="outline" asChild>
                        <Link href="/dashboard/notifications/preferences">
                            <Settings className="mr-2 h-4 w-4"/>
                            {t('preferences')}
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {notifications.map((notif, index) => (
                             <li key={notif.id} className={cn("p-4 hover:bg-muted/50 transition-colors", !notif.read && "bg-primary/5")}>
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1 relative">
                                        <div className="p-2 bg-muted rounded-full">
                                            {notif.icon}
                                        </div>
                                        {!notif.read && (
                                            <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-primary border-2 border-background"/>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">{t(notif.textKey as any, notif.params)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(notif.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!notif.read && (
                                            <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)}>
                                                {t('markAsRead')}
                                            </Button>
                                        )}
                                         <Button variant="outline" size="sm" asChild>
                                            <Link href={notif.link}>{t('open')}</Link>
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                         {notifications.length === 0 && (
                            <li className="p-8 text-center text-muted-foreground">
                                {t('noNotifications')}
                            </li>
                        )}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
