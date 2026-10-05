import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebaseAdmin';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    try {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            return NextResponse.json(
                { error: 'Stripe is not configured on the server' },
                { status: 500 }
            );
        }
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2025-09-30.clover',
        });

        const { payoutId } = await req.json();

        if (!payoutId) {
            return NextResponse.json(
                { error: 'Payout ID required' },
                { status: 400 }
            );
        }

        // Initialize Firebase Admin
        const { db, auth } = initAdmin();

        // Get the payout from Firestore
        const payoutRef = db.collection('payouts').doc(payoutId);
        const payoutDoc = await payoutRef.get();

        if (!payoutDoc.exists) {
            return NextResponse.json(
                { error: 'Payout not found' },
                { status: 404 }
            );
        }

        const payout = payoutDoc.data();

        // Verify payout is approved
        if (payout?.status !== 'approved') {
            return NextResponse.json(
                { error: 'Payout must be approved before initiating Stripe transfer' },
                { status: 400 }
            );
        }

        // Verify we have the necessary Stripe data
        if (!payout.stripeAccountId) {
            return NextResponse.json(
                { error: 'Stripe account ID missing' },
                { status: 400 }
            );
        }

        // Create a transfer to the connected account
        const transfer = await stripe.transfers.create({
            amount: payout.netAmount, // Amount in centimes
            currency: payout.currency || 'eur',
            destination: payout.stripeAccountId,
            description: `Payout ${payoutId}`,
            metadata: {
                payoutId: payoutId,
                professionalId: payout.professionalId,
            },
        });

        // Update the payout in Firestore
        await payoutRef.update({
            status: 'processing',
            stripePayoutId: transfer.id,
            processedAt: new Date(),
            updatedAt: new Date(),
        });

        // Create audit log
        await db.collection('auditLogs').add({
            action: 'payout_initiated',
            entityType: 'payout',
            entityId: payoutId,
            userId: 'system', // TODO: Get from auth session
            details: {
                stripeTransferId: transfer.id,
                amount: payout.netAmount,
                currency: payout.currency || 'eur',
                stripeAccountId: payout.stripeAccountId,
            },
            timestamp: new Date(),
        });

        return NextResponse.json({
            success: true,
            transferId: transfer.id,
            message: 'Payout initiated successfully',
        });

    } catch (error: any) {
        console.error('Error initiating payout:', error);

        // If it's a Stripe error, return more details
        if (error.type === 'StripeCardError' || error.type === 'StripeInvalidRequestError') {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to initiate payout' },
            { status: 500 }
        );
    }
}
