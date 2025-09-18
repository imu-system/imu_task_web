
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileSpreadsheet } from 'lucide-react';

const mockInvoices = [
    { id: '101', date: '10/08/2025', amount: 49.00 },
    { id: '100', date: '10/07/2025', amount: 49.00 },
    { id: '099', date: '10/06/2025', amount: 49.00 },
];

export default function LegalInvoicesPage() {
    const t = useTranslations('LegalPage.invoices');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>{t('table.date')}</TableHead>
                            <TableHead>{t('table.amount')}</TableHead>
                            <TableHead className="text-right">{t('table.download')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-medium">{invoice.id}</TableCell>
                                <TableCell>{invoice.date}</TableCell>
                                <TableCell>{invoice.amount.toFixed(2)} €</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Download className="h-4 w-4" />
                                        <span className="sr-only">Download</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-end">
                <Button variant="outline">
                    <FileSpreadsheet className="mr-2"/>
                    {t('actions.exportCsv')}
                </Button>
                <Button variant="outline">
                    <Download className="mr-2"/>
                    {t('actions.requestSummary')}
                </Button>
            </CardFooter>
        </Card>
    );
}
