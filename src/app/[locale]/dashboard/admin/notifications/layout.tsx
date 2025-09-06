
'use client';

import { usePathname, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminNotificationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const t = useTranslations('AdminNotificationsLayout');

    const navLinks = [
        { href: '/dashboard/admin/notifications', label: t('history') },
        { href: '/dashboard/admin/notifications/broadcast', label: t('broadcast') },
        { href: '/dashboard/admin/notifications/templates', label: t('templates') },
    ];
    
    // Find the current active tab. It will be the one whose href is the start of the current pathname.
    const activeTab = navLinks.find(link => pathname === link.href)?.href ?? navLinks[0].href;

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
