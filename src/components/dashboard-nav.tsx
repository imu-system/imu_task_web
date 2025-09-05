
'use client';

import { Link, useRouter } from '@/navigation';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  BookMarked,
  LayoutGrid,
  LogOut,
  MessageSquare,
  PlusCircle,
  UserCircle,
  Wallet,
  Zap,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/types';

export function DashboardNav() {
  const pathname = usePathname();
  const t = useTranslations('DashboardNav');
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  }

  const navItems = [
    { href: '/dashboard', icon: <LayoutGrid />, label: t('dashboard') },
    { href: '/dashboard/tasks/new', icon: <PlusCircle />, label: t('createTask') },
    { href: '/dashboard/bookings', icon: <BookMarked />, label: t('myTasks') },
    { href: '/dashboard/messages', icon: <MessageSquare />, label: t('messages') },
    { href: '/dashboard/wallet', icon: <Wallet />, label: t('wallet') },
  ];
  
  const isAdmin = user?.roles?.includes(UserRole.admin);

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
                  isActive={pathname.startsWith(item.href) && item.href !== '/dashboard' || pathname === '/dashboard'}
                  className="w-full justify-start"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        {isAdmin && (
            <SidebarMenu>
                <SidebarSeparator className="my-2"/>
                 <SidebarMenuItem>
                    <Link href="/dashboard/admin/categories">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin')}>
                            <Shield />
                            <span>{t('admin')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
            </SidebarMenu>
        )}
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
                <SidebarMenuButton onClick={handleSignOut}>
                    <LogOut />
                    <span>{t('logout')}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
