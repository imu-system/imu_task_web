
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { ArrowLeft, Award, CheckCircle, Heart, Medal, ShieldCheck, Sparkles, Star, Share2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const mockBadges = [
    { id: 'first_mission', icon: <Award/>, titleKey: 'badges.firstMission.title', descriptionKey: 'badges.firstMission.description', unlocked: true },
    { id: 'verified', icon: <ShieldCheck/>, titleKey: 'badges.verified.title', descriptionKey: 'badges.verified.description', unlocked: true },
    { id: 'top_rated', icon: <Star/>, titleKey: 'badges.topRated.title', descriptionKey: 'badges.topRated.description', unlocked: true },
    { id: 'community_helper', icon: <Heart/>, titleKey: 'badges.communityHelper.title', descriptionKey: 'badges.communityHelper.description', unlocked: false },
    { id: 'profil_complete', icon: <CheckCircle/>, titleKey: 'badges.profileComplete.title', descriptionKey: 'badges.profileComplete.description', unlocked: true },
    { id: 'pioneer', icon: <Sparkles/>, titleKey: 'badges.pioneer.title', descriptionKey: 'badges.pioneer.description', unlocked: false },
];

const mockHistory = [
    { id: 'h1', date: '12 sept.', title: 'Nettoyage de printemps', rating: 5 },
    { id: 'h2', date: '10 sept.', title: 'Aide aux courses', rating: 4 },
    { id: 'h3', date: '05 sept.', title: 'Assistance numérique', rating: 5 },
];

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn("h-4 w-4", i < rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground")} />
        ))}
    </div>
)

export default function BadgesPage() {
    const t = useTranslations('BadgesPage');
    const tProfile = useTranslations('ProfilePage');

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/profile">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Medal className="h-8 w-8 text-primary"/>
                        {tProfile('myBadges')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('cardTitle')}</CardTitle>
                    <CardDescription>{t('cardDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockBadges.map(badge => (
                        <div key={badge.id} className={cn("flex items-center gap-4 p-4 rounded-lg border", !badge.unlocked && "opacity-50")}>
                            <div className={cn("p-3 rounded-full", badge.unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                {badge.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold">{t(badge.titleKey as any)}</h3>
                                <p className="text-xs text-muted-foreground">{t(badge.descriptionKey as any)}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t('history.title')}</CardTitle>
                    <CardDescription>{t('history.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {mockHistory.map((item, index) => (
                             <li key={item.id}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted rounded-full">
                                            <MessageCircle className="h-5 w-5 text-muted-foreground"/>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-sm text-muted-foreground">{item.date}</p>
                                        </div>
                                    </div>
                                    <StarRating rating={item.rating} />
                                </div>
                                {index < mockHistory.length - 1 && <Separator className="mt-4"/>}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            
            <div className="flex justify-center">
                <Button size="lg">
                    <Share2 className="mr-2"/>
                    {t('shareProfile')}
                </Button>
            </div>

        </div>
    )
}
