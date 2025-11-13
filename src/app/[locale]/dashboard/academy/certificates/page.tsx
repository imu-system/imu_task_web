
'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { ArrowLeft, Award, CheckCircle, Heart, Medal, ShieldCheck, Sparkles, Star, Share2, MessageCircle, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockBadges = [
    { id: 'cert-starter', icon: <Award/>, titleKey: 'badges.firstMission.title', descriptionKey: 'badges.firstMission.description', unlocked: true, type: 'badge' },
    { id: 'cert-pro-communicator', icon: <ShieldCheck/>, titleKey: 'badges.verified.title', descriptionKey: 'badges.verified.description', unlocked: true, type: 'badge' },
    { id: 'cert-top-rated', icon: <Star/>, titleKey: 'badges.topRated.title', descriptionKey: 'badges.topRated.description', unlocked: true, type: 'badge' },
    { id: 'cert-community-helper', icon: <Heart/>, titleKey: 'badges.communityHelper.title', descriptionKey: 'badges.communityHelper.description', unlocked: false, type: 'badge' },
];

const mockCertificates = [
    { id: 'cert-pro-communicator', name: 'Certificat Communicateur Pro', date: '13/09/2025', type: 'certificate' },
    { id: 'cert-starter', name: 'Certificat Gestion de Tâches 101', date: '10/09/2025', type: 'certificate' }
];

const allItems = [...mockBadges, ...mockCertificates];

export default function CertificatesPage() {
    const t = useTranslations('BadgesPage');
    const tProfile = useTranslations('ProfilePage');

    const renderItem = (item: any) => {
        if (item.type === 'badge') {
            return (
                <Link key={item.id} href={item.unlocked ? `/dashboard/academy/certificate/${item.id}` : '#'} className={cn(!item.unlocked && "pointer-events-none")}>
                    <div className={cn("flex flex-col items-center text-center gap-4 p-6 rounded-lg border h-full hover:shadow-md transition-shadow", !item.unlocked && "opacity-50 bg-muted/50")}>
                        <div className={cn("p-4 rounded-full", item.unlocked ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground")}>
                            {React.cloneElement(item.icon as React.ReactElement, { className: 'h-8 w-8' })}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{t(item.titleKey as any)}</h3>
                            <p className="text-xs text-muted-foreground">{t(item.descriptionKey as any)}</p>
                        </div>
                    </div>
                </Link>
            )
        }
        if (item.type === 'certificate') {
            return (
                 <Card key={item.id} className="flex flex-col text-center items-center justify-center p-6">
                    <FileText className="h-10 w-10 text-primary mb-4"/>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{t('earnedOn', { date: item.date })}</CardDescription>
                    <CardFooter className="p-0 pt-4 flex gap-2">
                        <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4"/>PDF</Button>
                        <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4"/>{t('share')}</Button>
                    </CardFooter>
                </Card>
            )
        }
        return null;
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/profile">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Medal className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
            </div>
            
            <Tabs defaultValue="all">
                <TabsList>
                    <TabsTrigger value="all">{t('filters.all')}</TabsTrigger>
                    <TabsTrigger value="badges">{t('filters.badges')}</TabsTrigger>
                    <TabsTrigger value="certificates">{t('filters.certificates')}</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allItems.map(renderItem)}
                    </div>
                </TabsContent>
                 <TabsContent value="badges" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockBadges.map(renderItem)}
                    </div>
                </TabsContent>
                 <TabsContent value="certificates" className="mt-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockCertificates.map(renderItem)}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
