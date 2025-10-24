/**
 * Stripe Webhooks Endpoint
 * Phase 1 : Paiements & Finances - Task 10
 * 
 * Handles Stripe webhook events:
 * - payment_intent.succeeded: Update transaction status, send notification
 * - payout.paid: Update payout status, notify professional
 * - payout.failed: Update payout status, send alert
 * - account.updated: Sync Stripe Connect account changes
 * - charge.dispute.created: Create dispute record, notify admin
 * 
 * Security: Verifies Stripe signature using webhook secret
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { initAdmin } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import {
  TransactionStatusValues,
  PayoutStatusValues,
  DisputeStatusValues,
  DisputeReasonValues
} from '@/types/payments';

// Initialize Firebase Admin
const { db } = initAdmin();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Type guard for Stripe events
type StripeWebhookEvent =
  | Stripe.PaymentIntentSucceededEvent
  | Stripe.PayoutPaidEvent
  | Stripe.PayoutFailedEvent
  | Stripe.AccountUpdatedEvent
  | Stripe.ChargeDisputeCreatedEvent;

export async function POST(req: NextRequest) {
  try {
    // Get the raw body
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const error = err as Error;
      console.error('[Stripe Webhook] Signature verification failed:', error.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${error.message}` },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event as Stripe.PaymentIntentSucceededEvent);
        break;

      case 'payout.paid':
        await handlePayoutPaid(event as Stripe.PayoutPaidEvent);
        break;

      case 'payout.failed':
        await handlePayoutFailed(event as Stripe.PayoutFailedEvent);
        break;

      case 'account.updated':
        await handleAccountUpdated(event as Stripe.AccountUpdatedEvent);
        break;

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event as Stripe.ChargeDisputeCreatedEvent);
        break;

      case 'charge.dispute.updated':
        await handleChargeDisputeUpdated(event);
        break;

      case 'charge.dispute.closed':
        await handleChargeDisputeClosed(event);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    // Log webhook event in auditLogs collection
    await db.collection('auditLogs').add({
      action: 'stripe_webhook_received',
      eventType: event.type,
      eventId: event.id,
      livemode: event.livemode,
      metadata: {
        objectId: (event.data.object as any).id,
      },
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ received: true, eventType: event.type });

  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// ==================== EVENT HANDLERS ====================

/**
 * Handle payment_intent.succeeded
 * Update transaction status to succeeded, send notification to user
 */
async function handlePaymentIntentSucceeded(event: Stripe.PaymentIntentSucceededEvent) {
  const paymentIntent = event.data.object;
  console.log(`[Webhook] Payment Intent succeeded: ${paymentIntent.id}`);

  try {
    // Find transaction by stripePaymentIntentId
    const transactionsRef = db.collection('transactions');
    const snapshot = await transactionsRef
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn(`[Webhook] No transaction found for payment intent: ${paymentIntent.id}`);
      return;
    }

    const transactionDoc = snapshot.docs[0];
    const transactionData = transactionDoc.data();

    // Update transaction status
    await transactionDoc.ref.update({
      status: TransactionStatusValues.succeeded,
      processedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      stripeChargeId: paymentIntent.latest_charge,
    });

    console.log(`[Webhook] Transaction ${transactionDoc.id} updated to succeeded`);

    // Send notification to user
    await sendNotification({
      userId: transactionData.userId,
      type: 'payment_success',
      title: 'Paiement réussi',
      message: `Votre paiement de ${(paymentIntent.amount / 100).toFixed(2)}€ a été traité avec succès.`,
      metadata: {
        transactionId: transactionDoc.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });

  } catch (error) {
    console.error('[Webhook] Error handling payment_intent.succeeded:', error);
    throw error;
  }
}

/**
 * Handle payout.paid
 * Update payout status to paid, notify professional
 */
async function handlePayoutPaid(event: Stripe.PayoutPaidEvent) {
  const payout = event.data.object;
  console.log(`[Webhook] Payout paid: ${payout.id}`);

  try {
    // Find payout by stripePayoutId
    const payoutsRef = db.collection('payouts');
    const snapshot = await payoutsRef
      .where('stripePayoutId', '==', payout.id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn(`[Webhook] No payout found for Stripe payout: ${payout.id}`);
      return;
    }

    const payoutDoc = snapshot.docs[0];
    const payoutData = payoutDoc.data();

    // Update payout status
    await payoutDoc.ref.update({
      status: PayoutStatusValues.paid,
      paidAt: Timestamp.fromMillis(payout.arrival_date * 1000),
      updatedAt: Timestamp.now(),
    });

    console.log(`[Webhook] Payout ${payoutDoc.id} updated to paid`);

    // Send notification to professional
    await sendNotification({
      userId: payoutData.userId,
      type: 'payout_paid',
      title: 'Virement effectué',
      message: `Votre virement de ${(payout.amount / 100).toFixed(2)}€ a été effectué avec succès.`,
      metadata: {
        payoutId: payoutDoc.id,
        amount: payout.amount,
        currency: payout.currency,
        arrivalDate: payout.arrival_date,
      },
    });

  } catch (error) {
    console.error('[Webhook] Error handling payout.paid:', error);
    throw error;
  }
}

/**
 * Handle payout.failed
 * Update payout status to failed, send alert
 */
async function handlePayoutFailed(event: Stripe.PayoutFailedEvent) {
  const payout = event.data.object;
  console.log(`[Webhook] Payout failed: ${payout.id}`);

  try {
    // Find payout by stripePayoutId
    const payoutsRef = db.collection('payouts');
    const snapshot = await payoutsRef
      .where('stripePayoutId', '==', payout.id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn(`[Webhook] No payout found for Stripe payout: ${payout.id}`);
      return;
    }

    const payoutDoc = snapshot.docs[0];
    const payoutData = payoutDoc.data();

    // Update payout status
    await payoutDoc.ref.update({
      status: PayoutStatusValues.failed,
      failedAt: Timestamp.now(),
      errorCode: payout.failure_code || 'unknown',
      errorMessage: payout.failure_message || 'Payout failed',
      updatedAt: Timestamp.now(),
    });

    console.log(`[Webhook] Payout ${payoutDoc.id} updated to failed`);

    // Send alert notification to professional
    await sendNotification({
      userId: payoutData.userId,
      type: 'payout_failed',
      title: 'Échec du virement',
      message: `Votre virement de ${(payout.amount / 100).toFixed(2)}€ a échoué. Raison: ${payout.failure_message || 'Erreur inconnue'}`,
      metadata: {
        payoutId: payoutDoc.id,
        amount: payout.amount,
        currency: payout.currency,
        failureCode: payout.failure_code,
        failureMessage: payout.failure_message,
      },
      priority: 'high',
    });

    // Also notify admin
    await notifyAdmins({
      type: 'payout_failed',
      title: 'Échec de virement',
      message: `Un virement a échoué pour le professionnel ${payoutData.professionalId}`,
      metadata: {
        payoutId: payoutDoc.id,
        professionalId: payoutData.professionalId,
        amount: payout.amount,
        failureCode: payout.failure_code,
      },
    });

  } catch (error) {
    console.error('[Webhook] Error handling payout.failed:', error);
    throw error;
  }
}

/**
 * Handle account.updated
 * Sync Stripe Connect account changes with bank account records
 */
async function handleAccountUpdated(event: Stripe.AccountUpdatedEvent) {
  const account = event.data.object;
  console.log(`[Webhook] Account updated: ${account.id}`);

  try {
    // Find bank accounts linked to this Stripe account
    const bankAccountsRef = db.collection('bankAccounts');
    const snapshot = await bankAccountsRef
      .where('stripeAccountId', '==', account.id)
      .get();

    if (snapshot.empty) {
      console.log(`[Webhook] No bank accounts found for Stripe account: ${account.id}`);
      return;
    }

    // Update bank account status based on Stripe account status
    const updates: Promise<any>[] = [];

    snapshot.forEach((doc) => {
      let status = 'pending';

      if (account.charges_enabled && account.payouts_enabled) {
        status = 'verified';
      } else if (account.requirements?.disabled_reason) {
        status = 'failed';
      }

      updates.push(doc.ref.update({
        status,
        updatedAt: Timestamp.now(),
        metadata: {
          ...doc.data().metadata,
          stripeAccountStatus: {
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            disabledReason: account.requirements?.disabled_reason,
          },
        },
      }));
    });

    await Promise.all(updates);
    console.log(`[Webhook] Updated ${snapshot.size} bank account(s) for account ${account.id}`);

  } catch (error) {
    console.error('[Webhook] Error handling account.updated:', error);
    throw error;
  }
}

/**
 * Handle charge.dispute.created
 * Create dispute record, notify admin and professional
 */
async function handleChargeDisputeCreated(event: Stripe.ChargeDisputeCreatedEvent) {
  const dispute = event.data.object;
  console.log(`[Webhook] Dispute created: ${dispute.id}`);

  try {
    // Find transaction by stripeChargeId
    const transactionsRef = db.collection('transactions');
    const snapshot = await transactionsRef
      .where('stripeChargeId', '==', dispute.charge)
      .limit(1)
      .get();

    let transactionId: string | undefined;
    let userId: string | undefined;
    let bookingId: string | undefined;

    if (!snapshot.empty) {
      const transactionData = snapshot.docs[0].data();
      transactionId = snapshot.docs[0].id;
      userId = transactionData.userId;
      bookingId = transactionData.bookingId;
    }

    // Create dispute record
    const disputeRef = await db.collection('disputes').add({
      stripeDisputeId: dispute.id,
      stripeChargeId: dispute.charge as string,
      transactionId: transactionId || null,
      userId: userId || null,
      bookingId: bookingId || null,

      amount: dispute.amount,
      currency: dispute.currency,

      reason: mapDisputeReason(dispute.reason),
      status: DisputeStatusValues.opened,

      evidence: {
        customerEvidence: {},
      },

      notes: [],

      isUrgent: dispute.is_charge_refundable === false,
      dueBy: dispute.evidence_details?.due_by
        ? Timestamp.fromMillis(dispute.evidence_details.due_by * 1000)
        : null,

      createdAt: Timestamp.fromMillis(dispute.created * 1000),
      updatedAt: Timestamp.now(),
    });

    console.log(`[Webhook] Dispute ${disputeRef.id} created`);

    // Notify admins about new dispute
    await notifyAdmins({
      type: 'dispute_created',
      title: 'Nouveau litige',
      message: `Un nouveau litige de ${(dispute.amount / 100).toFixed(2)}€ a été créé. Raison: ${dispute.reason}`,
      metadata: {
        disputeId: disputeRef.id,
        stripeDisputeId: dispute.id,
        amount: dispute.amount,
        reason: dispute.reason,
        transactionId,
      },
      priority: 'high',
    });

    // If professional is involved, notify them too
    if (userId) {
      await sendNotification({
        userId,
        type: 'dispute_created',
        title: 'Litige ouvert',
        message: `Un litige a été ouvert concernant une transaction de ${(dispute.amount / 100).toFixed(2)}€.`,
        metadata: {
          disputeId: disputeRef.id,
          amount: dispute.amount,
          reason: dispute.reason,
        },
        priority: 'high',
      });
    }

  } catch (error) {
    console.error('[Webhook] Error handling charge.dispute.created:', error);
    throw error;
  }
}

/**
 * Handle charge.dispute.updated
 * Update dispute status when evidence is submitted or status changes
 */
async function handleChargeDisputeUpdated(event: Stripe.Event) {
  const dispute = event.data.object as Stripe.Dispute;
  console.log(`[Webhook] Dispute updated: ${dispute.id}`);

  try {
    const disputesRef = db.collection('disputes');
    const snapshot = await disputesRef
      .where('stripeDisputeId', '==', dispute.id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn(`[Webhook] No dispute found for Stripe dispute: ${dispute.id}`);
      return;
    }

    const disputeDoc = snapshot.docs[0];

    await disputeDoc.ref.update({
      status: mapDisputeStatus(dispute.status),
      updatedAt: Timestamp.now(),
    });

    console.log(`[Webhook] Dispute ${disputeDoc.id} updated`);

  } catch (error) {
    console.error('[Webhook] Error handling charge.dispute.updated:', error);
    throw error;
  }
}

/**
 * Handle charge.dispute.closed
 * Update dispute with final outcome
 */
async function handleChargeDisputeClosed(event: Stripe.Event) {
  const dispute = event.data.object as Stripe.Dispute;
  console.log(`[Webhook] Dispute closed: ${dispute.id} - Status: ${dispute.status}`);

  try {
    const disputesRef = db.collection('disputes');
    const snapshot = await disputesRef
      .where('stripeDisputeId', '==', dispute.id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn(`[Webhook] No dispute found for Stripe dispute: ${dispute.id}`);
      return;
    }

    const disputeDoc = snapshot.docs[0];
    const disputeData = disputeDoc.data();

    await disputeDoc.ref.update({
      status: mapDisputeStatus(dispute.status),
      resolvedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`[Webhook] Dispute ${disputeDoc.id} closed with status: ${dispute.status}`);

    // Notify user about dispute outcome
    if (disputeData.userId) {
      const isWon = dispute.status === 'won';
      await sendNotification({
        userId: disputeData.userId,
        type: 'dispute_closed',
        title: isWon ? 'Litige gagné' : 'Litige perdu',
        message: isWon
          ? `Le litige de ${(dispute.amount / 100).toFixed(2)}€ a été résolu en votre faveur.`
          : `Le litige de ${(dispute.amount / 100).toFixed(2)}€ a été résolu en faveur du client.`,
        metadata: {
          disputeId: disputeDoc.id,
          status: dispute.status,
          amount: dispute.amount,
        },
      });
    }

  } catch (error) {
    console.error('[Webhook] Error handling charge.dispute.closed:', error);
    throw error;
  }
}

/**
 * Handle payment_intent.payment_failed
 * Update transaction status to failed
 */
async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  console.log(`[Webhook] Payment Intent failed: ${paymentIntent.id}`);

  try {
    const transactionsRef = db.collection('transactions');
    const snapshot = await transactionsRef
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn(`[Webhook] No transaction found for payment intent: ${paymentIntent.id}`);
      return;
    }

    const transactionDoc = snapshot.docs[0];
    const transactionData = transactionDoc.data();

    await transactionDoc.ref.update({
      status: TransactionStatusValues.failed,
      failedAt: Timestamp.now(),
      errorCode: paymentIntent.last_payment_error?.code || 'unknown',
      errorMessage: paymentIntent.last_payment_error?.message || 'Payment failed',
      updatedAt: Timestamp.now(),
    });

    console.log(`[Webhook] Transaction ${transactionDoc.id} updated to failed`);

    // Notify user about payment failure
    await sendNotification({
      userId: transactionData.userId,
      type: 'payment_failed',
      title: 'Échec du paiement',
      message: `Votre paiement de ${(paymentIntent.amount / 100).toFixed(2)}€ a échoué. Veuillez réessayer.`,
      metadata: {
        transactionId: transactionDoc.id,
        amount: paymentIntent.amount,
        errorMessage: paymentIntent.last_payment_error?.message,
      },
    });

  } catch (error) {
    console.error('[Webhook] Error handling payment_intent.payment_failed:', error);
    throw error;
  }
}

/**
 * Handle charge.refunded
 * Update transaction with refund information
 */
async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;
  console.log(`[Webhook] Charge refunded: ${charge.id}`);

  try {
    const transactionsRef = db.collection('transactions');
    const snapshot = await transactionsRef
      .where('stripeChargeId', '==', charge.id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn(`[Webhook] No transaction found for charge: ${charge.id}`);
      return;
    }

    const transactionDoc = snapshot.docs[0];
    const transactionData = transactionDoc.data();

    const isFullRefund = charge.amount_refunded === charge.amount;

    await transactionDoc.ref.update({
      status: isFullRefund
        ? TransactionStatusValues.refunded
        : TransactionStatusValues.partially_refunded,
      refundedAmount: charge.amount_refunded,
      refundedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`[Webhook] Transaction ${transactionDoc.id} refunded: ${charge.amount_refunded} cents`);

    // Notify user about refund
    await sendNotification({
      userId: transactionData.userId,
      type: 'refund_processed',
      title: 'Remboursement effectué',
      message: `Un remboursement de ${(charge.amount_refunded / 100).toFixed(2)}€ a été effectué.`,
      metadata: {
        transactionId: transactionDoc.id,
        refundedAmount: charge.amount_refunded,
        isFullRefund,
      },
    });

  } catch (error) {
    console.error('[Webhook] Error handling charge.refunded:', error);
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Map Stripe dispute reason to our enum
 */
function mapDisputeReason(stripeReason: string): string {
  const reasonMap: Record<string, string> = {
    'fraudulent': DisputeReasonValues.fraudulent,
    'duplicate': DisputeReasonValues.duplicate,
    'product_not_received': DisputeReasonValues.product_not_received,
    'product_unacceptable': DisputeReasonValues.product_unacceptable,
    'subscription_canceled': DisputeReasonValues.subscription_canceled,
    'unrecognized': DisputeReasonValues.unrecognized,
    'general': DisputeReasonValues.general,
  };

  return reasonMap[stripeReason] || DisputeReasonValues.general;
}

/**
 * Map Stripe dispute status to our enum
 */
function mapDisputeStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    'warning_needs_response': DisputeStatusValues.opened,
    'warning_under_review': DisputeStatusValues.under_review,
    'needs_response': DisputeStatusValues.opened,
    'under_review': DisputeStatusValues.under_review,
    'charge_refunded': DisputeStatusValues.closed,
    'won': DisputeStatusValues.won,
    'lost': DisputeStatusValues.lost,
  };

  return statusMap[stripeStatus] || DisputeStatusValues.opened;
}

/**
 * Send notification to a user
 */
async function sendNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
}) {
  try {
    await db.collection('notifications').add({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata || {},
      priority: params.priority || 'medium',
      read: false,
      createdAt: Timestamp.now(),
    });

    console.log(`[Webhook] Notification sent to user ${params.userId}: ${params.type}`);
  } catch (error) {
    console.error('[Webhook] Error sending notification:', error);
    // Don't throw - notification failure shouldn't fail webhook processing
  }
}

/**
 * Send notification to all admins
 */
async function notifyAdmins(params: {
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
}) {
  try {
    // Find all admin users
    const usersRef = db.collection('users');
    const adminSnapshot = await usersRef
      .where('role', '==', 'admin')
      .get();

    const notifications: Promise<any>[] = [];

    adminSnapshot.forEach((doc) => {
      notifications.push(
        db.collection('notifications').add({
          userId: doc.id,
          type: params.type,
          title: params.title,
          message: params.message,
          metadata: params.metadata || {},
          priority: params.priority || 'high',
          read: false,
          createdAt: Timestamp.now(),
        })
      );
    });

    await Promise.all(notifications);
    console.log(`[Webhook] Notified ${adminSnapshot.size} admin(s): ${params.type}`);

  } catch (error) {
    console.error('[Webhook] Error notifying admins:', error);
    // Don't throw - notification failure shouldn't fail webhook processing
  }
}
