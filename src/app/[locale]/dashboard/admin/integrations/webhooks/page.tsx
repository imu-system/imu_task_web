
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function AdminWebhooksPage() {
    const t = useTranslations('AdminIntegrationsPage.webhooks');

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>{t('title')}</CardTitle>
                            <CardDescription>{t('description')}</CardDescription>
                        </div>
                        <Button variant="outline" disabled>
                            <PlusCircle className="mr-2"/>
                            {t('createButton')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <p>{t('wip')}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
