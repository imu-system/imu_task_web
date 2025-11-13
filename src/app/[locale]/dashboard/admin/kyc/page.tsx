
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, FileCheck2, MoreHorizontal, Eye } from 'lucide-react';
import { UserRole, KYCStatus } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const mockKycRequests = [
    { id: 'usr_2', providerName: 'Jane Doe', email: 'jane.doe@example.com', country: 'FR', status: KYCStatus.pending, submittedAt: '2023-10-26T10:00:00Z', documents: ['identity', 'selfie'] },
    { id: 'usr_5', providerName: 'Ahmed Benali', email: 'ahmed.benali@example.com', country: 'BE', status: KYCStatus.pending, submittedAt: '2023-10-25T14:30:00Z', documents: ['identity'] },
    { id: 'usr_6', providerName: 'Sophie Dubois', email: 'sophie.dubois@example.com', country: 'FR', status: KYCStatus.rejected, submittedAt: '2023-10-24T09:00:00Z', documents: ['identity', 'selfie'] },
];

export default function AdminKycPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminKycPage');
    const tUsers = useTranslations('AdminUsersPage');
    
    const [kycRequests, setKycRequests] = useState<any[]>(mockKycRequests);
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
    
    const getKycVariant = (kycStatus: string) => {
        switch (kycStatus) {
            case 'verified': return 'default';
            case 'pending': return 'secondary';
            case 'rejected': return 'destructive';
            default: return 'outline';
        }
    }

  return (
    <div className="space-y-8 mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                {t('subtitle')}
                </p>
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
                            <TableHead>{t('table.provider')}</TableHead>
                            <TableHead>{t('table.country')}</TableHead>
                            <TableHead>{t('table.status')}</TableHead>
                            <TableHead>{t('table.submittedAt')}</TableHead>
                            <TableHead>{t('table.documents')}</TableHead>
                            <TableHead><span className="sr-only">{t('table.actions')}</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {kycRequests.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={`https://i.pravatar.cc/150?u=${req.id}`} />
                                            <AvatarFallback>{req.providerName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{req.providerName}</div>
                                            <div className="text-sm text-muted-foreground">{req.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{req.country}</TableCell>
                                <TableCell>
                                    <Badge variant={getKycVariant(req.status)}>{tUsers(`kycStatus.${req.status}`)}</Badge>
                                </TableCell>
                                <TableCell>{new Date(req.submittedAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {req.documents.map((docType:string) => (
                                            <Badge key={docType} variant="outline" className="flex gap-1 items-center">
                                                <FileCheck2 className="h-3 w-3"/>
                                                {t(`documents.${docType}`)}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/dashboard/admin/kyc/${req.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            {t('actions.review')}
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
