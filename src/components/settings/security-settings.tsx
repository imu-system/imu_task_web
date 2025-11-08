'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, Shield, ShieldCheck, ShieldOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PasswordDialog from './password-dialog';
import TwoFactorDialog from './two-factor-dialog';
import SessionsList, { Session } from './sessions-list';

// Mock data - will be replaced with real data from Firebase in Task 6
const mockSessions: Session[] = [
    { 
        id: '1', 
        deviceType: 'desktop',
        browser: 'Chrome on macOS', 
        os: 'macOS 14.0',
        city: 'Paris', 
        country: 'France', 
        ipAddress: '92.184.xxx.xxx',
        isCurrent: true, 
        lastActive: 'Active now' 
    },
    { 
        id: '2', 
        deviceType: 'mobile',
        browser: 'Safari on iPhone', 
        os: 'iOS 17.1',
        city: 'Lyon', 
        country: 'France', 
        ipAddress: '90.45.xxx.xxx',
        isCurrent: false, 
        lastActive: '2 days ago' 
    },
    { 
        id: '3', 
        deviceType: 'tablet',
        browser: 'Chrome on iPad', 
        os: 'iPadOS 17.1',
        city: 'Marseille', 
        country: 'France', 
        ipAddress: '88.162.xxx.xxx',
        isCurrent: false, 
        lastActive: '1 week ago' 
    },
];

export default function SecuritySettings() {
    const { user, loading } = useAuth();
    const t = useTranslations('SettingsPage.security');
    
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessions, setSessions] = useState<Session[]>(mockSessions);

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    // Placeholder handlers - will be replaced with real Firebase calls in Task 6
    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        console.log('Change password:', { currentPassword: '***', newPassword: '***' });
        // TODO: Implement Firebase password update
        alert('Password change will be implemented in Backend Integration task');
    };

    const handleEnable2FA = async (method: 'sms' | 'app', code: string, phoneOrSecret?: string) => {
        console.log('Enable 2FA:', { method, code, phoneOrSecret });
        // TODO: Implement Firebase 2FA
        setTwoFactorEnabled(true);
        alert(`2FA (${method}) will be fully implemented in Backend Integration task`);
    };

    const handleDisable2FA = async () => {
        console.log('Disable 2FA');
        // TODO: Implement Firebase 2FA disable
        setTwoFactorEnabled(false);
        alert('2FA disable will be implemented in Backend Integration task');
    };

    const handleLogoutSession = async (sessionId: string) => {
        console.log('Logout session:', sessionId);
        // TODO: Implement Firebase session logout
        setSessions(sessions.filter(s => s.id !== sessionId));
        alert(`Session ${sessionId} logout will be implemented in Backend Integration task`);
    };

    const handleLogoutAllSessions = async () => {
        console.log('Logout all sessions');
        // TODO: Implement Firebase logout all
        setSessions(sessions.filter(s => s.isCurrent));
        alert('Logout all sessions will be implemented in Backend Integration task');
    };

    // Mock last password change date - will be from Firebase in Task 6
    const passwordLastChanged = 'Not available';
    
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

