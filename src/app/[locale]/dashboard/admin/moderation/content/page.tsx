
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, User, FileText, MessageSquare, Eye, ShieldOff, AlertTriangle } from 'lucide-react';
import { Link } from '@/navigation';

const mockFlaggedContent = [
    { id: 'flag1', type: 'Profil', content: "Bio de John Smith", reason: 'Langage potentiellement haineux détecté par IA', date: '2024-10-26T14:00:00Z', link: '/dashboard/admin/users/usr_3' },
    { id: 'flag2', type: 'Mission', content: "Besoin d'aide pour 'projet secret'", reason: "Termes ambigus et potentiellement non conformes", date: '2024-10-25T16:00:00Z', link: '/dashboard/admin/tasks/task_abc' },
    { id: 'flag3', type: 'Message', content: 'Message de Chloé vers Marc', reason: 'Détection de numéro de téléphone', date: '2024-10-24T11:00:00Z', link: '#' },
];

const contentTypeIcons: { [key: string]: React.ReactNode } = {
    'Profil': <User className="h-4 w-4" />,
    'Mission': <FileText className="h-4 w-4" />,
    'Message': <MessageSquare className="h-4 w-4" />,
};

export default function AdminModerationContentPage() {
    const t = useTranslations('AdminModerationPage.content');

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
                            <TableHead>{t('table.reason')}</TableHead>
                            <TableHead>{t('table.date')}</TableHead>
                             <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockFlaggedContent.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>
                                     <Badge variant="secondary" className="flex items-center gap-2">
                                        {contentTypeIcons[item.type]}
                                        {item.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <Link href={item.link} className="hover:underline">{item.content}</Link>
                                </TableCell>
                                <TableCell>{item.reason}</TableCell>
                                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreHorizontal/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={item.link}>
                                                    <Eye className="mr-2"/>
                                                    {t('table.actions.review')}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <ShieldOff className="mr-2"/>
                                                {t('table.actions.dismiss')}
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
    );
}
