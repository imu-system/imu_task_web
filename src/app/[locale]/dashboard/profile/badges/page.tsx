
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { ArrowLeft, Award, CheckCircle, Heart, Medal, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockBadges = [
    { id: 'first_mission', icon: <Award/>, titleKey: 'badges.firstMission.title', descriptionKey: 'badges.firstMission.description', unlocked: true },
    { id: 'verified', icon: <ShieldCheck/>, titleKey: 'badges.verified.title', descriptionKey: 'badges.verified.description', unlocked: true },
    { id: 'super_provider', icon: <Star/>, titleKey: 'badges.superProvider.title', descriptionKey: 'badges.superProvider.description', unlocked: false },
    { id: 'community_helper', icon: <Heart/>, titleKey: 'badges.communityHelper.title', descriptionKey: 'badges.communityHelper.description', unlocked: true },
    { id: 'profil_complete', icon: <CheckCircle/>, titleKey: 'badges.profileComplete.title', descriptionKey: 'badges.profileComplete.description', unlocked: true },
    { id: 'pioneer', icon: <Sparkles/>, titleKey: 'badges.pioneer.title', descriptionKey: 'badges.pioneer.description', unlocked: false },
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

        </div>
    )
}

    