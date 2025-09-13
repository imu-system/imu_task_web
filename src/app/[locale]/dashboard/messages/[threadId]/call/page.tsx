
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getThreadById } from '@/lib/data';
import { Thread } from '@/lib/types';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from '@/navigation';
import { useEffect, useState } from 'react';

export default function CallPage() {
    const { threadId } = useParams<{ threadId: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const t = useTranslations('CallPage');
    
    const [thread, setThread] = useState<Thread | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(true); // Audio call by default

    useEffect(() => {
        const fetchedThread = getThreadById(threadId);
        if (fetchedThread) {
        setThread(fetchedThread);
        }
    }, [threadId]);

    const otherParticipant = thread?.participants?.find(p => p.id !== user?.uid);

    if (!thread || !user) {
        return null; // Or a loading state
    }
    
    const handleEndCall = () => {
        // Logic to end the call
        router.back();
    }

    return (
        <div className="flex flex-col h-full items-center justify-center bg-background text-foreground p-4">
            <div className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                    <AvatarImage src={otherParticipant?.profile?.photoUrl || undefined} />
                    <AvatarFallback className="text-4xl">
                        {otherParticipant?.profile?.displayName.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-headline">
                        {otherParticipant?.profile?.displayName}
                    </h2>
                    <p className="text-muted-foreground">{t('calling')}</p>
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
                 <Button 
                    variant={isMuted ? "secondary" : "outline"} 
                    size="icon" 
                    className="h-16 w-16 rounded-full"
                    onClick={() => setIsMuted(!isMuted)}
                >
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-16 w-16 rounded-full"
                    onClick={handleEndCall}
                >
                    <PhoneOff />
                </Button>
                 <Button 
                    variant={isCameraOff ? "secondary" : "outline"} 
                    size="icon" 
                    className="h-16 w-16 rounded-full"
                    onClick={() => setIsCameraOff(!isCameraOff)}
                >
                    {isCameraOff ? <VideoOff /> : <Video />}
                </Button>
            </div>
        </div>
    );
}

