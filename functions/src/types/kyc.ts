/**
 * Types KYC pour la validation des prestataires
 */

export enum KYCStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected",
    incomplete = "incomplete",
}

export enum KYCDocumentType {
    identity = "identity", // Carte d'identité ou passeport
    address = "address", // Justificatif de domicile
    professional = "professional", // Carte professionnelle, diplôme, etc.
    tax = "tax", // Numéro SIRET/SIREN pour France
}

export interface KYCDocument {
    type: KYCDocumentType;
    url: string;
    uploadedAt: Date;
    verified: boolean;
    rejectionReason?: string;
}

export interface KYCSubmission {
    id: string;
    userId: string;
    status: KYCStatus;
    documents: KYCDocument[];
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string; // UID de l'admin qui a validé
    rejectionReason?: string;
    notes?: string;
}
