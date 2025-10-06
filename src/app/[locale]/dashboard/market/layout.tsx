
'use client';

import { usePathname, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, DollarSign, Star, MapPin } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trophy } from 'lucide-react';

export default function MarketInsightsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const t = useTranslations('MarketInsightsLayout');

    const navLinks = [
        { href: '/dashboard/market', label: t('tabs.trends'), icon: <LineChart/> },
        { href: '/dashboard/market/pricing', label: t('tabs.pricing'), icon: <DollarSign/> },
        { href: '/dashboard/market/performance', label: t('tabs.performance'), icon: <Star/> },
        { href: '/dashboard/market/zones', label: t('tabs.zones'), icon: <MapPin/> },
    ];
    
    const activeTab = navLinks.find(link => pathname.startsWith(link.href))?.href ?? navLinks[0].href;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <LineChart className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
            <Alert className="bg-primary/5 border-primary/20">
                <Trophy className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary font-bold">{t('congrats.title')}</AlertTitle>
                <AlertDescription>
                    {t('congrats.description', { category: 'Nettoyage' })}
                </AlertDescription>
            </Alert>
            <Tabs value={activeTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    {navLinks.map((link) => (
                        <TabsTrigger key={link.href} value={link.href} asChild>
                            <Link href={link.href} className="flex items-center gap-2">
                                {link.icon}
                                {link.label}
                            </Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            
            <div className="mt-6">{children}</div>
        </div>
    );
}
