import { redirect } from '@/navigation';
import { getTaskById } from '@/lib/tasks';
import { OfferForm } from '@/components/offers/OfferForm';
import { getTranslations } from 'next-intl/server';

interface OfferPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { id } = await params;
  const t = await getTranslations('Offers');
  
  // Récupérer la task
  const task = await getTaskById(id);
  
  if (!task) {
    redirect('/tasks');
    return; // TypeScript safety - même si redirect ne retourne jamais
  }
  
  if (task.status !== 'open') {
    redirect(`/tasks/${id}`);
    return; // TypeScript safety
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('submitOfferTitle')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('submitOfferDescription')}
        </p>
      </div>

      <OfferForm
        taskId={id}
        taskBudget={task.budget ?? 0}
        taskTitle={task.title}
      />
    </div>
  );
}
