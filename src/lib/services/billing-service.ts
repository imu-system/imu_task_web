/**
 * Billing Service - Stripe integration for subscriptions and payments
 * 
 * Note: This is a client-side service that calls Cloud Functions for Stripe operations
 * Direct Stripe API calls should be made from backend (Cloud Functions) for security
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { doc, updateDoc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  pdfUrl: string;
}

export interface Subscription {
  id: string;
  plan: 'free' | 'pro' | 'business';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

/**
 * Add payment method (calls Cloud Function → Stripe)
 */
export async function addPaymentMethod(cardToken: string, setAsDefault: boolean = false): Promise<PaymentMethod> {
  const addPaymentMethodFn = httpsCallable<
    { cardToken: string; setAsDefault: boolean },
    { paymentMethod: PaymentMethod }
  >(functions, 'addPaymentMethod');

  const result = await addPaymentMethodFn({ cardToken, setAsDefault });
  return result.data.paymentMethod;
}

/**
 * Get all payment methods for user
 */
export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  const getPaymentMethodsFn = httpsCallable<{ userId: string }, { paymentMethods: PaymentMethod[] }>(
    functions,
    'getPaymentMethods'
  );

  const result = await getPaymentMethodsFn({ userId });
  return result.data.paymentMethods;
}

/**
 * Remove payment method
 */
export async function removePaymentMethod(paymentMethodId: string): Promise<void> {
  const removePaymentMethodFn = httpsCallable<{ paymentMethodId: string }, void>(
    functions,
    'removePaymentMethod'
  );

  await removePaymentMethodFn({ paymentMethodId });
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
  const setDefaultPaymentMethodFn = httpsCallable<{ paymentMethodId: string }, void>(
    functions,
    'setDefaultPaymentMethod'
  );

  await setDefaultPaymentMethodFn({ paymentMethodId });
}

/**
 * Create subscription (calls Cloud Function → Stripe)
 */
export async function createSubscription(
  plan: 'pro' | 'business',
  billing: 'monthly' | 'annual'
): Promise<Subscription> {
  const createSubscriptionFn = httpsCallable<
    { plan: string; billing: string },
    { subscription: Subscription }
  >(functions, 'createSubscription');

  const result = await createSubscriptionFn({ plan, billing });
  
  // Update Firestore
  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      subscription: {
        plan,
        billing,
        status: 'active',
        stripeSubscriptionId: result.data.subscription.id,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  return result.data.subscription;
}

/**
 * Cancel subscription (at end of period)
 */
export async function cancelSubscription(): Promise<void> {
  const cancelSubscriptionFn = httpsCallable(functions, 'cancelSubscription');
  await cancelSubscriptionFn();

  // Update Firestore
  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      'subscription.cancelAtPeriodEnd': true,
      'subscription.updatedAt': new Date().toISOString(),
    });
  }
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(): Promise<void> {
  const reactivateSubscriptionFn = httpsCallable(functions, 'reactivateSubscription');
  await reactivateSubscriptionFn();

  // Update Firestore
  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      'subscription.cancelAtPeriodEnd': false,
      'subscription.updatedAt': new Date().toISOString(),
    });
  }
}

/**
 * Get invoices for user
 */
export async function getInvoices(userId: string): Promise<Invoice[]> {
  const getInvoicesFn = httpsCallable<{ userId: string }, { invoices: Invoice[] }>(functions, 'getInvoices');

  const result = await getInvoicesFn({ userId });
  return result.data.invoices;
}

/**
 * Get current subscription for user
 */
export async function getCurrentSubscription(userId: string): Promise<Subscription | null> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) return null;

  const data = userDoc.data();
  return data.subscription || null;
}

/**
 * Mock data for development (remove in production)
 */
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    card: {
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
    },
    isDefault: true,
  },
  {
    id: 'pm_2',
    type: 'card',
    card: {
      brand: 'mastercard',
      last4: '5555',
      expMonth: 6,
      expYear: 2026,
    },
    isDefault: false,
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv_1',
    number: 'INV-2025-001',
    date: '2025-01-01',
    amount: 49,
    status: 'paid',
    pdfUrl: 'https://example.com/invoice-001.pdf',
  },
  {
    id: 'inv_2',
    number: 'INV-2024-012',
    date: '2024-12-01',
    amount: 49,
    status: 'paid',
    pdfUrl: 'https://example.com/invoice-012.pdf',
  },
];

// Re-export auth for subscription functions
import { auth } from '@/lib/firebase';
