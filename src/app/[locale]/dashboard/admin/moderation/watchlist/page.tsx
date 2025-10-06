
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, User, Eye, UserX, AlertTriangle } from 'lucide-react';
import { Link } from '@/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

const mockWatchlist = [
    { id: 'watch1', user: { id: 'usr_3', name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?u=usr_3' }, reason: "Contenu inapproprié dans la bio (rapport #rep1)", addedBy: "Admin", date: '2024-10-27T10:00:00Z', risk: 'low' },
    { id: 'watch2', user: { id: 'usr_4', name: 'Marc Dubois', avatarUrl: 'https://i.pravatar.cc/150?u=usr_4' }, reason: "Signalé pour mission dangereuse (rapport #rep2)", addedBy: "Admin", date: '2024-10-27T11:00:00Z', risk: 'medium' },
];

const riskVariants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    low: 'secondary',
    medium: 'default',
    high: 'destructive'
}

export default function AdminWatchlistPage() {
    const t = useTranslations('AdminModerationPage.watchlist');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.user')}</TableHead>
                            <TableHead>{t('table.reason')}</TableHead>
                            <TableHead>{t('table.risk')}</TableHead>
                            <TableHead>{t('table.addedBy')}</TableHead>
                            <TableHead>{t('table.date')}</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockWatchlist.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={item.user.avatarUrl} />
                                            <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{item.user.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{item.reason}</TableCell>
                                <TableCell>
                                    <Badge variant={riskVariants[item.risk]}>
                                        <AlertTriangle className="mr-1 h-3 w-3"/>
                                        {t(`riskLevels.${item.risk}`)}
                                    </Badge>
                                </TableCell>
                                <TableCell>{item.addedBy}</TableCell>
                                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/admin/users/${item.user.id}`}>
                                                        <Eye className="mr-2"/>
                                                        {t('actions.viewProfile')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                        <UserX className="mr-2"/>
                                                        {t('actions.remove')}
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                         <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('dialog.title')}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('dialog.description', { name: item.user.name })}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
                                                <AlertDialogAction>{t('dialog.confirm')}</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
