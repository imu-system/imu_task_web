
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';

const mockWebhooks: any = {
    'wh_1': { id: 'wh_1', url: 'https://api.example.com/stripe-events', events: ['payment.succeeded', 'payment.failed'], secret: 'whsec_...123' },
    'wh_2': { id: 'wh_2', url: 'https://api.example.com/user-events', events: ['user.created', 'user.deleted'], secret: 'whsec_...456' },
};

const availableEvents = [
    'user.created', 'user.updated', 'user.deleted',
    'task.created', 'task.updated', 'task.canceled',
    'offer.created', 'offer.accepted',
    'booking.created', 'booking.completed',
    'payment.succeeded', 'payment.failed', 'payment.refunded',
];

const webhookSchema = z.object({
  url: z.string().url("Veuillez entrer une URL valide."),
  secret: z.string().optional(),
  events: z.array(z.string()).refine(value => value.some(item => item), {
    message: "Vous devez sélectionner au moins un événement.",
  }),
});

type WebhookFormValues = z.infer<typeof webhookSchema>;

export default function AdminEditWebhookPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const webhookId = params.id;
    const t = useTranslations('AdminIntegrationsPage.webhooks.edit');
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<WebhookFormValues>({
        resolver: zodResolver(webhookSchema),
        defaultValues: {
            url: '',
            secret: '',
            events: [],
        }
    });

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const webhookData = mockWebhooks[webhookId];
        if (webhookData) {
            form.reset(webhookData);
        }
        setIsLoading(false);
    }, [webhookId, form]);

    const onSubmit = async (data: WebhookFormValues) => {
        setIsSaving(true);
        console.log("Updating webhook:", webhookId, data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.updateSuccessTitle'),
            description: t('toast.updateSuccessDescription'),
        });
        setIsSaving(false);
        router.push('/dashboard/admin/integrations/webhooks');
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
                    <Link href="/dashboard/admin/integrations/webhooks">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('title')}
                    </h1>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('cardTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <FormField
                                control={form.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('urlLabel')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="secret"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('secretLabel')}</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="events"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>{t('eventsLabel')}</FormLabel>
                                        <div className="grid grid-cols-2 gap-2 p-4 border rounded-md max-h-60 overflow-y-auto">
                                            {availableEvents.map((item) => (
                                                <FormField
                                                    key={item}
                                                    control={form.control}
                                                    name="events"
                                                    render={({ field }) => {
                                                        return (
                                                        <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                                            <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(item)}
                                                                onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...field.value, item])
                                                                    : field.onChange(field.value?.filter((value) => value !== item))
                                                                }}
                                                            />
                                                            </FormControl>
                                                            <FormLabel className="text-sm font-normal">{item}</FormLabel>
                                                        </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" asChild>
                            <Link href="/dashboard/admin/integrations/webhooks">{t('cancel')}</Link>
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {t('save')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
