/**
 * New Conversation Modal
 * 
 * Modal pour sélectionner un utilisateur et démarrer une nouvelle conversation
 * Features: Search users, filtrage, création du thread
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, X, User, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useCreateThread } from '@/hooks/use-messaging';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Profile } from '@/lib/types';
import { UserProfile } from 'firebase/auth';

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
}

interface UserSearchResult {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: string;
}

export function NewConversationModal({
  open,
  onOpenChange,
  currentUserId,
}: NewConversationModalProps) {
  const t = useTranslations('messaging');
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const createThreadMutation = useCreateThread();

  // Charger les utilisateurs au montage
  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  // Filtrer les utilisateurs selon la recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.displayName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setIsSearching(true);
    try {
      // Récupérer tous les utilisateurs sauf l'utilisateur actuel
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('__name__', '!=', currentUserId),
        limit(50) // Limite pour performance
      );
      
      const snapshot = await getDocs(q);
      const usersData: UserSearchResult[] = snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          displayName: typeof data.displayName === 'string' ? data.displayName : 'Utilisateur',
          email: typeof data.email === 'string' ? data.email : '',
          photoURL: typeof data.photoURL === 'string' ? data.photoURL : undefined,
          role: typeof data.role === 'string' ? data.role : 'user',
        };
      });

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = async (userId: string) => {
    setIsCreating(true);
    try {
      // Créer ou récupérer le thread avec cet utilisateur
      const threadId = await createThreadMutation.mutateAsync({
        participants: [currentUserId, userId],
      });

      // Fermer la modal
      onOpenChange(false);
      
      // Rediriger vers la conversation
      router.push(`/dashboard/messages/${threadId}`);

      toast({
        title: 'Conversation créée',
        description: 'Vous pouvez maintenant envoyer des messages',
      });
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la conversation',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setSearchQuery('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('newConversation')}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isCreating}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchUsers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={isSearching || isCreating}
          />
        </div>

        {/* Users list */}
        <ScrollArea className="h-[400px] -mx-6 px-6">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? t('noUsersFound')
                  : t('noUsersAvailable')}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  disabled={isCreating}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL} alt={user.displayName} />
                    <AvatarFallback>
                      {user.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  {isCreating && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
