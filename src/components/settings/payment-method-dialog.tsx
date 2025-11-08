'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { CreditCard, Loader2 } from 'lucide-react';

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method?: {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    holderName: string;
  } | null;
  onSave: (data: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    holderName: string;
  }) => Promise<void>;
}

export default function PaymentMethodDialog({
  open,
  onOpenChange,
  method,
  onSave,
}: PaymentMethodDialogProps) {
  const t = useTranslations('SettingsPage.billing.paymentMethods');
  
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState(method?.expMonth.toString().padStart(2, '0') || '');
  const [expYear, setExpYear] = useState(method?.expYear.toString().slice(-2) || '');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState(method?.holderName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Détection du type de carte
  const detectCardType = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'Amex';
    return 'Unknown';
  };

  const cardType = detectCardType(cardNumber);

  // Formatage automatique du numéro de carte (xxxx xxxx xxxx xxxx)
  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    if (cleaned.length <= 16) {
      setCardNumber(formatted);
    }
  };

  // Validation des champs
  const validateFields = (): boolean => {
    const cleanedNumber = cardNumber.replace(/\s/g, '');
    
    if (cleanedNumber.length !== 16) {
      setError(t('dialog.errors.invalidCard'));
      return false;
    }
    
    const month = parseInt(expMonth);
    const year = parseInt(expYear);
    if (month < 1 || month > 12) {
      setError(t('dialog.errors.invalidExpiry'));
      return false;
    }
    
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      setError(t('dialog.errors.expiredCard'));
      return false;
    }
    
    if (cvv.length < 3 || cvv.length > 4) {
      setError(t('dialog.errors.invalidCvv'));
      return false;
    }
    
    if (holderName.trim().length < 3) {
      setError(t('dialog.errors.invalidName'));
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!validateFields()) return;
    
    setLoading(true);
    try {
      await onSave({
        cardNumber: cardNumber.replace(/\s/g, ''),
        expMonth,
        expYear,
        cvv,
        holderName,
      });
      onOpenChange(false);
      // Reset form
      setCardNumber('');
      setExpMonth('');
      setExpYear('');
      setCvv('');
      setHolderName('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dialog.errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {method ? t('dialog.editTitle') : t('dialog.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {method ? t('dialog.editDescription') : t('dialog.addDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Numéro de carte */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">{t('dialog.cardNumber')}</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                maxLength={19}
                disabled={!!method || loading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {cardType !== 'Unknown' && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {cardType}
                  </span>
                )}
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Date d'expiration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expMonth">{t('dialog.expiryMonth')}</Label>
              <Input
                id="expMonth"
                placeholder="MM"
                value={expMonth}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2) setExpMonth(value);
                }}
                maxLength={2}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expYear">{t('dialog.expiryYear')}</Label>
              <Input
                id="expYear"
                placeholder="YY"
                value={expYear}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2) setExpYear(value);
                }}
                maxLength={2}
                disabled={loading}
              />
            </div>
          </div>

          {/* CVV */}
          <div className="space-y-2">
            <Label htmlFor="cvv">{t('dialog.cvv')}</Label>
            <Input
              id="cvv"
              type="password"
              placeholder="123"
              value={cvv}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 4) setCvv(value);
              }}
              maxLength={4}
              disabled={loading}
            />
          </div>

          {/* Nom du titulaire */}
          <div className="space-y-2">
            <Label htmlFor="holderName">{t('dialog.cardholderName')}</Label>
            <Input
              id="holderName"
              placeholder="John Doe"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('dialog.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {method ? t('dialog.saveChanges') : t('dialog.addCard')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
