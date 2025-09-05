
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, Calendar, User, Euro, MessageSquare, Clock, XCircle, CheckCircle, Edit, ShieldAlert, Handshake, CreditCard, CalendarCheck, Trash2 } from 'lucide-react';
import { UserRole, Booking } from '@/lib/types';
import { useTranslations, useLocale } from 'next-intl';
import { getBookings } from '@/lib/bookings';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminBookingDetailPage() {
    const { user: adminUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const bookingId = params.id;
    const t = useTranslations('AdminBookingDetailPage');
    const tBookings = useTranslations('AdminBookingsPage');
    const locale = useLocale();
    
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!adminUser || !adminUser.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [adminUser, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        const fetchedBooking = getBookings().find(b => b.id === bookingId);
        if (fetchedBooking) {
            setBooking(fetchedBooking);
        }
        setLoading(false);
    }, [bookingId]);

    if (authLoading || loading || !adminUser || !adminUser.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!booking) {
        return (
            <div className="text-center">
                <h1 className="text-xl">{t('notFound')}</h1>
                 <Button asChild variant="link"><Link href="/dashboard/admin/bookings">{t('backToList')}</Link></Button>
            </div>
        )
    }

    const timelineEvents = [
        {
          icon: <Handshake className="h-5 w-5" />,
          titleKey: "offerAccepted",
          timestamp: "2024-08-17T09:55:00Z",
          descriptionKey: "offerAcceptedDesc",
        },
        {
          icon: <CreditCard className="h-5 w-5" />,
          titleKey: "paymentAuthorized",
          timestamp: "2024-08-17T09:56:00Z",
          descriptionKey: "paymentAuthorizedDesc"
        },
        {
          icon: <CalendarCheck className="h-5 w-5" />,
          titleKey: "bookingConfirmed",
          timestamp: "2024-08-17T10:00:00Z",
          descriptionKey: "bookingConfirmedDesc"
        },
         {
          icon: <CheckCircle className="h-5 w-5" />,
          titleKey: "taskCompleted",
          timestamp: "2024-08-18T12:05:00Z",
          descriptionKey: "taskCompletedDesc"
        }
      ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/admin/bookings">
                    <ArrowLeft className="h-4 w-4"/>
                    <span className="sr-only">{t('backToList')}</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {t('title')}
                </h1>
                <p className="text-muted-foreground font-mono text-xs">
                    ID: {booking.id}
                </p>
            </div>
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
                                        <Link href={`/dashboard/admin/users/${booking.client?.id}`} className="text-sm text-primary hover:underline">{t('viewProfile')}</Link>
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
                                        <Link href={`/dashboard/admin/users/${booking.provider?.id}`} className="text-sm text-primary hover:underline">{t('viewProfile')}</Link>
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
                                <span>{booking.agreedAmount / 100} {booking.currency}</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-full">
                                <Calendar className="h-4 w-4 text-muted-foreground"/>
                                <strong>{t('cards.summary.date')}:</strong>
                                <span>{new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(new Date(booking.startAt))}</span>
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

            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.moderation.title')}</CardTitle>
                        <CardDescription>{t('cards.moderation.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-2">
                        <Button variant="outline" disabled><Edit className="mr-2"/>{t('cards.moderation.reschedule')}</Button>
                        <Button variant="outline"><CheckCircle className="mr-2"/>{t('cards.moderation.markCompleted')}</Button>
                        <Button variant="outline"><XCircle className="mr-2"/>{t('cards.moderation.declareNoShow')}</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline"><Euro className="mr-2"/>{t('cards.moderation.adjustPrice')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.moderation.adjustPriceDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.moderation.adjustPriceDialog.description', { currentAmount: (booking.agreedAmount / 100).toFixed(2) })}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="adjustment-amount">{t('cards.moderation.adjustPriceDialog.amountLabel')}</Label>
                                            <Input id="adjustment-amount" type="number" placeholder="e.g. 5.50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="adjustment-type">{t('cards.moderation.adjustPriceDialog.typeLabel')}</Label>
                                             <Select defaultValue="credit">
                                                <SelectTrigger id="adjustment-type">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="credit">{t('cards.moderation.adjustPriceDialog.creditProvider')}</SelectItem>
                                                    <SelectItem value="debit">{t('cards.moderation.adjustPriceDialog.debitProvider')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="adjustment-reason">{t('cards.moderation.adjustPriceDialog.reasonLabel')}</Label>
                                        <Textarea id="adjustment-reason" placeholder={t('cards.moderation.adjustPriceDialog.reasonPlaceholder')} />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cards.moderation.adjustPriceDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction>{t('cards.moderation.adjustPriceDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="mr-2"/>{t('cards.moderation.cancel')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.moderation.cancelDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.moderation.cancelDialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-2 py-2">
                                    <Label htmlFor="cancellation-reason">{t('cards.moderation.cancelDialog.reasonLabel')}</Label>
                                    <Textarea id="cancellation-reason" placeholder={t('cards.moderation.cancelDialog.reasonPlaceholder')} />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cards.moderation.cancelDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction>{t('cards.moderation.cancelDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Separator className="my-2"/>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost"><MessageSquare className="mr-2"/>{t('cards.moderation.internalNote')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.moderation.internalNoteDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.moderation.internalNoteDialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-2">
                                    <Textarea placeholder={t('cards.moderation.internalNoteDialog.placeholder')} />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cards.moderation.internalNoteDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction>{t('cards.moderation.internalNoteDialog.save')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
                 <Button variant="outline" className="w-full">
                    <ShieldAlert className="mr-2"/>
                    {t('cards.moderation.openDispute')}
                </Button>
            </div>
        </div>
    </div>
  );
}

