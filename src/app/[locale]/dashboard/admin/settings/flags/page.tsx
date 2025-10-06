
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
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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

const availableRoles = [UserRole.client, UserRole.provider];

export default function AdminFlagsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminSettingsPage');
    const tUsers = useTranslations('AdminUsersPage');
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
                <CardContent className="space-y-8">
                    {flags.map((flag) => (
                        <Card key={flag.id} className="p-6">
                           <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-semibold">{t(flag.nameKey as any)}</h3>
                                    <p className="text-sm text-muted-foreground">{t(flag.descriptionKey as any)}</p>
                                </div>
                                <Switch
                                    id={flag.id}
                                    checked={flag.isActive}
                                    onCheckedChange={(checked) => handleFlagToggle(flag.id, checked)}
                                    aria-label={`Toggle ${t(flag.nameKey as any)}`}
                                />
                           </div>
                           <div className={`mt-4 space-y-6 transition-opacity ${flag.isActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                <Separator/>
                                <div className="space-y-2">
                                    <Label>{t('flags.targeting.environment')}</Label>
                                    <Select defaultValue="production" disabled>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="production">{t('flags.targeting.production')}</SelectItem>
                                            <SelectItem value="staging">{t('flags.targeting.staging')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('flags.targeting.rollout')} : 100%</Label>
                                    <Slider defaultValue={[100]} max={100} step={1} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('flags.targeting.roles')}</Label>
                                    <div className="flex gap-4">
                                        {availableRoles.map(role => (
                                            <div key={role} className="flex items-center space-x-2">
                                                <Checkbox id={`${flag.id}-${role}`} checked disabled/>
                                                <label htmlFor={`${flag.id}-${role}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    {tUsers(`roles.${role}`)}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                           </div>
                        </Card>
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
