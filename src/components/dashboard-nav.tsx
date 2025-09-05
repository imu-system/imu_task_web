'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from '@/components/ui/sidebar';
import {
  BookMarked,
  ClipboardList,
  LayoutGrid,
  LogOut,
  MessageSquare,
  PlusCircle,
  Settings,
  UserCircle,
  Wallet,
  Zap,
} from 'lucide-react';

export function DashboardNav() {
  const pathname = usePathname();
  const t = useTranslations('DashboardNav');

  const navItems = [
    { href: '/dashboard', icon: <LayoutGrid />, label: t('dashboard') },
    { href: '/dashboard/tasks/new', icon: <PlusCircle />, label: t('createTask') },
    { href: '/dashboard/bookings', icon: <BookMarked />, label: t('myTasks') },
    { href: '/dashboard/messages', icon: <MessageSquare />, label: t('messages') },
    { href: '/dashboard/wallet', icon: <Wallet />, label: t('wallet') },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-headline">ImuTask</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  className="w-full justify-start"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className='mt-auto'>
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/dashboard/profile">
                    <SidebarMenuButton isActive={pathname === '/dashboard/profile'}>
                        <UserCircle />
                        <span>{t('profile')}</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/">
                    <SidebarMenuButton>
                        <LogOut />
                        <span>{t('logout')}</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
