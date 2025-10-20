/**
 * Types pour le système de devis et facturation ImuPro
 * Gestion des devis, acceptation client, et facturation légale
 */

/**
 * Statut du devis
 */
export enum QuoteStatus {
    DRAFT = "draft", // Brouillon (non envoyé)
    SENT = "sent", // Envoyé au client
    VIEWED = "viewed", // Vu par le client
    ACCEPTED = "accepted", // Accepté par le client
    DECLINED = "declined", // Refusé par le client
    EXPIRED = "expired", // Expiré (date limite dépassée)
    CANCELLED = "cancelled", // Annulé par le pro
}

/**
 * Ligne de devis
 */
export interface QuoteLineItem {
    description: string;
    quantity: number;
    unitPrice: number; // En centimes
    total: number; // quantity * unitPrice
    unit?: string; // Ex: "heure", "m²", "unité"
}

/**
 * Conditions de paiement
 */
export enum PaymentTerms {
    IMMEDIATE = "immediate", // Paiement immédiat
    UPON_COMPLETION = "upon_completion", // À la fin des travaux
    NET_7 = "net_7", // 7 jours après facturation
    NET_15 = "net_15", // 15 jours
    NET_30 = "net_30", // 30 jours
    SPLIT_50_50 = "split_50_50", // 50% avant, 50% après
}

/**
 * Demande de devis (initiée par le client)
 */
export interface QuoteRequest {
    id: string;
    taskId: string; // Lien vers la tâche d'origine
    clientId: string;
    providerId: string;

    // Détails de la demande
    description: string;
    location: {
        address: string;
        city: string;
        postalCode: string;
        latitude?: number;
        longitude?: number;
    };

    // Photos/documents fournis par le client
    attachments?: string[]; // URLs

    // Disponibilité souhaitée
    preferredDate?: Date;
    urgency: "low" | "medium" | "high";

    // Métadonnées
    createdAt: Date;
    respondedAt?: Date;
    status: "pending" | "quote_sent" | "declined_by_pro";
}

/**
 * Devis (créé par le professionnel)
 */
export interface Quote {
    id: string;
    quoteNumber: string; // Ex: "DEVIS-2026-001"
    quoteRequestId?: string; // Si issu d'une demande
    taskId?: string; // Si lié à une tâche

    // Parties
    providerId: string;
    clientId: string;

    // Statut
    status: QuoteStatus;

    // Contenu du devis
    title: string;
    description: string;
    lineItems: QuoteLineItem[];

    // Montants
    subtotal: number; // Somme des lignes (en centimes)
    travelFee?: number; // Frais de déplacement
    discountAmount?: number; // Remise
    taxRate?: number; // Taux de TVA (ex: 20 pour 20%)
    taxAmount?: number; // Montant de TVA
    total: number; // Montant total TTC

    // Validité
    validUntil: Date; // Date d'expiration du devis

    // Conditions
    terms: string; // Conditions générales
    paymentTerms: PaymentTerms;
    estimatedDuration: string; // Ex: "2-3 jours"
    startDate?: Date; // Date de début souhaitée

    // Documents
    attachments?: string[]; // Plans, photos, etc.
    pdfUrl?: string; // PDF généré du devis

    // Historique
    createdAt: Date;
    sentAt?: Date;
    viewedAt?: Date;
    acceptedAt?: Date;
    declinedAt?: Date;

    // Commentaires
    clientNotes?: string; // Notes du client lors de l'acceptation/refus

    // Suivi
    bookingId?: string; // ID de la réservation créée si accepté
}

/**
 * Template de devis (réutilisable)
 */
export interface QuoteTemplate {
    id: string;
    providerId: string;
    name: string; // Ex: "Installation plomberie standard"
    category: string;
    lineItems: Omit<QuoteLineItem, "total">[]; // Sans les totaux calculés
    defaultTerms: string;
    defaultDuration: string;
}

/**
 * Statut de la facture
 */
export enum InvoiceStatus {
    DRAFT = "draft",
    ISSUED = "issued", // Émise
    SENT = "sent", // Envoyée au client
    VIEWED = "viewed", // Vue par le client
    PAID = "paid", // Payée
    OVERDUE = "overdue", // En retard
    CANCELLED = "cancelled",
}

/**
 * Facture (émise par le professionnel)
 */
export interface Invoice {
    id: string;
    invoiceNumber: string; // Ex: "FACT-2026-001"
    quoteId?: string; // Si liée à un devis
    bookingId: string; // Réservation associée

    // Parties
    seller: {
        companyName: string;
        siret: string;
        address: string;
        city: string;
        postalCode: string;
        vatNumber?: string;
        phone: string;
        email: string;
    };

    buyer: {
        name: string;
        address: string;
        email: string;
    };

    // Dates
    issueDate: Date;
    dueDate: Date;
    serviceDate?: Date; // Date de la prestation

    // Statut
    status: InvoiceStatus;

    // Prestations
    services: QuoteLineItem[];

    // Montants
    subtotal: number;
    discountAmount?: number;
    taxRate?: number; // Taux de TVA
    totalVAT: number; // Montant TVA
    total: number; // Total TTC

    // Commission plateforme
    platformFeeRate: number; // Ex: 10 pour 10%
    platformFeeAmount: number; // Montant de la commission
    netAmount: number; // Ce que le pro reçoit (total - platformFee)

    // Paiement
    paymentMethod?: string;
    paidAt?: Date;
    transactionId?: string;

    // Fichier
    pdfUrl: string; // PDF de la facture
    uploadedByPro?: boolean; // true si uploadée manuellement par le pro

    // Validation
    validatedByAdmin?: boolean;
    validatedAt?: Date;
    validatedBy?: string; // UID admin
    rejectionReason?: string;

    // Métadonnées
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Workflow du processus devis → facture
 */
export enum QuoteWorkflow {
    CLIENT_REQUEST = "client_request", // Client demande un devis
    PRO_SENDS_QUOTE = "pro_sends_quote", // Pro envoie le devis
    CLIENT_ACCEPTS = "client_accepts", // Client accepte
    BOOKING_CREATED = "booking_created", // Réservation créée
    WORK_STARTED = "work_started", // Travaux commencés
    WORK_COMPLETED = "work_completed", // Travaux terminés
    INVOICE_ISSUED = "invoice_issued", // Facture émise
    PAYMENT_COMPLETED = "payment_completed", // Paiement effectué
}

/**
 * Événement du workflow
 */
export interface QuoteWorkflowEvent {
    stage: QuoteWorkflow;
    timestamp: Date;
    actor: "client" | "provider" | "system";
    notes?: string;
}

/**
 * Statistiques de facturation (pour le pro)
 */
export interface InvoicingStats {
    providerId: string;
    period: {
        start: Date;
        end: Date;
    };

    // Factures
    totalInvoices: number;
    paidInvoices: number;
    unpaidInvoices: number;
    overdueInvoices: number;

    // Montants
    totalRevenue: number; // Chiffre d'affaires TTC
    totalPlatformFees: number; // Commissions versées
    netRevenue: number; // Revenu net perçu
    pendingAmount: number; // En attente de paiement

    // Moyennes
    averageInvoiceAmount: number;
    averagePaymentDelay: number; // En jours
}
