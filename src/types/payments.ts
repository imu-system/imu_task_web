/**
 * Types pour le système de paiements et finances
 * Phase 1 : Paiements & Finances
 */

import { Timestamp } from 'firebase/firestore';

// ==================== TRANSACTIONS ====================

export type TransactionStatus =
    | 'pending'        // En attente
    | 'processing'     // En cours de traitement
    | 'succeeded'      // Terminée avec succès
    | 'failed'         // Échouée
    | 'canceled'       // Annulée
    | 'refunded'       // Remboursée
    | 'partially_refunded'; // Partiellement remboursée

export const TransactionStatusValues = {
    pending: 'pending' as TransactionStatus,
    processing: 'processing' as TransactionStatus,
    succeeded: 'succeeded' as TransactionStatus,
    failed: 'failed' as TransactionStatus,
    canceled: 'canceled' as TransactionStatus,
    refunded: 'refunded' as TransactionStatus,
    partially_refunded: 'partially_refunded' as TransactionStatus,
};

export type TransactionType =
    | 'payment'        // Paiement client → plateforme
    | 'payout'         // Virement plateforme → professionnel
    | 'refund'         // Remboursement plateforme → client
    | 'transfer'       // Transfert interne
    | 'withdrawal'     // Retrait vers carte/banque
    | 'deposit'        // Dépôt/ajout de fonds
    | 'fee'            // Frais plateforme
    | 'commission';    // Commission

export const TransactionTypeValues = {
    payment: 'payment' as TransactionType,
    payout: 'payout' as TransactionType,
    refund: 'refund' as TransactionType,
    transfer: 'transfer' as TransactionType,
    withdrawal: 'withdrawal' as TransactionType,
    deposit: 'deposit' as TransactionType,
    fee: 'fee' as TransactionType,
    commission: 'commission' as TransactionType,
};

export type PaymentMethod =
    | 'card'           // Carte bancaire
    | 'bank_transfer'  // Virement bancaire
    | 'wallet'         // Portefeuille plateforme
    | 'sepa_debit'     // Prélèvement SEPA
    | 'paypal'         // PayPal
    | 'stripe';        // Stripe direct

export const PaymentMethodValues = {
    card: 'card' as PaymentMethod,
    bank_transfer: 'bank_transfer' as PaymentMethod,
    wallet: 'wallet' as PaymentMethod,
    sepa_debit: 'sepa_debit' as PaymentMethod,
    paypal: 'paypal' as PaymentMethod,
    stripe: 'stripe' as PaymentMethod,
};

// ==================== PAYMENT METHOD DETAILS ====================

export type PaymentMethodStatus =
    | 'active'         // Actif
    | 'expired'        // Expiré
    | 'inactive';      // Inactif

export const PaymentMethodStatusValues = {
    active: 'active' as PaymentMethodStatus,
    expired: 'expired' as PaymentMethodStatus,
    inactive: 'inactive' as PaymentMethodStatus,
};

/**
 * Interface pour les détails d'un moyen de paiement stocké
 * Utilisé pour gérer les cartes bancaires et autres moyens de paiement des utilisateurs
 */
export interface PaymentMethodDetails {
    id: string;
    userId: string;                    // ID utilisateur propriétaire

    // Type et statut
    type: PaymentMethod;               // Type de moyen de paiement
    status: PaymentMethodStatus;       // Statut actif/expiré/inactif
    isDefault: boolean;                // Moyen de paiement par défaut

    // Détails carte (si type = 'card')
    brand?: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'; // Marque carte
    last4?: string;                    // 4 derniers chiffres
    cardholderName?: string;           // Nom titulaire
    expiryMonth?: number;              // Mois expiration (1-12)
    expiryYear?: number;               // Année expiration (YYYY)

    // Stripe
    stripePaymentMethodId?: string;    // ID Stripe Payment Method
    stripeCustomerId?: string;         // ID Stripe Customer

    // Métadonnées
    nickname?: string;                 // Surnom personnalisé
    metadata?: Record<string, any>;    // Métadonnées additionnelles

    // Dates
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastUsedAt?: Timestamp;            // Dernière utilisation
}

export interface Transaction {
    id: string;

    // Références
    userId: string;                    // Utilisateur concerné
    bookingId?: string;                // Réservation liée (si applicable)
    quoteId?: string;                  // Devis lié (si applicable)
    invoiceId?: string;                // Facture liée (si applicable)

    // Type et statut
    type: TransactionType;
    status: TransactionStatus;

    // Montants (en centimes d'euro)
    amount: number;                    // Montant principal
    currency: string;                  // Code devise (EUR, USD, etc.)
    platformFee?: number;              // Frais plateforme
    stripeFee?: number;                // Frais Stripe
    netAmount?: number;                // Montant net (amount - platformFee - stripeFee)

    // Méthode de paiement
    paymentMethod: PaymentMethod;

    // Stripe
    stripePaymentIntentId?: string;    // ID Payment Intent Stripe
    stripeChargeId?: string;           // ID Charge Stripe
    stripeTransferId?: string;         // ID Transfer Stripe
    stripePayoutId?: string;           // ID Payout Stripe

    // Descriptions
    description: string;               // Description transaction
    metadata?: Record<string, any>;    // Métadonnées additionnelles

    // Parties impliquées
    fromUserId?: string;               // Utilisateur source (transfers)
    toUserId?: string;                 // Utilisateur destination (transfers)
    professionalId?: string;           // Professionnel concerné (payouts)

    // Erreurs
    errorCode?: string;                // Code erreur si échec
    errorMessage?: string;             // Message erreur si échec

    // Remboursements
    refundedAmount?: number;           // Montant remboursé
    refundReason?: string;             // Raison du remboursement
    parentTransactionId?: string;      // Transaction parente (pour refunds)

    // Dates
    createdAt: Timestamp;
    updatedAt: Timestamp;
    processedAt?: Timestamp;           // Date traitement effectif
    failedAt?: Timestamp;              // Date échec
    refundedAt?: Timestamp;            // Date remboursement
}

// ==================== PAYOUTS ====================

export type PayoutStatus =
    | 'pending'        // En attente validation
    | 'approved'       // Approuvé, en attente traitement
    | 'processing'     // En cours de traitement
    | 'paid'           // Payé
    | 'failed'         // Échec
    | 'cancelled'      // Annulé
    | 'rejected';      // Rejeté par admin

export const PayoutStatusValues = {
    pending: 'pending' as PayoutStatus,
    approved: 'approved' as PayoutStatus,
    processing: 'processing' as PayoutStatus,
    paid: 'paid' as PayoutStatus,
    failed: 'failed' as PayoutStatus,
    cancelled: 'cancelled' as PayoutStatus,
    rejected: 'rejected' as PayoutStatus,
};

export type PayoutFrequency =
    | 'daily'          // Quotidien
    | 'weekly'         // Hebdomadaire
    | 'biweekly'       // Bi-mensuel
    | 'monthly'        // Mensuel
    | 'manual';        // Manuel/sur demande

export interface Payout {
    id: string;

    // Professionnel
    professionalId: string;            // ID professionnel
    userId: string;                    // ID utilisateur (propriétaire)

    // Montants (en centimes)
    grossAmount: number;               // Montant brut généré
    platformFee: number;               // Commission plateforme
    netAmount: number;                 // Montant net à verser
    currency: string;                  // Devise

    // Statut
    status: PayoutStatus;
    frequency: PayoutFrequency;

    // Compte bancaire
    bankAccountId: string;             // ID compte bancaire destination
    iban?: string;                     // IBAN masqué (ex: FR76 **** **** 1234)
    bankName?: string;                 // Nom banque

    // Stripe
    stripePayoutId?: string;           // ID Payout Stripe
    stripeAccountId?: string;          // ID Stripe Connect Account

    // Détails
    description: string;
    period?: {                         // Période couverte
        startDate: Timestamp;
        endDate: Timestamp;
    };

    // Transactions incluses
    transactionIds: string[];          // IDs transactions regroupées
    transactionsCount: number;         // Nombre transactions

    // Validation admin
    approvedBy?: string;               // ID admin valideur
    approvedAt?: Timestamp;            // Date validation
    rejectedBy?: string;               // ID admin rejeteur
    rejectedAt?: Timestamp;            // Date rejet
    rejectionReason?: string;          // Raison rejet

    // Fraude detection
    fraudScore?: number;               // Score risque (0-100)
    fraudFlags?: string[];             // Flags détectés
    isReviewed?: boolean;              // Revu manuellement
    reviewedBy?: string;               // ID admin reviewer

    // Erreurs
    errorCode?: string;
    errorMessage?: string;
    failedAt?: Timestamp;

    // Dates
    createdAt: Timestamp;
    updatedAt: Timestamp;
    scheduledAt?: Timestamp;           // Date programmée
    processedAt?: Timestamp;           // Date traitement
    paidAt?: Timestamp;                // Date paiement effectif
}

// ==================== BANK ACCOUNTS ====================

export type BankAccountType =
    | 'checking'       // Compte courant
    | 'savings'        // Compte épargne
    | 'business';      // Compte professionnel

export type BankAccountStatus =
    | 'pending'        // En attente vérification
    | 'verified'       // Vérifié
    | 'failed'         // Échec vérification
    | 'disabled';      // Désactivé

export const BankAccountStatusValues = {
    pending: 'pending' as BankAccountStatus,
    verified: 'verified' as BankAccountStatus,
    failed: 'failed' as BankAccountStatus,
    disabled: 'disabled' as BankAccountStatus,
};

export interface BankAccount {
    id: string;

    // Propriétaire
    userId: string;
    professionalId?: string;           // Si compte pro

    // Type et statut
    type: BankAccountType;
    status: BankAccountStatus;

    // Coordonnées bancaires
    iban: string;                      // IBAN complet (stocké chiffré)
    bic?: string;                      // BIC/SWIFT
    accountHolderName: string;         // Titulaire compte
    bankName: string;                  // Nom banque
    country: string;                   // Code pays (FR, DE, etc.)

    // Affichage
    last4: string;                     // 4 derniers chiffres IBAN
    maskedIban: string;                // IBAN masqué pour affichage

    // Stripe
    stripeBankAccountId?: string;      // ID Stripe External Account

    // Vérification
    isVerified: boolean;
    verifiedAt?: Timestamp;
    verificationMethod?: 'microdeposit' | 'instant' | 'manual';

    // Par défaut
    isDefault: boolean;                // Compte par défaut

    // Métadonnées
    metadata?: Record<string, any>;

    // Dates
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastUsedAt?: Timestamp;            // Dernière utilisation
}

// ==================== WALLETS ====================

export type WalletStatus =
    | 'active'         // Actif
    | 'suspended'      // Suspendu
    | 'frozen'         // Gelé
    | 'closed';        // Fermé

export interface Wallet {
    id: string;

    // Propriétaire
    userId: string;

    // Solde (en centimes)
    balance: number;                   // Solde disponible
    pendingBalance: number;            // Solde en attente
    totalBalance: number;              // Solde total (balance + pending)
    currency: string;                  // Devise

    // Statut
    status: WalletStatus;

    // Limites
    dailyLimit?: number;               // Limite quotidienne
    monthlyLimit?: number;             // Limite mensuelle
    minimumBalance?: number;           // Solde minimum requis

    // Statistiques
    totalDeposits: number;             // Total dépôts
    totalWithdrawals: number;          // Total retraits
    totalTransactions: number;         // Nombre transactions

    // Stripe
    stripeCustomerId?: string;         // ID Stripe Customer

    // Métadonnées
    metadata?: Record<string, any>;

    // Dates
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastTransactionAt?: Timestamp;     // Dernière transaction
}

// ==================== WITHDRAWALS ====================

export type WithdrawalStatus =
    | 'pending'        // En attente
    | 'approved'       // Approuvé
    | 'processing'     // En cours
    | 'completed'      // Terminé
    | 'failed'         // Échec
    | 'cancelled';     // Annulé

export type WithdrawalMethod =
    | 'bank_transfer'  // Virement bancaire
    | 'card';          // Carte bancaire

export interface Withdrawal {
    id: string;

    // Utilisateur
    userId: string;
    walletId: string;                  // ID portefeuille source

    // Montants (en centimes)
    amount: number;                    // Montant demandé
    feeAmount: number;                 // Frais retrait
    netAmount: number;                 // Montant net reçu
    currency: string;

    // Destination
    method: WithdrawalMethod;
    bankAccountId?: string;            // Si bank_transfer
    cardId?: string;                   // Si card

    // Statut
    status: WithdrawalStatus;

    // Stripe
    stripeTransferId?: string;

    // Traitement
    estimatedArrival?: Timestamp;      // Arrivée estimée
    processingTime?: string;           // Délai traitement (ex: "1-3 business days")

    // Validation
    approvedBy?: string;
    approvedAt?: Timestamp;

    // Erreurs
    errorCode?: string;
    errorMessage?: string;
    failedAt?: Timestamp;

    // Dates
    createdAt: Timestamp;
    updatedAt: Timestamp;
    processedAt?: Timestamp;
    completedAt?: Timestamp;
}

// ==================== TRANSFERS ====================

export type TransferStatus =
    | 'pending'
    | 'completed'
    | 'failed'
    | 'reversed';

export interface Transfer {
    id: string;

    // Source et destination
    fromUserId: string;
    fromWalletId: string;
    toUserId: string;
    toWalletId: string;

    // Montants (en centimes)
    amount: number;
    feeAmount?: number;
    netAmount: number;
    currency: string;

    // Statut
    status: TransferStatus;

    // Contexte
    reason?: string;                   // Raison transfert
    bookingId?: string;                // Réservation liée
    quoteId?: string;                  // Devis lié

    // Stripe
    stripeTransferId?: string;

    // Erreurs
    errorCode?: string;
    errorMessage?: string;

    // Dates
    createdAt: Timestamp;
    updatedAt: Timestamp;
    completedAt?: Timestamp;
    failedAt?: Timestamp;
    reversedAt?: Timestamp;
}

// ==================== DISPUTES ====================

export type DisputeStatus =
    | 'opened'         // Ouvert
    | 'under_review'   // En cours d'examen
    | 'waiting_response' // En attente réponse
    | 'won'            // Gagné
    | 'lost'           // Perdu
    | 'closed';        // Fermé

export const DisputeStatusValues = {
    opened: 'opened' as DisputeStatus,
    under_review: 'under_review' as DisputeStatus,
    waiting_response: 'waiting_response' as DisputeStatus,
    won: 'won' as DisputeStatus,
    lost: 'lost' as DisputeStatus,
    closed: 'closed' as DisputeStatus,
};

export type DisputeReason =
    | 'fraudulent'              // Frauduleux
    | 'duplicate'               // Doublon
    | 'product_not_received'    // Produit non reçu
    | 'product_unacceptable'    // Produit inacceptable
    | 'subscription_canceled'   // Abonnement annulé
    | 'unrecognized'            // Non reconnu
    | 'credit_not_processed'    // Crédit non traité
    | 'general';                // Général

export const DisputeReasonValues = {
    fraudulent: 'fraudulent' as DisputeReason,
    duplicate: 'duplicate' as DisputeReason,
    product_not_received: 'product_not_received' as DisputeReason,
    product_unacceptable: 'product_unacceptable' as DisputeReason,
    subscription_canceled: 'subscription_canceled' as DisputeReason,
    unrecognized: 'unrecognized' as DisputeReason,
    credit_not_processed: 'credit_not_processed' as DisputeReason,
    general: 'general' as DisputeReason,
};

export interface DisputeEvidence {
    id: string;
    type: 'document' | 'image' | 'message';
    url: string;
    fileName: string;
    uploadedBy: string;
    uploadedAt: Timestamp;
    description?: string;
}

export interface DisputeNote {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    isInternal: boolean;        // Visible seulement par admin
    createdAt: Timestamp;
}

export interface Dispute {
    id: string;

    // Transaction liée
    transactionId: string;
    paymentIntentId?: string;
    chargeId?: string;

    // Parties
    userId: string;                    // Client qui dispute
    professionalId?: string;           // Professionnel concerné

    // Montants (en centimes)
    amount: number;                    // Montant disputé
    currency: string;

    // Détails du litige
    reason: DisputeReason;
    status: DisputeStatus;
    description?: string;              // Description du problème

    // Stripe
    stripeDisputeId?: string;

    // Preuves et documents
    evidence: DisputeEvidence[];
    customerEvidence?: {
        customerEmailAddress?: string;
        customerName?: string;
        customerPurchaseIp?: string;
        billingAddress?: string;
        receipt?: string;
        shippingAddress?: string;
        shippingDate?: string;
        shippingTrackingNumber?: string;
        uncategorizedText?: string;
    };

    // Notes administratives
    notes: DisputeNote[];

    // Dates importantes
    dueBy?: Timestamp;                 // Date limite réponse
    respondBy?: Timestamp;             // Date limite Stripe

    // Résolution
    resolvedAt?: Timestamp;
    resolvedBy?: string;               // ID admin
    resolution?: string;               // Explication résolution
    outcome?: 'won' | 'lost' | 'accepted';

    // Métadonnées
    metadata?: Record<string, any>;

    // Dates
    createdAt: Timestamp;
    updatedAt: Timestamp;
    closedAt?: Timestamp;
}

// ==================== RECONCILIATION ====================

export type ReconciliationStatus =
    | 'pending'        // En attente
    | 'matched'        // Rapproché
    | 'unmatched'      // Non rapproché
    | 'disputed';      // En litige

export interface BankStatement {
    id: string;

    // Fichier
    fileName: string;
    fileUrl: string;                   // URL fichier CSV/PDF
    uploadedBy: string;                // ID admin uploader

    // Période
    startDate: Timestamp;
    endDate: Timestamp;

    // Compte bancaire
    bankAccountId: string;
    accountNumber: string;             // Numéro compte

    // Statistiques
    totalEntries: number;              // Nombre lignes
    totalDebit: number;                // Total débits
    totalCredit: number;               // Total crédits
    openingBalance: number;            // Solde initial
    closingBalance: number;            // Solde final

    // Rapprochement
    matchedCount: number;              // Nombre rapprochés
    unmatchedCount: number;            // Nombre non rapprochés

    // Dates
    createdAt: Timestamp;
    uploadedAt: Timestamp;
    processedAt?: Timestamp;
}

export interface BankStatementEntry {
    id: string;

    // Référence
    statementId: string;               // ID relevé bancaire

    // Transaction bancaire
    date: Timestamp;
    description: string;
    reference?: string;                // Référence bancaire
    amount: number;                    // Montant (positif = crédit, négatif = débit)
    balance: number;                   // Solde après transaction

    // Rapprochement
    isMatched: boolean;
    matchedTransactionId?: string;     // ID transaction plateforme
    matchedAt?: Timestamp;
    matchedBy?: string;                // ID admin
    matchConfidence?: number;          // Score confiance (0-100)

    // Suggestions matching
    suggestedMatches?: Array<{
        transactionId: string;
        confidence: number;
        reason: string;
    }>;

    // Dates
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Reconciliation {
    id: string;

    // Période
    startDate: Timestamp;
    endDate: Timestamp;

    // Références
    statementId: string;

    // Statut
    status: ReconciliationStatus;

    // Résultats
    totalTransactions: number;
    matchedTransactions: number;
    unmatchedTransactions: number;
    discrepancies: number;             // Nombre écarts

    // Montants (en centimes)
    platformTotal: number;             // Total plateforme
    bankTotal: number;                 // Total banque
    difference: number;                // Écart

    // Validation
    reviewedBy?: string;               // ID admin
    reviewedAt?: Timestamp;
    notes?: string;                    // Notes admin

    // Rapport
    reportUrl?: string;                // URL rapport PDF

    // Dates
    createdAt: Timestamp;
    updatedAt: Timestamp;
    completedAt?: Timestamp;
}

// ==================== COMMISSION RULES ====================

export interface CommissionRule {
    id: string;

    // Nom et description
    name: string;
    description?: string;

    // Applicable à
    categoryId?: string;               // Catégorie service
    serviceName?: string;              // Service spécifique
    professionalId?: string;           // Professionnel spécifique

    // Commission
    commissionType: 'percentage' | 'fixed';
    commissionValue: number;           // % ou montant fixe (centimes)
    minimumFee?: number;               // Frais minimum (centimes)
    maximumFee?: number;               // Frais maximum (centimes)

    // Conditions
    minAmount?: number;                // Montant min pour appliquer
    maxAmount?: number;                // Montant max pour appliquer

    // Activité
    isActive: boolean;
    priority: number;                  // Priorité (pour règles multiples)

    // Dates
    validFrom?: Timestamp;             // Début validité
    validUntil?: Timestamp;            // Fin validité
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ==================== PAYMENT ANALYTICS ====================

export interface PaymentAnalytics {
    id: string;

    // Période
    date: Timestamp;                   // Journée concernée
    period: 'daily' | 'weekly' | 'monthly';

    // Volumes (en centimes)
    totalVolume: number;               // Volume total
    paymentVolume: number;             // Paiements
    payoutVolume: number;              // Virements
    refundVolume: number;              // Remboursements

    // Transactions
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    successRate: number;               // Taux succès (%)

    // Revenus plateforme
    platformRevenue: number;           // Commission générée
    stripeFees: number;                // Frais Stripe
    netRevenue: number;                // Revenu net

    // Moyennes
    averageTransactionAmount: number;
    averageCommissionRate: number;     // % moyen commission

    // Méthodes de paiement
    paymentMethodBreakdown: Record<PaymentMethod, {
        count: number;
        volume: number;
    }>;

    // Dates
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ==================== HELPERS ====================

/**
 * Convertit un montant en euros vers centimes
 */
export function eurosToCents(euros: number): number {
    return Math.round(euros * 100);
}

/**
 * Convertit un montant en centimes vers euros
 */
export function centsToEuros(cents: number): number {
    return cents / 100;
}

/**
 * Formate un montant en centimes pour affichage
 */
export function formatAmount(cents: number, currency: string = 'EUR'): string {
    const euros = centsToEuros(cents);
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
    }).format(euros);
}

/**
 * Calcule la commission plateforme
 */
export function calculateCommission(
    amount: number,
    commissionRate: number,
    minimumFee?: number,
    maximumFee?: number
): number {
    let commission = Math.round(amount * (commissionRate / 100));

    if (minimumFee !== undefined && commission < minimumFee) {
        commission = minimumFee;
    }

    if (maximumFee !== undefined && commission > maximumFee) {
        commission = maximumFee;
    }

    return commission;
}

/**
 * Calcule le montant net après commission
 */
export function calculateNetAmount(
    grossAmount: number,
    commissionRate: number,
    minimumFee?: number,
    maximumFee?: number
): number {
    const commission = calculateCommission(grossAmount, commissionRate, minimumFee, maximumFee);
    return grossAmount - commission;
}
