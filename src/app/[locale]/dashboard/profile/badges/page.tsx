

'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { ArrowLeft, Award, CheckCircle, Heart, Medal, ShieldCheck, Sparkles, Star, Share2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const mockBadges = [
    { id: 'cert-starter', icon: <Award/>, titleKey: 'badges.firstMission.title', descriptionKey: 'badges.firstMission.description', unlocked: true },
    { id: 'cert-pro-communicator', icon: <ShieldCheck/>, titleKey: 'badges.verified.title', descriptionKey: 'badges.verified.description', unlocked: true },
    { id: 'cert-top-rated', icon: <Star/>, titleKey: 'badges.topRated.title', descriptionKey: 'badges.topRated.description', unlocked: true },
    { id: 'cert-community-helper', icon: <Heart/>, titleKey: 'badges.communityHelper.title', descriptionKey: 'badges.communityHelper.description', unlocked: false },
    { id: 'cert-profile-complete', icon: <CheckCircle/>, titleKey: 'badges.profileComplete.title', descriptionKey: 'badges.profileComplete.description', unlocked: true },
    { id: 'cert-pioneer', icon: <Sparkles/>, titleKey: 'badges.pioneer.title', descriptionKey: 'badges.pioneer.description', unlocked: false },
];


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
                        <Link key={badge.id} href={badge.unlocked ? `/dashboard/academy/certificate/${badge.id}` : '#'} className={cn(!badge.unlocked && "pointer-events-none")}>
                            <div className={cn("flex flex-col items-center text-center gap-4 p-6 rounded-lg border h-full hover:shadow-md transition-shadow", !badge.unlocked && "opacity-50 bg-muted/50")}>
                                <div className={cn("p-4 rounded-full", badge.unlocked ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground")}>
                                    {React.cloneElement(badge.icon, { className: 'h-8 w-8' })}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">{t(badge.titleKey as any)}</h3>
                                    <p className="text-xs text-muted-foreground">{t(badge.descriptionKey as any)}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
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
