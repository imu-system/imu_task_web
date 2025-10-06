
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Zap, Edit } from 'lucide-react';
import { Link } from '@/navigation';

const mockZones = [
  { nameKey: 'zones.cityCenter', demandKey: 'zones.highDemand', color: 'bg-red-500' },
  { nameKey: 'zones.studentQuarters', demandKey: 'zones.highDemand', color: 'bg-red-500' },
  { nameKey: 'zones.residentialNorth', demandKey: 'zones.mediumDemand', color: 'bg-yellow-500' },
  { nameKey: 'zones.ruralArea', demandKey: 'zones.lowDemand', color: 'bg-green-500' },
];


export default function MarketZonesPage() {
    const t = useTranslations('MarketInsightsPage.zones');

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Map className="h-5 w-5 text-primary"/>
                        {t('heatmap.title')}
                    </CardTitle>
                    <CardDescription>{t('heatmap.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">{t('heatmap.placeholder')}</p>
                    </div>
                     <ul className="space-y-2">
                        {mockZones.map(zone => (
                             <li key={zone.nameKey} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <div className={`h-3 w-3 rounded-full ${zone.color}`}></div>
                                    {t(zone.nameKey as any)}
                                </span>
                                <span className="font-medium">{t(zone.demandKey as any)}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20 text-center">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 justify-center">
                        <Zap className="h-5 w-5 text-primary"/>
                        {t('suggestion.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>{t('suggestion.description')}</p>
                    <Button asChild>
                        <Link href="/dashboard/profile/edit">
                            <Edit className="mr-2"/>
                            {t('suggestion.actionButton')}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
