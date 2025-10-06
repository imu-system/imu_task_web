
'use client';

import { useTranslations } from 'next-intl';
import { Button } from './ui/button';
import { User, Shield, CreditCard, Lock } from 'lucide-react';

export type SettingsTab = 'account' | 'security' | 'billing' | 'privacy';

interface SettingsNavProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export function SettingsNav({ activeTab, onTabChange }: SettingsNavProps) {
  const t = useTranslations('SettingsPage');

  const navLinks: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: t('account.title'), icon: <User /> },
    { id: 'security', label: t('security.title'), icon: <Shield /> },
    { id: 'billing', label: t('billing.title'), icon: <CreditCard /> },
    { id: 'privacy', label: t('privacy.title'), icon: <Lock /> },
  ];

  return (
    <nav className="flex flex-col gap-2">
      {navLinks.map((link) => (
        <Button
          key={link.id}
          variant={activeTab === link.id ? 'secondary' : 'ghost'}
          className="justify-start gap-2"
          onClick={() => onTabChange(link.id)}
        >
          {link.icon}
          {link.label}
        </Button>
      ))}
    </nav>
  );
}
