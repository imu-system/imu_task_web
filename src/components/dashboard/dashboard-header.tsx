'use client';

import { Bell, Menu, Settings, User, LogOut, HelpCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from '@/navigation';
import { AccountType } from '@/lib/types';
import { AlgoliaSearchBox } from './algolia-search-box';
import { ContextualSearch } from './contextual-search';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isAlgoliaConfigured } from '@/lib/algolia-config';

interface DashboardHeaderProps {
  accountType: AccountType;
  title?: string;
  showSearch?: boolean;
}

/**
 * Header moderne pour les dashboards
 * 
 * Features:
 * - Barre de recherche contextuelle
 * - Notifications en temps réel
 * - Menu utilisateur
 * - Responsive avec mobile menu
 */
export function DashboardHeader({ 
  accountType, 
  title,
  showSearch = true 
}: DashboardHeaderProps) {
  const { user, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [useAlgolia, setUseAlgolia] = useState(false);

  // Vérifier si Algolia est configuré
  useEffect(() => {
    setUseAlgolia(isAlgoliaConfigured());
  }, []);

  // Écouter les notifications non lues
  useEffect(() => {
    if (!user?.uid) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

  // Écouter les messages non lus
  useEffect(() => {
    if (!user?.uid) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('receiverId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setUnreadMessages(snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

  const getUserInitials = () => {
    if (user?.profile?.displayName) {
      return user.profile.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const getAccountTypeLabel = () => {
    switch (accountType) {
      case AccountType.individual:
        return 'Client';
      case AccountType.professional:
        return 'Professionnel';
      case AccountType.senior:
        return 'Senior';
      default:
        return '';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        {/* Title - Desktop */}
        {title && (
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{getAccountTypeLabel()}</p>
          </div>
        )}

        {/* Search Bar - Desktop */}
        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
            {useAlgolia ? (
              <AlgoliaSearchBox accountType={accountType} />
            ) : (
              <ContextualSearch accountType={accountType} />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Messages */}
          <Link href="/dashboard/messages">
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              {unreadMessages > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Notifications */}
          <Link href="/dashboard/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profile?.photoUrl || ''} alt={user?.profile?.displayName || ''} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.profile?.displayName || 'Utilisateur'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <Badge variant="secondary" className="w-fit mt-1">
                    {getAccountTypeLabel()}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help" className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Aide</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search Bar - Mobile */}
      {showSearch && (
        <div className="md:hidden px-4 pb-4">
          {useAlgolia ? (
            <AlgoliaSearchBox accountType={accountType} />
          ) : (
            <ContextualSearch accountType={accountType} />
          )}
        </div>
      )}
    </header>
  );
}
