
'use client';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { useEffect, useState } from 'react';
import { Booking } from '@/lib/types';
import { getBookingById } from '@/lib/bookings';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import BookingDetailContent from './booking-detail-content';

interface BookingDetailSheetProps {
    bookingId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BookingDetailSheet({ bookingId, open, onOpenChange }: BookingDetailSheetProps) {
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(false);
    const t = useTranslations('BookingDetailPage');

    useEffect(() => {
        if (bookingId) {
            const fetchData = async () => {
                setLoading(true);
                const fetchedBooking = await getBookingById(bookingId);
                if(fetchedBooking) {
                    setBooking(fetchedBooking);
                } else {
                    setBooking(null);
                }
                setLoading(false);
            };
            fetchData();
        }
    }, [bookingId]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    </div>
                ) : booking ? (
                    <>
                        <SheetHeader>
                            <SheetTitle className="sr-only">{t('title')} {booking.id}</SheetTitle>
                            <SheetDescription className="sr-only">Détails pour la réservation {booking.id}</SheetDescription>
                        </SheetHeader>
                        <BookingDetailContent booking={booking} />
                    </>
                ) : (
                    <SheetHeader>
                        <SheetTitle>{t('notFound')}</SheetTitle>
                    </SheetHeader>
                )}
            </SheetContent>
        </Sheet>
    );
}
