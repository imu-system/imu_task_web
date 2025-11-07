/**
 * Recent Notifications Component - Phase 9: Connexion données réelles
 * 
 * Affiche les notifications récentes depuis Firestore
 * Utilise useRecentNotifications hook
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { 
    Bell, 
    Handshake, 
    MessageSquare, 
    Star, 
    DollarSign, 
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { ReactNode } from "react";
import { useRecentNotifications } from "@/hooks/use-dashboard-data";
import { Skeleton } from "../ui/skeleton";
import { NotificationType } from "@/lib/types/notifications";

interface RecentNotificationsProps {
    userId: string;
    limit?: number;
}

// Map notification types to icons
const getNotificationIcon = (type: NotificationType): ReactNode => {
    const iconClass = "h-4 w-4";
    
    switch (type) {
        case NotificationType.NEW_PROPOSAL:
        case NotificationType.PROPOSAL_ACCEPTED:
        case NotificationType.PROPOSAL_REJECTED:
            return <Handshake className={iconClass} />;
        case NotificationType.NEW_MESSAGE:
            return <MessageSquare className={iconClass} />;
        case NotificationType.NEW_REVIEW:
        case NotificationType.REVIEW_RESPONSE:
            return <Star className={iconClass} />;
        case NotificationType.BOOKING_CONFIRMED:
        case NotificationType.BOOKING_CANCELLED:
        case NotificationType.BOOKING_COMPLETED:
        case NotificationType.BOOKING_CREATED:
        case NotificationType.BOOKING_REMINDER:
        case NotificationType.BOOKING_UPDATED:
            return <Bell className={iconClass} />;
        case NotificationType.PAYMENT_RECEIVED:
        case NotificationType.PAYMENT_SENT:
        case NotificationType.PAYMENT_FAILED:
            return <DollarSign className={iconClass} />;
        case NotificationType.PROFILE_VERIFIED:
            return <CheckCircle className={iconClass} />;
        case NotificationType.PROFILE_UPDATE_REQUIRED:
        case NotificationType.PROFILE_INCOMPLETE:
            return <AlertTriangle className={iconClass} />;
        case NotificationType.TASK_UPDATED:
        case NotificationType.TASK_DELETED:
        case NotificationType.TASK_CREATED:
        case NotificationType.TASK_COMPLETED:
        case NotificationType.TASK_ASSIGNED:
            return <Info className={iconClass} />;
        default:
            return <Bell className={iconClass} />;
    }
};

export function RecentNotifications({ userId, limit = 3 }: RecentNotificationsProps) {
    const t = useTranslations('DashboardPage.recentNotifications');
    const { data: notifications, loading, error, markAsRead } = useRecentNotifications(userId, limit);

    // Loading state
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 flex-1" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription className="text-destructive">
                        Erreur de chargement
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Impossible de charger les notifications.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const handleNotificationClick = async (notificationId: string) => {
        try {
            await markAsRead(notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {notifications && notifications.length > 0 ? (
                    <>
                        {notifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                className={`flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors ${
                                    notif.read ? 'opacity-60' : ''
                                }`}
                                onClick={() => handleNotificationClick(notif.id)}
                            >
                                <div className="bg-primary/10 text-primary p-2 rounded-full flex-shrink-0">
                                    {getNotificationIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-muted-foreground break-words">
                                        {notif.body}
                                    </p>
                                    {notif.createdAt && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {(() => {
                                                let date = new Date();
                                                const createdAt = notif.createdAt as any;
                                                if (createdAt instanceof Date) {
                                                    date = createdAt;
                                                } else if (typeof createdAt === 'string') {
                                                    date = new Date(createdAt);
                                                } else if (createdAt?.toDate && typeof createdAt.toDate === 'function') {
                                                    date = createdAt.toDate();
                                                }
                                                return date.toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                });
                                            })()}
                                        </p>
                                    )}
                                </div>
                                {!notif.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                                )}
                            </div>
                        ))}
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        {t('noNotifications')}
                    </p>
                )}
                
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/notifications">{t('viewAll')}</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

