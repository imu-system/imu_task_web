
'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PostPreviewPage() {
    const params = useParams<{ id: string }>();
    const postId = params.id;
    const t = useTranslations('AdminCmsPage.posts.preview');

    return (
        <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>{t('description', { postId })}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        {t('contentPlaceholder')}
                    </p>
                    <div className="flex justify-center mt-4">
                         <Button variant="outline" asChild>
                            <Link href={`/dashboard/admin/cms/posts/edit/${postId}`}>
                                <ArrowLeft className="mr-2"/>
                                {t('backToEdit')}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

    