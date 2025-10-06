
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Upload, MoreHorizontal, Users, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockAudiences = [
    { id: 'aud1', name: 'Campus-ESIEA', members: 120, description: 'Étudiants ESIEA promo 2025' },
    { id: 'aud2', name: 'Beta-Internal', members: 12, description: 'Équipe interne pour les tests bêta' },
    { id: 'aud3', name: 'Power-Providers', members: 45, description: 'Prestataires avec plus de 50 missions terminées' },
];

export default function AudiencesPage() {
    const t = useTranslations('DevToolsPage.audiences');

    return (
        <div className="space-y-8">
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('title')}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Upload className="mr-2"/>{t('importCsv')}</Button>
                    <Button><PlusCircle className="mr-2"/>{t('createAudience')}</Button>
                </div>
            </div>

            <div className="space-y-4">
                {mockAudiences.map(audience => (
                     <Card key={audience.id}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl">{audience.name}</CardTitle>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal/></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>{t('actions.export')}</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="mr-2"/>
                                        {t('actions.delete')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">{audience.description}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground"/>
                                    <span>{audience.members} {t('members')}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">{t('actions.view')}</Button>
                                    <Button variant="outline" size="sm">{t('actions.add')}</Button>
                                    <Button variant="outline" size="sm">{t('actions.remove')}</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

