
'use client';

import { Link } from '@/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Calendar,
  MapPin,
  ShieldCheck,
  Star,
  MessageSquare,
  UserCheck,
  Edit,
  Trash2,
  Receipt,
  Loader2,
  ShieldAlert,
  Paperclip,
  Users,
} from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type Offer, type Task, TaskStatus, UserRole, OfferStatus } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import TaskStatusTimeline from '@/components/task-status-timeline';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { OfferForm } from '@/components/offer-form';

const OfferCard = ({ offer, onAccept, disabled }: { offer: Offer, onAccept: (offer: Offer) => void, disabled: boolean }) => {
  const { toast } = useToast();
  const t = useTranslations('OfferCard');
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
        title: t('toastAcceptTitle'),
        description: t('toastAcceptDescription', { name: offer.provider.profile?.displayName }),
    });
    onAccept(offer);
    setIsAccepting(false);
  }

  return (
    <div className="flex items-start gap-4 rounded-lg border p-4">
      <Avatar>
        <AvatarImage src={offer.provider.profile?.photoUrl} />
        <AvatarFallback>{offer.provider.profile?.displayName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{offer.provider.profile?.displayName}</p>
            <div className="flex items-center gap-0.5 text-yellow-500">
                <Star className='h-4 w-4 fill-current' />
                <Star className='h-4 w-4 fill-current' />
                <Star className='h-4 w-4 fill-current' />
                <Star className='h-4 w-4 fill-current' />
                <Star className='h-4 w-4 text-muted-foreground fill-muted-foreground' />
                <span className="text-xs text-muted-foreground ml-1">{t('reviews', { count: 12 })}</span>
            </div>
          </div>
          <p className="text-lg font-bold text-primary">{offer.proposedPrice}€</p>
        </div>
        <p className="text-sm text-muted-foreground bg-accent/20 p-3 rounded-md">
          {offer.message}
        </p>
        <div className="flex gap-2 pt-2">
          <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" disabled={isAccepting || disabled}>
                    {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {t('accept')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>{t('confirmAccept.title')}</AlertDialogTitle>
                      <AlertDialogDescription>
                          {t('confirmAccept.description', { amount: offer.proposedPrice, name: offer.provider.profile?.displayName })}
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>{t('confirmAccept.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleAccept} disabled={isAccepting}>
                         {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                         {t('confirmAccept.confirm')}
                      </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
          <Button size="sm" variant="ghost">
            <MessageSquare className="mr-2 h-4 w-4" />
            {t('contact')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProviderActions = ({ task }: { task: Task }) => {
    const t = useTranslations('TaskDetailPage');
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('providerActions.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full" size="lg">{t('providerActions.makeOffer')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <OfferForm task={task} />
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}

const ClientActions = ({ offers, onAccept, task }: { offers: Offer[], onAccept: (offer: Offer) => void, task: Task }) => {
    const t = useTranslations('TaskDetailPage');
    const acceptedOffersCount = offers.filter(o => o.status === OfferStatus.accepted).length;
    const requiredProviders = task.numberOfProvidersRequired || 1;
    const isFullyBooked = acceptedOffersCount >= requiredProviders;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-headline">{t('offersReceived', { count: offers.length })}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4"/>
                    <span>{t('providersNeeded', { accepted: acceptedOffersCount, required: requiredProviders })}</span>
                </div>
            </div>
            {offers.length > 0 ? (
                <div className="space-y-4">
                    {offers.map((offer) => (
                        <OfferCard key={offer.id} offer={offer} onAccept={onAccept} disabled={isFullyBooked || offer.status !== OfferStatus.pending}/>
                    ))}
                </div>
            ) : (
                <Card className="text-center p-8">
                    <p className="text-muted-foreground">{t('noOffers')}</p>
                </Card>
            )}
        </div>
    )
}


export default function TaskDetailContent({ task: initialTask, offers: initialOffers }: { task: Task, offers: Offer[] }) {
  const { user } = useAuth();
  const t = useTranslations('TaskDetailPage');
  const tActions = useTranslations('TaskActions');
  const locale = useLocale();
  const [task, setTask] = useState(initialTask);
  const [offers, setOffers] = useState(initialOffers);
  const { toast } = useToast();

  const isClient = user?.uid === task.clientId;
  const isProvider = user?.roles?.includes(UserRole.provider) ?? false;
  const isMatched = task.status === TaskStatus.matched || task.status === TaskStatus.in_progress || task.status === TaskStatus.completed;

  const handleOfferAccepted = (acceptedOffer: Offer) => {
    const updatedOffers = offers.map(o => 
      o.id === acceptedOffer.id ? { ...o, status: OfferStatus.accepted } : o
    );
    setOffers(updatedOffers);

    const newAcceptedCount = updatedOffers.filter(o => o.status === OfferStatus.accepted).length;
    const requiredCount = task.numberOfProvidersRequired || 1;

    let newStatus = task.status;
    if (newAcceptedCount >= requiredCount) {
      newStatus = TaskStatus.matched;
    } else {
      newStatus = TaskStatus.partially_matched;
    }

    setTask(currentTask => ({ ...currentTask, status: newStatus }));
  }

  const handleReportProblem = () => {
    toast({
      title: tActions('reportProblem.toastSuccessTitle'),
      description: tActions('reportProblem.toastSuccessDescription'),
    });
  }

  return (
    <div className="p-2 space-y-8">
      <TaskStatusTimeline currentStatus={task.status} />
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">
                {task.category?.name[locale as 'fr' | 'en'] || task.categoryId}
              </Badge>
              <CardTitle className="text-3xl font-headline">{task.title}</CardTitle>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{task.address?.formatted || task.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    }).format(new Date(task.timeWindowStart))}
                  </span>
                </div>
                 {task.numberOfProvidersRequired && task.numberOfProvidersRequired > 1 && (
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{t('providersRequired', { count: task.numberOfProvidersRequired })}</span>
                    </div>
                 )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80">{task.description}</p>
            </CardContent>
          </Card>

          {isClient ? <ClientActions offers={offers} onAccept={handleOfferAccepted} task={task} /> : null}
          {!isClient && isProvider ? <ProviderActions task={task}/> : null}
          
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <span className="text-4xl font-bold text-primary">{task.priceOffered}€</span>
              <CardDescription>{t('budget')}</CardDescription>
            </CardHeader>
          </Card>
           {isClient && (
            <Card>
                <CardHeader>
                <CardTitle>{t('actions.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-2">
                <Button asChild variant="outline" disabled={isMatched}>
                    <Link href={`/dashboard/tasks/${task.id}/edit`}>
                    <Edit className="mr-2" />{t('actions.edit')}
                    </Link>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isMatched}>
                            <Trash2 className="mr-2" />{t('actions.cancel')}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{tActions('cancelDialogTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>{tActions('cancelDialogDescription')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{tActions('cancelDialogCancel')}</AlertDialogCancel>
                            <AlertDialogAction>{tActions('cancelDialogConfirm')}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Separator />
                <Button variant="outline" disabled={task.status !== TaskStatus.completed}>
                    <Receipt className="mr-2" />{t('actions.receipt')}
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <Button variant="outline">
                        <ShieldAlert className="mr-2"/>{t('actions.reportProblem')}
                    </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{tActions('reportProblem.title')}</AlertDialogTitle>
                        <AlertDialogDescription>{tActions('reportProblem.description')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                        <Label htmlFor="reason">{tActions('reportProblem.reasonLabel')}</Label>
                        <Select>
                            <SelectTrigger id="reason">
                            <SelectValue placeholder={tActions('reportProblem.reasonPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="no_show">{tActions('reportProblem.reasons.noShow')}</SelectItem>
                            <SelectItem value="quality">{tActions('reportProblem.reasons.quality')}</SelectItem>
                            <SelectItem value="delay">{tActions('reportProblem.reasons.delay')}</SelectItem>
                            <SelectItem value="other">{tActions('reportProblem.reasons.other')}</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="comment">{tActions('reportProblem.commentLabel')}</Label>
                        <Textarea id="comment" placeholder={tActions('reportProblem.commentPlaceholder')} />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="attachments">{tActions('reportProblem.attachmentsLabel')}</Label>
                        <Button variant="outline" asChild className="w-full">
                            <label>
                            <Paperclip className="mr-2"/>{tActions('reportProblem.attachmentsButton')}
                            <input type="file" className="sr-only"/>
                            </label>
                        </Button>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{tActions('cancelDialogCancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReportProblem}>{tActions('reportProblem.submitButton')}</AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </CardContent>
            </Card>
           )}
           {isClient && isMatched && (
                <Card>
                    <CardHeader>
                    <CardTitle>{t('messaging.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <Button className="w-full">
                        <MessageSquare className="mr-2"/>
                        {t('messaging.contactProvider')}
                    </Button>
                    </CardContent>
                </Card>
           )}
          <Card>
            <CardHeader>
              <CardTitle>{t('client')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={task.client?.profile?.photoUrl || undefined} />
                  <AvatarFallback>
                    {task.client?.profile?.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{task.client?.profile?.displayName}</p>
                  <p className="text-sm text-muted-foreground">{t('memberSince', { year: 2023 })}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                 <div className="flex items-center gap-2 text-green-600">
                    <ShieldCheck className="h-4 w-4"/>
                    <span>{t('identityVerified')}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground"/>
                    <span>{t('paymentVerified')}</span>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
