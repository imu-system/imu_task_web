
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Button } from './ui/button';
import { useSidebar } from './ui/sidebar';
import { CommandMenu } from './command-menu';
import React from 'react';

export function DashboardHeader() {
  const t = useTranslations('Header');
  const tNav = useTranslations('DashboardNav');
  const { user, signOut } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
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


  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <Menu />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Command Menu */}
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t('create')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/tasks/new">{t('createTask')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/availability">{t('setAvailability')}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/messages">
            <MessageSquare />
            <span className="sr-only">{tNav('messages')}</span>
          </Link>
        </Button>
        
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/notifications">
            <Bell />
            <span className="sr-only">{tNav('notifications')}</span>
          </Link>
        </Button>

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
             <DropdownMenuItem asChild>
              <Link href="/dashboard/admin/support/tickets">
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>{t('support')}</span>
              </Link>
            </DropdownMenuItem>
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
