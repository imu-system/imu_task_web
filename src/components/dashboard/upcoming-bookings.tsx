/**
 * Upcoming Bookings Component - Phase 9: Connexion données réelles
 * 
 * Affiche les prochains bookings (missions) depuis Firestore
 * Utilise useUpcomingBookings hook
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Calendar, MapPin, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Separator } from "../ui/separator";
import { useUpcomingBookings } from "@/hooks/use-dashboard-data";
import { Skeleton } from "../ui/skeleton";

interface UpcomingBookingsProps {
    userId: string;
    role: 'client' | 'provider';
    limit?: number;
}

export function UpcomingBookings({ userId, role, limit = 5 }: UpcomingBookingsProps) {
    const t = useTranslations('DashboardPage.upcomingBookings');
    const { data: bookings, loading, error } = useUpcomingBookings(userId, role, limit);

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
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                            {i < 3 && <Separator className="mt-4" />}
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
                        Impossible de charger les bookings. Veuillez réessayer.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {bookings && bookings.length > 0 ? (
                    <>
                        {bookings.map((booking, index) => {
                            // Format scheduled date safely
                            let scheduledDate = new Date();
                            const schedDate = booking.scheduledDate as any;
                            if (schedDate) {
                                if (schedDate instanceof Date) {
                                    scheduledDate = schedDate;
                                } else if (typeof schedDate === 'string') {
                                    scheduledDate = new Date(schedDate);
                                } else if (schedDate?.toDate && typeof schedDate.toDate === 'function') {
                                    scheduledDate = schedDate.toDate();
                                }
                            }
                            
                            const formattedDate = scheduledDate.toLocaleDateString('fr-FR', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            });

                            // Determine which name to display based on role
                            const displayName = role === 'client' 
                                ? booking.providerName || 'Prestataire'
                                : booking.clientName || 'Client';

                            return (
                                <div key={booking.id}>
                                    <div className="space-y-2">
                                        <p className="font-semibold">{booking.taskTitle || 'Mission'}</p>
                                        
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formattedDate}</span>
                                        </div>
                                        
                                        {booking.taskLocation && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>
                                                    {typeof booking.taskLocation === 'string' 
                                                        ? booking.taskLocation 
                                                        : booking.taskLocation?.address || 'Lieu non spécifié'}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            <span>{displayName}</span>
                                        </div>

                                        {/* Booking status badge */}
                                        <div className="mt-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                booking.status === 'accepted' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            }`}>
                                                {booking.status === 'accepted' ? 'Acceptée' : 'En cours'}
                                            </span>
                                        </div>
                                    </div>
                                    {index < bookings.length - 1 && <Separator className="mt-4"/>}
                                </div>
                            );
                        })}
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        {t('noBookings')}
                    </p>
                )}
                
                {bookings && bookings.length > 0 && (
                    <Button variant="outline" className="w-full mt-4" asChild>
                        <Link href="/dashboard/bookings">Voir tous les bookings</Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

