
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Gift, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockRewardsHistory = [
    { id: 'r1', date: '12/09/2025', reward: 'Carte Amazon (20 €)', status: 'received' },
    { id: 'r2', date: '05/09/2025', reward: 'Coupon Uber Eats', status: 'pending' },
    { id: 'r3', date: '01/09/2025', reward: 'Réduction ImuTask', status: 'used' },
];

export default function RewardsHistoryPage() {
    const t = useTranslations('ReferralsPage.rewardsHistory');

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'received':
            case 'used':
                return 'default';
            case 'pending':
                return 'secondary';
            default:
                return 'outline';
        }
    };
     const getStatusIcon = (status: string) => {
        switch (status) {
            case 'received':
            case 'used':
                return <CheckCircle className="h-4 w-4 mr-1" />;
            case 'pending':
                return <Clock className="h-4 w-4 mr-1" />;
            default:
                return null;
        }
    };

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
                    <CardTitle>{t('table.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>{t('table.reward')}</TableHead>
                                <TableHead>{t('table.date')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockRewardsHistory.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.reward}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(item.status)} className="flex items-center w-fit">
                                            {getStatusIcon(item.status)}
                                            {t(`statuses.${item.status}`)}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
