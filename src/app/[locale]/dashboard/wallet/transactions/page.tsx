
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, ArrowLeft, Download, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const mockTransactions = [
    { id: 'txn_1', date: new Date('2025-09-12'), amount: 40.00, type: 'payment', status: '✅ Confirmé', description: 'Mission: Nettoyage' },
    { id: 'txn_2', date: new Date('2025-08-28'), amount: 25.50, type: 'payment', status: '✅ Confirmé', description: 'Mission: Courses' },
    { id: 'txn_3', date: new Date('2025-08-20'), amount: 50.00, type: 'payout', status: '✅ Payé', description: 'Retrait de fonds' },
    { id: 'txn_4', date: new Date('2025-08-15'), amount: 15.00, type: 'refund', status: '✅ Remboursé', description: 'Remboursement: Mission #M-56' },
];


export default function TransactionsPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('TransactionsPage');

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const getStatusVariant = (status: string) => {
        if (status.includes('Confirmé') || status.includes('Payé') || status.includes('Remboursé')) return 'default';
        if (status.includes('En attente')) return 'secondary';
        if (status.includes('Échoué')) return 'destructive';
        return 'outline';
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/wallet">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <FileText className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
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
                                <TableHead>{t('table.date')}</TableHead>
                                <TableHead>{t('table.description')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead className="text-right">{t('table.amount')}</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTransactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>{tx.date.toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {tx.type === 'payment' && <ArrowUpRight className="h-4 w-4 text-destructive"/>}
                                            {tx.type === 'payout' && <ArrowDownLeft className="h-4 w-4 text-green-600"/>}
                                            {tx.type === 'refund' && <ArrowDownLeft className="h-4 w-4 text-muted-foreground"/>}
                                            <span>{tx.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(tx.status)}>
                                            {tx.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-right">{tx.amount.toFixed(2)} €</TableCell>
                                     <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/dashboard/wallet/transactions/${tx.id}`}>
                                                {t('table.details')}
                                            </Link>
                                        </Button>
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
