
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, Ticket, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const couponSchema = z.object({
    code: z.string().min(5, "Le code doit contenir au moins 5 caractères.").max(20, "Le code ne peut pas dépasser 20 caractères.").transform(val => val.toUpperCase()),
    type: z.enum(['percentage', 'fixed']),
    value: z.coerce.number().positive("La valeur doit être positive."),
    usageLimit: z.coerce.number().int().positive().optional(),
    expiresAt: z.date().optional(),
    isActive: z.boolean().default(true),
}).refine(data => {
    if (data.type === 'percentage' && data.value > 100) {
        return false;
    }
    return true;
}, {
    message: "Le pourcentage ne peut pas dépasser 100.",
    path: ['value'],
});

type CouponFormValues = z.infer<typeof couponSchema>;

const mockCoupons: any = {
    'c1': { id: 'c1', code: 'BIENVENUE10', type: 'percentage', value: 10, usageCount: 25, usageLimit: 100, expiresAt: new Date('2024-12-31'), isActive: true },
    'c2': { id: 'c2', code: 'SOLDE20E', type: 'fixed', value: 20, usageCount: 5, usageLimit: 20, expiresAt: new Date('2024-09-30'), isActive: true },
    'c3': { id: 'c3', code: 'EXPIRE', type: 'percentage', value: 15, usageCount: 50, usageLimit: 50, expiresAt: new Date('2023-12-31'), isActive: false },
};

export default function AdminEditCouponPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const couponId = params.id;
    const t = useTranslations('AdminPricingPage.coupons');
    const { toast } = useToast();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema),
    });

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const couponData = mockCoupons[couponId];
        if (couponData) {
            form.reset(couponData);
        }
        setIsLoading(false);
    }, [couponId, form]);

    const onSubmit = async (data: CouponFormValues) => {
        setIsSaving(true);
        console.log("Updating coupon:", couponId, data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('form.toast.updateSuccessTitle'),
            description: t('form.toast.updateSuccessDescription'),
        });
        setIsSaving(false);
        router.push('/dashboard/admin/pricing/coupons');
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
                    <Link href="/dashboard/admin/pricing/coupons">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('form.titleEdit')}
                    </h1>
                </div>
            </div>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('form.title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('form.code.label')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('form.code.placeholder')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>{t('form.type.label')}</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="percentage"/></FormControl><FormLabel className="font-normal">{t('form.type.percentage')}</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="fixed"/></FormControl><FormLabel className="font-normal">{t('form.type.fixed')}</FormLabel></FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('form.value.label')}</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="usageLimit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('form.usageLimit.label')}</FormLabel>
                                        <FormControl><Input type="number" placeholder={t('form.usageLimit.placeholder')} {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="expiresAt"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{t('form.expiresAt.label')}</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP") : <span>{t('form.expiresAt.placeholder')}</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus /></PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <FormLabel>{t('form.isActive.label')}</FormLabel>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" asChild>
                            <Link href="/dashboard/admin/pricing/coupons">{t('form.cancelButton')}</Link>
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {t('form.saveChangesButton')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
