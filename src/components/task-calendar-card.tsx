
'use client';

import { Badge } from '@/components/ui/badge';
import { type Task } from '@/lib/types';
import { Link } from '@/navigation';
import { Button } from './ui/button';
import { useTranslations, useLocale } from 'next-intl';
import { Dialog, DialogTrigger, DialogContent } from './ui/dialog';
import { OfferForm } from './offer-form';

type TaskCalendarCardProps = {
  task: Task;
};

export default function TaskCalendarCard({ task }: TaskCalendarCardProps) {
  const { title, priceOffered, id } = task;
  const locale = useLocale();
  const tCard = useTranslations('TaskCard');

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50">
        <div className="flex-1">
            <Link href={`/dashboard/tasks/${id}`} className="font-medium hover:underline">
                {title}
            </Link>
            <p className="text-sm font-bold text-primary">{priceOffered}€</p>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm">{tCard('makeOffer')}</Button>
            </DialogTrigger>
            <DialogContent>
                <OfferForm task={task}/>
            </DialogContent>
        </Dialog>
    </div>
  );
}
