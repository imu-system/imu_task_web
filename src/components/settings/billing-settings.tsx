
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, CreditCard, PlusCircle, Trash2, Settings2, Crown, Building2, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
import PaymentMethodDialog from './payment-method-dialog';
import SubscriptionDialog from './subscription-dialog';
import InvoicesTable, { type Invoice } from './invoices-table';
import {
  getPaymentMethods,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getInvoices,
  getCurrentSubscription,
  cancelSubscription,
  type PaymentMethod,
  mockPaymentMethods,
  mockInvoices,
} from '@/lib/services/billing-service';

export default function BillingSettings() {
  const { user, loading } = useAuth();
  const t = useTranslations('SettingsPage.billing');

  // Dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State for data fetched from Stripe/Firestore
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'business'>('free');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load billing data from Stripe/Firestore
  useEffect(() => {
    if (!user) return;

    const loadBillingData = async () => {
      try {
        // For now, use mock data until Cloud Functions are set up
        // In production, these would be actual API calls:
        // const [methods, invoicesList, subscription] = await Promise.all([
        //   getPaymentMethods(user.uid),
        //   getInvoices(user.uid),
        //   getCurrentSubscription(user.uid),
        // ]);
        
        setPaymentMethods(mockPaymentMethods);
        
        // Map service invoices to component format
        const mappedInvoices: Invoice[] = mockInvoices.map(inv => ({
          id: inv.id,
          date: new Date(inv.date).toLocaleDateString('fr-FR'),
          amount: inv.amount,
          status: inv.status,
          plan: 'Pro', // Default for mock data
          invoiceNumber: inv.number,
          pdfUrl: inv.pdfUrl,
        }));
        setInvoices(mappedInvoices);
        
        // Try to get subscription from Firestore
        const subscription = await getCurrentSubscription(user.uid);
        if (subscription) {
          setCurrentPlan(subscription.plan);
        }
      } catch (err) {
        console.error('Failed to load billing data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadBillingData();
  }, [user]);

  // Real handlers with Firebase/Stripe services
  const handleAddPaymentMethod = async (data: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    holderName: string;
  }) => {
    try {
      // TODO: Create Stripe token from card data
      // const token = await stripe.createToken({ card: data });
      // const { addPaymentMethod } = await import('@/lib/services/billing-service');
      // const paymentMethod = await addPaymentMethod(token.id, false);
      // setPaymentMethods([...paymentMethods, paymentMethod]);
      
      console.log('Adding payment method:', data);
      alert(t('paymentMethods.addSuccess'));
    } catch (err) {
      console.error('Failed to add payment method:', err);
      alert(t('paymentMethods.addError'));
    }
  };

  const handleDeletePaymentMethod = async () => {
    if (!methodToDelete) return;
    
    setDeleteLoading(true);
    try {
      await removePaymentMethod(methodToDelete);
      setPaymentMethods(paymentMethods.filter(m => m.id !== methodToDelete));
      alert(t('paymentMethods.deleteSuccess'));
      setDeleteDialogOpen(false);
      setMethodToDelete(null);
    } catch (err) {
      console.error('Failed to delete payment method:', err);
      alert(t('paymentMethods.deleteError'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    try {
      await setDefaultPaymentMethod(methodId);
      setPaymentMethods(
        paymentMethods.map(m => ({ ...m, isDefault: m.id === methodId }))
      );
      alert(t('paymentMethods.setDefaultSuccess'));
    } catch (err) {
      console.error('Failed to set default payment method:', err);
      alert(t('paymentMethods.setDefaultError'));
    }
  };

  const handleChangePlan = async (
    plan: 'free' | 'pro' | 'business',
    billing: 'monthly' | 'annual'
  ) => {
    try {
      if (plan === 'free') {
        // Downgrade to free = cancel subscription
        await cancelSubscription();
        setCurrentPlan('free');
        alert(t('subscription.downgradeSuccess'));
      } else {
        // Upgrade/change plan
        const { createSubscription } = await import('@/lib/services/billing-service');
        await createSubscription(plan, billing);
        setCurrentPlan(plan);
        alert(t('subscription.changeSuccess'));
      }
    } catch (err) {
      console.error('Failed to change plan:', err);
      alert(t('subscription.changeError'));
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      alert(t('subscription.cancelSuccess'));
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      alert(t('subscription.cancelError'));
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice?.pdfUrl) {
        window.open(invoice.pdfUrl, '_blank');
      } else {
        alert(t('invoices.errors.notFound'));
      }
    } catch (err) {
      console.error('Failed to download invoice:', err);
      alert(t('invoices.errors.downloadFailed'));
    }
  };

  const getPlanIcon = () => {
    switch (currentPlan) {
      case 'free': return Zap;
      case 'pro': return Crown;
      case 'business': return Building2;
    }
  };

  const getPlanBadgeVariant = () => {
    switch (currentPlan) {
      case 'free': return 'secondary';
      case 'pro': return 'default';
      case 'business': return 'default';
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const PlanIcon = getPlanIcon();

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('plan.title')}</CardTitle>
          <CardDescription>{t('plan.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <PlanIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">
                    {currentPlan === 'free' && t('plan.free')}
                    {currentPlan === 'pro' && t('plan.pro')}
                    {currentPlan === 'business' && t('plan.business')}
                  </p>
                  <Badge variant={getPlanBadgeVariant()}>
                    {t('plan.current')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentPlan === 'free' && t('plan.freePrice')}
                  {currentPlan === 'pro' && t('plan.proPrice')}
                  {currentPlan === 'business' && t('plan.businessPrice')}
                </p>
              </div>
            </div>
            <Button onClick={() => setSubscriptionDialogOpen(true)}>
              <Settings2 className="mr-2 h-4 w-4" />
              {t('plan.manage')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('paymentMethods.title')}</CardTitle>
          <CardDescription>{t('paymentMethods.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockPaymentMethods.map((method, index) => (
            <div key={method.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {method.card.brand} {t('paymentMethods.endingIn')} {method.card.last4}
                      </p>
                      {method.isDefault && (
                        <Badge variant="secondary">{t('paymentMethods.default')}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('paymentMethods.expires')} {method.card.expMonth.toString().padStart(2, '0')}/{method.card.expYear}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setMethodToDelete(method.id);
                    setDeleteDialogOpen(true);
                  }}
                  disabled={method.isDefault && paymentMethods.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {index < mockPaymentMethods.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
          <Separator />
          <Button
            variant="outline"
            onClick={() => {
              setSelectedMethod(null);
              setPaymentDialogOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('paymentMethods.addCard')}
          </Button>
        </CardContent>
      </Card>

      {/* Invoices Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('invoices.title')}</CardTitle>
          <CardDescription>{t('invoices.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoicesTable invoices={invoices} onDownload={handleDownloadInvoice} />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PaymentMethodDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        method={selectedMethod ? {
          id: selectedMethod.id,
          brand: selectedMethod.card.brand,
          last4: selectedMethod.card.last4,
          expMonth: selectedMethod.card.expMonth,
          expYear: selectedMethod.card.expYear,
          holderName: '', // Not stored in Stripe PaymentMethod
        } : null}
        onSave={handleAddPaymentMethod}
      />

      <SubscriptionDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
        currentPlan={currentPlan}
        onChangePlan={handleChangePlan}
        onCancelSubscription={handleCancelSubscription}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('paymentMethods.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('paymentMethods.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              {t('paymentMethods.deleteCancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePaymentMethod}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('paymentMethods.deleteConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
