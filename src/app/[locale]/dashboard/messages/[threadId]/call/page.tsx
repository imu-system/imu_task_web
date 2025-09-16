
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getThreadById } from '@/lib/data';
import { Thread } from '@/lib/types';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Square, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from '@/navigation';
import { useEffect, useState, useRef } from 'react';
import { WebRTCService } from '@/lib/webrtc';

export default function CallPage() {
    const { threadId } = useParams<{ threadId: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const t = useTranslations('CallPage');
    
    const [thread, setThread] = useState<Thread | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [callStatus, setCallStatus] = useState<'connecting' | 'active'>('connecting');
    const [callDuration, setCallDuration] = useState(0);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const webRTCService = useRef<WebRTCService | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const fetchedThread = getThreadById(threadId);
        if (fetchedThread) {
            setThread(fetchedThread);
        }
    }, [threadId]);

     useEffect(() => {
        if (!user || !thread) return;

        const onRemoteStream = (stream: MediaStream) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
            setCallStatus('active');
        };

        const service = new WebRTCService(threadId, onRemoteStream);
        webRTCService.current = service;

        const startCallFlow = async () => {
            try {
                const localStream = await service.getMedia();
                localStreamRef.current = localStream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream;
                }
                
                // For simplicity, we assume this user is always the caller.
                // A real-world app would need to check if a call offer already exists.
                await service.startCall();

            } catch (error) {
                console.error("Error starting call flow:", error);
                // Handle error (e.g., show a toast to the user)
                router.back();
            }
        };

        startCallFlow();

        return () => {
            webRTCService.current?.hangUp();
        };
    }, [user, thread, threadId, router]);


    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callStatus === 'active') {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callStatus]);

    const otherParticipant = thread?.participantsData?.find(p => p.id !== user?.uid);

    if (!thread || !user) {
        return null; // Or a loading state
    }
    
    const handleEndCall = () => {
        webRTCService.current?.hangUp();
        router.back();
    }

    const handleToggleMute = () => {
        setIsMuted(prev => {
            const newMutedState = !prev;
            if (localStreamRef.current) {
                localStreamRef.current.getAudioTracks().forEach(track => {
                    track.enabled = !newMutedState;
                });
            }
            return newMutedState;
        });
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    return (
        <div className="flex flex-col h-full items-center justify-between bg-black text-white p-4 relative">
            
            {/* Remote Video */}
            <div className="absolute inset-0 z-0">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            {/* Local Video Preview */}
            <div className="absolute top-4 right-4 z-20">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-48 h-32 object-cover rounded-lg border-2 border-white"></video>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 text-center">
                <Avatar className="h-32 w-32 border-4 border-white">
                    <AvatarImage src={otherParticipant?.profile?.photoUrl || undefined} />
                    <AvatarFallback className="text-4xl">
                        {otherParticipant?.profile?.displayName.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-3xl font-bold font-headline">
                        {otherParticipant?.profile?.displayName}
                    </h2>
                    <p className="text-white/80">
                        {callStatus === 'connecting' ? t('ringing') : t('callInProgress')}
                    </p>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-sm">
                 {isRecording && (
                    <div className="mb-4 flex items-center justify-center gap-2 text-sm text-amber-400 bg-amber-900/50 p-2 rounded-lg border border-amber-500/50">
                        <AlertTriangle className="h-4 w-4"/>
                        <p>{t('recordingConsent')}</p>
                    </div>
                )}
                 {callStatus === 'active' && <p className="text-center font-mono text-lg font-semibold mb-2">{formatDuration(callDuration)}</p>}
                <div className="flex items-center justify-evenly bg-white/10 backdrop-blur-sm p-3 rounded-full">
                    <Button 
                        variant={isMuted ? "secondary" : "outline"} 
                        size="icon" 
                        className="h-14 w-14 rounded-full bg-white/20 border-none hover:bg-white/30 text-white"
                        onClick={handleToggleMute}
                    >
                        {isMuted ? <MicOff /> : <Mic />}
                    </Button>
                    
                    <Button 
                        variant={isRecording ? "destructive" : "outline"} 
                        size="icon" 
                        className="h-14 w-14 rounded-full bg-white/20 border-none hover:bg-white/30 text-white"
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
