
'use client';

import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Globe,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Menu,
  User,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LanguageRegionSwitcher from './language-region-switcher';

export default function Header() {
  const t = useTranslations('Header');
  const tLang = useTranslations('LanguageSwitcher');
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;

  const navLinks = [
    { href: '#features', label: t('features') },
    { href: '#how-it-works', label: t('howItWorks') },
    { href: '#categories', label: t('categories') },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.photoURL || "https://picsum.photos/id/1005/100/100"} alt="User" />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName || 'Utilisateur'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const AuthButtons = () => (
    <div className="hidden md:flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/sign-in">{t('signIn')}</Link>
      </Button>
      <Button asChild>
        <Link href="/inscription">{t('signUp')}</Link>
      </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg">ImuTask</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">{t('openMenu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-4 p-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                  <Zap className="h-6 w-6 text-primary" />
                  <span className="font-headline">ImuTask</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-muted-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
                <div className="border-t pt-4">
                  {isAuthenticated ? (
                     <div className="flex flex-col gap-2">
                        <Link href="/dashboard" className="w-full"><Button className="w-full">{t('dashboard')}</Button></Link>
                        <Button variant="secondary" onClick={logout}>{t('signOut')}</Button>
                     </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" asChild><Link href="/sign-in" className="w-full">{t('signIn')}</Link></Button>
                      <Button asChild><Link href="/inscription" className="w-full">{t('signUp')}</Link></Button>
                    </div>
                  )}
                </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <Link href="/" className="flex items-center gap-2 font-bold md:hidden">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg">ImuTask</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageRegionSwitcher />
            {isAuthenticated ? <UserMenu /> : <AuthButtons />}
          </div>
        </div>
      </div>
    </header>
  );
}
