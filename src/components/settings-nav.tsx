
'use client';

import { useTranslations } from 'next-intl';
import { Button } from './ui/button';
import { User, Shield, CreditCard, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from '@/navigation';

export function SettingsNav() {
  const t = useTranslations('SettingsLayout');
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard/settings/account', label: t('account'), icon: <User /> },
    { href: '/dashboard/settings/security', label: t('security'), icon: <Shield /> },
    { href: '/dashboard/settings/billing', label: t('billing'), icon: <CreditCard /> },
    { href: '/dashboard/settings/privacy', label: t('privacy'), icon: <Lock /> },
  ];

  const activeLink = '/dashboard/settings/account'; // Placeholder for now

  return (
    <nav className="flex flex-col gap-2">
      {navLinks.map((link) => (
        <Button
          key={link.href}
          variant={activeLink === link.href ? 'secondary' : 'ghost'}
          className="justify-start gap-2"
        >
          {link.icon}
          {link.label}
        </Button>
      ))}
    </nav>
  );
}
