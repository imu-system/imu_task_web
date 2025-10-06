
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const mockContracts = [
    { id: 'c1', nameKey: 'contracts.providerContract', date: '01/06/2025' },
    { id: 'c2', nameKey: 'contracts.nda', date: '15/04/2025' },
];

export default function LegalContractsPage() {
    const t = useTranslations('LegalPage');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('contracts.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockContracts.map((contract, index) => (
                    <div key={contract.id}>
                        <div className="space-y-2">
                            <p className="font-semibold">{t(contract.nameKey as any)}</p>
                            <p className="text-sm text-muted-foreground">{t('contracts.signedOn', { date: contract.date })}</p>
                            <div className="flex gap-2">
                                <Button variant="outline"><FileText className="mr-2"/>{t('contracts.read')}</Button>
                                <Button variant="outline"><Download className="mr-2"/>{t('contracts.download')}</Button>
                            </div>
                        </div>
                        {index < mockContracts.length - 1 && <Separator className="my-4" />}
                    </div>
                ))}
                <Separator />
                <Button variant="secondary" className="w-full">
                    <PlusCircle className="mr-2"/>
                    {t('contracts.addNew')}
                </Button>
            </CardContent>
        </Card>
    );
}
