
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, User, Calendar, ShieldAlert, BadgeAlert, FileText, UserCog, MessageSquare, Euro, Check, X, Shield, Clock } from 'lucide-react';
import { UserRole, Dispute, DisputeStatus, DisputeType } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { getDisputeById, users } from '@/lib/data';
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
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const moderators = users.filter(u => u.roles.includes(UserRole.moderator));

export default function AdminDisputeDetailPage() {
    const { user: adminUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const disputeId = params.id;
    const t = useTranslations('AdminDisputeDetailPage');
    const tDisputes = useTranslations('AdminDisputesPage');
    const locale = useLocale();
    const { toast } = useToast();
    
    const [dispute, setDispute] = useState<Dispute | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!adminUser || !adminUser.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [adminUser, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        const fetchedDispute = getDisputeById(disputeId);
        if (fetchedDispute) {
            setDispute(fetchedDispute);
        }
        setLoading(false);
    }, [disputeId]);

    const handleAssign = () => {
        toast({
            title: t('toast.assignSuccessTitle'),
            description: t('toast.assignSuccessDescription'),
        });
    }

    const handleStatusChange = () => {
        toast({
            title: t('toast.statusChangeSuccessTitle'),
            description: t('toast.statusChangeSuccessDescription'),
        });
    }
    
    const handleRefund = () => {
         toast({
            title: t('toast.refundSuccessTitle'),
            description: t('toast.refundSuccessDescription'),
        });
    }


    if (authLoading || loading || !adminUser || !adminUser.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!dispute) {
        return (
            <div className="text-center">
                <h1 className="text-xl">{t('notFound')}</h1>
                 <Button asChild variant="link"><Link href="/dashboard/admin/disputes">{t('backToList')}</Link></Button>
            </div>
        )
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
    
    const historyEvents = [
        { icon: <BadgeAlert className="h-5 w-5" />, titleKey: "disputeOpened", timestamp: dispute.createdAt, by: dispute.openedBy?.profile.displayName },
        { icon: <UserCog className="h-5 w-5" />, titleKey: "assignedToModerator", timestamp: dispute.updatedAt, by: adminUser.profile?.displayName },
        { icon: <MessageSquare className="h-5 w-5" />, titleKey: "noteAdded", timestamp: new Date(), by: "Admin" },
        { icon: <Check className="h-5 w-5" />, titleKey: "disputeResolved", timestamp: dispute.resolvedAt, by: dispute.assignedTo?.profile.displayName },
    ].filter(event => event.timestamp);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/admin/disputes">
                    <ArrowLeft className="h-4 w-4"/>
                    <span className="sr-only">{t('backToList')}</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {t('title')}
                </h1>
                <p className="text-muted-foreground font-mono text-xs">
                    ID: {dispute.id}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.details.title')}</CardTitle>
                        <CardDescription>
                            {t('cards.details.description', {
                                type: tDisputes(`types.${dispute.type}`),
                                user: dispute.openedBy?.profile.displayName,
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <blockquote className="border-l-2 pl-6 italic text-muted-foreground">
                            {dispute.description}
                        </blockquote>

                        {dispute.attachments && dispute.attachments.length > 0 && (
                            <>
                            <Separator className="my-4"/>
                            <h4 className="font-semibold mb-2">{t('cards.details.attachments')}</h4>
                            <div className="flex flex-wrap gap-4">
                                {dispute.attachments.map((url, index) => (
                                    <Link key={index} href={url} target="_blank">
                                        <Image src={url} alt={`Attachment ${index+1}`} width={200} height={150} className="rounded-lg border hover:opacity-80 transition-opacity" data-ai-hint="evidence document"/>
                                    </Link>
                                ))}
                            </div>
                            </>
                        )}
                        <Separator className="my-4"/>
                        <div className="text-sm">
                            <strong>{t('cards.details.bookingId')}: </strong>
                            <Button asChild variant="link" className="p-0 h-auto">
                                <Link href={`/dashboard/admin/bookings/${dispute.bookingId}`}>{dispute.bookingId}</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.timeline.title')}</CardTitle>
                        <CardDescription>{t('cards.timeline.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-6">
                            {historyEvents.map((event, index) => (
                                <li key={index} className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                            {event.icon}
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-semibold">{t(`cards.timeline.events.${event.titleKey}`)}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.timestamp!))}
                                            {' par '}
                                            <span className="font-medium">{event.by}</span>
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

            </div>

            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.context.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold">{t('cards.context.client')}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={dispute.booking?.client?.profile?.photoUrl} />
                                    <AvatarFallback>{dispute.booking?.client?.profile?.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Link href={`/dashboard/admin/users/${dispute.booking?.client?.id}`} className="text-sm hover:underline">{dispute.booking?.client?.profile?.displayName}</Link>
                            </div>
                        </div>
                         <Separator/>
                        <div>
                            <h3 className="font-semibold">{t('cards.context.provider')}</h3>
                             <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={dispute.booking?.provider?.profile?.photoUrl} />
                                    <AvatarFallback>{dispute.booking?.provider?.profile?.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Link href={`/dashboard/admin/users/${dispute.booking?.provider?.id}`} className="text-sm hover:underline">{dispute.booking?.provider?.profile?.displayName}</Link>
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
                                <Button variant="outline"><UserCog className="mr-2"/>{t('cards.moderation.assign')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.moderation.assignDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.moderation.assignDialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                     <Select defaultValue={dispute.assignedToId || undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('cards.moderation.assignDialog.selectPlaceholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {moderators.map(mod => (
                                                <SelectItem key={mod.id} value={mod.id}>{mod.profile.displayName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <AlertDialogFooter>
                                <AlertDialogCancel>{t('cards.moderation.assignDialog.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={handleAssign}>{t('cards.moderation.assignDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline"><Shield className="mr-2"/>{t('cards.moderation.changeStatus')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.moderation.statusDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.moderation.statusDialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4 space-y-4">
                                    <Select defaultValue={dispute.status}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(DisputeStatus).map(s => (
                                                <SelectItem key={s} value={s}>{tDisputes(`status.${s}`)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div>
                                        <Label htmlFor="status-note">{t('cards.moderation.statusDialog.noteLabel')}</Label>
                                        <Textarea id="status-note" placeholder={t('cards.moderation.statusDialog.notePlaceholder')} />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cards.moderation.statusDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleStatusChange}>{t('cards.moderation.statusDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><Euro className="mr-2"/>{t('cards.moderation.triggerRefund')}</Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.moderation.refundDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.moderation.refundDialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4 space-y-4">
                                     <div>
                                        <Label htmlFor="refund-amount">{t('cards.moderation.refundDialog.amountLabel')}</Label>
                                        <Input id="refund-amount" type="number" placeholder="20.00" />
                                     </div>
                                    <div>
                                        <Label htmlFor="refund-note">{t('cards.moderation.refundDialog.noteLabel')}</Label>
                                        <Textarea id="refund-note" placeholder={t('cards.moderation.refundDialog.notePlaceholder')} />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cards.moderation.refundDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRefund}>{t('cards.moderation.refundDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

