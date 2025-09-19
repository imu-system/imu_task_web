
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, BookCopy } from 'lucide-react';
import { Link, useRouter } from '@/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function NewTaskTemplatePage() {
    const t = useTranslations('TaskTemplatesPage.form');
    const { toast } = useToast();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.createSuccessTitle'),
            description: t('toast.createSuccessDescription')
        });
        setIsSaving(false);
        router.push('/dashboard/templates');
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
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <BookCopy className="h-8 w-8 text-primary"/>
                        {t('titleNew')}
                    </h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('cardTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('nameLabel')}</Label>
                        <Input id="name" placeholder={t('namePlaceholder')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">{t('categoryLabel')}</Label>
                         <Select>
                            <SelectTrigger id="category">
                                <SelectValue placeholder={t('categoryPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Courses">Courses</SelectItem>
                                <SelectItem value="Nettoyage">Nettoyage</SelectItem>
                                <SelectItem value="Visites">Visites</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">{t('descriptionLabel')}</Label>
                        <Textarea id="description" placeholder={t('descriptionPlaceholder')} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">{t('addressLabel')}</Label>
                         <Select>
                            <SelectTrigger id="address">
                                <SelectValue placeholder={t('addressPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="123 Rue Principale, Paris">123 Rue Principale, Paris</SelectItem>
                               <SelectItem value="24 Rue de la Paix, Lyon">24 Rue de la Paix, Lyon</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="price">{t('priceLabel')}</Label>
                        <Input id="price" type="number" placeholder="20"/>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/templates">{t('cancel')}</Link>
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 animate-spin" />}
                    {t('save')}
                </Button>
            </div>
        </div>
    );
}
