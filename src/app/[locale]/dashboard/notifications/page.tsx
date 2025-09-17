
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Loader2, Bell, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Handshake,
  MessageSquare,
  Star as StarIcon,
  CreditCard,
  Circle,
  CircleDot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/navigation';
import { useState } from 'react';

const mockUserNotifications = [
    { id: 'n1', type: 'offer', textKey: 'mock.offer', params: { task: "Nettoyage d'appartement" }, date: new Date(Date.now() - 3600000), read: false, icon: <Handshake className="h-5 w-5"/>, link: '/dashboard/tasks/task1' },
    { id: 'n2', type: 'message', textKey: 'mock.message', params: { user: 'Client X' }, date: new Date(Date.now() - 7200000), read: false, icon: <MessageSquare className="h-5 w-5"/>, link: '/dashboard/messages/thread1' },
    { id: 'n3', type: 'payment', textKey: 'mock.payment', params: { amount: '45,00 €' }, date: new Date(Date.now() - 86400000), read: true, icon: <CreditCard className="h-5 w-5"/>, link: '/dashboard/wallet/transactions' },
    { id: 'n4', type: 'review', textKey: 'mock.review', params: { user: 'Client Y' }, date: new Date(Date.now() - 172800000), read: true, icon: <StarIcon className="h-5 w-5"/>, link: '/dashboard/reviews' },
];

export default function UserNotificationsPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('UserNotificationsPage');
    const [notifications, setNotifications] = useState(mockUserNotifications);

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };


    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Bell className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={markAllAsRead}>
                        <CheckCheck className="mr-2 h-4 w-4"/>
                        {t('markAllAsRead')}
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {notifications.map((notif, index) => (
                             <li key={notif.id} className={cn("p-4 hover:bg-muted/50 transition-colors", !notif.read && "bg-primary/5")}>
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1 relative">
                                        <div className="p-2 bg-muted rounded-full">
                                            {notif.icon}
                                        </div>
                                        {!notif.read && (
                                            <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-primary border-2 border-background"/>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">{t(notif.textKey as any, notif.params)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(notif.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!notif.read && (
                                            <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)}>
                                                {t('markAsRead')}
                                            </Button>
                                        )}
                                         <Button variant="outline" size="sm" asChild>
                                            <Link href={notif.link}>{t('open')}</Link>
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                         {notifications.length === 0 && (
                            <li className="p-8 text-center text-muted-foreground">
                                {t('noNotifications')}
                            </li>
                        )}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}

```
  </change>
  <change>
    <file>src/components/dashboard-nav.tsx</file>
    <content><![CDATA[
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
  useSidebar,
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
    { href: '/dashboard/search', icon: <Search />, label: t('findProvider') },
    { href: '/dashboard/offers', icon: <Briefcase />, label: t('findTask') },
    { href: '/dashboard/tasks', icon: <BookMarked />, label: t('myTasks') },
    { href: '/dashboard/bookings', icon: <CalendarCheck />, label: t('myBookings') },
    { href: '/dashboard/reviews', icon: <Star />, label: t('reviews') },
    { href: '/dashboard/messages', icon: <MessageSquare />, label: t('messages') },
    { href: '/dashboard/notifications', icon: <Bell />, label: t('notifications') },
    { href: '/dashboard/wallet', icon: <Wallet />, label: t('wallet') },
  ];
  
  const providerNavItems = [
    { href: '/dashboard/availability', icon: <CalendarIcon />, label: t('availability') },
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
                        <Link href="/dashboard/admin/services/categories">
                            <SidebarMenuButton isActive={pathname.startsWith('/dashboard/admin/services')}>
                                <LayoutList />
                                <span>{t('categories')}</span>
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

    