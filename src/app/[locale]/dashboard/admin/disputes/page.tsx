
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, BadgeAlert, Eye } from 'lucide-react';
import { UserRole, Dispute, DisputeStatus } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDisputes } from '@/lib/data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const mockDisputes: Dispute[] = getDisputes();

export default function AdminDisputesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminDisputesPage');
    
    const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
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
    
    const getStatusVariant = (status: DisputeStatus) => {
        switch (status) {
            case DisputeStatus.resolved_no_refund:
            case DisputeStatus.resolved_refund_full:
            case DisputeStatus.resolved_refund_partial:
                 return 'default';
            case DisputeStatus.open: return 'destructive';
            case DisputeStatus.under_review: return 'secondary';
            case DisputeStatus.canceled: return 'outline';
            default: return 'outline';
        }
    }

  return (
    <div className="space-y-8 mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <BadgeAlert className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                {t('subtitle')}
                </p>
            </div>
        </div>

       <Card>
            <CardHeader>
                <CardTitle>{t('table.title')}</CardTitle>
                <CardDescription>{t('table.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.header.id')}</TableHead>
                            <TableHead>{t('table.header.booking')}</TableHead>
                            <TableHead>{t('table.header.type')}</TableHead>
                            <TableHead>{t('table.header.status')}</TableHead>
                            <TableHead>{t('table.header.sla')}</TableHead>
                            <TableHead>{t('table.header.agent')}</TableHead>
                            <TableHead><span className="sr-only">{t('table.header.actions')}</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {disputes.map((dispute) => (
                            <TableRow key={dispute.id}>
                                <TableCell>
                                    <div className="font-mono text-xs text-muted-foreground">{dispute.id.substring(0,6)}...</div>
                                </TableCell>
                                <TableCell>
                                    <Button variant="link" asChild className="p-0 h-auto font-mono">
                                        <Link href={`/dashboard/admin/bookings/${dispute.bookingId || 'unknown'}`}>{(dispute.bookingId || 'N/A').substring(0,6)}...</Link>
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{t(`types.${dispute.type}`)}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(dispute.status)}>{t(`status.${dispute.status}`)}</Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-muted-foreground">{t('mockSla')}</span>
                                </TableCell>
                                <TableCell>
                                    {dispute.assignedTo ? (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={dispute.assignedTo.profile?.photoUrl} />
                                                <AvatarFallback>{dispute.assignedTo.profile?.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{dispute.assignedTo.profile?.displayName}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">{t('unassigned')}</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/dashboard/admin/disputes/${dispute.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            {t('table.actions.details')}
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

