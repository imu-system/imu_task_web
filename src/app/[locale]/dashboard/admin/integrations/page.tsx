
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function AdminConnectorsPage() {
    const t = useTranslations('AdminIntegrationsPage.connectors');
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast({
            title: t('toast.saveSuccessTitle'),
            description: t('toast.saveSuccessDescription'),
        });
        setIsSaving(false);
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>{t('stripe.title')}</CardTitle>
                    <CardDescription>{t('stripe.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="stripe-pk">{t('stripe.publicKeyLabel')}</Label>
                        <Input id="stripe-pk" placeholder="pk_test_..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stripe-sk">{t('stripe.secretKeyLabel')}</Label>
                        <Input id="stripe-sk" type="password" placeholder="sk_test_..." />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="stripe-webhook-secret">{t('stripe.webhookSecretLabel')}</Label>
                        <Input id="stripe-webhook-secret" type="password" placeholder="whsec_..." />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('email.title')}</CardTitle>
                    <CardDescription>{t('email.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="smtp-host">{t('email.smtpHost')}</Label>
                            <Input id="smtp-host" placeholder="smtp.example.com" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="smtp-port">{t('email.smtpPort')}</Label>
                            <Input id="smtp-port" placeholder="587" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="smtp-user">{t('email.smtpUser')}</Label>
                        <Input id="smtp-user" placeholder="user@example.com" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="smtp-pass">{t('email.smtpPassword')}</Label>
                        <Input id="smtp-pass" type="password" />
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {t('saveButton')}
                </Button>
            </div>
        </div>
    );
}
