
'use client';

import { usePathname, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Code, Flag, Users, AreaChart, HeartPulse, Database, Webhook, KeyRound, History } from 'lucide-react';

export default function DevToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const t = useTranslations('DevToolsLayout');

    const navLinks = [
        { href: '/dashboard/dev/flags', label: t('sidebar.flags'), icon: <Flag/> },
        { href: '/dashboard/dev/audiences', label: t('sidebar.audiences'), icon: <Users/> },
        { href: '/dashboard/dev/rollouts', label: t('sidebar.rollouts'), icon: <AreaChart/> },
        { href: '/dashboard/dev/health', label: t('sidebar.health'), icon: <HeartPulse/> },
        { href: '/dashboard/dev/fixtures', label: t('sidebar.fixtures'), icon: <Database/> },
        { href: '/dashboard/dev/webhook-tester', label: t('sidebar.webhookTester'), icon: <Webhook/> },
        { href: '/dashboard/dev/sdk-keys', label: t('sidebar.sdkKeys'), icon: <KeyRound/> },
        { href: '/dashboard/dev/audit', label: t('sidebar.auditLog'), icon: <History/> },
    ];
    
    return (
        <div className="flex gap-8">
            <aside className="hidden md:flex w-64 flex-col gap-4">
                 <h2 className="text-lg font-semibold tracking-tight">{t('title')}</h2>
                 <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                        <Button
                            key={link.href}
                            variant={pathname.startsWith(link.href) ? 'secondary' : 'ghost'}
                            asChild
                            className="justify-start gap-2"
                        >
                            <Link href={link.href}>
                                {link.icon}
                                {link.label}
                            </Link>
                        </Button>
                    ))}
                 </nav>
            </aside>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
