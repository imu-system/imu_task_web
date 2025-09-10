
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Eye } from 'lucide-react';
import { Link } from '@/navigation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const mockTickets = [
    { id: 'TKT-001', subject: "Problème de paiement pour la mission #task3", user: "Anne-Marie Dupont", status: "Open", priority: "High", assignedTo: "Emma Moreau", updatedAt: '2024-10-26T12:00:00Z' },
    { id: 'TKT-002', subject: "Comment annuler une mission ?", user: "Lucas Bernard", status: "In Progress", priority: "Medium", assignedTo: "Emma Moreau", updatedAt: '2024-10-26T11:30:00Z' },
    { id: 'TKT-003', subject: "Avis non visible sur mon profil", user: "Chloé Petit", status: "Closed", priority: "Low", assignedTo: "Admin", updatedAt: '2024-10-25T18:00:00Z' },
    { id: 'TKT-004', subject: "Le prestataire n'est pas venu", user: "Marc Dubois", status: "Open", priority: "High", assignedTo: "Unassigned", updatedAt: '2024-10-26T14:00:00Z' },
];

export default function AdminTicketsPage() {
    const t = useTranslations('AdminSupportPage.tickets');

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <CardTitle>{t('title')}</CardTitle>
                            <CardDescription>{t('description')}</CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/dashboard/admin/support/tickets/new">
                                <PlusCircle className="mr-2"/>{t('actions.create')}
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <Input placeholder={t('filters.searchPlaceholder')} className="max-w-sm" />
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('filters.status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('filters.priority')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.allPriorities')}</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.id')}</TableHead>
                                <TableHead>{t('table.subject')}</TableHead>
                                <TableHead>{t('table.user')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead>{t('table.priority')}</TableHead>
                                <TableHead>{t('table.agent')}</TableHead>
                                <TableHead><span className="sr-only">{t('table.actions')}</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTickets.map(ticket => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                                    <TableCell>{ticket.user}</TableCell>
                                    <TableCell><Badge>{ticket.status}</Badge></TableCell>
                                    <TableCell><Badge variant="secondary">{ticket.priority}</Badge></TableCell>
                                    <TableCell>{ticket.assignedTo}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/dashboard/admin/support/tickets/${ticket.id}`}>
                                                <Eye className="mr-2 h-4 w-4"/>
                                                {t('actions.view')}
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
