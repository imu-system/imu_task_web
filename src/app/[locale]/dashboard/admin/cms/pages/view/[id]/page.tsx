
'use client';

import { useParams } from 'next/navigation';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ContentPage } from '@/lib/types';
import { getPages } from '@/lib/data';

export default function AdminPageViewPage() {
    const params = useParams<{ id: string }>();
    const pageId = params.id;
    const t = useTranslations('AdminCmsPage.pages.view');
    const [page, setPage] = useState<ContentPage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const pageData = getPages().find(p => p.id === pageId);
        if (pageData) {
            setPage(pageData);
        }
        setLoading(false);
    }, [pageId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!page) {
         return (
            <div className="text-center">
                <h1 className="text-xl">{t('notFound')}</h1>
                <Button asChild variant="link">
                    <Link href="/dashboard/admin/cms/pages">{t('backToList')}</Link>
                </Button>
            </div>
         )
    }


    return (
        <div className="space-y-8 mx-auto">
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
                    <CardTitle>{page.title.fr || t('defaultTitle')}</CardTitle>
                    <CardDescription>/{page.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="prose max-w-none">
                        {page.content.fr ? (
                            <p>{page.content.fr}</p>
                        ) : (
                            <p className="text-muted-foreground">{t('contentPlaceholder')}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
