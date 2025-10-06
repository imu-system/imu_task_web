
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Share2, Edit, Trash2 } from 'lucide-react';
import { Link } from '@/navigation';

// This is a placeholder component with mock data.
export default function ProviderTemplateCard() {
    const t = useTranslations('TaskTemplatesPage');
    
    const template = {
        id: 'ptpl1',
        name: 'Pack "Nettoyage Airbnb 2h"',
        category: 'Nettoyage',
        duration: '2h',
        price: '40 €',
        lastMission: '03/09/2025'
    };

    return (
        <Card className="flex flex-col md:flex-row justify-between items-start p-4 gap-4">
            <div className="flex-1">
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                    <span><strong>{t('list.category')}:</strong> {template.category}</span>
                    <span><strong>{t('providerList.duration')}:</strong> {template.duration}</span>
                    <span><strong>{t('providerList.price')}:</strong> {template.price}</span>
                    <span><strong>{t('providerList.lastMission')}:</strong> {template.lastMission}</span>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" asChild>
                    <Link href={`/dashboard/templates/${template.id}/share`}>
                        <Share2 className="mr-2"/>
                        {t('providerList.share')}
                    </Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon"><MoreHorizontal /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/templates/edit/${template.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('list.edit')}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('providerList.disable')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Card>
    );
}
