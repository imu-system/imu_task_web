
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, User, Calendar, MapPin, Euro, ShieldAlert, BadgeInfo, PlayCircle, Ban, Trash2, EyeOff, FileBox } from 'lucide-react';
import { UserRole, Task, Offer, OfferStatus, TaskStatus } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { getTasks, getOffersForTask } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export default function AdminTaskDetailPage() {
    const { user: adminUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const taskId = params.id;
    const t = useTranslations('AdminTaskDetailPage');
    const tTaskStatus = useTranslations('AdminTasksPage.status');
    const locale = useLocale();
    
    const [task, setTask] = useState<Task | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!adminUser || !adminUser.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [adminUser, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        const fetchedTask = getTasks().find(t => t.id === taskId);
        if (fetchedTask) {
            setTask(fetchedTask);
            const fetchedOffers = getOffersForTask(taskId);
            setOffers(fetchedOffers);
        }
        setLoading(false);
    }, [taskId]);

    if (authLoading || loading || !adminUser || !adminUser.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!task) {
        return (
            <div className="text-center">
                <h1 className="text-xl">{t('notFound')}</h1>
                 <Button asChild variant="link"><Link href="/dashboard/admin/tasks">{t('backToList')}</Link></Button>
            </div>
        )
    }

    const getStatusVariant = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.published: return 'default';
            case TaskStatus.matched: return 'secondary';
            case TaskStatus.completed: return 'outline';
            case TaskStatus.canceled: return 'destructive';
            default: return 'outline';
        }
    }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/admin/tasks">
                    <ArrowLeft className="h-4 w-4"/>
                    <span className="sr-only">{t('backToList')}</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {t('title')}
                </h1>
                <p className="text-muted-foreground font-mono text-xs">
                    ID: {task.id}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{task.title}</CardTitle>
                        <CardDescription>{t('postedBy')} <Link href={`/dashboard/admin/users/${task.client.id}`} className="text-primary hover:underline">{task.client.profile?.displayName}</Link></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{task.description}</p>
                        <Separator className="my-4"/>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <BadgeInfo className="h-4 w-4 text-primary"/>
                                <strong>{t('details.status')}:</strong>
                                <Badge variant={getStatusVariant(task.status)}>{tTaskStatus(task.status)}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Euro className="h-4 w-4 text-primary"/>
                                <strong>{t('details.budget')}:</strong>
                                <span>{task.price}€</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary"/>
                                <strong>{t('details.date')}:</strong>
                                <span>{new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(task.date))}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary"/>
                                <strong>{t('details.location')}:</strong>
                                <span>{task.location}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('offers.title')}</CardTitle>
                        <CardDescription>{t('offers.description', { count: offers.length })}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('offers.provider')}</TableHead>
                                    <TableHead>{t('offers.price')}</TableHead>
                                    <TableHead>{t('offers.status')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {offers.length > 0 ? offers.map(offer => (
                                    <TableRow key={offer.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={offer.provider.profile?.photoUrl} />
                                                    <AvatarFallback>{offer.provider.profile?.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <Link href={`/dashboard/admin/users/${offer.provider.id}`} className="font-medium hover:underline">{offer.provider.profile?.displayName}</Link>
                                            </div>
                                        </TableCell>
                                        <TableCell>{offer.proposedPrice}€</TableCell>
                                        <TableCell>
                                            <Badge variant={offer.status === OfferStatus.accepted ? 'default' : 'secondary'}>
                                                {offer.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">{t('offers.noOffers')}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('moderation.title')}</CardTitle>
                        <CardDescription>{t('moderation.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-2">
                        <Button variant="outline"><PlayCircle className="mr-2"/>{t('moderation.forcePublish')}</Button>
                        <Button variant="outline"><Ban className="mr-2"/>{t('moderation.unpublish')}</Button>
                        <Button variant="outline"><EyeOff className="mr-2"/>{t('moderation.hideInfo')}</Button>
                        <Button variant="outline" disabled><FileBox className="mr-2"/>{t('moderation.asTemplate')}</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="mr-2"/>{t('moderation.cancel')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('moderation.cancelDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('moderation.cancelDialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-2 py-2">
                                    <Label htmlFor="cancellation-reason">{t('moderation.cancelDialog.reasonLabel')}</Label>
                                    <Textarea id="cancellation-reason" placeholder={t('moderation.cancelDialog.reasonPlaceholder')} />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('moderation.cancelDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction>{t('moderation.cancelDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('flags.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{t('flags.noFlags')}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
