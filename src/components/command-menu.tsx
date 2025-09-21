
'use client';

import * as React from 'react';
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

interface CommandMenuProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function CommandMenu({ open, setOpen }: CommandMenuProps) {
    const t = useTranslations('DashboardNav');
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <Link href="/dashboard" passHref>
            <CommandItem onSelect={() => setOpen(false)}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>{t('dashboard')}</span>
            </CommandItem>
          </Link>
          <Link href="/dashboard/tasks" passHref>
            <CommandItem onSelect={() => setOpen(false)}>
              <Smile className="mr-2 h-4 w-4" />
              <span>{t('myTasks')}</span>
            </CommandItem>
          </Link>
           <Link href="/dashboard/wallet" passHref>
            <CommandItem onSelect={() => setOpen(false)}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>{t('wallet')}</span>
            </CommandItem>
           </Link>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <Link href="/dashboard/profile" passHref>
            <CommandItem onSelect={() => setOpen(false)}>
              <User className="mr-2 h-4 w-4" />
              <span>{t('profile')}</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
          </Link>
          <Link href="/dashboard/settings" passHref>
            <CommandItem onSelect={() => setOpen(false)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('settings')}</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </Link>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
