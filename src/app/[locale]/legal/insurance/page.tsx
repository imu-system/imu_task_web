'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Download, Shield } from 'lucide-react';

export default function LegalInsurancePage() {
    const t = useTranslations('LegalPage.insurance');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary"/>
                    {t('title')}
                </CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2 text-sm">
                    <p><strong>{t('providerLabel')}:</strong> Allianz</p>
                    <p><strong>{t('policyNumberLabel')}:</strong> FR-123456789</p>
                    <p><strong>{t('coverageLabel')}:</strong> {t('coverageValue')}</p>
                </div>
                <div className="space-y-4">
                    <h3 className="text-base font-semibold">{t('documentsTitle')}</h3>
                     <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline"><Download className="mr-2"/>{t('certificateButton')}</Button>
                        <Button variant="outline"><FileText className="mr-2"/>{t('conditionsButton')}</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
