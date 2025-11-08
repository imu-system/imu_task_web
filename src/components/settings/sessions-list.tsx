'use client';

import { useState } from 'react';
import { Loader2, Smartphone, Laptop, Monitor, Tablet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface Session {
    id: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    city: string;
    country: string;
    ipAddress: string;
    isCurrent: boolean;
    lastActive: string;
}

interface SessionsListProps {
    sessions: Session[];
    onLogout: (sessionId: string) => Promise<void>;
    onLogoutAll: () => Promise<void>;
    currentLabel: string;
    lastActiveLabel: string;
    logoutLabel: string;
    logoutAllLabel: string;
}

export default function SessionsList({ 
    sessions, 
    onLogout, 
    onLogoutAll,
    currentLabel,
    lastActiveLabel,
    logoutLabel,
    logoutAllLabel
}: SessionsListProps) {
    const [logoutSessionId, setLogoutSessionId] = useState<string | null>(null);
    const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType) {
            case 'mobile':
                return Smartphone;
            case 'tablet':
                return Tablet;
            case 'desktop':
            default:
                return Monitor;
        }
    };

    const handleLogout = async (sessionId: string) => {
        setIsLoading(sessionId);
        try {
            await onLogout(sessionId);
            setLogoutSessionId(null);
        } catch (error) {
            console.error('Error logging out session:', error);
        } finally {
            setIsLoading(null);
        }
    };

    const handleLogoutAll = async () => {
        setIsLoading('all');
        try {
            await onLogoutAll();
            setShowLogoutAllDialog(false);
        } catch (error) {
            console.error('Error logging out all sessions:', error);
        } finally {
            setIsLoading(null);
        }
    };

    const nonCurrentSessions = sessions.filter(s => !s.isCurrent);

    return (
        <div className="space-y-4">
            {/* Logout all button */}
            {nonCurrentSessions.length > 1 && (
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowLogoutAllDialog(true)}
                        disabled={isLoading !== null}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        {logoutAllLabel}
                    </Button>
                </div>
            )}

            {/* Sessions list */}
            {sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceType);
                
                return (
                    <Card key={session.id} className={session.isCurrent ? 'border-primary' : ''}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="p-2 rounded-lg bg-muted">
                                        <DeviceIcon className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{session.browser}</p>
                                            {session.isCurrent && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                    {currentLabel}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {session.os}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {session.city}, {session.country} • {session.ipAddress}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {lastActiveLabel}: {session.lastActive}
                                        </p>
                                    </div>
                                </div>
                                {!session.isCurrent && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setLogoutSessionId(session.id)}
                                        disabled={isLoading !== null}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        {isLoading === session.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                {logoutLabel}
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {/* Single logout confirmation */}
            <AlertDialog open={logoutSessionId !== null} onOpenChange={(open) => !open && setLogoutSessionId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Log out this session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will sign you out from this device. You'll need to sign in again to access your account from that device.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading !== null}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => logoutSessionId && handleLogout(logoutSessionId)}
                            disabled={isLoading !== null}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging out...
                                </>
                            ) : (
                                'Log out'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Logout all confirmation */}
            <AlertDialog open={showLogoutAllDialog} onOpenChange={setShowLogoutAllDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Log out all other sessions?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will sign you out from all devices except this one. You'll need to sign in again on those devices.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading !== null}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogoutAll}
                            disabled={isLoading !== null}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isLoading === 'all' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging out...
                                </>
                            ) : (
                                'Log out all'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
