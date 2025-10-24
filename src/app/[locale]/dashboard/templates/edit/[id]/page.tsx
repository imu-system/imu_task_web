
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, BookCopy, Percent, Star } from 'lucide-react';
import { Link, useRouter, useParams } from '@/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';

const mockTemplate = {
    id: 'tpl1', 
    name: 'Courses hebdomadaires', 
    category: 'Courses', 
    description: 'Faire les courses pour la semaine selon la liste fournie.',
    address: '123 Rue Principale, Paris', 
    price: 20
};

const mockProviderTemplate = {
    id: 'ptpl1',
    name: 'Pack "Nettoyage Airbnb 2h"',
    category: 'Nettoyage',
    description: 'Service de nettoyage complet pour les locations de courte durée. Inclut le changement des draps, le nettoyage des surfaces, de la salle de bain et de la cuisine.',
    duration: '2h',
    price: 40,
    loyaltyDiscount: 10,
    badge: 'Expert Propreté'
};

export default function EditTaskTemplatePage() {
    const t = useTranslations('TaskTemplatesPage.form');
    const params = useParams();
    const { toast } = useToast();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const { user, loading } = useAuth();
    
    const isProvider = user?.roles?.includes(UserRole.provider) ?? false;


    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.updateSuccessTitle'),
            description: t('toast.updateSuccessDescription')
        });
        setIsSaving(false);
        router.push('/dashboard/templates');
    }
    
    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-12 w-12 text-primary"/>
            </div>
        );
    }

    if (isProvider) {
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
                            {t('titleEditProvider')}
                        </h1>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('cardTitleProvider')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('packNameLabel')}</Label>
                            <Input id="name" defaultValue={mockProviderTemplate.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">{t('categoryLabel')}</Label>
                            <Select defaultValue={mockProviderTemplate.category}>
                                <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Courses">Courses</SelectItem>
                                    <SelectItem value="Nettoyage">Nettoyage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">{t('descriptionLabel')}</Label>
                            <Textarea id="description" placeholder={t('descriptionPlaceholder')} defaultValue={mockProviderTemplate.description}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration">{t('durationLabel')}</Label>
                                <Input id="duration" defaultValue={mockProviderTemplate.duration} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">{t('priceLabel')}</Label>
                                <Input id="price" type="number" defaultValue={mockProviderTemplate.price} />
                            </div>
                        </div>
                         <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                                <Label>{t('loyaltyDiscountLabel')}</Label>
                                <p className="text-xs text-muted-foreground">{t('loyaltyDiscountDescription')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input type="number" className="w-20" defaultValue={mockProviderTemplate.loyaltyDiscount} />
                                <Percent className="h-4 w-4 text-muted-foreground"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="badge">{t('badgeLabel')}</Label>
                            <Select defaultValue={mockProviderTemplate.badge}>
                                <SelectTrigger id="badge"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Expert Propreté">Expert Propreté</SelectItem>
                                    <SelectItem value="Main Verte">Main Verte</SelectItem>
                                </SelectContent>
                            </Select>
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
                        {t('titleEdit')}
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
                        <Input id="name" defaultValue={mockTemplate.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">{t('categoryLabel')}</Label>
                         <Select defaultValue={mockTemplate.category}>
                            <SelectTrigger id="category">
                                <SelectValue />
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
                        <Textarea id="description" placeholder={t('descriptionPlaceholder')} defaultValue={mockTemplate.description}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">{t('addressLabel')}</Label>
                         <Select defaultValue={mockTemplate.address}>
                            <SelectTrigger id="address">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="123 Rue Principale, Paris">123 Rue Principale, Paris</SelectItem>
                               <SelectItem value="24 Rue de la Paix, Lyon">24 Rue de la Paix, Lyon</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="price">{t('priceLabel')}</Label>
                        <Input id="price" type="number" defaultValue={mockTemplate.price}/>
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
