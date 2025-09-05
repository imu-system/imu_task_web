
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Shield, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Link } from '@/navigation';

export default function AdminNewCategoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminCategoriesPage');
    const tForm = useTranslations('AdminCategoryForm');

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
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/admin/services/categories">
                    <ArrowLeft className="h-4 w-4"/>
                    <span className="sr-only">{tForm('backToList')}</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {tForm('titleNew')}
                </h1>
                <p className="text-muted-foreground">
                    {tForm('subtitleNew')}
                </p>
            </div>
        </div>


       <Card>
            <CardHeader>
                <CardTitle>{tForm('cardTitle')}</CardTitle>
                <CardDescription>{tForm('cardDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name_fr">{tForm('nameLabel')}</Label>
                            <Input id="name_fr" placeholder={tForm('namePlaceholder')} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="slug">{tForm('slugLabel')}</Label>
                            <Input id="slug" placeholder={tForm('slugPlaceholder')} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description_fr">{tForm('descriptionLabel')}</Label>
                        <Textarea id="description_fr" placeholder={tForm('descriptionPlaceholder')} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="displayOrder">{tForm('displayOrderLabel')}</Label>
                            <Input id="displayOrder" type="number" defaultValue="10" />
                        </div>
                        <div className="space-y-2">
                             <Label>{tForm('statusLabel')}</Label>
                             <div className="flex items-center space-x-2 pt-2">
                                <Switch id="isActive" defaultChecked={true} />
                                <Label htmlFor="isActive">{tForm('statusActive')}</Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost">{tForm('cancel')}</Button>
                        <Button type="submit">{tForm('save')}</Button>
                    </div>
                </form>
            </CardContent>
       </Card>
    </div>
  );
}
