
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, Bell, User, Hash, MessageSquare, Code, RotateCw, Send } from 'lucide-react';
import { UserRole, Notification } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { getNotificationById } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function AdminNotificationDetailPage() {
    const { user: adminUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const notificationId = params.id;
    const t = useTranslations('AdminNotificationsPage.detail');
    const tHistory = useTranslations('AdminNotificationsPage.history');
    const locale = useLocale();
    const { toast } = useToast();
    
    const [notification, setNotification] = useState<Notification | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!adminUser || !adminUser.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [adminUser, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        const fetchedNotification = getNotificationById(notificationId);
        if (fetchedNotification) {
            setNotification(fetchedNotification);
        }
        setLoading(false);
    }, [notificationId]);
    
    const handleResend = () => {
        toast({
            title: t('toast.resendSuccessTitle'),
            description: t('toast.resendSuccessDescription'),
        })
    }

    if (authLoading || loading || !adminUser || !adminUser.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!notification) {
        return (
            <div className="text-center">
                <h1 className="text-xl">{t('notFound')}</h1>
                 <Button asChild variant="link"><Link href="/dashboard/admin/notifications">{t('backToList')}</Link></Button>
            </div>
        )
    }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/admin/notifications">
                    <ArrowLeft className="h-4 w-4"/>
                    <span className="sr-only">{t('backToList')}</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {t('title')}
                </h1>
                <p className="text-muted-foreground font-mono text-xs">
                    ID: {notification.id}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.details.title')}</CardTitle>
                        <CardDescription>
                             {t('cards.details.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <strong>{t('cards.details.type')}:</strong>
                            <Badge variant="outline">{tHistory(`types.${notification.type}`)}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Send className="h-4 w-4 text-muted-foreground" />
                            <strong>{t('cards.details.channel')}:</strong>
                            <span>{tHistory(`channels.${notification.channel}`)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Bell className="h-4 w-4 text-muted-foreground" />
                             <strong>{t('cards.details.status')}:</strong>
                            <Badge variant={notification.deliveryStatus === 'failed' ? 'destructive' : 'default'}>
                                {tHistory(`statuses.${notification.deliveryStatus}`)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                             <User className="h-4 w-4 text-muted-foreground" />
                            <strong>{t('cards.details.recipient')}:</strong>
                             <Link href={`/dashboard/admin/users/${notification.userId}`} className="text-primary hover:underline">
                                {notification.user?.profile?.displayName}
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.payload.title')}</CardTitle>
                        <CardDescription>{t('cards.payload.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                            {JSON.stringify(notification.payload, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.actions.title')}</CardTitle>
                    </CardHeader>
                     <CardContent className="grid grid-cols-1 gap-2">
                        <Button variant="outline" onClick={handleResend} disabled={notification.deliveryStatus !== 'failed'}>
                            <RotateCw className="mr-2"/>
                            {t('cards.actions.resend')}
                        </Button>
                    </CardContent>
                </Card>
            </div>

        </div>
    </div>
  );
}
