
'use client';

import { usePathname, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Languages } from 'lucide-react';

export default function AdminI18nLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const t = useTranslations('AdminI18nLayout');

    const navLinks = [
        { href: '/dashboard/admin/i18n/keys', label: t('keys') },
        { href: '/dashboard/admin/i18n/io', label: t('io') },
    ];
    
    const activeTab = navLinks.find(link => pathname.startsWith(link.href))?.href ?? navLinks[0].href;

    return (
        <div className="space-y-8">
            <div>
                 <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Languages className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
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
