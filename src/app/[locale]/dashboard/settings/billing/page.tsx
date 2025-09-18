
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Loader2, CreditCard, PlusCircle, Trash2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const mockPaymentMethods = [
    { id: 'pm_1', brand: 'Visa', last4: '1234', isDefault: true },
];

const mockInvoices = [
    { id: 'inv_1', date: '10/08/2025', amount: 49.00 },
    { id: 'inv_2', date: '10/07/2025', amount: 49.00 },
];


export default function BillingSettingsPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('SettingsPage.billing');

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('paymentMethods.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockPaymentMethods.map((method, index) => (
                        <div key={method.id}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-6 w-6 text-muted-foreground"/>
                                    <div>
                                        <p className="font-semibold">{method.brand} {t('paymentMethods.endingIn')} {method.last4}</p>
                                        {method.isDefault && <Badge variant="secondary">{t('paymentMethods.default')}</Badge>}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </div>
                            {index < mockPaymentMethods.length - 1 && <Separator className="mt-4"/>}
                        </div>
                    ))}
                    <Separator/>
                     <Button variant="outline">
                        <PlusCircle className="mr-2"/>
                        {t('paymentMethods.addCard')}
                     </Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t('invoices.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>{t('invoices.date')}</TableHead>
                                <TableHead>{t('invoices.amount')}</TableHead>
                                <TableHead className="text-right">{t('invoices.download')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockInvoices.map((invoice, index) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{invoice.date}</TableCell>
                                    <TableCell>{invoice.amount.toFixed(2)} €</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Download className="h-4 w-4"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t('subscription.title')}</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm font-medium">{t('subscription.currentPlan')}</p>
                        <p className="text-muted-foreground">Pro (49 €/mois)</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">{t('subscription.changePlan')}</Button>
                        <Button variant="destructive">{t('subscription.cancel')}</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
