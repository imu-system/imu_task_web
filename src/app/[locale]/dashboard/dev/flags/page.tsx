
'use client';

import { useTranslations } from 'next-intl';

export default function FlagsPage() {
    const t = useTranslations('DevToolsLayout.sidebar');
    return <div>{t('flags')} Page Placeholder</div>;
}
