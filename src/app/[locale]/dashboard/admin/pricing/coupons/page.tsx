
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, Ticket, PlusCircle, MoreHorizontal, Trash2, Edit, Calendar as CalendarIcon } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';


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

const mockCoupons = [
    { id: 'c1', code: 'BIENVENUE10', type: 'percentage', value: 10, usageCount: 25, usageLimit: 100, expiresAt: new Date('2024-12-31'), isActive: true },
    { id: 'c2', code: 'SOLDE20E', type: 'fixed', value: 20, usageCount: 5, usageLimit: 20, expiresAt: new Date('2024-09-30'), isActive: true },
    { id: 'c3', code: 'EXPIRE', type: 'percentage', value: 15, usageCount: 50, usageLimit: 50, expiresAt: new Date('2023-12-31'), isActive: false },
];


export default function AdminCouponsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminPricingPage.coupons');
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            code: '',
            type: 'percentage',
            value: 10,
            isActive: true,
        },
    });

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);
    
    const onSubmit = async (data: CouponFormValues) => {
        setIsSaving(true);
        console.log("Saving coupon:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('form.toast.successTitle'),
            description: t('form.toast.successDescription'),
        });
        setIsSaving(false);
        setIsDialogOpen(false);
        form.reset();
    };

    if (authLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Ticket className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                    {t('subtitle')}
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2"/>
                            {t('createButton')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t('form.title')}</DialogTitle>
                            <DialogDescription>{t('form.description')}</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
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
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
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
                                <DialogFooter>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        {t('form.saveButton')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('table.title')}</CardTitle>
                    <CardDescription>{t('table.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.header.code')}</TableHead>
                                <TableHead>{t('table.header.status')}</TableHead>
                                <TableHead>{t('table.header.type')}</TableHead>
                                <TableHead>{t('table.header.value')}</TableHead>
                                <TableHead>{t('table.header.usage')}</TableHead>
                                <TableHead>{t('table.header.expiresAt')}</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockCoupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="font-mono">{coupon.code}</TableCell>
                                    <TableCell>
                                        <Badge variant={coupon.isActive ? 'default' : 'outline'}>
                                            {coupon.isActive ? t('table.statusActive') : t('table.statusInactive')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{t(`form.type.${coupon.type}`)}</TableCell>
                                    <TableCell className="font-medium">
                                        {coupon.type === 'percentage' ? `${coupon.value}%` : `${(coupon.value).toFixed(2)}€`}
                                    </TableCell>
                                    <TableCell>{`${coupon.usageCount} / ${coupon.usageLimit}`}</TableCell>
                                    <TableCell>{coupon.expiresAt.toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/admin/pricing/coupons/edit/${coupon.id}`}>
                                                        <Edit className="mr-2"/>{t('table.actions.edit')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/>{t('table.actions.delete')}</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
