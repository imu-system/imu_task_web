/**
 * Booking Detail Page
 * 
 * Affiche les détails complets d'une réservation avec:
 * - Informations client/provider
 * - Timeline des événements
 * - Actions disponibles selon le statut
 * - Bouton "Laisser un avis" si complété
 */

import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import BookingDetailPageClient from './booking-detail-client';
import { Loader2 } from 'lucide-react';

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations('BookingDetailPage');

  return (
    <div className="container mx-auto py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        }
      >
        <BookingDetailPageClient bookingId={id} />
      </Suspense>
    </div>
  );
}
