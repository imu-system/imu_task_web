
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Handshake, Eye } from 'lucide-react';
import { UserRole, Offer, OfferStatus } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOffers } from '@/lib/data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const mockOffers: Offer[] = getOffers();

export default function AdminOffersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminOffersPage');
    const tDashboard = useTranslations('DashboardNav');
    const locale = useLocale();
    
    const [offers, setOffers] = useState<Offer[]>(mockOffers);
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
    
    const getStatusVariant = (status: OfferStatus) => {
        switch (status) {
            case OfferStatus.accepted: return 'default';
            case OfferStatus.pending: return 'secondary';
            case OfferStatus.declined:
            case OfferStatus.expired:
            case OfferStatus.withdrawn:
                return 'destructive';
            default: return 'outline';
        }
    }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Handshake className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                {t('subtitle')}
                </p>
            </div>
             <div className="w-full md:w-1/3">
                <Input placeholder={t('table.provider')} />
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
                            <TableHead>{t('table.id')}</TableHead>
                            <TableHead>{t('table.task')}</TableHead>
                            <TableHead>{t('table.provider')}</TableHead>
                            <TableHead>{t('table.price')}</TableHead>
                            <TableHead>{t('table.status')}</TableHead>
                            <TableHead>{t('table.expiresAt')}</TableHead>
                            <TableHead><span className="sr-only">{t('table.actions')}</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {offers.map((offer) => (
                            <TableRow key={offer.id}>
                                <TableCell>
                                    <div className="font-mono text-xs text-muted-foreground">{offer.id.substring(0,6)}...</div>
                                </TableCell>
                                <TableCell>
                                    <Link href={`/dashboard/admin/tasks/${offer.taskId}`} className="font-medium hover:underline">
                                        {offer.task?.title}
                                    </Link>
                                    <div className="text-sm text-muted-foreground font-mono">{offer.taskId.substring(0,6)}...</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={offer.provider.profile?.photoUrl} />
                                            <AvatarFallback>{offer.provider.profile?.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{offer.provider.profile?.displayName}</span>
                                    </div>
                                </TableCell>
                                 <TableCell>
                                    <div className="font-medium">{offer.proposedPrice}€</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(offer.status)}>{t(`status.${offer.status}`)}</Badge>
                                </TableCell>
                                 <TableCell>
                                    {offer.expiresAt ? new Intl.DateTimeFormat(locale).format(new Date(offer.expiresAt)) : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/dashboard/admin/offers/${offer.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            {t('details')}
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
