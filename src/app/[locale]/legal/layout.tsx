
'use client';

import { usePathname, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const t = useTranslations('LegalLayout');

    const navLinks = [
        { href: '/legal/terms', label: t('tabs.policies') },
        { href: '/legal/invoices', label: t('tabs.invoices') },
        // { href: '/legal/contracts', label: t('tabs.contracts') },
        // { href: '/legal/insurance', label: t('tabs.insurance') },
    ];
    
    const activeTab = navLinks.find(link => pathname.startsWith(link.href))?.href ?? navLinks[0].href;

    return (
        <div className="container mx-auto max-w-4xl py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <FileText className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
            </div>
            <Tabs value={activeTab} className="w-full">
                <TabsList>
                    {navLinks.map((link) => (
                        <TabsTrigger key={link.href} value={link.href} asChild>
                            <Link href={link.href}>{link.label}</Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            
            <div className="mt-6">{children}</div>
        </div>
    );
}
