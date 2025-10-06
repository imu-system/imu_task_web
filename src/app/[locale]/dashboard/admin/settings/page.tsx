
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const settingsSchema = z.object({
  offerExpirationDays: z.coerce.number().int().min(1, "Doit être d'au moins 1 jour."),
  cancellationHoursBefore: z.coerce.number().int().min(1, "Doit être d'au moins 1 heure."),
  supportSlaHours: z.coerce.number().int().min(1, "Doit être d'au moins 1 heure."),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminSettingsPage.settings');
    const { toast } = useToast();

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            offerExpirationDays: 7,
            cancellationHoursBefore: 24,
            supportSlaHours: 48,
            maintenanceMode: false,
            maintenanceMessage: "Le site est actuellement en maintenance. Nous serons de retour très bientôt !",
        },
    });

    useEffect(() => {
        // In a real app, you would fetch these settings from your backend
        // For now, we just use the default values.
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const onSubmit = async (data: SettingsFormValues) => {
        setIsSaving(true);
        console.log("Saving settings:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.successTitle'),
            description: t('toast.successDescription'),
        });
        setIsSaving(false);
    };

    if (authLoading || isLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('operational.title')}</CardTitle>
                        <CardDescription>{t('operational.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <FormField
                                control={form.control}
                                name="offerExpirationDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('operational.offerExpirationDaysLabel')}</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormDescription>{t('operational.offerExpirationDaysDesc')}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cancellationHoursBefore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('operational.cancellationHoursBeforeLabel')}</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormDescription>{t('operational.cancellationHoursBeforeDesc')}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="supportSlaHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('operational.supportSlaHoursLabel')}</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormDescription>{t('operational.supportSlaHoursDesc')}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                     <CardHeader>
                        <CardTitle>{t('maintenance.title')}</CardTitle>
                        <CardDescription>{t('maintenance.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="maintenanceMode"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">{t('maintenance.enableLabel')}</FormLabel>
                                        <FormDescription>{t('maintenance.enableDesc')}</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         {form.watch('maintenanceMode') && (
                            <FormField
                                control={form.control}
                                name="maintenanceMessage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('maintenance.messageLabel')}</FormLabel>
                                        <FormControl><Textarea {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                         )}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {t('saveButton')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
