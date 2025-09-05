'use client';

import { getOffersForTask, getTasks, users } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
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

const OfferCard = ({ offer }: { offer: Offer }) => {
  const { toast } = useToast();
  
  const handleAccept = () => {
    toast({
        title: 'Offre acceptée !',
        description: `La mission est maintenant assignée à ${offer.provider.name}.`,
    });
  }

  return (
    <div className="flex items-start gap-4 rounded-lg border p-4">
      <Avatar>
        <AvatarImage src={offer.provider.avatarUrl} />
        <AvatarFallback>{offer.provider.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{offer.provider.name}</p>
            <div className="flex items-center gap-0.5 text-yellow-500">
                <Star className='h-4 w-4 fill-current' />
                <Star className='h-4 w-4 fill-current' />
                <Star className='h-4 w-4 fill-current' />
                <Star className='h-4 w-4 fill-current' />
                <Star className='h-4 w-4 text-muted-foreground fill-muted-foreground' />
                <span className="text-xs text-muted-foreground ml-1">(12 avis)</span>
            </div>
          </div>
          <p className="text-lg font-bold text-primary">{offer.price}€</p>
        </div>
        <p className="text-sm text-muted-foreground bg-accent/20 p-3 rounded-md">
          {offer.message}
        </p>
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={handleAccept}>Accepter l'offre</Button>
          <Button size="sm" variant="ghost">
            <MessageSquare className="mr-2 h-4 w-4" />
            Contacter
          </Button>
        </div>
      </div>
    </div>
  );
};

const OfferForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Faire une offre</CardTitle>
        <CardDescription>
          Proposez vos services pour cette mission.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price">Votre prix (€)</Label>
          <Input id="price" type="number" placeholder="25" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Votre message</Label>
          <Textarea
            id="message"
            placeholder="Présentez-vous et expliquez pourquoi vous êtes la bonne personne pour cette mission."
          />
        </div>
        <Button className="w-full">Envoyer mon offre</Button>
      </CardContent>
    </Card>
  );
};

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = getTasks().find((t) => t.id === params.id);
  const offers = getOffersForTask(params.id);
  const locale = useLocale();

  // Mock current user role for demonstration
  const [isClientView, setIsClientView] = useState(true);

  if (!task) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-2 text-sm mb-4">
        <Label htmlFor="role-switch">Vue Client</Label>
        <Switch
          id="role-switch"
          checked={!isClientView}
          onCheckedChange={() => setIsClientView(!isClientView)}
        />
        <Label htmlFor="role-switch">Vue Prestataire</Label>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">
                {task.category}
              </Badge>
              <CardTitle className="text-3xl font-headline">{task.title}</CardTitle>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{task.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    }).format(task.date)}
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
              <h2 className="text-2xl font-bold font-headline">Offres reçues ({offers.length})</h2>
              {offers.length > 0 ? (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              ) : (
                <Card className="text-center p-8">
                  <p className="text-muted-foreground">Vous n'avez pas encore reçu d'offres pour cette mission.</p>
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
              <span className="text-4xl font-bold text-primary">{task.price}€</span>
              <CardDescription>Budget du client</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={task.client.avatarUrl} />
                  <AvatarFallback>
                    {task.client.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{task.client.name}</p>
                  <p className="text-sm text-muted-foreground">Membre depuis 2023</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                 <div className="flex items-center gap-2 text-green-600">
                    <ShieldCheck className="h-4 w-4"/>
                    <span>Identité vérifiée</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground"/>
                    <span>Paiement vérifié</span>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
