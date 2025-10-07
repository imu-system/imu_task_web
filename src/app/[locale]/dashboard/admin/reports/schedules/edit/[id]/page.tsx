
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';

// Mock data for this example
const mockSchedules = [
    { id: 'sch1', name: "Rapport Transactions Mensuel", format: 'CSV', frequency: 'monthly', nextRun: new Date('2024-11-01T00:00:00Z'), recipients: 'compta@imutask.com', encrypted: true, isActive: true },
    { id: 'sch2', name: "Activité Utilisateurs Hebdomadaire", format: 'CSV', frequency: 'weekly', nextRun: new Date('2024-10-28T00:00:00Z'), recipients: 'analytics@imutask.com', encrypted: false, isActive: true },
    { id: 'sch3', name: "Export Annuel Archives", format: 'CSV', frequency: 'yearly', nextRun: new Date('2025-01-01T00:00:00Z'), recipients: 'admin@imutask.com', encrypted: true, isActive: false },
];

export default function AdminEditSchedulePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const scheduleId = params.id;
    const t = useTranslations('AdminReportsPage.schedules');
    const { toast } = useToast();

    const [schedule, setSchedule] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const data = mockSchedules.find(s => s.id === scheduleId);
        if (data) {
            setSchedule(data);
        }
        setIsLoading(false);
    }, [scheduleId]);

    const handleSave = async () => {
        setIsSaving(true);
        console.log("Saving schedule:", schedule);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.updateSuccessTitle'),
            description: t('toast.updateSuccessDescription'),
        });
        setIsSaving(false);
        router.push('/dashboard/admin/reports/schedules');
    };

    if (authLoading || isLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!schedule) {
        return (
            <div className="text-center">
                <p>{t('notFound')}</p>
                <Button asChild variant="link">
                    <Link href="/dashboard/admin/reports/schedules">{t('backToList')}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/admin/reports/schedules">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('edit.title')}
                    </h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('edit.cardTitle')}</CardTitle>
                    <CardDescription>{t('edit.cardDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('dialog.nameLabel')}</Label>
                        <Input id="name" defaultValue={schedule.name} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="format">{t('dialog.formatLabel')}</Label>
                            <Select defaultValue={schedule.format}>
                                <SelectTrigger id="format"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="frequency">{t('dialog.frequencyLabel')}</Label>
                            <Select defaultValue={schedule.frequency}>
                                <SelectTrigger id="frequency"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">{t('dialog.frequency.daily')}</SelectItem>
                                    <SelectItem value="weekly">{t('dialog.frequency.weekly')}</SelectItem>
                                    <SelectItem value="monthly">{t('dialog.frequency.monthly')}</SelectItem>
                                    <SelectItem value="yearly">{t('dialog.frequency.yearly')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="recipients">{t('dialog.recipientsLabel')}</Label>
                        <Input id="recipients" type="email" defaultValue={schedule.recipients} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="encryption" defaultChecked={schedule.encrypted} />
                        <Label htmlFor="encryption">{t('dialog.encryptionLabel')}</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="isActive" defaultChecked={schedule.isActive} />
                        <Label htmlFor="isActive">{t('table.statusActive')}</Label>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="ghost" asChild><Link href="/dashboard/admin/reports/schedules">{t('dialog.cancel')}</Link></Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {t('edit.save')}
                </Button>
            </div>
        </div>
    );
}
