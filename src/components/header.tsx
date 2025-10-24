
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
  Settings,
  CreditCard,
  Bell,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LanguageCurrencyModal from './language-currency-modal';
import Image from 'next/image';

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
    <div className="hidden md:flex items-center gap-3">
      <Button 
        variant="ghost" 
        asChild 
        className="rounded-3xl font-medium hover:bg-muted/60"
      >
        <Link href="/become-provider" className="flex items-center gap-2">
          <span>{t('becomeHost') || 'Devenir prestataire'}</span>
        </Link>
      </Button>
      <LanguageCurrencyModal />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-auto px-3 py-2 rounded-3xl hover:shadow-md transition-all border border-border/40 hover:border-border"
          >
            <div className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || "https://picsum.photos/id/1005/100/100"} alt="User" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-2xl shadow-xl border-border/50 p-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal px-3 py-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{user?.displayName || 'Utilisateur'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
          <Link href="/dashboard" className="flex items-center">
            <LayoutGrid className="mr-3 h-4 w-4" />
            <span>{t('dashboard')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
          <Link href="/dashboard/profile" className="flex items-center">
            <User className="mr-3 h-4 w-4" />
            <span>{t('profile')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
          <Link href="/dashboard/bookings" className="flex items-center">
            <Star className="mr-3 h-4 w-4" />
            <span>{t('bookings') || 'Mes réservations'}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
          <Link href="/dashboard/notifications" className="flex items-center">
            <Bell className="mr-3 h-4 w-4" />
            <span>{t('notifications') || 'Notifications'}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
          <Link href="/dashboard/settings" className="flex items-center">
            <Settings className="mr-3 h-4 w-4" />
            <span>{t('settings') || 'Paramètres'}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
          <Link href="/help" className="flex items-center">
            <LifeBuoy className="mr-3 h-4 w-4" />
            <span>{t('help') || 'Aide'}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem onClick={logout} className="rounded-xl cursor-pointer py-2.5 text-destructive focus:text-destructive">
          <LogOut className="mr-3 h-4 w-4" />
          <span>{t('signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const AuthButtons = () => (
    <div className="hidden sm:flex items-center gap-3">
      <Button 
        variant="ghost" 
        asChild 
        className="rounded-3xl font-medium hover:bg-muted/60 hidden md:flex"
      >
        <Link href="/become-provider" className="flex items-center gap-2">
          <span>{t('becomeHost') || 'Devenir prestataire'}</span>
        </Link>
      </Button>
      <LanguageCurrencyModal />
      <Button 
        variant="ghost" 
        asChild
        className="relative h-auto px-3 py-2 rounded-3xl hover:shadow-md transition-all border border-border/40 hover:border-border"
      >
        <Link href="/sign-in" className="flex items-center gap-2">
          <Menu className="h-4 w-4" />
          <User className="h-5 w-5 text-muted-foreground" />
        </Link>
      </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-20 items-center px-4 md:px-8">
        {/* Logo - Desktop & Mobile */}
        <Link href="/" className="flex items-center gap-2 mr-6 md:mr-10">
          <div className="relative h-10 w-10">
            <Image
              src="/images/logo_imutask_v2_no_background.png"
              alt="ImuTask Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-headline text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hidden sm:inline">
            ImuTask
          </span>
        </Link>

        {/* Navigation - Desktop Only */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium flex-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-foreground/70 transition-colors hover:text-foreground hover:underline underline-offset-4"
            >
              {link.label}
            </a>
          ))}
        </nav>
        
        {/* Right Side: Auth/User Menu */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t('openMenu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex flex-col gap-6 p-4">
                  {/* Mobile Logo */}
                  <Link href="/" className="flex items-center gap-3 font-bold text-lg" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="relative h-10 w-10">
                      <Image
                        src="/images/logo_imutask_v2_no_background.png"
                        alt="ImuTask"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-headline text-xl">ImuTask</span>
                  </Link>
                  
                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-3">
                    {navLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="text-foreground/80 hover:text-foreground font-medium py-2 px-3 rounded-xl hover:bg-muted/60 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                  
                  {/* Mobile Auth Section */}
                  <div className="border-t pt-6 mt-2">
                    {isAuthenticated ? (
                      <div className="flex flex-col gap-3">
                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full rounded-2xl font-medium" size="lg">
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            {t('dashboard')}
                          </Button>
                        </Link>
                        <Link href="/dashboard/profile" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full rounded-2xl font-medium" size="lg">
                            <User className="mr-2 h-4 w-4" />
                            {t('profile')}
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full rounded-2xl font-medium text-destructive hover:text-destructive"
                          size="lg"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {t('signOut')}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Button variant="outline" asChild className="w-full rounded-2xl font-medium" size="lg">
                          <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                            {t('signIn')}
                          </Link>
                        </Button>
                        <Button asChild className="w-full rounded-2xl font-medium" size="lg">
                          <Link href="/inscription" onClick={() => setIsMobileMenuOpen(false)}>
                            {t('signUp')}
                          </Link>
                        </Button>
                        <Button variant="ghost" asChild className="w-full rounded-2xl font-medium mt-2">
                          <Link href="/become-provider" onClick={() => setIsMobileMenuOpen(false)}>
                            {t('becomeHost') || 'Devenir prestataire'}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile Language Switcher */}
                  <div className="border-t pt-4">
                    <LanguageCurrencyModal variant="outline" className="w-full justify-start" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Auth/User Menu */}
          {isAuthenticated ? <UserMenu /> : <AuthButtons />}
        </div>
      </div>
    </header>
  );
}
