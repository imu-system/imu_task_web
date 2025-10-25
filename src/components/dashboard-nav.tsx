
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
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  BookMarked,
  LayoutGrid,
  LogOut,
  MessageSquare,
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
  ChevronRight,
  Users2,
  HeartHandshake,
  Landmark,
  Palette,
  MoreVertical,
  Edit,
  Heart,
  UtensilsCrossed,
  Home,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, AccountType } from '@/lib/types';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from './ui/dropdown-menu';
import { useSettingsModal } from '@/context/settings-modal-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useAccountType } from '@/hooks/use-account-type';

export function DashboardNav() {
  const pathname = usePathname();
  const t = useTranslations('DashboardNav');
  const tHeader = useTranslations('Header');
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { setIsOpen } = useSettingsModal();
  const { accountType, loading: loadingAccountType } = useAccountType();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  }

  // Navigation pour CLIENTS (Particuliers)
  const clientNavItems = [
    { href: '/dashboard', icon: <LayoutGrid />, label: 'Tableau de bord', exact: true },
    { href: '/dashboard/tasks', icon: <BookMarked />, label: 'Mes tâches' },
    { href: '/dashboard/messages', icon: <MessageSquare />, label: 'Messages' },
    { href: '/dashboard/bookings', icon: <CalendarCheck />, label: 'Mes réservations' },
    { href: '/dashboard/search', icon: <Search />, label: 'Trouver un prestataire' },
    { href: '/dashboard/wallet', icon: <Wallet />, label: 'Portefeuille' },
  ];

  // Navigation pour PROFESSIONNELS
  const proNavItems = [
    { href: '/dashboard', icon: <LayoutGrid />, label: 'Tableau de bord', exact: true },
    { href: '/dashboard/offers', icon: <Briefcase />, label: 'Missions disponibles' },
    { href: '/dashboard/tasks', icon: <BookMarked />, label: 'Mes offres' },
    { href: '/dashboard/bookings', icon: <CalendarCheck />, label: 'Planning' },
    { href: '/dashboard/messages', icon: <MessageSquare />, label: 'Messages' },
    { href: '/dashboard/stats', icon: <LineChart />, label: 'Statistiques' },
    { href: '/dashboard/availability', icon: <CalendarIcon />, label: 'Disponibilités' },
    { href: '/dashboard/wallet', icon: <Wallet />, label: 'Revenus' },
    { href: '/dashboard/market', icon: <LineChart />, label: 'Marché' },
  ];

  // Navigation pour SENIORS (Simplifiée)
  const seniorNavItems = [
    { href: '/dashboard', icon: <Heart />, label: 'Accueil', exact: true },
    { href: '/dashboard/services/meals', icon: <UtensilsCrossed />, label: 'Repas' },
    { href: '/dashboard/services/home-help', icon: <Home />, label: 'Aide à domicile' },
    { href: '/dashboard/contacts', icon: <Users />, label: 'Mes contacts' },
    { href: '/dashboard/calendar', icon: <CalendarIcon />, label: 'Mon planning' },
    { href: '/help', icon: <Phone />, label: 'Aide & Support' },
  ];

  // Navigation par défaut (fallback)
  const defaultNavItems = [
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

  // Sélection des items selon accountType
  let navItems = defaultNavItems;
  if (!loadingAccountType) {
    if (accountType === AccountType.individual) {
      navItems = clientNavItems;
    } else if (accountType === AccountType.professional) {
      navItems = proNavItems;
    } else if (accountType === AccountType.senior) {
      navItems = seniorNavItems;
    }
  }
  
  const providerNavItems = [
    { href: '/dashboard/availability', icon: <CalendarIcon />, label: t('availability') },
    { href: '/dashboard/stats', icon: <LineChart />, label: t('stats') },
    { href: '/dashboard/market', icon: <LineChart />, label: t('marketInsights') },
  ];

  const adminNavGroups = {
    community: {
        icon: <Users2 className="h-4 w-4 mr-2"/>,
        links: [
            { href: '/dashboard/admin/users', icon: <Users/>, label: t('users') },
            { href: '/dashboard/admin/tasks', icon: <ListOrdered/>, label: t('tasks') },
            { href: '/dashboard/admin/offers', icon: <Handshake/>, label: t('offers') },
            { href: '/dashboard/admin/reviews', icon: <Star/>, label: t('reviews') },
        ]
    },
    moderation: {
        icon: <ModerationIcon className="h-4 w-4 mr-2"/>,
        links: [
            { href: '/dashboard/admin/kyc', icon: <ShieldCheck/>, label: t('kycVerification') },
            { href: '/dashboard/admin/disputes', icon: <BadgeAlert/>, label: t('disputes') },
            { href: '/dashboard/admin/support/tickets', icon: <LifeBuoy/>, label: t('support') },
        ]
    },
    platform: {
        icon: <Palette className="h-4 w-4 mr-2"/>,
        links: [
            { href: '/dashboard/admin/services/categories', icon: <LayoutList/>, label: t('categories') },
            { href: '/dashboard/admin/cms/pages', icon: <FileText/>, label: t('cms') },
            { href: '/dashboard/admin/notifications', icon: <Bell/>, label: t('notifications') },
            { href: '/dashboard/admin/partnerships', icon: <Handshake/>, label: t('partnerships') },
        ]
    },
    finance: {
        icon: <Landmark className="h-4 w-4 mr-2"/>,
        links: [
            { href: '/dashboard/admin/payments/transactions', icon: <Wallet/>, label: t('payments') },
            { href: '/dashboard/admin/pricing/fees', icon: <DollarSign/>, label: t('pricing') },
            { href: '/dashboard/admin/reports', icon: <LineChart/>, label: t('reports') },
        ]
    },
    config: {
        icon: <SlidersHorizontal className="h-4 w-4 mr-2"/>,
        links: [
            { href: '/dashboard/admin/integrations', icon: <Plug/>, label: t('integrations') },
            { href: '/dashboard/admin/settings', icon: <SlidersHorizontal/>, label: t('settings') },
            { href: '/dashboard/admin/i18n/keys', icon: <Languages/>, label: t('translations') },
            { href: '/dashboard/admin/audit', icon: <History/>, label: t('auditLog') },
            { href: '/dashboard/dev', icon: <Code/>, label: t('devTools') },
        ]
    }
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

  const AdminNavGroup = ({ groupKey, groupData }: { groupKey: keyof typeof adminNavGroups, groupData: any }) => {
    const [isOpen, setIsOpen] = useState(groupData.links.some((link: any) => pathname.startsWith(link.href)));

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full">
                <div className={cn("flex w-full items-center justify-between rounded-md p-2 hover:bg-sidebar-accent", isOpen && "bg-sidebar-accent")}>
                    <span className="text-sm font-semibold flex items-center">{groupData.icon} {t(`adminNav.${groupKey}`)}</span>
                    <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")}/>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <SidebarMenu className="pl-4 py-2 border-l ml-4 space-y-0">
                    {groupData.links.map((link: any) => <AdminNavLink key={link.href} {...link}/>)}
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

        <SidebarContent className="p-2 space-y-2">
            <div className="p-2 space-y-3">
                 <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL || undefined} alt="User avatar" />
                            <AvatarFallback>
                                {user?.profile?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 truncate">
                            <p className="font-semibold truncate text-sm">{user?.profile?.displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <MoreVertical className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/profile">
                                    <UserCircle className="mr-2 h-4 w-4" />
                                    <span>{t('profile')}</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsOpen(true)}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>{t('settings')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{t('logout')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {isProvider && (
                    <div className="flex items-center space-x-2">
                        <Switch id="availability-switch" defaultChecked />
                        <Label htmlFor="availability-switch" className="text-sm">
                            {tHeader('availableForMissions')}
                        </Label>
                    </div>
                )}
                {accountType === AccountType.senior && (
                    <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200">
                        <Button variant="destructive" size="sm" className="w-full">
                            <Phone className="h-4 w-4 mr-2" />
                            Appel d'urgence
                        </Button>
                    </div>
                )}
            </div>

            <SidebarSeparator/>

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
                        {Object.entries(adminNavGroups).map(([key, groupData]) => (
                            <AdminNavGroup key={key} groupKey={key as keyof typeof adminNavGroups} groupData={groupData} />
                        ))}
                    </div>

                </SidebarGroup>
            )}
        </SidebarContent>
      </Sidebar>
  );
}

    