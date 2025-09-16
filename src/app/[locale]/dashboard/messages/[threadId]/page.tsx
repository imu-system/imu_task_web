
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { getThreadById } from '@/lib/data';
import { Attachment, AttachmentKind, Message, MessageType, Thread } from '@/lib/types';
import { Link } from '@/navigation';
import { Send, Paperclip, ArrowLeft, Phone, Bell, MoreVertical, Smile, Mic, Plus, FileText, Download, Play, ShieldAlert, Trash2, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Fragment, useEffect, useState, useRef } from 'react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import AttachmentPreview from '@/components/attachment-preview';
import { collection, onSnapshot, orderBy, query, Timestamp, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    // Fetch thread details (non-real-time for now)
    const fetchedThread = getThreadById(threadId);
    if (fetchedThread) {
      setThread(fetchedThread);
    }

    // Set up real-time listener for messages
    const messagesQuery = query(
        collection(db, 'threads', threadId, 'messages'),
        orderBy('sentAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData: Message[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                sentAt: (data.sentAt as Timestamp)?.toDate ? (data.sentAt as Timestamp).toDate() : new Date(),
            } as Message;
        });
        setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [threadId]);

  const sendMessage = async (messageContent: string) => {
    if (!user || !messageContent.trim()) return;

    setIsSending(true);
    try {
      const batch = writeBatch(db);

      const messagesCol = collection(db, 'threads', threadId, 'messages');
      const newMessageRef = doc(messagesCol);
      batch.set(newMessageRef, {
        senderId: user.uid,
        body: messageContent,
        type: MessageType.text,
        sentAt: serverTimestamp(),
      });
      
      const threadRef = doc(db, 'threads', threadId);
      batch.update(threadRef, {
        lastMessage: {
          body: messageContent,
          senderId: user.uid,
        },
        lastMessageAt: serverTimestamp(),
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: 'destructive',
        title: t('toastErrorTitle'),
        description: t('toastErrorDescription'),
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
    }
  };

  const handleQuickReply = async (message: string) => {
    if (isSending) return;
    await sendMessage(message);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Fichier sélectionné:', file.name);
      // La logique d'upload sera ajoutée ici
    }
  };


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
            <Button variant="outline" size="sm" onClick={() => handleQuickReply('Ok ✔')} disabled={isSending}>Ok ✔</Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickReply('Merci 🙏')} disabled={isSending}>Merci 🙏</Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickReply('RDV demain ?')} disabled={isSending}>RDV demain ?</Button>
        </div>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button variant="ghost" size="icon" type="button">
                <Plus/>
            </Button>
            <Button variant="ghost" size="icon" type="button">
                <Smile/>
            </Button>
            <Input 
                placeholder={t('placeholder')} 
                className="flex-1" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isSending}
            />
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect}
                className="hidden"
            />
            <Button variant="ghost" size="icon" type="button" onClick={() => fileInputRef.current?.click()}>
                <Paperclip/>
            </Button>
             <Button variant="ghost" size="icon" type="button">
                <Mic/>
            </Button>
            <Button type="submit" disabled={!newMessage.trim() || isSending}>
                {isSending ? <Loader2 className="animate-spin" /> : <Send/>}
            </Button>
        </form>
      </footer>
    </div>
  );
}
