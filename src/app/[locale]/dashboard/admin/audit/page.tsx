
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, History, MoreHorizontal, Eye } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { users } from '@/lib/data';

const mockAuditLogs = [
    { id: 'log1', actorId: 'user1', actorName: users.find(u=> u.id === 'user1')?.profile?.displayName, action: 'user.login', targetType: 'user', targetId: 'user1', createdAt: new Date('2024-08-27T10:00:00Z'), result: 'success' },
    { id: 'log2', actorId: 'usr_1', actorName: 'Nathan Imogo', action: 'category.update', targetType: 'serviceCategory', targetId: 'cat_abc123', createdAt: new Date('2024-08-27T09:45:00Z'), result: 'success' },
    { id: 'log3', actorId: 'user2', actorName: users.find(u=> u.id === 'user2')?.profile?.displayName, action: 'offer.create', targetType: 'offer', targetId: 'offer_xyz789', createdAt: new Date('2024-08-27T09:30:00Z'), result: 'success' },
    { id: 'log4', actorId: 'usr_1', actorName: 'Nathan Imogo', action: 'user.suspend', targetType: 'user', targetId: 'user3', createdAt: new Date('2024-08-26T18:00:00Z'), result: 'success' },
    { id: 'log5', actorId: 'system', actorName: 'System', action: 'payment.failed', targetType: 'transaction', targetId: 'pi_123abc', createdAt: new Date('2024-08-26T15:20:00Z'), result: 'failure' },
];

export default function AdminAuditLogPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminAuditLogPage');

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
                    <History className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('table.title')}</CardTitle>
                    <CardDescription>{t('table.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <Input 
                            placeholder={t('filters.searchPlaceholder')}
                            className="max-w-xs"
                        />
                        <Select>
                            <SelectTrigger className="w-full md:w-[240px]">
                                <SelectValue placeholder={t('filters.action')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.allActions')}</SelectItem>
                                <SelectItem value="user.login">user.login</SelectItem>
                                <SelectItem value="category.update">category.update</SelectItem>
                                <SelectItem value="offer.create">offer.create</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">{t('filters.apply')}</Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.header.date')}</TableHead>
                                <TableHead>{t('table.header.actor')}</TableHead>
                                <TableHead>{t('table.header.action')}</TableHead>
                                <TableHead>{t('table.header.target')}</TableHead>
                                <TableHead>{t('table.header.details')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockAuditLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>{log.actorName}</TableCell>
                                    <TableCell><code className="text-sm bg-muted p-1 rounded-sm">{log.action}</code></TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs">{log.targetId}</span>
                                            <span className="text-xs text-muted-foreground">{log.targetType}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
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
