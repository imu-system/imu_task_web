
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { getMessagesForThread, getThreadById } from '@/lib/data';
import { Message, Thread } from '@/lib/types';
import { Link } from '@/navigation';
import { Send, Paperclip, ArrowLeft, Phone, Bell, MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { user } = useAuth();
  const t = useTranslations('ThreadPage');
  
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchedThread = getThreadById(threadId);
    if (fetchedThread) {
      setThread(fetchedThread);
      const fetchedMessages = getMessagesForThread(threadId);
      setMessages(fetchedMessages);
    }
  }, [threadId]);

  if (!thread || !user) {
    return null;
  }
  
  const otherParticipant = thread.participants?.find(p => p.id !== user.uid);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between gap-4 p-2 border-b">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/messages">
                    <ArrowLeft/>
                </Link>
            </Button>
            <Avatar>
                <AvatarImage src={otherParticipant?.profile?.photoUrl || undefined}/>
                <AvatarFallback>{otherParticipant?.profile?.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold">{otherParticipant?.profile?.displayName}</p>
                <p className="text-sm text-muted-foreground">{t('task')}: {thread.task?.title}</p>
            </div>
        </div>
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
                <Phone />
            </Button>
            <Button variant="ghost" size="icon">
                <Bell />
            </Button>
             <Button variant="ghost" size="icon">
                <MoreVertical />
            </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(message => {
            const isSender = message.senderId === user.uid;
            return (
                 <div key={message.id} className={`flex items-end gap-2 ${isSender ? 'justify-end' : ''}`}>
                    {!isSender && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={otherParticipant?.profile?.photoUrl || undefined}/>
                            <AvatarFallback>{otherParticipant?.profile?.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isSender ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p>{message.body}</p>
                        <p className={`text-xs mt-1 ${isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                 </div>
            )
        })}
      </main>
      <footer className="p-4 border-t">
        <div className="relative">
            <Input placeholder={t('placeholder')} className="pr-24"/>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon"><Paperclip/></Button>
                <Button><Send/></Button>
            </div>
        </div>
      </footer>
    </div>
  );
}
