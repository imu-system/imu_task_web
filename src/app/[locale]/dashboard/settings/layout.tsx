
'use client';

import { usePathname, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, CreditCard, Lock } from 'lucide-react';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const t = useTranslations('SettingsLayout');

    const navLinks = [
        { href: '/dashboard/settings', label: t('account'), icon: <User className="h-4 w-4" /> },
        { href: '/dashboard/settings/security', label: t('security'), icon: <Shield className="h-4 w-4" /> },
        { href: '/dashboard/settings/billing', label: t('billing'), icon: <CreditCard className="h-4 w-4" /> },
        { href: '/dashboard/settings/privacy', label: t('privacy'), icon: <Lock className="h-4 w-4" /> },
    ];
    
    const activeTab = navLinks.find(link => pathname === link.href)?.href ?? navLinks[0].href;

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
                            <Link href={link.href} className="flex items-center gap-2">
                                {link.icon}
                                {link.label}
                            </Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            
            <div className="mt-6">{children}</div>
        </div>
    );
}
