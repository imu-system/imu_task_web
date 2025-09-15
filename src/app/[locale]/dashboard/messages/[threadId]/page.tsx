

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { getMessagesForThread, getThreadById } from '@/lib/data';
import { Attachment, AttachmentKind, Message, Thread } from '@/lib/types';
import { Link } from '@/navigation';
import { Send, Paperclip, ArrowLeft, Phone, Bell, MoreVertical, Smile, Mic, Plus, FileText, Download, Play, ShieldAlert, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import AttachmentPreview from '@/components/attachment-preview';

function isSameDay(date1: Date, date2: Date) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

const DateSeparator = ({ date }: { date: Date }) => {
    return (
        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <Separator />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-background px-2 text-xs text-muted-foreground">
                    {date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>
        </div>
    );
};


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
  
  const otherParticipant = thread.participantsData?.find(p => p.id !== user.uid);

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center justify-between gap-4 p-2 border-b">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="md:hidden">
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
            <Button variant="ghost" size="icon" asChild>
                <Link href={`/dashboard/messages/${threadId}/call`}>
                    <Phone />
                </Link>
            </Button>
            <Button variant="ghost" size="icon">
                <Bell />
            </Button>
             <Button variant="ghost" size="icon">
                <MoreVertical />
            </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => {
            const isSender = message.senderId === user.uid;
            const currentMessageDate = new Date(message.sentAt);
            const prevMessageDate = index > 0 ? new Date(messages[index - 1].sentAt) : null;
            const showDateSeparator = !prevMessageDate || !isSameDay(currentMessageDate, prevMessageDate);

            return (
                 <Fragment key={message.id}>
                    {showDateSeparator && <DateSeparator date={currentMessageDate} />}
                    <div className={`flex items-end gap-2 ${isSender ? 'justify-end' : ''}`}>
                        {!isSender && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={otherParticipant?.profile?.photoUrl || undefined}/>
                                <AvatarFallback>{otherParticipant?.profile?.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isSender ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            {message.body && <p>{message.body}</p>}
                            {message.attachments?.map((att, i) => <AttachmentPreview key={i} attachment={att} />)}
                            <p className={`text-xs mt-1 ${isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </Fragment>
            )
        })}
      </main>
      <footer className="p-4 border-t bg-background space-y-3">
        <div className="flex justify-start gap-2">
            <Button variant="outline" size="sm">Ok ✔</Button>
            <Button variant="outline" size="sm">Merci 🙏</Button>
            <Button variant="outline" size="sm">RDV demain ?</Button>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
                <Plus/>
            </Button>
            <Button variant="ghost" size="icon">
                <Smile/>
            </Button>
            <Input placeholder={t('placeholder')} className="flex-1" />
            <Button variant="ghost" size="icon">
                <Paperclip/>
            </Button>
             <Button variant="ghost" size="icon">
                <Mic/>
            </Button>
            <Button>
                <Send/>
            </Button>
        </div>
      </footer>
    </div>
  );
}
