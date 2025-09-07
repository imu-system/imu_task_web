
'use client';

import { usePathname, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const t = useTranslations('AdminPricingLayout');

    const navLinks = [
        { href: '/dashboard/admin/pricing/fees', label: t('fees') },
        { href: '/dashboard/admin/pricing/guidance', label: t('guidance') },
        { href: '/dashboard/admin/pricing/coupons', label: t('coupons') },
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
