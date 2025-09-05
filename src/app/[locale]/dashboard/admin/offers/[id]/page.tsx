
'use client';

import { useTranslations } from 'next-intl';

export default function AdminOfferDetailPage() {
  const t = useTranslations('AdminOffersPage');
  
  return (
    <div>
      <h1 className="text-2xl font-bold">Offer Detail Page</h1>
      <p>{t('details')}</p>
    </div>
  );
}
