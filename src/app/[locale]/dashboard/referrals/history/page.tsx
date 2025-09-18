
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockRewardsHistory = [
    { id: 'r1', date: '15/09/2025', description: 'Coupon Uber Eats', amount: 10 },
    { id: 'r2', date: '01/09/2025', description: 'Réduction ImuTask', amount: 5 },
    { id: 'r3', date: '20/08/2025', description: 'Virement bancaire', amount: 50 },
];

export default function RewardsHistoryPage() {
    const t = useTranslations('ReferralsPage.rewardsHistory');

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/referrals">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Gift className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.date')}</TableHead>
                                <TableHead>{t('table.description')}</TableHead>
                                <TableHead className="text-right">{t('table.amount')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockRewardsHistory.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right font-medium">{item.amount.toFixed(2)} €</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

