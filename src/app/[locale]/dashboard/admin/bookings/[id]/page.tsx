
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { UserRole, Booking } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { getBookings } from '@/lib/bookings';
import { Button } from '@/components/ui/button';

export default function AdminBookingDetailPage() {
    const { user: adminUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const bookingId = params.id;
    const t = useTranslations('AdminBookingDetailPage');
    
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
        <div>
            <p>Booking details for {booking.task?.title} will be displayed here.</p>
        </div>
    </div>
  );
}
