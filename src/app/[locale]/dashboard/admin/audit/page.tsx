
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, History, MoreHorizontal, Eye, Calendar as CalendarIcon, X, Download, GitCommit } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { users } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const mockAuditLogs = [
    { id: 'log1', actorId: 'user1', actorName: users.find(u=> u.id === 'user1')?.profile?.displayName, action: 'user.login', targetType: 'user', targetId: 'user1', createdAt: new Date('2024-08-27T10:00:00Z'), result: 'success' },
    { id: 'log2', actorId: 'usr_1', actorName: 'Nathan Imogo', action: 'category.update', targetType: 'serviceCategory', targetId: 'cat_abc123', createdAt: new Date('2024-08-27T09:45:00Z'), result: 'success' },
    { id: 'log3', actorId: 'user2', actorName: users.find(u=> u.id === 'user2')?.profile?.displayName, action: 'offer.create', targetType: 'offer', targetId: 'offer_xyz789', createdAt: new Date('2024-08-27T09:30:00Z'), result: 'success' },
    { id: 'log4', actorId: 'usr_1', actorName: 'Nathan Imogo', action: 'user.suspend', targetType: 'user', targetId: 'user3', createdAt: new Date('2024-08-26T18:00:00Z'), result: 'success' },
    { id: 'log5', actorId: 'system', actorName: 'System', action: 'payment.failed', targetType: 'transaction', targetId: 'pi_123abc', createdAt: new Date('2024-08-26T15:20:00Z'), result: 'failure' },
];

const targetTypeRoutes: Record<string, string> = {
    user: '/dashboard/admin/users',
    task: '/dashboard/admin/tasks',
    offer: '/dashboard/admin/offers',
    booking: '/dashboard/admin/bookings',
    // serviceCategory needs a different link structure, handle separately or omit
};


export default function AdminAuditLogPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminAuditLogPage');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isDeltaDialogOpen, setIsDeltaDialogOpen] = useState(false);


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
        <>
        <AlertDialog open={isDeltaDialogOpen} onOpenChange={setIsDeltaDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('deltaDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('deltaDialog.description')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsDeltaDialogOpen(false)}>{t('deltaDialog.close')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <History className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
                 <Button variant="outline" disabled>
                    <Download className="mr-2 h-4 w-4"/>
                    {t('actions.export')}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('table.title')}</CardTitle>
                    <CardDescription>{t('table.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-end gap-4 mb-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('filters.actor')}</label>
                            <Input 
                                placeholder={t('filters.actorPlaceholder')}
                                className="w-[200px]"
                            />
                        </div>
                        <div className="grid gap-2">
                             <label className="text-sm font-medium">{t('filters.targetType')}</label>
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t('filters.targetTypePlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('filters.allTargetTypes')}</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="task">Task</SelectItem>
                                    <SelectItem value="offer">Offer</SelectItem>
                                    <SelectItem value="booking">Booking</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('filters.dateRange')}</label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className="w-[300px] justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                    ) : (
                                    <span>{t('filters.pickDate')}</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Button>{t('filters.apply')}</Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.header.date')}</TableHead>
                                <TableHead>{t('table.header.actor')}</TableHead>
                                <TableHead>{t('table.header.action')}</TableHead>
                                <TableHead>{t('table.header.target')}</TableHead>
                                <TableHead>{t('table.header.result')}</TableHead>
                                <TableHead className="text-right">{t('table.header.details')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockAuditLogs.map((log) => {
                                const targetRoute = targetTypeRoutes[log.targetType];
                                const canNavigate = targetRoute && !log.targetId.startsWith('pi_');

                                return (
                                <TableRow key={log.id}>
                                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>{log.actorName}</TableCell>
                                    <TableCell><code className="text-sm bg-muted p-1 rounded-sm">{log.action}</code></TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            {canNavigate ? (
                                                <Button variant="link" asChild className="p-0 h-auto justify-start font-mono text-xs">
                                                    <Link href={`${targetRoute}/${log.targetId}`}>{log.targetId}</Link>
                                                </Button>
                                            ) : (
                                                <span className="font-mono text-xs">{log.targetId}</span>
                                            )}
                                            <span className="text-xs text-muted-foreground">{log.targetType}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={log.result === 'success' ? 'default' : 'destructive'}>
                                            {t(`table.results.${log.result}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => setIsDeltaDialogOpen(true)}>
                                                    <GitCommit className="mr-2 h-4 w-4" />
                                                    {t('actions.viewChanges')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        </>
    );
}
