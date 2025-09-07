
'use client';

import { useParams, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminPageViewPage() {
    const params = useParams<{ id: string }>();
    const pageId = params.id;
    const t = useTranslations('AdminCmsPage.pages.view');

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/admin/cms/pages">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('title')}
                    </h1>
                     <p className="text-muted-foreground font-mono text-xs">
                        ID: {pageId}
                    </p>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('cardTitle')}</CardTitle>
                    <CardDescription>{t('cardDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{t('contentPlaceholder')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
