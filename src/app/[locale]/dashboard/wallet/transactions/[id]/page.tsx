
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, ArrowLeft, Download, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';

const mockTransactions = [
    { id: 'txn_1', date: new Date('2025-09-12T14:32:00Z'), amount: 40.00, status: '✅ Confirmé', description: 'Mission: Nettoyage (2h)', client: { id: 'U-231', name: 'Alice' }, provider: { id: 'U-999', name: 'Bob' } },
];


export default function TransactionDetailPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const t = useTranslations('TransactionDetailPage');

    const [transaction, setTransaction] = useState<any>(null);

    useEffect(() => {
        // In a real app, fetch transaction by ID
        const tx = mockTransactions.find(t => t.id === params.id);
        if (tx) {
            setTransaction(tx);
        }
    }, [params.id]);


    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!transaction) {
         return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p>{t('notFound')}</p>
                <Button asChild variant="outline">
                    <Link href="/dashboard/wallet/transactions">{t('backToList')}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/wallet/transactions">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        {t('title', {id: transaction.id})}
                    </h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span className="text-4xl font-bold">{transaction.amount.toFixed(2)} €</span>
                        <Badge variant="default" className="text-base">
                            <CheckCircle2 className="mr-2"/>
                            {t('status.confirmed')}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        {new Date(transaction.date).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Separator/>
                    <CardTitle className="text-lg">{t('details.title')}</CardTitle>
                    <div className="text-sm space-y-2 text-muted-foreground">
                        <p><strong>{t('details.client')}:</strong> {transaction.client.name} ({transaction.client.id})</p>
                        <p><strong>{t('details.provider')}:</strong> {transaction.provider.name} ({transaction.provider.id})</p>
                        <p><strong>{t('details.service')}:</strong> {transaction.description}</p>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('actions.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Button variant="outline">
                        <Download className="mr-2"/>
                        {t('actions.downloadInvoice')}
                   </Button>
                    <Button variant="outline">
                        <ShieldAlert className="mr-2"/>
                        {t('actions.requestRefund')}
                   </Button>
                </CardContent>
            </Card>

        </div>
    );
}
