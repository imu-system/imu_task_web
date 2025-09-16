
'use client';

import { useAuth } from "@/hooks/use-auth";
import { KYCStatus } from "@/lib/types";
import { useTranslations } from "next-intl";
import { Loader2, ShieldCheck, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/navigation";
import { useToast } from "@/hooks/use-toast";

export default function KycPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('KycPage');
    const { toast } = useToast();

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const handleStartVerification = () => {
        // In a real app, this would redirect to a third-party KYC provider
        // or open a modal with the verification flow.
        toast({
            title: t('toast.title'),
            description: t('toast.description'),
        })
    }

    const StatusDisplay = () => {
        switch (user.KYCStatus) {
            case KYCStatus.verified:
                return (
                    <div className="text-center p-6 bg-green-100/50 rounded-lg border border-green-200 text-green-800">
                        <CheckCircle className="h-12 w-12 mx-auto" />
                        <h3 className="text-xl font-bold mt-4">{t('status.verified.title')}</h3>
                        <p className="mt-2">{t('status.verified.description')}</p>
                    </div>
                )
            case KYCStatus.pending:
                 return (
                    <div className="text-center p-6 bg-yellow-100/50 rounded-lg border border-yellow-200 text-yellow-800">
                        <Clock className="h-12 w-12 mx-auto" />
                        <h3 className="text-xl font-bold mt-4">{t('status.pending.title')}</h3>
                        <p className="mt-2">{t('status.pending.description')}</p>
                    </div>
                )
            case KYCStatus.rejected:
                return (
                    <div className="text-center p-6 bg-red-100/50 rounded-lg border border-red-200 text-red-800">
                        <AlertCircle className="h-12 w-12 mx-auto" />
                        <h3 className="text-xl font-bold mt-4">{t('status.rejected.title')}</h3>
                        <p className="mt-2">{t('status.rejected.description')}</p>
                        <Button onClick={handleStartVerification} className="mt-4">{t('startVerification')}</Button>
                    </div>
                )
            default:
                return (
                    <Button onClick={handleStartVerification} size="lg" className="w-full">
                        {t('startVerification')}
                    </Button>
                )
        }
    }


    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/profile">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('card.title')}</CardTitle>
                    <CardDescription>{t('card.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>{t('card.item1')}</li>
                        <li>{t('card.item2')}</li>
                        <li>{t('card.item3')}</li>
                    </ul>
                    <Separator />
                    <StatusDisplay />
                </CardContent>
            </Card>
        </div>
    )
}
