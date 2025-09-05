
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, User, Calendar, Euro, ShieldAlert, Handshake, Check, X, Clock, Trash2, FileText, BadgeInfo } from 'lucide-react';
import { UserRole, Offer, OfferStatus } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { getOffers } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function AdminOfferDetailPage() {
    const { user: adminUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const offerId = params.id;
    const t = useTranslations('AdminOfferDetailPage');
    const tOffers = useTranslations('AdminOffersPage');
    const locale = useLocale();
    
    const [offer, setOffer] = useState<Offer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!adminUser || !adminUser.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [adminUser, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        const fetchedOffer = getOffers().find(o => o.id === offerId);
        if (fetchedOffer) {
            setOffer(fetchedOffer);
        }
        setLoading(false);
    }, [offerId]);

    if (authLoading || loading || !adminUser || !adminUser.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!offer) {
        return (
            <div className="text-center">
                <h1 className="text-xl">{t('notFound')}</h1>
                 <Button asChild variant="link"><Link href="/dashboard/admin/offers">{t('backToList')}</Link></Button>
            </div>
        )
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
    <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/admin/offers">
                    <ArrowLeft className="h-4 w-4"/>
                    <span className="sr-only">{t('backToList')}</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {t('title')}
                </h1>
                <p className="text-muted-foreground font-mono text-xs">
                    ID: {offer.id}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.offer.title')}</CardTitle>
                        <CardDescription>
                            {t('cards.offer.description', {
                                providerName: offer.provider.profile?.displayName,
                                taskTitle: offer.task?.title
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {offer.message && (
                            <>
                            <blockquote className="border-l-2 pl-6 italic text-muted-foreground">
                                {offer.message}
                            </blockquote>
                            <Separator className="my-4"/>
                            </>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <BadgeInfo className="h-4 w-4 text-primary"/>
                                <strong>{t('cards.offer.status')}:</strong>
                                <Badge variant={getStatusVariant(offer.status)}>{tOffers(`status.${offer.status}`)}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Euro className="h-4 w-4 text-primary"/>
                                <strong>{t('cards.offer.price')}:</strong>
                                <span>{offer.proposedPrice}€</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary"/>
                                <strong>{t('cards.offer.expires')}:</strong>
                                <span>{new Intl.DateTimeFormat(locale).format(offer.expiresAt)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.task.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-bold text-lg">{offer.task?.title}</p>
                        <p className="text-sm text-muted-foreground">{offer.task?.location}</p>
                        <div className="flex justify-end">
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/dashboard/admin/tasks/${offer.taskId}`}>
                                    <FileText className="mr-2"/>
                                    {t('cards.task.view')}
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.provider.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={offer.provider.profile?.photoUrl} />
                                <AvatarFallback>{offer.provider.profile?.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{offer.provider.profile?.displayName}</p>
                                <Button asChild variant="link" className="p-0 h-auto">
                                    <Link href={`/dashboard/admin/users/${offer.provider.id}`}>{t('cards.provider.viewProfile')}</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.moderation.title')}</CardTitle>
                        <CardDescription>{t('cards.moderation.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline"><Handshake className="mr-2"/>{t('cards.moderation.forceStatus')}</Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.moderation.forceStatusDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.moderation.forceStatusDialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <RadioGroup defaultValue="accept" className="py-2 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="accept" id="force-accept" />
                                        <Label htmlFor="force-accept" className="flex items-center gap-2"><Check className="text-green-600"/>{t('cards.moderation.forceStatusDialog.accept')}</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="decline" id="force-decline" />
                                        <Label htmlFor="force-decline" className="flex items-center gap-2"><X className="text-red-600"/>{t('cards.moderation.forceStatusDialog.decline')}</Label>
                                    </div>
                                </RadioGroup>
                                <div className="space-y-2 py-2">
                                    <Label htmlFor="justification">{t('cards.moderation.forceStatusDialog.justificationLabel')}</Label>
                                    <Textarea id="justification" placeholder={t('cards.moderation.forceStatusDialog.justificationPlaceholder')} />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cards.moderation.forceStatusDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction>{t('cards.moderation.forceStatusDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="mr-2"/>{t('cards.moderation.withdraw')}</Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.moderation.withdrawDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.moderation.withdrawDialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cards.moderation.withdrawDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction>{t('cards.moderation.withdrawDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button variant="outline" disabled><Clock className="mr-2"/>{t('cards.moderation.adjustExpiration')}</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}


    