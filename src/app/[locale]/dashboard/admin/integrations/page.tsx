
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const integrationsSchema = z.object({
    stripePk: z.string().startsWith('pk_test_').or(z.string().startsWith('pk_live_')).or(z.literal('')),
    stripeSk: z.string().startsWith('sk_test_').or(z.string().startsWith('sk_live_')).or(z.literal('')),
    stripeWebhookSecret: z.string().startsWith('whsec_').or(z.literal('')),
    smtpHost: z.string().optional(),
    smtpPort: z.coerce.number().optional(),
    smtpUser: z.string().optional(),
    smtpPass: z.string().optional(),
});

type IntegrationsFormValues = z.infer<typeof integrationsSchema>;

export default function AdminConnectorsPage() {
    const t = useTranslations('AdminIntegrationsPage.connectors');
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<IntegrationsFormValues>({
        resolver: zodResolver(integrationsSchema),
        defaultValues: {
            stripePk: '',
            stripeSk: '',
            stripeWebhookSecret: '',
            smtpHost: '',
            smtpUser: '',
            smtpPass: '',
        }
    });


    const onSubmit = async (data: IntegrationsFormValues) => {
        setIsSaving(true);
        console.log("Saving integration data:", data);
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast({
            title: t('toast.saveSuccessTitle'),
            description: t('toast.saveSuccessDescription'),
        });
        setIsSaving(false);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('stripe.title')}</CardTitle>
                        <CardDescription>{t('stripe.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="stripePk"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('stripe.publicKeyLabel')}</FormLabel>
                                    <FormControl><Input placeholder="pk_test_..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="stripeSk"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('stripe.secretKeyLabel')}</FormLabel>
                                    <FormControl><Input type="password" placeholder="sk_test_..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="stripeWebhookSecret"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('stripe.webhookSecretLabel')}</FormLabel>
                                    <FormControl><Input type="password" placeholder="whsec_..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('email.title')}</CardTitle>
                        <CardDescription>{t('email.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="smtpHost"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('email.smtpHost')}</FormLabel>
                                    <FormControl><Input placeholder="smtp.example.com" {...field} /></FormControl>
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="smtpPort"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('email.smtpPort')}</FormLabel>
                                    <FormControl><Input placeholder="587" {...field} /></FormControl>
                                </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="smtpUser"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('email.smtpUser')}</FormLabel>
                                <FormControl><Input placeholder="user@example.com" {...field} /></FormControl>
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="smtpPass"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('email.smtpPassword')}</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                            </FormItem>
                            )}
                        />
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
