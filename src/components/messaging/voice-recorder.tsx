'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Mic, Square, Play, Pause, Trash2, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => Promise<void>;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const t = useTranslations('messaging');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio context for waveform visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      // Start waveform animation
      updateWaveform();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(t('microphoneAccessDenied'));
    }
  };

  // Update waveform visualization
  const updateWaveform = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const update = () => {
      if (!isRecording || isPaused) return;
      
      analyserRef.current!.getByteFrequencyData(dataArray);
      
      // Sample 20 values for waveform
      const samples = [];
      const step = Math.floor(bufferLength / 20);
      for (let i = 0; i < 20; i++) {
        const value = dataArray[i * step];
        samples.push(value / 255); // Normalize to 0-1
      }
      
      setWaveform(samples);
      animationFrameRef.current = requestAnimationFrame(update);
    };
    
    update();
  };

  // Pause/Resume recording
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      if (intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      }
      updateWaveform();
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  // Play/Pause playback
  const togglePlayback = () => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl!);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }
    
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  // Delete recording
  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setIsPlaying(false);
    setWaveform([]);
  };

  // Send audio
  const handleSend = async () => {
    if (!audioBlob) return;
    
    setIsSending(true);
    try {
      await onSend(audioBlob, duration);
      deleteRecording();
    } catch (error) {
      console.error('Error sending audio:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audioElementRef.current) audioElementRef.current.pause();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [audioUrl]);

  // Auto-start recording
  useEffect(() => {
    startRecording();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mic className="w-5 h-5 text-red-500" />
            {isRecording ? t('recording') : t('voiceMessage')}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={isSending}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Waveform Visualization */}
        <div className="mb-6 h-32 bg-muted/30 rounded-xl p-4 flex items-center justify-center gap-1">
          {isRecording && !audioBlob ? (
            waveform.map((value, i) => (
              <div
                key={i}
                className="flex-1 bg-primary rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(20, value * 100)}%`,
                  opacity: isPaused ? 0.3 : 1
                }}
              />
            ))
          ) : audioBlob ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <Mic className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{t('recordingReady')}</p>
            </div>
          ) : (
            <div className="flex gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-muted rounded-full"
                  style={{ height: '20%' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="text-center mb-6">
          <span className={cn(
            "text-3xl font-mono font-bold",
            isRecording && !isPaused && "text-red-500 animate-pulse"
          )}>
            {formatDuration(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {isRecording && !audioBlob && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={togglePause}
                className="w-12 h-12 rounded-full"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={stopRecording}
                className="w-16 h-16 rounded-full"
              >
                <Square className="w-6 h-6" />
              </Button>
            </>
          )}

          {audioBlob && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={deleteRecording}
                className="w-12 h-12 rounded-full"
                disabled={isSending}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlayback}
                className="w-12 h-12 rounded-full"
                disabled={isSending}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button
                variant="default"
                size="icon"
                onClick={handleSend}
                className="w-16 h-16 rounded-full bg-[#00A884] hover:bg-[#00A884]/90"
                disabled={isSending}
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </Button>
            </>
          )}
        </div>

        {/* Help text */}
        <p className="text-xs text-center text-muted-foreground mt-4">
          {isRecording && !audioBlob ? (
            <>
              {isPaused ? t('recordingPaused') : t('recordingInProgress')}
              <br />
              {t('tapStopWhenDone')}
            </>
          ) : audioBlob ? (
            t('tapSendOrDelete')
          ) : null}
        </p>
      </div>
    </div>
  );
}
