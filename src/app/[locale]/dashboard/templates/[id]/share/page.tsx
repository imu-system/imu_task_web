
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Link, useParams } from '@/navigation';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Copy, Loader2 } from 'lucide-react';
import { useState } from 'react';

const mockTemplate = {
    id: 'ptpl1',
    name: 'Pack "Nettoyage Airbnb 2h"',
};

export default function ShareTemplatePage() {
    const params = useParams();
    const t = useTranslations('TaskTemplatesPage.form.share');
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const packName = mockTemplate.name; // In a real app, fetch this based on params.id
    const shareLink = `https://imutask.com/p/${params.id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink);
        toast({
            title: t('copied'),
        });
    };
    
    const handleSaveSettings = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: 'Paramètres enregistrés !',
            description: 'Les paramètres de visibilité de votre pack ont été mis à jour.'
        });
        setIsSaving(false);
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/templates">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('title')}
                    </h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('description', { packName })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="visibility-switch" className="text-base">{t('visibilityLabel')}</Label>
                            <p className="text-sm text-muted-foreground">{t('visibilityDescription')}</p>
                        </div>
                        <Switch id="visibility-switch" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="share-link">{t('linkLabel')}</Label>
                        <div className="flex gap-2">
                            <Input id="share-link" value={shareLink} readOnly />
                            <Button variant="outline" onClick={handleCopy}>
                                <Copy className="mr-2"/>
                                {t('copyLink')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('promote.title')}</CardTitle>
                    <CardDescription>{t('promote.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>{t('promote.button')}</Button>
                </CardContent>
            </Card>

            <div className="flex justify-between">
                 <Button variant="ghost" asChild>
                    <Link href="/dashboard/templates">{t('back')}</Link>
                </Button>
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                     {isSaving && <Loader2 className="mr-2 animate-spin" />}
                    Enregistrer les paramètres
                </Button>
            </div>
        </div>
    );
}
