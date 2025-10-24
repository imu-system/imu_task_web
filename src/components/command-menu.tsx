
'use client';

import * as React from 'react';
import {
  LayoutGrid,
  User,
  BookMarked,
  LifeBuoy,
  PlusCircle,
  Settings,
} from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { useRouter } from 'next/navigation';

interface CommandMenuProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function CommandMenu({ open, setOpen }: CommandMenuProps) {
    const t = useTranslations('DashboardNav');
  const router = useRouter();

    const runCommand = (command: () => unknown) => {
        setOpen(false);
        command();
    };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Tapez une commande ou une recherche..." />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

        <CommandGroup heading="Missions">
            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/tasks/new'))}>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Créer une nouvelle mission</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/tasks'))}>
                <BookMarked className="mr-2 h-4 w-4" />
                <span>Voir mes missions</span>
            </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />

        <CommandGroup heading="Utilisateurs">
             <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/profile'))}>
                <User className="mr-2 h-4 w-4" />
                <span>Voir mon profil</span>
            </CommandItem>
             <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/admin/users'))}>
                <User className="mr-2 h-4 w-4" />
                <span>Rechercher un utilisateur...</span>
            </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Navigation">
          <Link href="/dashboard" passHref>
            <CommandItem onSelect={() => runCommand(() => {})}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span>{t('dashboard')}</span>
            </CommandItem>
          </Link>
          <Link href="/dashboard/settings" passHref>
            <CommandItem onSelect={() => runCommand(() => {})}>
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('settings')}</span>
            </CommandItem>
          </Link>
           <Link href="/dashboard/admin/support/tickets" passHref>
            <CommandItem onSelect={() => runCommand(() => {})}>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>{t('support')}</span>
            </CommandItem>
          </Link>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
