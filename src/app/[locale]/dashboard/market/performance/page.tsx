
'use client';

import { useTranslations } from 'next-intl';

export default function MarketPerformancePage() {
    const t = useTranslations('MarketInsightsPage.performance');
    return (
        <div>
            <h1>{t('title')}</h1>
            {/* Le contenu de la page des performances sera ajouté ici */}
        </div>
    )
}
