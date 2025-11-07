
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from '@/navigation';
import { Loader2, ArrowLeft, Calendar, User, Euro, MessageSquare, Clock, XCircle, CheckCircle, Edit, ShieldAlert, Handshake, CreditCard, CalendarCheck, Trash2 } from 'lucide-react';
import { UserRole, Booking, BookingStatus } from '@/lib/types';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { ReviewStatsCard } from '@/features/reviews/components/review-stats-card';
import { ReviewsList } from '@/features/reviews/components/reviews-list';
import { getUserReviews, getReviewStats, markReviewHelpful, unmarkReviewHelpful } from '@/lib/firestore-reviews';
import type { Review, ReviewStats } from '@/types/reviews';
import { useToast } from '@/hooks/use-toast';


export default function BookingDetailContent({ booking }: { booking: Booking }) {
    const { user } = useAuth();
    const t = useTranslations('BookingDetailPage');
    const tBookings = useTranslations('MyBookingsPage');
    const locale = useLocale();
    const { toast } = useToast();

    // Reviews state
    const [providerReviews, setProviderReviews] = useState<Review[]>([]);
    const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
    const [loadingReviews, setLoadingReviews] = useState(true);

    // Fetch provider reviews
    useEffect(() => {
        const fetchProviderReviews = async () => {
            if (!booking.provider?.uid) return;
            
            try {
                setLoadingReviews(true);
                const reviews = await getUserReviews(booking.provider.uid, { sortBy: 'recent' });
                const stats = await getReviewStats(booking.provider.uid);
                setProviderReviews(reviews);
                setReviewStats(stats);
            } catch (error) {
                console.error('Error fetching provider reviews:', error);
                toast({
                    title: t('errors.loadReviewsFailed'),
                    variant: 'destructive',
                });
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchProviderReviews();
    }, [booking.provider?.uid, t, toast]);

    // Handle helpful vote
    const handleHelpful = async (reviewId: string) => {
        if (!user) {
            toast({
                title: t('pleaseSignIn'),
            });
            return;
        }

        try {
            // Find review to check if user already voted
            const review = providerReviews.find((r) => r.id === reviewId);
            if (!review) return;
            
            const currentUserHasVoted = review.helpfulVoters?.includes(user.uid);

            if (currentUserHasVoted) {
                await unmarkReviewHelpful(reviewId, user.uid);
                // Optimistic update
                setProviderReviews(prev => prev.map(r => 
                    r.id === reviewId 
                        ? { ...r, helpfulCount: (r.helpfulCount || 0) - 1, helpfulVoters: r.helpfulVoters?.filter((id: string) => id !== user.uid) || [] }
                        : r
                ));
            } else {
                await markReviewHelpful(reviewId, user.uid);
                // Optimistic update
                setProviderReviews(prev => prev.map(r => 
                    r.id === reviewId 
                        ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1, helpfulVoters: [...(r.helpfulVoters || []), user.uid] }
                        : r
                ));
            }
            toast({
                title: t('reviewHelpfulSuccess'),
            });
        } catch (error) {
            console.error('Error marking review helpful:', error);
            toast({
                title: t('errors.markHelpfulFailed'),
                variant: 'destructive',
            });
        }
    };

    if (!user) return null;

    const timelineEvents = [
        {
          icon: <Handshake className="h-5 w-5" />,
          titleKey: "offerAccepted",
          timestamp: booking.createdAt,
          descriptionKey: "offerAcceptedDesc",
        },
        {
          icon: <CreditCard className="h-5 w-5" />,
          titleKey: "paymentAuthorized",
          timestamp: new Date(new Date(booking.createdAt).getTime() + 60000),
          descriptionKey: "paymentAuthorizedDesc"
        },
        {
          icon: <CalendarCheck className="h-5 w-5" />,
          titleKey: "bookingConfirmed",
          timestamp: new Date(new Date(booking.createdAt).getTime() + 120000),
          descriptionKey: "bookingConfirmedDesc"
        },
         ...(booking.status === BookingStatus.completed ? [{
          icon: <CheckCircle className="h-5 w-5" />,
          titleKey: "taskCompleted",
          timestamp: booking.updatedAt,
          descriptionKey: "taskCompletedDesc"
        }] : []),
      ];

  return (
    <div className="p-2 space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                {t('title')}
            </h1>
            <p className="text-muted-foreground font-mono text-xs">
                ID: {booking.id}
            </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.summary.title')}</CardTitle>
                        <CardDescription>
                            {t('cards.summary.description', { taskTitle: booking.task?.title })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold">{t('cards.summary.client')}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={booking.client?.profile?.photoUrl} />
                                        <AvatarFallback>{booking.client?.profile?.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p>{booking.client?.profile?.displayName}</p>
                                        <Link href={`/dashboard/profile`} className="text-sm text-primary hover:underline">{t('viewProfile')}</Link>
                                    </div>
                                </div>
                            </div>
                             <div>
                                <h3 className="font-semibold">{t('cards.summary.provider')}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={booking.provider?.profile?.photoUrl} />
                                        <AvatarFallback>{booking.provider?.profile?.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p>{booking.provider?.profile?.displayName}</p>
                                        <Link href={`/dashboard/profile`} className="text-sm text-primary hover:underline">{t('viewProfile')}</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Separator/>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Badge variant={tBookings(`statusVariants.${booking.status}`) as any} className="text-sm">
                                    {tBookings(`status.${booking.status}`)}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Euro className="h-4 w-4 text-muted-foreground"/>
                                <strong>{t('cards.summary.amount')}:</strong>
                                <span>{(booking.agreedAmount ?? 0) / 100} {booking.currency}</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-full">
                                <Calendar className="h-4 w-4 text-muted-foreground"/>
                                <strong>{t('cards.summary.date')}:</strong>
                                <span>{booking.startAt && new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(new Date(booking.startAt))}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.timeline.title')}</CardTitle>
                        <CardDescription>{t('cards.timeline.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-6">
                            {timelineEvents.map((event, index) => (
                                <li key={index} className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                            {event.icon}
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-semibold">{t(`cards.timeline.events.${event.titleKey}`)}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.timestamp))}
                                        </p>
                                        <p className="text-sm mt-1">{t(`cards.timeline.events.${event.descriptionKey}`)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Provider Reviews Section */}
                {booking.provider?.uid && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('cards.reviews.title', { name: booking.provider.profile?.displayName })}</CardTitle>
                            <CardDescription>{t('cards.reviews.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {loadingReviews ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <>
                                    {reviewStats && <ReviewStatsCard stats={reviewStats} />}
                                    <ReviewsList 
                                        reviews={providerReviews} 
                                        currentUserId={user?.uid}
                                        onHelpful={handleHelpful}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.actions.title')}</CardTitle>
                        <CardDescription>{t('cards.actions.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-2">
                        <Button variant="outline"><CheckCircle className="mr-2"/>{t('cards.actions.confirmCompletion')}</Button>
                        <Separator className="my-2"/>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline"><Edit className="mr-2"/>{t('cards.actions.reschedule')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>{t('cards.actions.rescheduleDialog.title')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('cards.actions.rescheduleDialog.description')}
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="flex justify-center">
                                        <CalendarPicker
                                            mode="single"
                                            selected={booking.startAt ? new Date(booking.startAt) : undefined}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="start-time">{t('cards.actions.rescheduleDialog.startTime')}</Label>
                                            <Input id="start-time" type="time" defaultValue={booking.startAt ? new Date(booking.startAt).toTimeString().substring(0,5) : ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end-time">{t('cards.actions.rescheduleDialog.endTime')}</Label>
                                            <Input id="end-time" type="time" defaultValue={booking.endAt ? new Date(booking.endAt).toTimeString().substring(0,5) : ''} />
                                        </div>
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                <AlertDialogCancel>{t('cards.actions.rescheduleDialog.cancel')}</AlertDialogCancel>
                                <AlertDialogAction>{t('cards.actions.rescheduleDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="mr-2"/>{t('cards.actions.cancel')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.actions.cancelDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.actions.cancelDialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-2 py-2">
                                    <Label htmlFor="cancellation-reason">{t('cards.actions.cancelDialog.reasonLabel')}</Label>
                                    <Textarea id="cancellation-reason" placeholder={t('cards.actions.cancelDialog.reasonPlaceholder')} />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cards.actions.cancelDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction>{t('cards.actions.cancelDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
                 <Button variant="outline" className="w-full">
                    <ShieldAlert className="mr-2"/>
                    {t('cards.actions.openDispute')}
                </Button>
            </div>
        </div>
    </div>
  );
}

