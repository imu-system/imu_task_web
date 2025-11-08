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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Loader2, Zap, Crown, Building2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: 'free' | 'pro' | 'business';
  onChangePlan: (plan: 'free' | 'pro' | 'business', billing: 'monthly' | 'annual') => Promise<void>;
  onCancelSubscription: () => Promise<void>;
}

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    icon: Zap,
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'free.tasks',
      'free.basicSupport',
      'free.community',
    ],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    icon: Crown,
    monthlyPrice: 49,
    annualPrice: 490, // ~41€/mois
    features: [
      'pro.unlimitedTasks',
      'pro.prioritySupport',
      'pro.analytics',
      'pro.customBranding',
    ],
  },
  {
    id: 'business' as const,
    name: 'Business',
    icon: Building2,
    monthlyPrice: 149,
    annualPrice: 1490, // ~124€/mois
    features: [
      'business.everything',
      'business.team',
      'business.api',
      'business.sla',
      'business.dedicated',
    ],
  },
];

export default function SubscriptionDialog({
  open,
  onOpenChange,
  currentPlan,
  onChangePlan,
  onCancelSubscription,
}: SubscriptionDialogProps) {
  const t = useTranslations('SettingsPage.billing.subscription');
  const tPlan = useTranslations('SettingsPage.billing.plan');
  
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleUpgrade = async (planId: 'free' | 'pro' | 'business') => {
    setLoading(true);
    try {
      await onChangePlan(planId, billing);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to change plan:', err);
      alert(t('dialog.errors.changeFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    setCancelLoading(true);
    try {
      await onCancelSubscription();
      setShowCancelDialog(false);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      alert(t('dialog.errors.cancelFailed'));
    } finally {
      setCancelLoading(false);
    }
  };

  const calculateSavings = (plan: typeof plans[number]) => {
    if (plan.monthlyPrice === 0) return 0;
    const monthlyTotal = plan.monthlyPrice * 12;
    return monthlyTotal - plan.annualPrice;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('dialog.title')}</DialogTitle>
            <DialogDescription>{t('dialog.description')}</DialogDescription>
          </DialogHeader>

          {/* Toggle mensuel/annuel */}
          <div className="flex justify-center py-4">
            <Tabs value={billing} onValueChange={(v) => setBilling(v as 'monthly' | 'annual')}>
              <TabsList>
                <TabsTrigger value="monthly">{t('dialog.monthly')}</TabsTrigger>
                <TabsTrigger value="annual">
                  {t('dialog.annual')}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {t('dialog.save')}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Grille des plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
              const displayPrice = billing === 'monthly' ? price : Math.round(price / 12);
              const isCurrent = plan.id === currentPlan;
              const isUpgrade = 
                (currentPlan === 'free' && plan.id !== 'free') ||
                (currentPlan === 'pro' && plan.id === 'business');
              const isDowngrade = 
                (currentPlan === 'business' && plan.id !== 'business') ||
                (currentPlan === 'pro' && plan.id === 'free');
              const savings = calculateSavings(plan);

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-lg border-2 p-6 ${
                    isCurrent
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 transition-colors'
                  }`}
                >
                  {isCurrent && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      {t('dialog.currentPlan')}
                    </Badge>
                  )}

                  <div className="text-center space-y-4">
                    <Icon className="h-12 w-12 mx-auto text-primary" />
                    <div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-4xl font-bold">{displayPrice}€</span>
                        <span className="text-muted-foreground">/{t('dialog.month')}</span>
                      </div>
                      {billing === 'annual' && savings > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          {t('dialog.saveAmount', { amount: savings })}
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Liste des fonctionnalités */}
                    <ul className="space-y-2 text-sm text-left">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span>{tPlan(`features.${feature}`)}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Bouton d'action */}
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        {t('dialog.current')}
                      </Button>
                    ) : isUpgrade ? (
                      <Button
                        className="w-full"
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={loading}
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('dialog.upgrade')}
                      </Button>
                    ) : isDowngrade ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={loading}
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('dialog.downgrade')}
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Option d'annulation */}
          {currentPlan !== 'free' && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('dialog.cancelTitle')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('dialog.cancelDescription')}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={loading}
                >
                  {t('dialog.cancelButton')}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('dialog.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation d'annulation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.cancelConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialog.cancelConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelLoading}>
              {t('dialog.cancelNo')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={cancelLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('dialog.cancelYes')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
