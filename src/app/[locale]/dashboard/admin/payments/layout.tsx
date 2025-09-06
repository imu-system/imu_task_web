
'use client';

import { usePathname, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPaymentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const t = useTranslations('AdminPaymentsLayout');

    const navLinks = [
        { href: '/dashboard/admin/payments/transactions', label: t('transactions') },
        { href: '/dashboard/admin/payments/transfers', label: t('transfers') },
        { href: '/dashboard/admin/payments/payouts', label: t('payouts') },
        { href: '/dashboard/admin/payments/recon', label: t('reconciliation') },
    ];
    
    // Find the current active tab. It will be the one whose href is the start of the current pathname.
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

