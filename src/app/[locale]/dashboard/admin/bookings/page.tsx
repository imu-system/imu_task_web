
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, Link } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, CalendarCheck, Eye } from 'lucide-react';
import { UserRole, Booking, BookingStatus } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBookings } from '@/lib/bookings';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const mockBookings: Booking[] = getBookings();

export default function AdminBookingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminBookingsPage');
    
    const [bookings, setBookings] = useState<Booking[]>(mockBookings);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);


    if (authLoading || loading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const getStatusVariant = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.completed: return 'default';
            case BookingStatus.scheduled:
            case BookingStatus.in_progress:
                 return 'secondary';
            case BookingStatus.canceled:
            case BookingStatus.no_show_client:
            case BookingStatus.no_show_provider:
                return 'destructive';
            default: return 'outline';
        }
    }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <CalendarCheck className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                {t('subtitle')}
                </p>
            </div>
             <div className="w-full md:w-1/3">
                <Input placeholder={t('searchPlaceholder')} />
            </div>
        </div>

       <Card>
            <CardHeader>
                <CardTitle>{t('tableTitle')}</CardTitle>
                <CardDescription>{t('tableDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.id')}</TableHead>
                            <TableHead>{t('table.task')}</TableHead>
                            <TableHead>{t('table.client')}</TableHead>
                             <TableHead>{t('table.provider')}</TableHead>
                            <TableHead>{t('table.amount')}</TableHead>
                            <TableHead>{t('table.status')}</TableHead>
                            <TableHead><span className="sr-only">{t('table.actions')}</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell>
                                    <div className="font-mono text-xs text-muted-foreground">{booking.id.substring(0,6)}...</div>
                                </TableCell>
                                <TableCell>
                                    <Link href={`/dashboard/admin/tasks/${booking.taskId}`} className="font-medium hover:underline">
                                        {booking.task?.title}
                                    </Link>
                                    <div className="text-sm text-muted-foreground font-mono">{booking.taskId.substring(0,6)}...</div>
                                </TableCell>
                                 <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={booking.client?.profile?.photoUrl} />
                                            <AvatarFallback>{booking.client?.profile?.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{booking.client?.profile?.displayName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={booking.provider?.profile?.photoUrl} />
                                            <AvatarFallback>{booking.provider?.profile?.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{booking.provider?.profile?.displayName}</span>
                                    </div>
                                </TableCell>
                                 <TableCell>
                                    <div className="font-medium">{booking.agreedAmount / 100} {booking.currency}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={t(`statusVariants.${booking.status}`) as any}>{t(`status.${booking.status}`)}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/dashboard/admin/bookings/${booking.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            {t('details')}
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
       </Card>
    </div>
  );
}

    