
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Calendar, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Separator } from "../ui/separator";

const mockBookings = [
    { id: '1', title: 'Tondre la pelouse', date: new Date('2024-09-15T14:00:00'), location: 'Metz' },
    { id: '2', title: 'Faire les courses', date: new Date('2024-09-16T10:00:00'), location: 'Thionville' },
];

export function UpcomingBookings() {
    const t = useTranslations('DashboardPage.upcomingBookings');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockBookings.map((booking, index) => (
                    <div key={booking.id}>
                        <div className="space-y-2">
                            <p className="font-semibold">{booking.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{booking.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{booking.location}</span>
                            </div>
                        </div>
                        {index < mockBookings.length - 1 && <Separator className="mt-4"/>}
                    </div>
                ))}
                 {mockBookings.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('noBookings')}</p>
                )}
            </CardContent>
        </Card>
    )
}
