
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { getThreadsForUser } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Link, usePathname } from '@/navigation';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

const mockThreads = getThreadsForUser('user1'); // Assuming current user is user1 for now

export function ThreadList() {
  const { user } = useAuth();
  const pathname = usePathname();
  const t = useTranslations('DashboardNav');

  if (!user) return null;

  return (
    <div className="hidden md:flex w-full md:w-80 border-r flex-col bg-background">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold font-headline">{t('messages')}</h2>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-10" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {mockThreads.map((thread) => {
            const otherParticipant = thread.participantsData?.find(p => p.id !== user.uid);
            const isActive = pathname.includes(thread.id);
            return (
              <Link
                key={thread.id}
                href={`/dashboard/messages/${thread.id}`}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg hover:bg-muted',
                  isActive && 'bg-muted'
                )}
              >
                <Avatar>
                  <AvatarImage src={otherParticipant?.profile?.photoUrl || undefined} />
                  <AvatarFallback>{otherParticipant?.profile?.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="font-semibold">{otherParticipant?.profile?.displayName}</p>
                  <p className="text-sm text-muted-foreground truncate">{thread.lastMessage?.body}</p>
                </div>
                <time className="text-xs text-muted-foreground">
                    {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </time>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
