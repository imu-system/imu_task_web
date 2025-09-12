'use client';

import { getOffersForTask, getTasks } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Offer } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

const OfferCard = ({ offer }: { offer: Offer }) => {
  const { toast } = useToast();
  const t = useTranslations('OfferCard');

  const handleAccept = () => {
    toast({
        title: t('toastAcceptTitle'),
        description: t('toastAcceptDescription', { name: offer.provider.profile?.displayName }),
    });
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
          <Button size="sm" onClick={handleAccept}>{t('accept')}</Button>
          <Button size="sm" variant="ghost">
            <MessageSquare className="mr-2 h-4 w-4" />
            {t('contact')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const OfferForm = () => {
  const t = useTranslations('OfferForm');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price">{t('priceLabel')}</Label>
          <Input id="price" type="number" placeholder="25" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">{t('messageLabel')}</Label>
          <Textarea
            id="message"
            placeholder={t('messagePlaceholder')}
          />
        </div>
        <Button className="w-full">{t('submit')}</Button>
      </CardContent>
    </Card>
  );
};

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const task = getTasks().find((t) => t.id === id);
  const offers = getOffersForTask(id);
  const t = useTranslations('TaskDetailPage');
  const locale = useLocale();

  // Mock current user role for demonstration
  const [isClientView, setIsClientView] = useState(true);

  if (!task) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-2 text-sm mb-4">
        <Label htmlFor="role-switch">{t('clientView')}</Label>
        <Switch
          id="role-switch"
          checked={!isClientView}
          onCheckedChange={() => setIsClientView(!isClientView)}
        />
        <Label htmlFor="role-switch">{t('providerView')}</Label>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">
                {task.category?.name[locale] || task.categoryId}
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
                    }).format(task.timeWindowStart)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80">{task.description}</p>
            </CardContent>
          </Card>

          {isClientView ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-headline">{t('offersReceived', { count: offers.length })}</h2>
              {offers.length > 0 ? (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              ) : (
                <Card className="text-center p-8">
                  <p className="text-muted-foreground">{t('noOffers')}</p>
                </Card>
              )}
            </div>
          ) : (
            <OfferForm />
          )}
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
