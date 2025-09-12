
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
import { type Offer, type Task, TaskStatus } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import TaskStatusTimeline from '@/components/task-status-timeline';
import { useState } from 'react';

const OfferCard = ({ offer, onAccept }: { offer: Offer, onAccept: (offer: Offer) => void }) => {
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
          <Button size="sm" onClick={handleAccept} disabled={isAccepting}>
            {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            {t('accept')}
          </Button>
          <Button size="sm" variant="ghost">
            <MessageSquare className="mr-2 h-4 w-4" />
            {t('contact')}
          </Button>
        </div>
      </div>
    </div>
  );
};


export default function TaskDetailClientPage({ task: initialTask, offers: initialOffers }: { task: Task, offers: Offer[] }) {
  const t = useTranslations('TaskDetailPage');
  const tActions = useTranslations('TaskActions');
  const locale = useLocale();
  const [task, setTask] = useState(initialTask);
  const [offers, setOffers] = useState(initialOffers);

  const isMatched = task.status === TaskStatus.matched || task.status === TaskStatus.in_progress || task.status === TaskStatus.completed;

  const handleOfferAccepted = (acceptedOffer: Offer) => {
    // Visually update the UI to reflect the new state
    setTask(currentTask => ({...currentTask, status: TaskStatus.matched}));
    setOffers(currentOffers => 
      currentOffers.map(o => 
        o.id === acceptedOffer.id ? {...o, status: 'accepted'} : {...o, status: 'declined'}
      )
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
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
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80">{task.description}</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline">{t('offersReceived', { count: offers.length })}</h2>
            {offers.length > 0 ? (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} onAccept={handleOfferAccepted}/>
                ))}
              </div>
            ) : (
              <Card className="text-center p-8">
                <p className="text-muted-foreground">{t('noOffers')}</p>
              </Card>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <span className="text-4xl font-bold text-primary">{task.priceOffered}€</span>
              <CardDescription>{t('budget')}</CardDescription>
            </CardHeader>
          </Card>
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
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>{t('messaging.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isMatched ? (
                <Button className="w-full">
                  <MessageSquare className="mr-2"/>
                  {t('messaging.contactProvider')}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground text-center">{t('messaging.notMatched')}</p>
              )}
            </CardContent>
          </Card>
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

