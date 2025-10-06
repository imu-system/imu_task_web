
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Loader2, ArrowLeft, Banknote, ShieldAlert } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function WithdrawPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const t = useTranslations('WithdrawPage');
    const { toast } = useToast();

    useEffect(() => {
        if (!loading && (!user || !user.roles.includes(UserRole.provider))) {
            router.push('/dashboard/wallet');
        }
    }, [user, loading, router]);


    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const handleWithdraw = () => {
        toast({
            title: t('toast.successTitle'),
            description: t('toast.successDescription')
        });
        router.push('/dashboard/wallet');
    }

    const availableBalance = 120.00;

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/wallet">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Banknote className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('availableBalance')}</CardTitle>
                    <CardDescription className="text-4xl font-bold tracking-tight">{availableBalance.toFixed(2)} €</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="amount">{t('form.amountLabel')}</Label>
                        <Input id="amount" type="number" defaultValue={availableBalance.toFixed(2)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="method">{t('form.methodLabel')}</Label>
                        <Select defaultValue="stripe">
                            <SelectTrigger id="method">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="stripe">Stripe</SelectItem>
                                <SelectItem value="paypal" disabled>Paypal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="account">{t('form.accountLabel')}</Label>
                        <Select defaultValue="acct_xxxx6789">
                            <SelectTrigger id="account">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="acct_xxxx6789">Compte bancaire terminant par 6789</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

             {user.KYCStatus !== 'verified' && (
                <Card className="border-amber-500 bg-amber-500/5 text-amber-800">
                    <CardHeader className="flex flex-row items-center gap-3">
                        <ShieldAlert className="h-6 w-6"/>
                        <CardTitle className="text-lg">{t('kyc.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{t('kyc.description')}</p>
                        <Button variant="link" asChild className="p-0 text-amber-800 hover:text-amber-900">
                            <Link href="/dashboard/profile">{t('kyc.link')}</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-end">
                <Button size="lg" onClick={handleWithdraw} disabled={user.KYCStatus !== 'verified'}>
                    {t('form.confirmButton')}
                </Button>
            </div>
        </div>
    );
}
