
'use client';

import { useTranslations } from 'next-intl';

export default function MarketPricingPage() {
    const t = useTranslations('MarketInsightsPage.pricing');
    return (
        <div>
            <h1>{t('title')}</h1>
            {/* Le contenu de la page des prix sera ajouté ici */}
        </div>
    )
}
