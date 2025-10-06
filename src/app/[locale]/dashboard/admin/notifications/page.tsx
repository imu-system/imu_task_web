

'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, Bell, MoreHorizontal, Eye } from 'lucide-react';
import { UserRole, type Notification, NotificationType, NotificationChannel, DeliveryStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getNotifications } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const mockNotifications: Notification[] = getNotifications();

export default function AdminNotificationsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminNotificationsPage.history');

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredNotifications = useMemo(() => {
        return mockNotifications.filter(notif => {
            const matchesSearch = searchTerm ? notif.user?.profile?.displayName.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            const matchesType = typeFilter !== 'all' ? notif.type === typeFilter : true;
            const matchesStatus = statusFilter !== 'all' ? notif.deliveryStatus === statusFilter : true;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [searchTerm, typeFilter, statusFilter]);

    if (authLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const getStatusVariant = (status: DeliveryStatus) => {
        switch (status) {
            case 'sent': return 'default';
            case 'queued': return 'secondary';
            case 'failed': return 'destructive';
            default: return 'outline';
        }
    };
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Bell className="h-8 w-8 text-primary"/>
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
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <Input 
                            placeholder={t('filters.searchPlaceholder')} 
                            className="max-w-xs"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                         <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[240px]">
                                <SelectValue placeholder={t('filters.type')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                                {Object.values(NotificationType).map(type => (
                                    <SelectItem key={type} value={type}>{t(`types.${type}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder={t('filters.status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                                {Object.values(DeliveryStatus).map(status => (
                                    <SelectItem key={status} value={status}>{t(`statuses.${status}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.user')}</TableHead>
                                <TableHead>{t('table.type')}</TableHead>
                                <TableHead>{t('table.channel')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead>{t('table.date')}</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredNotifications.map((notif) => (
                                <TableRow key={notif.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={notif.user?.profile?.photoUrl}/>
                                                <AvatarFallback>{notif.user?.profile?.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{notif.user?.profile?.displayName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{t(`types.${notif.type}`)}</Badge></TableCell>
                                    <TableCell>{t(`channels.${notif.channel}`)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(notif.deliveryStatus)}>{t(`statuses.${notif.deliveryStatus}`)}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {notif.sentAt ? new Date(notif.sentAt).toLocaleString() : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/admin/notifications/${notif.id}`}>
                                                        <Eye className="mr-2"/>
                                                        {t('table.viewDetails')}
                                                    </Link>
                                                </DropdownMenuItem>
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
