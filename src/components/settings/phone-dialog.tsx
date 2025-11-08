'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Phone } from 'lucide-react';
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

interface PhoneDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentPhone?: string;
    onSave: (phone: string) => Promise<void>;
}

export default function PhoneDialog({ open, onOpenChange, currentPhone, onSave }: PhoneDialogProps) {
    const t = useTranslations('SettingsPage.account.phone');
    const [phone, setPhone] = useState(currentPhone || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const validatePhone = (phone: string): boolean => {
        // Basic phone validation - adjust regex based on requirements
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    };

    const handleSave = async () => {
        setError('');
        
        if (!phone.trim()) {
            setError('Phone number is required');
            return;
        }

        if (!validatePhone(phone)) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(phone);
            onOpenChange(false);
        } catch (error: any) {
            setError(error.message || 'Failed to save phone number');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (!isSaving) {
            setPhone(currentPhone || '');
            setError('');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        {currentPhone ? t('buttonEdit') : t('buttonAdd')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">{t('title')}</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+33 6 12 34 56 78"
                            disabled={isSaving}
                            autoComplete="tel"
                        />
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !phone.trim()}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
