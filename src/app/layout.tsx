import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Bell,
  Home,
  LineChart,
  MessageSquare,
  Package,
  Package2,
  Search,
  Users,
  Briefcase,
  PlusCircle,
} from 'lucide-react';
import './globals.css';

import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImuTaskLogo } from '@/components/icons';

export const metadata: Metadata = {
  title: 'ImuTask',
  description: 'Streamline your tasks and connect with providers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <SidebarProvider>
          <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar side="left" collapsible="icon" variant="sidebar">
              <SidebarContent>
                <SidebarHeader className="h-14">
                  <Link href="/" className="flex items-center gap-2 font-semibold">
                    <ImuTaskLogo className="h-8 w-8 text-primary" />
                    <span className="">ImuTask</span>
                  </Link>
                </SidebarHeader>
                <SidebarMenu className="flex-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/" tooltip="Dashboard">
                      <Home />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/tasks/new" tooltip="New Task">
                      <PlusCircle />
                      <span>New Task</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/providers" tooltip="Providers">
                      <Users />
                      <span>Providers</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/messages" tooltip="Messages">
                      <MessageSquare />
                      <span>Messages</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
            <div className="flex flex-col sm:gap-4 sm:py-4">
              <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <div className="relative flex-1 md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search tasks..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[280px] lg:w-[320px]"
                  />
                </div>
                <div className="flex items-center gap-4 ml-auto">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Toggle notifications</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="https://picsum.photos/100" alt="@shadcn" data-ai-hint="person" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Support</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/login">Logout</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>
              <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
