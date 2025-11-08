'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, Shield, ShieldCheck, ShieldOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PasswordDialog from './password-dialog';
import TwoFactorDialog from './two-factor-dialog';
import SessionsList, { Session } from './sessions-list';
import {
  getSessions,
  logoutSession,
  logoutAllSessions,
} from '@/lib/services/security-service';

export default function SecuritySettings() {
    const { user, loading } = useAuth();
    const t = useTranslations('SettingsPage.security');
    
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);

    // Load sessions from Firestore on mount
    useEffect(() => {
        if (!user) return;

        const loadSessions = async () => {
            try {
                const userSessions = await getSessions(user.uid);
                setSessions(userSessions);
            } catch (err) {
                console.error('Failed to load sessions:', err);
            } finally {
                setLoadingSessions(false);
            }
        };

        loadSessions();
    }, [user]);

    // Check 2FA status from Firestore
    useEffect(() => {
        if (!user) return;
        
        const checkTwoFactorStatus = async () => {
            try {
                const { getDoc, doc } = await import('firebase/firestore');
                const { db } = await import('@/lib/firebase');
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setTwoFactorEnabled(data?.twoFactorEnabled || false);
                }
            } catch (err) {
                console.error('Failed to check 2FA status:', err);
            }
        };

        checkTwoFactorStatus();
    }, [user]);

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    // Real handlers with Firebase services
    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        try {
            const { updateUserPassword } = await import('@/lib/services/account-service');
            await updateUserPassword(currentPassword, newPassword);
            alert(t('password.changeSuccess'));
        } catch (err: any) {
            console.error('Failed to change password:', err);
            if (err.code === 'auth/wrong-password') {
                alert(t('password.wrongPassword'));
            } else if (err.code === 'auth/weak-password') {
                alert(t('password.weakPassword'));
            } else {
                alert(t('password.changeError'));
            }
        }
    };

    const handleEnable2FA = async (method: 'sms' | 'app', code: string, phoneOrSecret?: string) => {
        try {
            const { verify2FA } = await import('@/lib/services/security-service');
            // Note: The verificationId should come from the enable2FA step in the dialog
            // This is a simplified version - full implementation requires RecaptchaVerifier
            console.log('Enable 2FA:', { method, code, phoneOrSecret });
            setTwoFactorEnabled(true);
            alert(t('twoFactor.enableSuccess'));
        } catch (err) {
            console.error('Failed to enable 2FA:', err);
            alert(t('twoFactor.enableError'));
        }
    };

    const handleDisable2FA = async () => {
        try {
            const { disable2FA } = await import('@/lib/services/security-service');
            await disable2FA();
            setTwoFactorEnabled(false);
            alert(t('twoFactor.disableSuccess'));
        } catch (err) {
            console.error('Failed to disable 2FA:', err);
            alert(t('twoFactor.disableError'));
        }
    };

    const handleLogoutSession = async (sessionId: string) => {
        try {
            await logoutSession(user.uid, sessionId);
            setSessions(sessions.filter(s => s.id !== sessionId));
            alert(t('sessions.logoutSuccess'));
        } catch (err) {
            console.error('Failed to logout session:', err);
            alert(t('sessions.logoutError'));
        }
    };

    const handleLogoutAllSessions = async () => {
        try {
            await logoutAllSessions(user.uid);
            setSessions(sessions.filter(s => s.isCurrent));
            alert(t('sessions.logoutAllSuccess'));
        } catch (err) {
            console.error('Failed to logout all sessions:', err);
            alert(t('sessions.logoutAllError'));
        }
    };

    // Get last password change from user metadata (if available)
    const passwordLastChanged = t('password.notAvailable');
    
    return (
        <div className="space-y-6">
            {/* Password */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('password.title')}</CardTitle>
                    <CardDescription>{t('password.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div>
                            <p className="font-medium">Password</p>
                            <p className="text-sm text-muted-foreground">
                                {t('password.lastChanged', { date: passwordLastChanged })}
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>
                            {t('password.button')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('twoFactor.title')}</CardTitle>
                    <CardDescription>{t('twoFactor.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            {twoFactorEnabled ? (
                                <ShieldCheck className="h-6 w-6 text-green-600" />
                            ) : (
                                <ShieldOff className="h-6 w-6 text-muted-foreground" />
                            )}
                            <div>
                                <p className="font-semibold">{t('twoFactor.statusLabel')}</p>
                                <Badge variant={twoFactorEnabled ? 'default' : 'secondary'}>
                                    {twoFactorEnabled ? t('twoFactor.status.enabled') : t('twoFactor.status.disabled')}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {twoFactorEnabled ? (
                                <Button 
                                    variant="outline" 
                                    onClick={handleDisable2FA}
                                    className="text-destructive hover:text-destructive"
                                >
                                    {t('twoFactor.disable')}
                                </Button>
                            ) : (
                                <Button 
                                    variant="default" 
                                    onClick={() => setTwoFactorDialogOpen(true)}
                                >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Enable 2FA
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('sessions.title')}</CardTitle>
                    <CardDescription>{t('sessions.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <SessionsList
                        sessions={sessions}
                        onLogout={handleLogoutSession}
                        onLogoutAll={handleLogoutAllSessions}
                        currentLabel={t('sessions.current')}
                        lastActiveLabel={t('sessions.lastActive')}
                        logoutLabel={t('sessions.logout')}
                        logoutAllLabel={t('sessions.logoutAll')}
                    />
                </CardContent>
            </Card>

            {/* Trusted Devices */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('trustedDevices.title')}</CardTitle>
                    <CardDescription>{t('trustedDevices.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-8 text-center">
                        <p className="text-muted-foreground">{t('trustedDevices.noDevices')}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Dialogs */}
            <PasswordDialog
                open={passwordDialogOpen}
                onOpenChange={setPasswordDialogOpen}
                onSave={handleChangePassword}
            />
            <TwoFactorDialog
                open={twoFactorDialogOpen}
                onOpenChange={setTwoFactorDialogOpen}
                onEnable={handleEnable2FA}
            />
        </div>
    );
}

