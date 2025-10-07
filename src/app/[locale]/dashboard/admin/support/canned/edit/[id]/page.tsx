
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';

const cannedResponseSchema = z.object({
  shortcut: z.string().min(3, "Le raccourci doit contenir au moins 3 caractères."),
  content: z.string().min(10, "Le contenu doit contenir au moins 10 caractères."),
});

type CannedResponseFormValues = z.infer<typeof cannedResponseSchema>;

const mockCannedResponses: any = {
    'canned1': { shortcut: 'salutation', content: "Bonjour {{user.name}},\n\nMerci d'avoir contacté le support ImuTask.\n\nCordialement," },
    'canned2': { shortcut: 'kyc_rejet', content: "Votre vérification d'identité a été rejetée car le document fourni était illisible. Veuillez soumettre à nouveau une photo claire de votre pièce d'identité." },
    'canned3': { shortcut: 'remboursement_ok', content: "Nous avons bien procédé au remboursement de votre mission. Les fonds devraient apparaître sur votre compte d'ici 5 à 10 jours ouvrés." },
};

export default function AdminEditCannedResponsePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const responseId = params.id;
    const t = useTranslations('AdminSupportPage.canned');
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<CannedResponseFormValues>({
        resolver: zodResolver(cannedResponseSchema),
    });

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const responseData = mockCannedResponses[responseId];
        if (responseData) {
            form.reset(responseData);
        }
        setIsLoading(false);
    }, [responseId, form]);

    const onSubmit = async (data: CannedResponseFormValues) => {
        setIsSaving(true);
        console.log("Saving canned response:", responseId, data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.updateSuccessTitle'),
            description: t('toast.updateSuccessDescription'),
        });
        setIsSaving(false);
        router.push('/dashboard/admin/support/canned');
    };

    if (authLoading || isLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/admin/support/canned">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('dialog.editTitle')}
                    </h1>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('form.cardTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <FormField
                                control={form.control}
                                name="shortcut"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('dialog.shortcutLabel')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('dialog.shortcutPlaceholder')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('dialog.contentLabel')}</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder={t('dialog.contentPlaceholder')} rows={8} {...field} />
                                        </FormControl>
                                         <p className="text-xs text-muted-foreground">{t('dialog.variablesInfo')}</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" asChild>
                            <Link href="/dashboard/admin/support/canned">{t('dialog.cancel')}</Link>
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {t('dialog.save')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
