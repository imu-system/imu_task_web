
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
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/types';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from './ui/dropdown-menu';
import { DashboardHeader } from './dashboard-header';
import { useSettingsModal } from '@/context/settings-modal-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function DashboardNav() {
  const pathname = usePathname();
  const t = useTranslations('DashboardNav');
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { setIsOpen } = useSettingsModal();

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

  const adminNavGroups = {
    community: [
      { href: '/dashboard/admin/users', icon: <Users/>, label: t('users') },
      { href: '/dashboard/admin/tasks', icon: <ListOrdered/>, label: t('tasks') },
      { href: '/dashboard/admin/offers', icon: <Handshake/>, label: t('offers') },
      { href: '/dashboard/admin/bookings', icon: <CalendarCheck/>, label: t('bookings') },
      { href: '/dashboard/admin/reviews', icon: <Star/>, label: t('reviews') },
    ],
    moderation: [
       { href: '/dashboard/admin/moderation/reports', icon: <ModerationIcon/>, label: t('moderation') },
       { href: '/dashboard/admin/kyc', icon: <ShieldCheck/>, label: t('kycVerification') },
       { href: '/dashboard/admin/disputes', icon: <BadgeAlert/>, label: t('disputes') },
       { href: '/dashboard/admin/support/tickets', icon: <LifeBuoy/>, label: t('support') },
    ],
    platform: [
        { href: '/dashboard/admin/academy', icon: <BookOpen/>, label: t('academy') },
        { href: '/dashboard/admin/services/categories', icon: <LayoutList/>, label: t('categories') },
        { href: '/dashboard/admin/partnerships', icon: <Handshake/>, label: t('partnerships') },
        { href: '/dashboard/admin/cms/pages', icon: <FileText/>, label: t('cms') },
        { href: '/dashboard/admin/notifications', icon: <Bell/>, label: t('notifications') },
        { href: '/dashboard/admin/i18n/keys', icon: <Languages/>, label: t('translations') },
    ],
    finance: [
        { href: '/dashboard/admin/payments/transactions', icon: <Wallet/>, label: t('payments') },
        { href: '/dashboard/admin/pricing/fees', icon: <DollarSign/>, label: t('pricing') },
        { href: '/dashboard/admin/reports', icon: <LineChart/>, label: t('reports') },
    ],
    config: [
        { href: '/dashboard/admin/integrations', icon: <Plug/>, label: t('integrations') },
        { href: '/dashboard/admin/settings', icon: <SlidersHorizontal/>, label: t('settings') },
        { href: '/dashboard/dev', icon: <Code/>, label: t('devTools') },
        { href: '/dashboard/admin/audit', icon: <History/>, label: t('auditLog') },
    ]
  };

  const isAdmin = user?.roles?.includes(UserRole.admin);
  const isProvider = user?.roles?.includes(UserRole.provider);

  const AdminNavLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string; }) => (
     <SidebarMenuItem>
        <Link href={href}>
            <SidebarMenuButton isActive={pathname.startsWith(href)} className="w-full justify-start text-sm h-9">
                {icon}
                <span>{label}</span>
            </SidebarMenuButton>
        </Link>
    </SidebarMenuItem>
  );

  const AdminNavGroup = ({ groupKey, links }: { groupKey: keyof typeof adminNavGroups, links: any[] }) => {
    const [isOpen, setIsOpen] = useState(links.some(link => pathname.startsWith(link.href)));

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full">
                <div className={cn("flex w-full items-center justify-between rounded-md p-2 hover:bg-sidebar-accent", isOpen && "bg-sidebar-accent")}>
                    <span className="text-sm font-semibold">{t(`adminNav.${groupKey}`)}</span>
                    <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")}/>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <SidebarMenu className="pl-4 py-2 border-l ml-4 space-y-0">
                    {links.map(link => <AdminNavLink key={link.href} {...link}/>)}
                </SidebarMenu>
            </CollapsibleContent>
        </Collapsible>
    )
  }


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
              <SidebarGroup className="p-0">
                  <SidebarSeparator className="my-2"/>
                  <SidebarGroupLabel className="px-2">{t('provider')}</SidebarGroupLabel>
                  <SidebarMenu className="px-2">
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
              <SidebarGroup className="p-0">
                  <SidebarSeparator className="my-2"/>
                   <div className="px-2">
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
                    </SidebarMenu>
                   </div>
                    
                    <div className="space-y-1 mt-2">
                        {Object.entries(adminNavGroups).map(([key, links]) => (
                            <AdminNavGroup key={key} groupKey={key as keyof typeof adminNavGroups} links={links} />
                        ))}
                    </div>

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
                <SidebarMenuButton onClick={() => setIsOpen(true)} isActive={pathname.startsWith('/dashboard/settings')}>
                    <Settings />
                    <span>{t('settings')}</span>
                </SidebarMenuButton>
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
