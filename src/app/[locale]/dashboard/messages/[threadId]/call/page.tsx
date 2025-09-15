
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getThreadById } from '@/lib/data';
import { Thread } from '@/lib/types';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Square, AlertTriangle } from 'lucide-react';
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
    const [isRecording, setIsRecording] = useState(false);
    const [callStatus, setCallStatus] = useState<'ringing' | 'active'>('ringing');
    const [callDuration, setCallDuration] = useState(0);

    useEffect(() => {
        const fetchedThread = getThreadById(threadId);
        if (fetchedThread) {
        setThread(fetchedThread);
        }
    }, [threadId]);

    useEffect(() => {
        // Simulate call connection
        const connectTimer = setTimeout(() => {
            setCallStatus('active');
        }, 3000);

        return () => clearTimeout(connectTimer);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callStatus === 'active') {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callStatus]);


    const otherParticipant = thread?.participants?.find(p => p.id !== user?.uid);

    if (!thread || !user) {
        return null; // Or a loading state
    }
    
    const handleEndCall = () => {
        // Logic to end the call
        router.back();
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    return (
        <div className="flex flex-col h-full items-center justify-between bg-background text-foreground p-4">
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
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
                    <p className="text-muted-foreground">
                        {callStatus === 'ringing' ? t('ringing') : t('callInProgress')}
                    </p>
                </div>
            </div>

            <div className="w-full max-w-sm">
                 {isRecording && (
                    <div className="mb-4 flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        <AlertTriangle className="h-4 w-4"/>
                        <p>{t('recordingConsent')}</p>
                    </div>
                )}
                <div className="flex items-center justify-evenly bg-muted p-3 rounded-full">
                    {callStatus === 'active' && <p className="font-mono text-lg font-semibold">{formatDuration(callDuration)}</p>}
                    
                    <Button 
                        variant={isMuted ? "secondary" : "outline"} 
                        size="icon" 
                        className="h-14 w-14 rounded-full"
                        onClick={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? <MicOff /> : <Mic />}
                    </Button>
                    
                    <Button 
                        variant={isRecording ? "destructive" : "outline"} 
                        size="icon" 
                        className="h-14 w-14 rounded-full"
                        onClick={() => setIsRecording(!isRecording)}
                        disabled={callStatus !== 'active'}
                    >
                        <Square className="h-5 w-5"/>
                    </Button>

                    <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-14 w-14 rounded-full"
                        onClick={handleEndCall}
                    >
                        <PhoneOff />
                    </Button>
                </div>
            </div>
        </div>
    );
}
