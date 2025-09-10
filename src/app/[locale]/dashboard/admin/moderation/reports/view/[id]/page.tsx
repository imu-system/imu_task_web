'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/navigation';
import { useParams } from 'next/navigation';

export default function AdminViewReportPage() {
    const t = useTranslations('AdminModerationPage.viewReport');
    const params = useParams<{ id: string }>();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/admin/moderation/reports">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('title')}
                    </h1>
                     <p className="text-muted-foreground font-mono text-xs">
                        ID: {params.id}
                    </p>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('cardTitle')}</CardTitle>
                    <CardDescription>{t('cardDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{t('contentPlaceholder')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
