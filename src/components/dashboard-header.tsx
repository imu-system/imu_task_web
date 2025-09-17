
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
import { Input } from './ui/input';

export function DashboardHeader() {
  const t = useTranslations('Header');
  const { user, signOut } = useAuth();
  const { toggleSidebar } = useSidebar();

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
      
      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>

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
            <span className="sr-only">{t('messages', { ns: 'DashboardNav' })}</span>
          </Link>
        </Button>
        
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/notifications">
            <Bell />
            <span className="sr-only">{t('notifications', { ns: 'DashboardNav' })}</span>
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
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                <span>{t('profile')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/admin/settings">
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span>{t('settings')}</span>
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
