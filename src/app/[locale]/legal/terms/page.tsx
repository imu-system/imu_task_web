
'use client';

import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function LegalTermsPage() {
    const t = useTranslations('LegalPage.terms');

    return (
        <div className="space-y-6">
            <Alert className="bg-primary/10 border-primary/20">
                <Bell className="h-4 w-4" />
                <AlertTitle>{t('update.title')}</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                    <p>{t('update.description')}</p>
                    <Button>{t('update.button')}</Button>
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>{t('cgu.title')}</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                   <p>{t('cgu.contentPlaceholder')}</p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t('privacy.title')}</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                   <p>{t('privacy.contentPlaceholder')}</p>
                </CardContent>
            </Card>
        </div>
    );
}

