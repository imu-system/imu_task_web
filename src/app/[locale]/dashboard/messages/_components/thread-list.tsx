
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { Thread } from '@/lib/types';
import { mockThreads } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Link, usePathname } from '@/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';


export function ThreadList() {
  const { user } = useAuth();
  const pathname = usePathname();
  const t = useTranslations('DashboardNav');
  const [threads, setThreads] = useState<Thread[]>(mockThreads);

  if (!user) return null;

  return (
    <div className="hidden md:flex w-full md:w-80 border-r flex-col bg-background">
      <div className="p-4 border-b space-y-4">
        <h2 className="text-xl font-bold font-headline">{t('messages')}</h2>
        <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-10" />
            </div>
            <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4"/>
            </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {threads.map((thread) => {
            const otherParticipant = thread.participantsData?.find(p => p.id !== user.uid);
            const isActive = pathname.includes(thread.id);
            return (
              <Link
                key={thread.id}
                ref={`/dashboard/messages/${thread.id}`}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg hover:bg-muted',
                  isActive && 'bg-muted'
                )} href={'/'}>
                <div className="relative">
                    <Avatar>
                      <AvatarImage src={otherParticipant?.profile?.photoUrl || undefined} />
                      <AvatarFallback>{otherParticipant?.profile?.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold truncate">{otherParticipant?.profile?.displayName}</p>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{thread.lastMessage?.body}</p>
                   {thread.task && <Badge variant="secondary" className="mt-1">{thread.task.title}</Badge>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
