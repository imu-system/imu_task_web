
      
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
  ShieldCheck,
  Users,
  LayoutList,
  ListOrdered,
  Handshake,
  CalendarCheck,
  Star,
  BadgeAlert,
  Bell,
  FileText,
  DollarSign,
  SlidersHorizontal,
  LineChart,
  History,
  Languages,
  LifeBuoy,
  ShieldAlert as ModerationIcon,
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
    { href: '/dashboard', icon: <LayoutGrid />, label: t('dashboard'), exact: true },
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
                  isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
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
                    <Link href="/dashboard/admin">
                        <SidebarMenuButton isActive={pathname === '/dashboard/admin'}>
                            <Shield />
                            <span>{t('admin')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/admin/reports">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/reports')}>
                            <LineChart />
                            <span>{t('reports')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/admin/users">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/users')}>
                            <Users />
                            <span>{t('users')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/admin/services/categories">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/services')}>
                            <LayoutList />
                            <span>{t('categories')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/admin/tasks">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/tasks')}>
                            <ListOrdered />
                            <span>{t('tasks')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/admin/offers">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/offers')}>
                            <Handshake />
                            <span>{t('offers')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/admin/bookings">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/bookings')}>
                            <CalendarCheck />
                            <span>{t('bookings')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/admin/kyc">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/kyc')}>
                            <ShieldCheck />
                            <span>{t('kycVerification')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard/admin/payments/transactions">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/payments')}>
                            <Wallet />
                            <span>{t('payments')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/admin/pricing/fees">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/pricing')}>
                            <DollarSign />
                            <span>{t('pricing')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard/admin/reviews">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/reviews')}>
                            <Star />
                            <span>{t('reviews')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard/admin/disputes">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/disputes')}>
                            <BadgeAlert />
                            <span>{t('disputes')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard/admin/support/tickets">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/support')}>
                            <LifeBuoy />
                            <span>{t('support')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard/admin/moderation/reports">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/moderation')}>
                            <ModerationIcon />
                            <span>{t('moderation')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/admin/notifications">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/notifications')}>
                            <Bell />
                            <span>{t('notifications')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/admin/cms/pages">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/cms')}>
                            <FileText />
                            <span>{t('cms')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard/admin/i18n/keys">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/i18n')}>
                            <Languages />
                            <span>{t('translations')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/admin/settings">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/settings')}>
                            <SlidersHorizontal />
                            <span>{t('settings')}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard/admin/audit">
                        <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/audit')}>
                            <History />
                            <span>{t('auditLog')}</span>
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

    