
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, Send, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { UserRole, NotificationChannel } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const broadcastSchema = z.object({
    title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères.'),
    message: z.string().min(10, 'Le message doit contenir au moins 10 caractères.'),
    roles: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "Vous devez sélectionner au moins un rôle.",
    }),
    channels: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "Vous devez sélectionner au moins un canal.",
    }),
    targetCities: z.string().optional(),
    sendOption: z.enum(['now', 'later']).default('now'),
    scheduledAtDate: z.date().optional(),
    scheduledAtTime: z.string().optional(),
}).refine(data => {
    if (data.sendOption === 'later') {
        return !!data.scheduledAtDate && !!data.scheduledAtTime;
    }
    return true;
}, {
    message: "La date et l'heure sont requises pour une planification.",
    path: ['scheduledAtDate'],
});


type BroadcastFormValues = z.infer<typeof broadcastSchema>;

const availableRoles = [
  { id: UserRole.client, labelKey: 'roles.client' },
  { id: UserRole.provider, labelKey: 'roles.provider' },
];

const availableChannels = [
    { id: NotificationChannel.in_app, labelKey: 'channels.in_app' },
    { id: NotificationChannel.push, labelKey: 'channels.push' },
    { id: NotificationChannel.email, labelKey: 'channels.email' },
];

export default function AdminBroadcastPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminNotificationsPage.broadcast');
    const tUsers = useTranslations('AdminUsersPage');
    const tHistory = useTranslations('AdminNotificationsPage.history');
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<BroadcastFormValues>({
        resolver: zodResolver(broadcastSchema),
        defaultValues: {
            title: '',
            message: '',
            roles: [UserRole.client],
            channels: [NotificationChannel.in_app],
            targetCities: '',
            sendOption: 'now',
        },
    });

    const onSubmit = async (data: BroadcastFormValues) => {
        setIsSubmitting(true);
        console.log("Broadcast data:", data);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
            title: t('form.toast.successTitle'),
            description: t('form.toast.successDescription'),
        });
        
        form.reset();
        setIsSubmitting(false);
    };

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    if (authLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Send className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                    {t('subtitle')}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('form.content.title')}</CardTitle>
                        <CardDescription>{t('form.content.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('form.content.titleLabel')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('form.content.titlePlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('form.content.messageLabel')}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t('form.content.messagePlaceholder')} {...field} rows={5} />
                                    </FormControl>
                                     <FormDescription>{t('form.content.messageDescription')}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>{t('form.targeting.title')}</CardTitle>
                        <CardDescription>{t('form.targeting.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="roles"
                            render={() => (
                                <FormItem>
                                    <FormLabel>{t('form.targeting.rolesLabel')}</FormLabel>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                    {availableRoles.map((item) => (
                                        <FormField
                                            key={item.id}
                                            control={form.control}
                                            name="roles"
                                            render={({ field }) => (
                                                <FormItem key={item.id} className="flex flex-row items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(item.id)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                ? field.onChange([...field.value, item.id])
                                                                : field.onChange(field.value?.filter((value) => value !== item.id))
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">{tUsers(item.labelKey as any)}</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="targetCities"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('form.targeting.citiesLabel')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('form.targeting.citiesPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormDescription>{t('form.targeting.citiesDescription')}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('form.sending.title')}</CardTitle>
                        <CardDescription>{t('form.sending.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="channels"
                            render={() => (
                                <FormItem>
                                    <FormLabel>{t('form.sending.channelsLabel')}</FormLabel>
                                     <div className="flex flex-wrap gap-4 pt-2">
                                        {availableChannels.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="channels"
                                                render={({ field }) => (
                                                    <FormItem key={item.id} className="flex flex-row items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(item.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                    ? field.onChange([...field.value, item.id])
                                                                    : field.onChange(field.value?.filter((value) => value !== item.id))
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{tHistory(item.labelKey as any)}</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sendOption"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>{t('form.sending.sendOptionLabel')}</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="now" /></FormControl>
                                                <FormLabel className="font-normal">{t('form.sending.sendNow')}</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="later" /></FormControl>
                                                <FormLabel className="font-normal">{t('form.sending.sendLater')}</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {form.watch('sendOption') === 'later' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg">
                                <FormField
                                    control={form.control}
                                    name="scheduledAtDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>{t('form.sending.dateLabel')}</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? (format(field.value, "PPP")) : (<span>{t('form.sending.datePlaceholder')}</span>)}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="scheduledAtTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('form.sending.timeLabel')}</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2"/>}
                        {t('form.submitButton')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

    

    
