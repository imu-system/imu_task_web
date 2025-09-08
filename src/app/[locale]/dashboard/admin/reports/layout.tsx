
'use client';

import { usePathname, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminReportsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const t = useTranslations('AdminReportsLayout');

    const navLinks = [
        { href: '/dashboard/admin/reports', label: t('kpi') },
        { href: '/dashboard/admin/reports/schedules', label: t('schedules') },
    ];
    
    const activeTab = navLinks.find(link => pathname.startsWith(link.href))?.href ?? navLinks[0].href;

    return (
        <div className="space-y-8">
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
