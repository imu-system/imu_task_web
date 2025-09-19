
'use client';

import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

export default function MessagesPage() {
    const t = useTranslations('MessagesPage');
    return (
        <div className="hidden md:flex flex-col items-center justify-center h-full text-center bg-muted/50">
            <MessageSquare className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">{t('title')}</h2>
            <p className="mt-2 text-muted-foreground">{t('description')}</p>
        </div>
    );
}
