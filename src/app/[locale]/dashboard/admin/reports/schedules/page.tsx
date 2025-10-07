
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, CalendarClock, PlusCircle, MoreHorizontal, Trash2, Edit, Play, Pause } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const mockSchedules = [
    { id: 'sch1', name: "Rapport Transactions Mensuel", format: 'CSV', frequency: 'monthly', nextRun: new Date('2024-11-01T00:00:00Z'), recipients: 'compta@imutask.com', encrypted: true, isActive: true },
    { id: 'sch2', name: "Activité Utilisateurs Hebdomadaire", format: 'CSV', frequency: 'weekly', nextRun: new Date('2024-10-28T00:00:00Z'), recipients: 'analytics@imutask.com', encrypted: false, isActive: true },
    { id: 'sch3', name: "Export Annuel Archives", format: 'CSV', frequency: 'yearly', nextRun: new Date('2025-01-01T00:00:00Z'), recipients: 'admin@imutask.com', encrypted: true, isActive: false },
];

export default function AdminReportSchedulesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminReportsPage.schedules');
    const { toast } = useToast();

    const [schedules, setSchedules] = useState(mockSchedules);
    const [isSaving, setIsSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);
    
    const handleSave = async (data: any) => {
        setIsSaving(true);
        console.log("Saving schedule:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.createSuccessTitle'),
            description: t('toast.createSuccessDescription'),
        });
        setIsSaving(false);
        setIsDialogOpen(false);
    };

    const toggleScheduleStatus = (scheduleId: string) => {
        setSchedules(schedules.map(s => 
            s.id === scheduleId ? { ...s, isActive: !s.isActive } : s
        ));
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
                        <CalendarClock className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                    {t('subtitle')}
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2"/>{t('actions.create')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('dialog.title')}</DialogTitle>
                            <DialogDescription>{t('dialog.description')}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('dialog.nameLabel')}</Label>
                                <Input id="name" placeholder={t('dialog.namePlaceholder')} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="format">{t('dialog.formatLabel')}</Label>
                                    <Select defaultValue="csv">
                                        <SelectTrigger id="format"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="csv">CSV</SelectItem>
                                            <SelectItem value="parquet" disabled>Parquet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="frequency">{t('dialog.frequencyLabel')}</Label>
                                    <Select defaultValue="monthly">
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
                                <Input id="recipients" type="email" multiple placeholder={t('dialog.recipientsPlaceholder')} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="encryption" />
                                <Label htmlFor="encryption">{t('dialog.encryptionLabel')}</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>{t('dialog.cancel')}</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                {t('dialog.save')}
                            </Button>
                        </DialogFooter>
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
                                <TableHead>{t('table.header.name')}</TableHead>
                                <TableHead>{t('table.header.format')}</TableHead>
                                <TableHead>{t('table.header.frequency')}</TableHead>
                                <TableHead>{t('table.header.nextRun')}</TableHead>
                                <TableHead>{t('table.header.status')}</TableHead>
                                <TableHead><span className="sr-only">{t('table.header.actions')}</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules.map((schedule) => (
                                <TableRow key={schedule.id}>
                                    <TableCell className="font-medium">{schedule.name}</TableCell>
                                    <TableCell><Badge variant="outline">{schedule.format}</Badge></TableCell>
                                    <TableCell>{t(`dialog.frequency.${schedule.frequency}`)}</TableCell>
                                    <TableCell>{schedule.nextRun.toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={schedule.isActive ? 'default' : 'secondary'}>
                                            {schedule.isActive ? t('table.statusActive') : t('table.statusPaused')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/admin/reports/schedules/edit/${schedule.id}`}>
                                                        <Edit className="mr-2"/>{t('actions.edit')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toggleScheduleStatus(schedule.id)}>
                                                    {schedule.isActive ? (
                                                        <><Pause className="mr-2"/>{t('actions.pause')}</>
                                                    ) : (
                                                        <><Play className="mr-2"/>{t('actions.resume')}</>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/>{t('actions.delete')}</DropdownMenuItem>
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
