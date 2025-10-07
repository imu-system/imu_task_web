
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, FileText, Edit, MoreHorizontal } from 'lucide-react';
import { UserRole, NotificationType, NotificationChannel } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockTemplates = [
    { id: 'task_offer_received', name: 'Nouvelle offre reçue', channels: [NotificationChannel.in_app, NotificationChannel.push] },
    { id: 'offer_accepted', name: 'Offre acceptée', channels: [NotificationChannel.in_app, NotificationChannel.email] },
    { id: 'booking_reminder', name: 'Rappel de réservation (24h)', channels: [NotificationChannel.push, NotificationChannel.email] },
    { id: 'dispute_update', name: 'Mise à jour d\'un litige', channels: [NotificationChannel.in_app] },
];


export default function AdminTemplatesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminNotificationsPage.templates');
    const tHistory = useTranslations('AdminNotificationsPage.history');

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
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <FileText className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                {t('subtitle')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('card.title')}</CardTitle>
                    <CardDescription>{t('card.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.header.name')}</TableHead>
                                <TableHead>{t('table.header.type')}</TableHead>
                                <TableHead>{t('table.header.channels')}</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTemplates.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell className="font-medium">{template.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{tHistory(`types.${template.id}`)}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {template.channels.map(channel => (
                                                <Badge key={channel} variant="secondary">{tHistory(`channels.${channel}`)}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/dashboard/admin/notifications/templates/edit/${template.id}`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                {t('table.actions.edit')}
                                            </Link>
                                        </Button>
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
