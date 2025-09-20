
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
  SidebarGroup,
  SidebarGroupLabel,
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
  Plug,
  Search,
  Briefcase,
  Calendar as CalendarIcon,
  BookOpen,
  Gift,
  Settings,
  BookCopy,
  Code,
  Webhook,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/types';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from './ui/dropdown-menu';
import { DashboardHeader } from './dashboard-header';

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
    { href: '/dashboard/search', icon: <Search />, label: t('findProvider') },
    { href: '/dashboard/offers', icon: <Briefcase />, label: t('findTask') },
    { href: '/dashboard/tasks', icon: <BookMarked />, label: t('myTasks') },
    { href: '/dashboard/bookings', icon: <CalendarCheck />, label: t('myBookings') },
    { href: '/dashboard/messages', icon: <MessageSquare />, label: t('messages') },
    { href: '/dashboard/templates', icon: <BookCopy />, label: t('templates') },
    { href: '/dashboard/reviews', icon: <Star />, label: t('reviews') },
    { href: '/dashboard/wallet', icon: <Wallet />, label: t('wallet') },
    { href: '/dashboard/academy', icon: <BookOpen />, label: t('academy') },
    { href: '/dashboard/referrals', icon: <Gift />, label: t('referrals') },
  ];
  
  const providerNavItems = [
    { href: '/dashboard/availability', icon: <CalendarIcon />, label: t('availability') },
    { href: '/dashboard/stats', icon: <LineChart />, label: t('stats') },
    { href: '/dashboard/market', icon: <LineChart />, label: t('marketInsights') },
  ];

  const isAdmin = user?.roles?.includes(UserRole.admin);
  const isProvider = user?.roles?.includes(UserRole.provider);


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
          {isProvider && (
              <SidebarGroup>
                  <SidebarSeparator className="my-2"/>
                  <SidebarGroupLabel>{t('provider')}</SidebarGroupLabel>
                  <SidebarMenu>
                      {providerNavItems.map((item) => (
                          <SidebarMenuItem key={item.href}>
                              <Link href={item.href}>
                                  <SidebarMenuButton
                                  isActive={pathname.startsWith(item.href)}
                                  className="w-full justify-start"
                                  >
                                  {item.icon}
                                  <span>{item.label}</span>
                                  </SidebarMenuButton>
                              </Link>
                          </SidebarMenuItem>
                      ))}
                  </SidebarMenu>
              </SidebarGroup>
          )}
          {isAdmin && (
              <SidebarGroup>
                  <SidebarSeparator className="my-2"/>
                  <SidebarGroupLabel>{t('admin')}</SidebarGroupLabel>
                  <SidebarMenu>
                      <SidebarMenuItem>
                          <Link href="/dashboard/admin">
                              <SidebarMenuButton isActive={pathname === '/dashboard/admin'}>
                                  <Shield />
                                  <span>{t('dashboard')}</span>
                              </SidebarMenuButton>
                          </Link>
                      </SidebarMenuItem>

                      <SidebarGroupLabel className="mt-4">{t('adminNav.community')}</SidebarGroupLabel>
                      <SidebarMenuItem>
                          <Link href="/dashboard/admin/users">
                              <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/users')}>
                                  <Users />
                                  <span>{t('users')}</span>
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
                          <Link href="/dashboard/admin/reviews">
                              <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/reviews')}>
                                  <Star />
                                  <span>{t('reviews')}</span>
                              </SidebarMenuButton>
                          </Link>
                      </SidebarMenuItem>

                      <SidebarGroupLabel className="mt-4">{t('adminNav.moderation')}</SidebarGroupLabel>
                      <SidebarMenuItem>
                          <Link href="/dashboard/admin/moderation/reports">
                              <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/moderation')}>
                                  <ModerationIcon />
                                  <span>{t('moderation')}</span>
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
                      
                      <SidebarGroupLabel className="mt-4">{t('adminNav.platform')}</SidebarGroupLabel>
                       <SidebarMenuItem>
                          <Link href="/dashboard/admin/academy">
                              <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/academy')}>
                                  <BookOpen />
                                  <span>{t('academy')}</span>
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
                          <Link href="/dashboard/admin/partnerships">
                              <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/partnerships')}>
                                  <Handshake />
                                  <span>{t('partnerships')}</span>
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
                          <Link href="/dashboard/admin/notifications">
                              <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/notifications')}>
                                  <Bell />
                                  <span>{t('notifications')}</span>
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

                      <SidebarGroupLabel className="mt-4">{t('adminNav.finance')}</SidebarGroupLabel>
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
                          <Link href="/dashboard/admin/reports">
                              <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/reports')}>
                                  <LineChart />
                                  <span>{t('reports')}</span>
                              </SidebarMenuButton>
                          </Link>
                      </SidebarMenuItem>

                      <SidebarGroupLabel className="mt-4">{t('adminNav.config')}</SidebarGroupLabel>
                      <SidebarMenuItem>
                          <Link href="/dashboard/admin/integrations">
                              <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/integrations')}>
                                  <Plug />
                                  <span>{t('integrations')}</span>
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
                          <Link href="/dashboard/dev">
                              <SidebarMenuButton isActive={pathname.startsWith('/dashboard/dev')}>
                                  <Code />
                                  <span>{t('devTools')}</span>
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
              </SidebarGroup>
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
                <Link href="/dashboard/settings">
                    <SidebarMenuButton isActive={pathname.startsWith('/dashboard/settings')}>
                        <Settings />
                        <span>{t('settings')}</span>
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
