import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TransactionStatus } from '@/types/payments';
import Stripe from 'stripe';

// Helper to check transaction status
const isRefundedStatus = (status: string) => status === 'refunded';
const isSucceededStatus = (status: string) => status === 'succeeded';

export async function POST(req: NextRequest) {
    try {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            return NextResponse.json(
                { error: 'Stripe is not configured on the server' },
                { status: 500 }
            );
        }
        const stripe = new Stripe(stripeSecretKey);

        const { transactionId } = await req.json();

        if (!transactionId) {
            return NextResponse.json(
                { error: 'Transaction ID is required' },
                { status: 400 }
            );
        }

        // Get transaction from Firestore
        const txRef = doc(db, 'transactions', transactionId);
        const txSnap = await getDoc(txRef);

        if (!txSnap.exists()) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        const transaction = txSnap.data();

        // Check if transaction is already refunded
        if (isRefundedStatus(transaction.status)) {
            return NextResponse.json(
                { error: 'Transaction already refunded' },
                { status: 400 }
            );
        }

        // Check if transaction can be refunded
        if (!isSucceededStatus(transaction.status)) {
            return NextResponse.json(
                { error: 'Only succeeded transactions can be refunded' },
                { status: 400 }
            );
        }

        // Process refund with Stripe
        const refund = await stripe.refunds.create({
            payment_intent: transaction.stripePaymentIntentId,
            metadata: {
                transactionId: transactionId,
                bookingId: transaction.bookingId || '',
            },
        });

        // Update transaction in Firestore
        await updateDoc(txRef, {
            status: 'refunded',
            stripeRefundId: refund.id,
            refundedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        return NextResponse.json({
            success: true,
            refundId: refund.id,
            transactionId: transactionId,
        });
    } catch (error: any) {
        console.error('Error processing refund:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process refund' },
            { status: 500 }
        );
    }
}
