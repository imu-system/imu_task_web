
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, Link } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Shield, MoreHorizontal, User, Eye } from 'lucide-react';
import { User as UserType, UserRole } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const mockUsers: any[] = [
    { id: 'usr_1', displayName: 'Nathan Imogo', email: 'nathan.imogo@outlook.fr', roles: ['admin', 'client'], status: 'active', kycStatus: 'verified', createdAt: '2023-01-15T10:00:00Z', lastActiveAt: '2023-10-26T12:00:00Z' },
    { id: 'usr_2', displayName: 'Jane Doe', email: 'jane.doe@example.com', roles: ['provider'], status: 'active', kycStatus: 'pending', createdAt: '2023-02-20T11:30:00Z', lastActiveAt: '2023-10-25T18:45:00Z' },
    { id: 'usr_3', displayName: 'John Smith', email: 'john.smith@example.com', roles: ['client'], status: 'suspended', kycStatus: 'not_required', createdAt: '2023-05-10T08:00:00Z', lastActiveAt: '2023-09-01T22:10:00Z' },
    { id: 'usr_4', displayName: 'Marie Curie', email: 'marie.curie@example.com', roles: ['provider', 'client'], status: 'active', kycStatus: 'verified', createdAt: '2022-12-01T15:20:00Z', lastActiveAt: '2023-10-26T11:55:00Z' },
];

export default function AdminUsersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminUsersPage');
    const tDashboard = useTranslations('DashboardNav');
    
    const [users, setUsers] = useState<any[]>(mockUsers);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);


    if (authLoading || loading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <User className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                {t('subtitle')}
                </p>
            </div>
             <div className="w-full md:w-1/3">
                <Input placeholder={t('searchPlaceholder')} />
            </div>
        </div>

       <Card>
            <CardHeader>
                <CardTitle>{t('tableTitle')}</CardTitle>
                <CardDescription>{t('tableDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.user')}</TableHead>
                            <TableHead>{t('table.role')}</TableHead>
                            <TableHead>{t('table.status')}</TableHead>
                            <TableHead>{t('table.kyc')}</TableHead>
                            <TableHead>{t('table.registeredAt')}</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={`https://i.pravatar.cc/150?u=${u.id}`} />
                                            <AvatarFallback>{u.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{u.displayName}</div>
                                            <div className="text-sm text-muted-foreground">{u.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {u.roles.map((role: string) => (
                                            <Badge key={role} variant={role === 'admin' ? 'destructive' : 'secondary'}>{t(`roles.${role}`)}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={u.status === 'active' ? 'default' : 'outline'}>{t(`status.${u.status}`)}</Badge>
                                </TableCell>
                                <TableCell>
                                     <Badge variant={u.kycStatus === 'verified' ? 'default' : (u.kycStatus === 'pending' ? 'secondary' : 'outline')}>
                                        {t(`kycStatus.${u.kycStatus}`)}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/admin/users/${u.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    {t('viewProfile')}
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
