
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ArrowLeft, BellRing, Loader2, Smartphone, PlusCircle } from 'lucide-react';
import { Link } from '@/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const notificationChannels = [
    { id: 'in_app', labelKey: 'channels.inApp' },
    { id: 'email', labelKey: 'email' },
    { id: 'push', labelKey: 'push' },
];

const notificationTypes = [
    { id: 'new_message', labelKey: 'types.newMessage' },
    { id: 'booking_update', labelKey: 'types.bookingUpdate' },
    { id: 'payment_update', labelKey: 'types.paymentUpdate' },
    { id: 'new_offer', labelKey: 'types.newOffer' },
    { id: 'promotional', labelKey: 'types.promotional' },
];

const mockDevices = [
    { id: 'd1', name: 'iPhone 14', lastSync: '12/09 10:15' },
    { id: 'd2', name: 'MacBook Pro', lastSync: '11/09 19:45' },
];


export default function NotificationPreferencesPage() {
    const t = useTranslations('NotificationPreferencesPage');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.saveSuccessTitle'),
            description: t('toast.saveSuccessDescription'),
        });
        setIsSaving(false);
    }
    
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/notifications">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <BellRing className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('channels.title')}</CardTitle>
                    <CardDescription>{t('channels.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {notificationChannels.map(channel => (
                        <div key={channel.id} className="flex items-center space-x-2">
                            <Checkbox id={`channel-${channel.id}`} defaultChecked={channel.id !== 'push'}/>
                            <Label htmlFor={`channel-${channel.id}`}>{t(channel.labelKey as any)}</Label>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('types.title')}</CardTitle>
                    <CardDescription>{t('types.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {notificationTypes.map(type => (
                         <div key={type.id} className="flex items-center space-x-2">
                            <Checkbox id={`type-${type.id}`} defaultChecked={type.id !== 'promotional'}/>
                            <Label htmlFor={`type-${type.id}`}>{t(type.labelKey as any)}</Label>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('devices.title')}</CardTitle>
                    <CardDescription>{t('devices.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockDevices.map((device) => (
                         <div key={device.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">{device.name}</p>
                                    <p className="text-xs text-muted-foreground">{t('devices.lastSync')}: {device.lastSync}</p>
                                </div>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" className="text-destructive">{t('devices.remove')}</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('devices.dialog.title')}</AlertDialogTitle>
                                        <AlertDialogDescription>{t('devices.dialog.description', { deviceName: device.name })}</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('devices.dialog.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction>{t('devices.dialog.confirm')}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                    <Separator/>
                    <Button variant="outline" className="w-full" disabled>
                        <PlusCircle className="mr-2"/>
                        {t('devices.add')}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dnd.title')}</CardTitle>
                    <CardDescription>{t('dnd.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Switch id="dnd-mode" />
                        <Label htmlFor="dnd-mode">{t('dnd.enable')}</Label>
                    </div>
                     <div className="flex items-center gap-4">
                        <Input type="time" defaultValue="22:00" className="w-32"/>
                        <span>-</span>
                        <Input type="time" defaultValue="07:00" className="w-32"/>
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button size="lg" onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {t('saveButton')}
                </Button>
            </div>
        </div>
    );
}
