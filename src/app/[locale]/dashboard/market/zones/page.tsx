
'use client';

import { useTranslations } from 'next-intl';

export default function MarketZonesPage() {
    const t = useTranslations('MarketInsightsPage.zones');
    return (
        <div>
            <h1>{t('title')}</h1>
            {/* Le contenu de la page des zones sera ajouté ici */}
        </div>
    )
}
