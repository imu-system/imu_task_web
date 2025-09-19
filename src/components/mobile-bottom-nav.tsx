
'use client';

import { Link, usePathname } from '@/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  MessageSquare,
  BookMarked,
  Wallet,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations('DashboardNav');

  const navItems = [
    { href: '/dashboard', label: t('dashboard'), icon: <LayoutGrid />, exact: true },
    { href: '/dashboard/messages', label: t('messages'), icon: <MessageSquare /> },
    { href: '/dashboard/tasks', label: t('myTasks'), icon: <BookMarked /> },
    { href: '/dashboard/wallet', label: t('wallet'), icon: <Wallet /> },
    { href: '/dashboard/profile', label: t('profile'), icon: <User /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex flex-col items-center justify-center px-2 hover:bg-muted',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
