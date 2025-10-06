
'use client';

import { usePathname, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminCmsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const t = useTranslations('AdminCmsLayout');

    const navLinks = [
        { href: '/dashboard/admin/cms/pages', label: t('pages') },
        { href: '/dashboard/admin/cms/faq', label: t('faq') },
        { href: '/dashboard/admin/cms/policies', label: t('policies') },
        { href: '/dashboard/admin/cms/posts', label: t('posts') },
    ];
    
    const activeTab = navLinks.find(link => pathname.startsWith(link.href))?.href ?? navLinks[0].href;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
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
