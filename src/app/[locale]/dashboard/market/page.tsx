
'use client';

import { useTranslations } from 'next-intl';

export default function MarketTrendsPage() {
    const t = useTranslations('MarketInsightsPage.trends');
    return (
        <div>
            <h1>{t('title')}</h1>
            {/* Le contenu de la page des tendances sera ajouté ici */}
        </div>
    )
}
