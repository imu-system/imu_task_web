
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Loader2, BookCheck } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminReconciliationPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminPaymentsPage.reconciliation');

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    if (authLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <BookCheck className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                {t('subtitle')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('card.title')}</CardTitle>
                    <CardDescription>{t('card.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{t('card.content')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
