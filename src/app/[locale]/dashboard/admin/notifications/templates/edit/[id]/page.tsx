
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, FileText, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';

const templateSchema = z.object({
  inApp: z.object({
    fr: z.object({
      title: z.string().optional(),
      body: z.string().optional(),
    }),
    en: z.object({
      title: z.string().optional(),
      body: z.string().optional(),
    }),
  }),
  email: z.object({
    fr: z.object({
      subject: z.string().optional(),
      body: z.string().optional(),
    }),
    en: z.object({
      subject: z.string().optional(),
      body: z.string().optional(),
    }),
  }),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

const mockTemplateData: Record<string, TemplateFormValues> = {
    'offer_accepted': {
        inApp: {
            fr: { title: "Votre offre a été acceptée !", body: "Félicitations {{displayName}}, votre offre pour la mission \"{{taskTitle}}\" a été acceptée par le client." },
            en: { title: "Your offer was accepted!", body: "Congratulations {{displayName}}, your offer for the task \"{{taskTitle}}\" has been accepted by the client." }
        },
        email: {
            fr: { subject: "Bonne nouvelle ! Votre offre a été acceptée", body: "Bonjour {{displayName}},\n\nExcellente nouvelle ! Le client a accepté votre offre pour la mission : \"{{taskTitle}}\".\n\nVous pouvez maintenant prendre contact avec lui via la messagerie pour finaliser les détails.\n\nL'équipe ImuTask" },
            en: { subject: "Good news! Your offer has been accepted", body: "Hello {{displayName}},\n\nGreat news! The client has accepted your offer for the task: \"{{taskTitle}}\".\n\nYou can now contact them via the messaging system to finalize the details.\n\nThe ImuTask Team" }
        }
    }
}

export default function AdminEditTemplatePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const templateId = params.id;
    const t = useTranslations('AdminNotificationsPage.templates.edit');
    const tHistory = useTranslations('AdminNotificationsPage.history');
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<TemplateFormValues>({
        resolver: zodResolver(templateSchema),
        defaultValues: mockTemplateData[templateId] || {
            inApp: { fr: {}, en: {} },
            email: { fr: {}, en: {} }
        }
    });

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const onSubmit = async (data: TemplateFormValues) => {
        setIsSaving(true);
        console.log("Saving template data:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toastSuccessTitle'),
            description: t('toastSuccessDescription'),
        });
        setIsSaving(false);
    }

    if (authLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
                 <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/admin/notifications/templates">
                            <ArrowLeft className="h-4 w-4"/>
                            <span className="sr-only">{t('backToList')}</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                            <FileText className="h-8 w-8 text-primary"/>
                            {t('title', { templateName: tHistory(`types.${templateId}` as any) })}
                        </h1>
                        <p className="text-muted-foreground">
                        {t('subtitle')}
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="in-app">
                    <TabsList>
                        <TabsTrigger value="in-app">{t('tabs.inAppPush')}</TabsTrigger>
                        <TabsTrigger value="email">{t('tabs.email')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="in-app">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('card.inAppPush.title')}</CardTitle>
                                <CardDescription>{t('card.inAppPush.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 border rounded-md space-y-4">
                                    <h3 className="font-medium">Français</h3>
                                    <FormField
                                        control={form.control}
                                        name="inApp.fr.title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('fields.title')}</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="inApp.fr.body"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('fields.body')}</FormLabel>
                                                <FormControl><Textarea {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="p-4 border rounded-md space-y-4">
                                    <h3 className="font-medium">English</h3>
                                    <FormField
                                        control={form.control}
                                        name="inApp.en.title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('fields.title')}</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="inApp.en.body"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('fields.body')}</FormLabel>
                                                <FormControl><Textarea {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormDescription>{t('variablesInfo')}</FormDescription>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="email">
                         <Card>
                            <CardHeader>
                                <CardTitle>{t('card.email.title')}</CardTitle>
                                <CardDescription>{t('card.email.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                               <div className="p-4 border rounded-md space-y-4">
                                    <h3 className="font-medium">Français</h3>
                                    <FormField
                                        control={form.control}
                                        name="email.fr.subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('fields.subject')}</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email.fr.body"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('fields.body')}</FormLabel>
                                                <FormControl><Textarea {...field} rows={10} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="p-4 border rounded-md space-y-4">
                                    <h3 className="font-medium">English</h3>
                                    <FormField
                                        control={form.control}
                                        name="email.en.subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('fields.subject')}</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email.en.body"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('fields.body')}</FormLabel>
                                                <FormControl><Textarea {...field} rows={10} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                 <FormDescription>{t('variablesInfo')}</FormDescription>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="animate-spin mr-2"/>}
                        {t('saveButton')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

