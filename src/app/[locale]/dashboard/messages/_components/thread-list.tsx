
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { Message, Thread, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Link, usePathname } from '@/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { collection, query, where, onSnapshot, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getTaskById } from '@/lib/tasks'; // Assuming a function to get task by ID

export function ThreadList() {
  const { user } = useAuth();
  const pathname = usePathname();
  const t = useTranslations('DashboardNav');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = query(collection(db, 'threads'), where('participants', 'array-contains', user.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const threadsData: Thread[] = await Promise.all(snapshot.docs.map(async (threadDoc) => {
        const data = threadDoc.data();
        
        // Fetch other participant's data
        const otherParticipantId = data.participants.find((pId: string) => pId !== user.uid);
        let otherParticipantData: User | undefined;
        if (otherParticipantId) {
            const userRef = doc(db, 'users', otherParticipantId);
            const profileRef = doc(db, 'profiles', otherParticipantId);
            const userSnap = await getDoc(userRef);
            const profileSnap = await getDoc(profileRef);
            if (userSnap.exists()) {
                otherParticipantData = { id: userSnap.id, ...userSnap.data(), profile: profileSnap.data() } as User;
            }
        }

        // Fetch task data
        let taskData;
        if (data.taskId) {
            const taskRef = doc(db, 'tasks', data.taskId);
            const taskSnap = await getDoc(taskRef);
            if (taskSnap.exists()) {
                taskData = taskSnap.data();
            }
        }
        
        const participantsData = [user, otherParticipantData].filter(Boolean) as User[];
        
        return {
          id: threadDoc.id,
          ...data,
          participantsData,
          task: taskData,
          lastMessageAt: (data.lastMessageAt as Timestamp)?.toDate ? (data.lastMessageAt as Timestamp).toDate() : new Date(),
        } as Thread;
      }));

      // Sort by most recent message
      threadsData.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      
      setThreads(threadsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);


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
          {loading ? (
             <p className="p-4 text-sm text-center text-muted-foreground">Chargement des conversations...</p>
          ) : threads.length === 0 ? (
             <p className="p-4 text-sm text-center text-muted-foreground">Aucune conversation.</p>
          ) : (
            threads.map((thread) => {
                const otherParticipant = thread.participantsData?.find(p => p.id !== user.uid);
                const isActive = pathname.includes(thread.id);
                return (
                <Link
                    key={thread.id}
                    href={`/dashboard/messages/${thread.id}`}
                    className={cn(
                    'flex items-start gap-3 p-3 rounded-lg hover:bg-muted',
                    isActive && 'bg-muted'
                    )}>
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
            })
          )}
        </nav>
      </div>
    </div>
  );
}
