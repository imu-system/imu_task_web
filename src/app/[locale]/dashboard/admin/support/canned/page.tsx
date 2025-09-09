
      
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminCannedResponsesPage() {
    const t = useTranslations('AdminSupportPage.canned');

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{t('content')}</p>
                </CardContent>
            </Card>
        </div>
    );
}

    