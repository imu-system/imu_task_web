
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Loader2, Mail, Phone, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.108-11.127-7.462l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        ...
        ...
      <path d="M12.5 4.5h-5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5l-4-4Z" />
      <path d="M15 4.5V8h3.5" />
    </svg>
  ),
  'digital-assistance': <HelpCircle className="h-4 w-4" />,
  'admin-help': <Briefcase className="h-4 w-4" />,
  handyman: <Wrench className="h-4 w-4" />,
  'pet-care': <PawPrint className="h-4 w-4" />,
  default: <HelpCircle className="h-4 w-4" />,
};

type TaskCardProps = {
  task: Task;
};

export default function TaskCard({ task }: TaskCardProps) {
  const { title, client, category, address, timeWindowStart, priceOffered, id } = task;
  const locale = useLocale();
  const t = useTranslations('TaskCard');

  const clientName = client?.profile?.displayName || 'Utilisateur';
  const clientAvatarUrl = client?.profile?.photoUrl;
  const clientFallback = clientName ? clientName.charAt(0) : 'U';

  const categoryName = category?.name || { fr: 'Catégorie', en: 'Category' };
  const categoryLabel = categoryName[locale as keyof typeof categoryName] || category?.slug || 'Catégorie';
  const categoryIcon = category?.icon ? (categoryIcons[category.icon] || categoryIcons.default) : categoryIcons.default;
  const locationLabel = address?.city || task.location;

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
            <span>{locationLabel}</span>
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
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/tasks/${id}`}>
              <Eye className="mr-2" />
              {t('viewTask')}
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">{t('makeOffer')}</Button>
            </DialogTrigger>
            <DialogContent>
              <OfferForm task={task} />
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
}
