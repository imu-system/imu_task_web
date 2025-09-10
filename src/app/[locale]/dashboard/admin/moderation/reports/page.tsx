
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, User, FileText, MessageSquare, Eye, ShieldOff, AlertTriangle } from 'lucide-react';
import { Link } from '@/navigation';
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

const mockReports = [
    { id: 'rep1', type: 'Utilisateur', content: 'John Smith', reporter: 'Anne-Marie Dupont', reason: 'Contenu inapproprié dans la bio', date: '2024-10-26T10:00:00Z', link: '/dashboard/admin/users/usr_3' },
    { id: 'rep2', type: 'Mission', content: 'Nettoyage de printemps extrême', reporter: 'Lucas Bernard', reason: 'Mission dangereuse/irréalisable', date: '2024-10-25T14:30:00Z', link: '/dashboard/admin/tasks/task_xyz' },
    { id: 'rep3', type: 'Message', content: 'Message de Chloé Petit', reporter: 'Marc Dubois', reason: 'Harcèlement', date: '2024-10-24T09:00:00Z', link: '/dashboard/admin/messages/thread_abc' },
];

const reportIcons: { [key: string]: React.ReactNode } = {
    'Utilisateur': <User className="h-4 w-4" />,
    'Mission': <FileText className="h-4 w-4" />,
    'Message': <MessageSquare className="h-4 w-4" />,
}


export default function AdminModerationReportsPage() {
    const t = useTranslations('AdminModerationPage.reports');

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
                            <TableHead>{t('table.type')}</TableHead>
                            <TableHead>{t('table.content')}</TableHead>
                            <TableHead>{t('table.reporter')}</TableHead>
                            <TableHead>{t('table.reason')}</TableHead>
                            <TableHead>{t('table.date')}</TableHead>
                             <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockReports.map(report => (
                            <TableRow key={report.id}>
                                <TableCell>
                                    <Badge variant="secondary" className="flex items-center gap-2">
                                        {reportIcons[report.type]}
                                        {report.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <Link href={report.link} className="hover:underline">{report.content}</Link>
                                </TableCell>
                                <TableCell>{report.reporter}</TableCell>
                                <TableCell>{report.reason}</TableCell>
                                <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/admin/moderation/reports/view/${report.id}`}>
                                                        <Eye className="mr-2"/>
                                                        {t('table.actions.view')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <ShieldOff className="mr-2"/>
                                                        {t('table.actions.dismiss')}
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                 <DropdownMenuItem className="text-destructive">
                                                    <AlertTriangle className="mr-2"/>
                                                    {t('table.actions.takeAction')}
                                                 </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('dialogs.dismiss.title')}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('dialogs.dismiss.description')}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('dialogs.dismiss.cancel')}</AlertDialogCancel>
                                                <AlertDialogAction>{t('dialogs.dismiss.confirm')}</AlertDialogAction>
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
