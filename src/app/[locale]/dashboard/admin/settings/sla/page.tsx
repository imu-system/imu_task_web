
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const slaSchema = z.object({
  kycReviewHours: z.coerce.number().int().min(1, "Doit être d'au moins 1 heure."),
  disputeResponseHours: z.coerce.number().int().min(1, "Doit être d'au moins 1 heure."),
  supportTicketResponseHours: z.coerce.number().int().min(1, "Doit être d'au moins 1 heure."),
  offerResponseHours: z.coerce.number().int().min(1, "Doit être d'au moins 1 heure."),
});

type SlaFormValues = z.infer<typeof slaSchema>;

export default function AdminSlaPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminSettingsPage.sla');
    const { toast } = useToast();

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<SlaFormValues>({
        resolver: zodResolver(slaSchema),
        defaultValues: {
            kycReviewHours: 24,
            disputeResponseHours: 48,
            supportTicketResponseHours: 8,
            offerResponseHours: 48,
        },
    });

    useEffect(() => {
        // In a real app, you would fetch these settings from your backend
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const onSubmit = async (data: SlaFormValues) => {
        setIsSaving(true);
        console.log("Saving SLA settings:", data);
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
                        <CardTitle>{t('title')}</CardTitle>
                        <CardDescription>{t('description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FormField
                                control={form.control}
                                name="kycReviewHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('kycReviewHours.label')}</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormDescription>{t('kycReviewHours.description')}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="disputeResponseHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('disputeResponseHours.label')}</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormDescription>{t('disputeResponseHours.description')}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="supportTicketResponseHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('supportTicketResponseHours.label')}</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormDescription>{t('supportTicketResponseHours.description')}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="offerResponseHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('offerResponseHours.label')}</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormDescription>{t('offerResponseHours.description')}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('reporting.title')}</CardTitle>
                        <CardDescription>{t('reporting.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{t('reporting.content')}</p>
                        <Button asChild variant="secondary">
                            <Link href="/dashboard/admin/reports">{t('reporting.link')}</Link>
                        </Button>
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
