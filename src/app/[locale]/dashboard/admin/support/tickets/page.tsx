
      
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const mockTickets = [
    { id: 'TKT-001', subject: "Problème de paiement", user: "Anne-Marie Dupont", status: "Open", priority: "High", assignedTo: "Emma Moreau" },
    { id: 'TKT-002', subject: "Comment annuler une mission ?", user: "Lucas Bernard", status: "In Progress", priority: "Medium", assignedTo: "Emma Moreau" },
    { id: 'TKT-003', subject: "Avis non visible", user: "Chloé Petit", status: "Closed", priority: "Low", assignedTo: "Admin" },
];

export default function AdminTicketsPage() {
    const t = useTranslations('AdminSupportPage.tickets');

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.id')}</TableHead>
                                <TableHead>{t('table.subject')}</TableHead>
                                <TableHead>{t('table.user')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead>{t('table.priority')}</TableHead>
                                <TableHead>{t('table.agent')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTickets.map(ticket => (
                                <TableRow key={ticket.id}>
                                    <TableCell>{ticket.id}</TableCell>
                                    <TableCell>{ticket.subject}</TableCell>
                                    <TableCell>{ticket.user}</TableCell>
                                    <TableCell><Badge>{ticket.status}</Badge></TableCell>
                                    <TableCell><Badge variant="secondary">{ticket.priority}</Badge></TableCell>
                                    <TableCell>{ticket.assignedTo}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

    