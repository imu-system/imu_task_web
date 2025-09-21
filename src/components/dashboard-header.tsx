
'use client';

import { useAuth } from '@/hooks/use-auth';
import {
  Bell,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Menu,
  User,
  PlusCircle,
  MessageSquare,
  Search,
  ChevronDown,
  Sparkles,
  Handshake,
  Star,
  CheckCheck,
  Wifi,
  Settings as SettingsIcon,
  Monitor,
  Sun,
  Moon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Button } from './ui/button';
import { useSidebar } from './ui/sidebar';
import { CommandMenu } from './command-menu';
import React, { useEffect, useState } from 'react';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Dialog, DialogTrigger, DialogContent } from './ui/dialog';
import { CreateTaskForm } from './create-task-form';
import { useSettingsModal } from '@/context/settings-modal-context';

export function DashboardHeader() {
  const t = useTranslations('Header');
  const tNav = useTranslations('DashboardNav');
  const tCreateTask = useTranslations('NewTaskPage');
  const { user, signOut } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [open, setOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const { setIsOpen: setSettingsModalOpen } = useSettingsModal();
  const [theme, setThemeState] = React.useState<"theme-light" | "theme-dark" | "system">("system")

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setThemeState(isDarkMode ? "theme-dark" : "theme-light")
  }, [])

  useEffect(() => {
    const isDark =
      theme === "theme-dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.classList[isDark ? "add" : "remove"]("dark")
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('imu_theme', theme);
  }, [theme])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey))) {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])
  
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    if (typeof window !== 'undefined' && !window.navigator.onLine) {
        handleOffline();
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Simulate pending changes for demo
    const timer = setTimeout(() => {
        if(!isOffline) setHasPendingChanges(true);
    }, 5000);
    const timer2 = setTimeout(() => {
        if(!isOffline) setHasPendingChanges(false);
    }, 15000);


    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [isOffline]);
  
  const getStatus = () => {
      if (isOffline) return 'offline';
      if (hasPendingChanges) return 'pending';
      return 'online';
  }

  const status = getStatus();


  if (!user) return null;
  
  const isClient = user.roles.includes(UserRole.client);
  const isProvider = user.roles.includes(UserRole.provider);

  const CreateButton = () => {
    // Client-first approach: If user is client (even if also provider), primary action is creating a task.
    if (isClient) {
      return (
        <Dialog>
            <div className="flex items-center">
                <DialogTrigger asChild>
                    <Button size="sm" className="gap-1 rounded-r-none">
                        <PlusCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('createTask')}</span>
                    </Button>
                </DialogTrigger>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" className="rounded-l-none px-2 border-l">
                            <ChevronDown className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/availability">{t('setAvailability')}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/tasks/new?template=shopping">
                            <Sparkles className="mr-2 h-4 w-4 text-primary" />
                            <span>{t('suggestedAction')}</span>
                          </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <DialogContent className="sm:max-w-2xl">
                 <CreateTaskForm />
            </DialogContent>
        </Dialog>
      )
    }

    // If user is ONLY a provider (not a client)
    if (isProvider) {
        return (
            <div className="flex items-center">
                <Button asChild size="sm" className="gap-1 rounded-r-none">
                    <Link href="/dashboard/availability">
                        <PlusCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('setAvailability')}</span>
                    </Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" className="rounded-l-none px-2 border-l">
                            <ChevronDown className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <Dialog>
                            <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    {t('createTask')}
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <CreateTaskForm />
                            </DialogContent>
                        </Dialog>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem asChild>
                           <Link href="/dashboard/tasks/new?template=shopping">
                             <Sparkles className="mr-2 h-4 w-4 text-primary" />
                             <span>{t('suggestedAction')}</span>
                           </Link>
                         </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        )
    }

    // Default fallback for users with other roles (e.g., admin only)
    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t('create')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             <Dialog>
                <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        {t('createTask')}
                    </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <CreateTaskForm />
                </DialogContent>
            </Dialog>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/availability">{t('setAvailability')}</Link>
            </DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem asChild>
               <Link href="/dashboard/tasks/new?template=shopping">
                 <Sparkles className="mr-2 h-4 w-4 text-primary" />
                 <span>{t('suggestedAction')}</span>
               </Link>
             </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    )
  }


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/60 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <Menu />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="hidden lg:inline-flex">{t('searchPlaceholder')}</span>
        <span className="inline-flex lg:hidden">{t('search')}</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandMenu open={open} setOpen={setOpen} />


      <div className="flex-1">
        {/* Placeholder for potential breadcrumbs or page title */}
      </div>

      <div className="flex items-center gap-2">
        <CreateButton/>

        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/messages">
            <MessageSquare />
            <span className="sr-only">{tNav('messages')}</span>
          </Link>
        </Button>
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Bell />
                    <span className="sr-only">{tNav('notifications')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 p-0">
                <Tabs defaultValue="all" className="w-full">
                    <div className="p-4 border-b">
                         <div className="flex items-center justify-between">
                            <DropdownMenuLabel className="p-0">{t('notificationsTitle')}</DropdownMenuLabel>
                            <Button variant="ghost" size="sm">
                                <CheckCheck className="mr-2"/>
                                Marquer tout comme lu
                            </Button>
                         </div>
                        <TabsList className="grid w-full grid-cols-2 mt-2">
                            <TabsTrigger value="all">Toutes</TabsTrigger>
                            <TabsTrigger value="unread">Non lues</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="all">
                        <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                            <div className="p-2 rounded-md hover:bg-muted">
                                <div className="flex items-start gap-3">
                                    <Handshake className="h-4 w-4 mt-1 text-muted-foreground"/>
                                    <div className="flex-1">
                                        <p className="text-sm">3 nouvelles offres pour votre mission 'Jardinage'</p>
                                        <p className="text-xs text-muted-foreground">il y a 5 minutes</p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button variant="outline" size="sm">Voir les offres</Button>
                                    <Button variant="ghost" size="sm">Ignorer</Button>
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <div className="p-2 rounded-md hover:bg-muted">
                                <div className="flex items-start gap-3">
                                    <Star className="h-4 w-4 mt-1 text-muted-foreground"/>
                                    <div className="flex-1">
                                        <p className="text-sm">Vous avez reçu un nouvel avis de la part de Marie D.</p>
                                        <p className="text-xs text-muted-foreground">il y a 1 heure</p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button variant="outline" size="sm">Laisser un avis</Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="unread">
                         <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                           <div className="p-2 rounded-md hover:bg-muted">
                                <div className="flex items-start gap-3">
                                    <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground"/>
                                    <div className="flex-1">
                                        <p className="text-sm">Nouveau message de Jean P. concernant la mission 'Aide aux courses'</p>
                                        <p className="text-xs text-muted-foreground">il y a 3 heures</p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button variant="default" size="sm">Répondre</Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                    <Link href="/dashboard/notifications" className="justify-center">
                            {t('viewAllNotifications')}
                    </Link>
                    </DropdownMenuItem>
                </Tabs>
            </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <Button asChild variant="ghost" size="icon">
                        <Link href="/dashboard/offline">
                            <Wifi className={cn(
                                status === 'offline' && 'text-destructive',
                                status === 'pending' && 'text-amber-500',
                                status === 'online' && 'text-green-500'
                            )}/>
                            <span className="sr-only">{tNav('offline')}</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t(`status.${status}`)}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                    <AvatarImage
                    src={user?.photoURL || undefined}
                    alt="User avatar"
                    />
                    <AvatarFallback>
                    {user?.profile?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                    {user.profile?.displayName || 'Utilisateur'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isProvider && (
                <>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between">
                    <Label htmlFor="availability-switch" className="pr-2 font-normal cursor-pointer">{t('availableForMissions')}</Label>
                    <Switch id="availability-switch" defaultChecked />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                </>
                )}
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span>{t('dashboard')}</span>
                    </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>{t('profile')}</span>
                    </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem onSelect={() => setSettingsModalOpen(true)}>
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>{tNav('settings')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                    <Link href="/dashboard/admin/support/tickets">
                        <LifeBuoy className="mr-2 h-4 w-4" />
                        <span>{t('support')}</span>
                    </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="ml-2">Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => setThemeState("theme-light")}>
                                <Sun className="mr-2 h-4 w-4" />
                                <span>Clair</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setThemeState("theme-dark")}>
                                <Moon className="mr-2 h-4 w-4" />
                                <span>Sombre</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setThemeState("system")}>
                                <Monitor className="mr-2 h-4 w-4" />
                                <span>Système</span>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('signOut')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

    