/**
 * Leave Review Page
 * 
 * Page dédiée pour laisser un avis sur un booking complété
 * - Vérifie que le booking est complété
 * - Vérifie que l'utilisateur peut laisser un avis
 * - Affiche ReviewForm pré-rempli avec contexte du booking
 */

import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import LeaveReviewClient from './leave-review-client';
import { Loader2 } from 'lucide-react';

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function LeaveReviewPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations('LeaveReviewPage');

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        }
      >
        <LeaveReviewClient bookingId={id} />
      </Suspense>
    </div>
  );
}
