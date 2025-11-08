
'use client';

import { useState } from 'react';
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

// Mock data - Will be replaced with real Firebase/Stripe data in Task 6
const mockPaymentMethods = [
  { 
    id: 'pm_1', 
    brand: 'Visa', 
    last4: '4242', 
    isDefault: true,
    expMonth: 12,
    expYear: 2025,
    holderName: 'John Doe',
  },
  { 
    id: 'pm_2', 
    brand: 'Mastercard', 
    last4: '8888', 
    isDefault: false,
    expMonth: 6,
    expYear: 2026,
    holderName: 'John Doe',
  },
];

const mockInvoices: Invoice[] = [
  { 
    id: 'inv_1', 
    date: '01/11/2025', 
    amount: 49.00, 
    status: 'paid',
    plan: 'Pro',
    invoiceNumber: 'INV-2025-011',
    pdfUrl: '/invoices/inv_1.pdf',
  },
  { 
    id: 'inv_2', 
    date: '01/10/2025', 
    amount: 49.00, 
    status: 'paid',
    plan: 'Pro',
    invoiceNumber: 'INV-2025-010',
    pdfUrl: '/invoices/inv_2.pdf',
  },
  { 
    id: 'inv_3', 
    date: '01/09/2025', 
    amount: 49.00, 
    status: 'paid',
    plan: 'Pro',
    invoiceNumber: 'INV-2025-009',
    pdfUrl: '/invoices/inv_3.pdf',
  },
];


export default function BillingSettings() {
  const { user, loading } = useAuth();
  const t = useTranslations('SettingsPage.billing');

  // Dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<typeof mockPaymentMethods[0] | null>(null);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Mock current plan - Will be fetched from Firestore in Task 6
  const currentPlan = 'pro' as 'free' | 'pro' | 'business';

  // Placeholder handlers - Will be replaced with real Firebase/Stripe calls in Task 6
  const handleAddPaymentMethod = async (data: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    holderName: string;
  }) => {
    console.log('Adding payment method:', data);
    // TODO Task 6: Call Stripe API to create PaymentMethod
    // const paymentMethod = await stripe.paymentMethods.create({...});
    // await stripe.paymentMethods.attach(paymentMethod.id, { customer: customerId });
    alert(t('paymentMethods.addSuccess'));
  };

  const handleDeletePaymentMethod = async () => {
    if (!methodToDelete) return;
    
    setDeleteLoading(true);
    try {
      console.log('Deleting payment method:', methodToDelete);
      // TODO Task 6: Call Stripe API to detach PaymentMethod
      // await stripe.paymentMethods.detach(methodToDelete);
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

  const handleChangePlan = async (
    plan: 'free' | 'pro' | 'business',
    billing: 'monthly' | 'annual'
  ) => {
    console.log('Changing plan to:', plan, billing);
    // TODO Task 6: Call Stripe API to update/create subscription
    // const subscription = await stripe.subscriptions.update(subscriptionId, {
    //   items: [{ price: priceId }],
    //   proration_behavior: 'always_invoice',
    // });
    alert(t('subscription.changeSuccess'));
  };

  const handleCancelSubscription = async () => {
    console.log('Canceling subscription');
    // TODO Task 6: Call Stripe API to cancel subscription at period end
    // await stripe.subscriptions.update(subscriptionId, {
    //   cancel_at_period_end: true,
    // });
    alert(t('subscription.cancelSuccess'));
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    console.log('Downloading invoice:', invoiceId);
    // TODO Task 6: Fetch PDF URL from Stripe and trigger download
    // const invoice = await stripe.invoices.retrieve(invoiceId);
    // window.open(invoice.invoice_pdf, '_blank');
    alert(t('invoices.downloadSuccess'));
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
                        {method.brand} {t('paymentMethods.endingIn')} {method.last4}
                      </p>
                      {method.isDefault && (
                        <Badge variant="secondary">{t('paymentMethods.default')}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('paymentMethods.expires')} {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
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
                  disabled={method.isDefault && mockPaymentMethods.length === 1}
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
          <InvoicesTable invoices={mockInvoices} onDownload={handleDownloadInvoice} />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PaymentMethodDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        method={selectedMethod}
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
