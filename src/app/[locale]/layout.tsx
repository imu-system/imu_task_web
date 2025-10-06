import { NextIntlClientProvider } from 'next-intl';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { getTranslations, getMessages } from 'next-intl/server';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationToastProvider } from '@/components/notifications';
import { AppHeaderClient } from '@/components/layout/app-header-client';
import { ReactQueryProvider } from '@/lib/react-query/provider';
import {
  Bell,
  Home,
  MessageSquare,
  Search,
  Users,
  PlusCircle,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { ImuTaskLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: 'ImuTask',
    description: 'Streamline your tasks and connect with providers.',
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const t = await getTranslations('Navigation');
  const tUserMenu = await getTranslations('UserMenu');
  const tRootLayout = await getTranslations('RootLayout');
 
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReactQueryProvider>
            <AuthProvider>
              <NotificationToastProvider>
                <div className="flex min-h-screen w-full flex-col">
                <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
              <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold md:text-base"
                >
                  <ImuTaskLogo className="h-8 w-8 text-primary" />
                  <span className="sr-only">ImuTask</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="text-foreground transition-colors hover:text-foreground"
                >
                  {t('dashboard')}
                </Link>
                <Link
                  href="/tasks/new"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('newTask')}
                </Link>
                <Link
                  href="/providers"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('providers')}
                </Link>
                <Link
                  href="/messages"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('messages')}
                </Link>
              </nav>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <nav className="grid gap-6 text-lg font-medium">
                    <Link
                      href="/"
                      className="flex items-center gap-2 text-lg font-semibold"
                    >
                      <ImuTaskLogo className="h-8 w-8 text-primary" />
                      <span className="sr-only">ImuTask</span>
                    </Link>
                    <Link href="/dashboard" className="hover:text-foreground">
                      {t('dashboard')}
                    </Link>
                    <Link
                      href="/tasks/new"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {t('newTask')}
                    </Link>
                    <Link
                      href="/providers"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {t('providers')}
                    </Link>
                    <Link
                      href="/messages"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {t('messages')}
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
              <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <form className="ml-auto flex-1 sm:flex-initial">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={tRootLayout('searchPlaceholder')}
                      className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                    />
                  </div>
                </form>
                <AppHeaderClient locale={locale as 'fr' | 'en' | 'es' | 'de' | 'ja'} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="https://picsum.photos/100"
                          alt="@shadcn"
                          data-ai-hint="person"
                        />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {tUserMenu('myAccount')}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">{tUserMenu('profile')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>{tUserMenu('support')}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/auth/login">{tUserMenu('logout')}</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              {children}
            </main>
          </div>
          <Toaster />
            </NotificationToastProvider>
          </AuthProvider>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
