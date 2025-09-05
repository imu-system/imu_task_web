import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { type Task, type TaskCategory, type CategoryKey } from '@/lib/types';
import {
  Calendar,
  MapPin,
  ShoppingBasket,
  Spade,
  Sparkles as SparklesIcon,
  Briefcase,
  Wrench,
  PawPrint,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useTranslations, useLocale } from 'next-intl';
import { ReactNode } from 'react';

const categoryIcons: Record<CategoryKey, ReactNode> = {
  shopping: <ShoppingBasket className="h-4 w-4" />,
  gardening: <Spade className="h-4 w-4" />,
  lightCleaning: <SparklesIcon className="h-4 w-4" />,
  digitalHelp: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 11h2" />
      <path d="M17 11h2" />
      <path d="M12 17v-1.17a2 2 0 0 1 .59-1.42l.82-.82a2 2 0 0 0 .59-1.42V11a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v.17a2 2 0 0 0 .59 1.42l.82.82a2 2 0 0 1 .59 1.42V17" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
    </svg>
  ),
  administrativeHelp: <Briefcase className="h-4 w-4" />,
  handyman: <Wrench className="h-4 w-4" />,
  petSitting: <PawPrint className="h-4 w-4" />,
};

const categoryKeyMap: Record<TaskCategory, CategoryKey> = {
  'Courses': 'shopping',
  'Jardinage': 'gardening',
  'Ménage léger': 'lightCleaning',
  'Aide numérique': 'digitalHelp',
  'Aide administrative': 'administrativeHelp',
  'Petits bricolages': 'handyman',
  'Garde d’animaux': 'petSitting',
};

type TaskCardProps = {
  task: Task;
};

export default function TaskCard({ task }: TaskCardProps) {
  const { title, client, category, location, date, price, id } = task;
  const locale = useLocale();
  const t = useTranslations('TaskCard');
  const tCat = useTranslations('TaskCategories');
  const catKey = categoryKeyMap[category];
  const clientName = client?.profile?.displayName || 'Utilisateur';
  const clientAvatarUrl = client?.profile?.photoUrl;
  const clientFallback = clientName.charAt(0);


  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <Badge variant="secondary" className="flex items-center gap-2">
                {categoryIcons[catKey]}
                <span>{tCat(catKey)}</span>
            </Badge>
            <span className="text-xl font-bold text-primary">{price}€</span>
        </div>
        <CardTitle className="pt-2 font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={clientAvatarUrl || undefined} alt={clientName} />
            <AvatarFallback>{clientFallback}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{clientName}</span>
        </div>
        <Button asChild>
          <Link href={`/dashboard/tasks/${id}`}>{t('viewTask')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
