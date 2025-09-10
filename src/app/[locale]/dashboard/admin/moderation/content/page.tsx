
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminModerationContentPage() {
    const t = useTranslations('AdminModerationPage.content');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">{t('content')}</p>
                </div>
            </CardContent>
        </Card>
    );
}
