
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, History, CheckCircle } from 'lucide-react';

const mockAuditTrail = [
    { version: 'v2.2', date: '10/08/2024' },
    { version: 'v2.3', date: '01/09/2025' },
]

export default function LegalTermsPage() {
    const t = useTranslations('LegalPage.terms');

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('cgu.title', {version: '2.3'})}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2">
                   <Button variant="outline"><FileText className="mr-2"/>{t('readOnline')}</Button>
                   <Button><Download className="mr-2"/>{t('downloadPdf')}</Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t('privacy.title', {year: 2025})}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline"><FileText className="mr-2"/>{t('readOnline')}</Button>
                   <Button><Download className="mr-2"/>{t('downloadPdf')}</Button>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5"/>
                        {t('audit.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {mockAuditTrail.map((item, index) => (
                             <li key={index} className="flex items-center gap-3">
                                <CheckCircle className="h-4 w-4 text-green-500"/>
                                <span className="text-sm">{t('audit.acceptedOn', {date: item.date, version: item.version})}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
