
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Bell, Handshake, MessageSquare, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ReactNode } from "react";

const mockNotifications = [
    { id: '1', type: 'offer', text: "Lucas B. a fait une offre pour votre mission 'Courses'", icon: <Handshake className="h-4 w-4"/> },
    { id: '2', type: 'message', text: "Nouveau message de Chloé P.", icon: <MessageSquare className="h-4 w-4"/> },
    { id: '3', type: 'review', text: "Vous avez reçu un nouvel avis 5 étoiles !", icon: <Star className="h-4 w-4"/> },
];

export function RecentNotifications() {
    const t = useTranslations('DashboardPage.recentNotifications');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {mockNotifications.map((notif) => (
                    <div key={notif.id} className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-full">
                           {notif.icon}
                        </div>
                        <p className="text-sm text-muted-foreground flex-1">{notif.text}</p>
                    </div>
                ))}
                 {mockNotifications.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('noNotifications')}</p>
                )}
                 <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/notifications">{t('viewAll')}</Link>
                </Button>
            </CardContent>
        </Card>
    )
}
