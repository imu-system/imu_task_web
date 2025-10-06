/**
 * Bookings Page
 * 
 * Displays all bookings for the current user.
 * Shows different views based on user role (client vs provider).
 */

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import BookingsPageClient from './bookings-client';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Bookings' });

  return {
    title: t('myBookings'),
    description: t('bookingCount', { count: 0 }),
  };
}

export default function BookingsPage() {
  return <BookingsPageClient />;
}
