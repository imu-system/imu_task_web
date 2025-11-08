'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Shield, Smartphone, QrCode } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TwoFactorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEnable: (method: 'sms' | 'app', code: string, phoneOrSecret?: string) => Promise<void>;
}

export default function TwoFactorDialog({ open, onOpenChange, onEnable }: TwoFactorDialogProps) {
    const t = useTranslations('SettingsPage.security.twoFactor');
    const [method, setMethod] = useState<'sms' | 'app'>('app');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<'setup' | 'verify'>('setup');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Mock QR code data - will be replaced with real data in backend integration
    const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/ImuTask:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=ImuTask';
    const secret = 'JBSWY3DPEHPK3PXP';

    const handleSetup = async () => {
        setError('');
        
        if (method === 'sms') {
            if (!phone.trim()) {
                setError('Phone number is required');
                return;
            }
            // Validate phone format
            const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                setError('Please enter a valid phone number');
                return;
            }
        }

        setIsLoading(true);
        try {
            // Simulate API call to send SMS or generate QR
            await new Promise(resolve => setTimeout(resolve, 1000));
            setStep('verify');
        } catch (error: any) {
            setError(error.message || 'Failed to setup 2FA');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        setError('');
        
        if (!code.trim() || code.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);
        try {
            await onEnable(method, code, method === 'sms' ? phone : secret);
            handleClose();
        } catch (error: any) {
            setError(error.message || 'Invalid code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setPhone('');
            setCode('');
            setStep('setup');
            setError('');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {t('title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>

                {step === 'setup' ? (
                    <Tabs value={method} onValueChange={(v) => setMethod(v as 'sms' | 'app')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="app">
                                <QrCode className="mr-2 h-4 w-4" />
                                Authenticator App
                            </TabsTrigger>
                            <TabsTrigger value="sms">
                                <Smartphone className="mr-2 h-4 w-4" />
                                SMS
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="app" className="space-y-4">
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        1. Download an authenticator app like Google Authenticator or Authy
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        2. Scan this QR code with your app
                                    </p>
                                </div>
                                
                                <div className="flex justify-center p-4 bg-muted rounded-lg">
                                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                                </div>
                                
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Or enter this code manually:
                                    </p>
                                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md font-mono text-sm">
                                        {secret}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="sms" className="space-y-4">
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+33 6 12 34 56 78"
                                        disabled={isLoading}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        We'll send a verification code to this number
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Verification code</Label>
                            <Input
                                id="code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                disabled={isLoading}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest"
                            />
                            <p className="text-sm text-muted-foreground">
                                {method === 'sms' 
                                    ? `Enter the 6-digit code sent to ${phone}`
                                    : 'Enter the 6-digit code from your authenticator app'
                                }
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    {step === 'setup' ? (
                        <Button
                            onClick={handleSetup}
                            disabled={isLoading || (method === 'sms' && !phone.trim())}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Setting up...
                                </>
                            ) : (
                                'Continue'
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleVerify}
                            disabled={isLoading || code.length !== 6}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Enable 2FA'
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
