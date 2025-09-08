
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Mock data for feature flags
const mockFlags = [
  {
    id: 'ai-category-suggestion',
    nameKey: 'flags.aiSuggestion.name',
    descriptionKey: 'flags.aiSuggestion.description',
    isActive: true,
  },
  {
    id: 'new-profile-page-design',
    nameKey: 'flags.newProfilePage.name',
    descriptionKey: 'flags.newProfilePage.description',
    isActive: false,
  },
  {
    id: 'provider-availability-calendar',
    nameKey: 'flags.providerCalendar.name',
    descriptionKey: 'flags.providerCalendar.description',
    isActive: true,
  },
];

export default function AdminFlagsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminSettingsPage');
    const { toast } = useToast();
    const [flags, setFlags] = useState(mockFlags);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const handleFlagToggle = (flagId: string, checked: boolean) => {
        setFlags(currentFlags =>
            currentFlags.map(flag =>
                flag.id === flagId ? { ...flag, isActive: checked } : flag
            )
        );
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        console.log("Saving feature flags:", flags);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('flags.toast.successTitle'),
            description: t('flags.toast.successDescription'),
        });
        setIsSaving(false);
    };

    if (authLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle>{t('flags.card.title')}</CardTitle>
                    <CardDescription>{t('flags.card.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {flags.map((flag, index) => (
                        <React.Fragment key={flag.id}>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor={flag.id} className="flex flex-col space-y-1">
                                    <span>{t(flag.nameKey as any)}</span>
                                    <span className="font-normal leading-snug text-muted-foreground">
                                        {t(flag.descriptionKey as any)}
                                    </span>
                                </Label>
                                <Switch
                                    id={flag.id}
                                    checked={flag.isActive}
                                    onCheckedChange={(checked) => handleFlagToggle(flag.id, checked)}
                                />
                            </div>
                            {index < flags.length - 1 && <Separator />}
                        </React.Fragment>
                    ))}
                </CardContent>
             </Card>
             <div className="flex justify-end">
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {t('settings.saveButton')}
                </Button>
            </div>
        </div>
    );
}
