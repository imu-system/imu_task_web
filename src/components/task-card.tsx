
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { type Task, type ServiceCategory } from '@/lib/types';
import {
  Calendar,
  MapPin,
  ShoppingBasket,
  Spade,
  Sparkles as SparklesIcon,
  Briefcase,
  Wrench,
  PawPrint,
  HelpCircle,
} from 'lucide-react';
import { Link } from '@/navigation';
import { Button } from './ui/button';
import { useTranslations, useLocale } from 'next-intl';
import { ReactNode, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const categoryIcons: Record<string, ReactNode> = {
  groceries: <ShoppingBasket className="h-4 w-4" />,
  gardening: <Spade className="h-4 w-4" />,
  cleaning: <SparklesIcon className="h-4 w-4" />,
  'digital-assistance': <HelpCircle className="h-4 w-4" />, // Assuming 'digital-assistance' slug
  'admin-help': <Briefcase className="h-4 w-4" />,
  handyman: <Wrench className="h-4 w-4" />,
  'pet-care': <PawPrint className="h-4 w-4" />,
  default: <HelpCircle className="h-4 w-4" />,
};


type TaskCardProps = {
  task: Task;
};

export default function TaskCard({ task }: TaskCardProps) {
  const { title, client, categoryId, location, timeWindowStart, priceOffered, id } = task;
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const locale = useLocale();
  const t = useTranslations('TaskCard');
  
  useEffect(() => {
    const fetchCategory = async () => {
      if (categoryId) {
        const docRef = doc(db, "serviceCategories", categoryId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCategory(docSnap.data() as ServiceCategory);
        } else {
          console.log("No such category!");
        }
      }
    };

    fetchCategory();
  }, [categoryId]);


  const clientName = client?.profile?.displayName || 'Utilisateur';
  const clientAvatarUrl = client?.profile?.photoUrl;
  const clientFallback = clientName ? clientName.charAt(0) : 'U';
  
  const categoryLabel = category?.slug || 'Catégorie';
  const categoryIcon = category ? (categoryIcons[category.id] || categoryIcons.default) : categoryIcons.default;


  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <Badge variant="secondary" className="flex items-center gap-2">
                {categoryIcon}
                <span>{categoryLabel}</span>
            </Badge>
            <span className="text-xl font-bold text-primary">{priceOffered}€</span>
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
            <span>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timeWindowStart))}</span>
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
