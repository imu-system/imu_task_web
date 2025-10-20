/**
 * Types KYB (Know Your Business) pour les professionnels ImuPro
 * Extension du système KYC existant pour les prestataires certifiés
 */

import {KYCStatus} from "./kyc";

/**
 * Types de documents supplémentaires pour les professionnels
 * En plus des documents KYC classiques (identity, address, tax)
 */
export enum KYBDocumentType {
    // Documents KYC de base (hérités)
    IDENTITY = "identity",
    ADDRESS = "address",
    TAX = "tax",

    // Nouveaux documents KYB Pro
    BUSINESS_REGISTRATION = "business_registration", // KBIS, SIRET
    PROFESSIONAL_INSURANCE = "professional_insurance", // RC Pro obligatoire
    DIPLOMA_CERTIFICATE = "diploma_certificate", // CAP, BEP, Licence pro...
    PROFESSIONAL_CARD = "professional_card", // Carte pro (serrurier, VTC...)
    CRIMINAL_RECORD = "criminal_record", // B3 pour garde d'enfants
    HEALTH_CERTIFICATION = "health_certification", // Pour métiers de bouche
}

/**
 * Forme juridique de l'entreprise
 */
export enum BusinessType {
    AUTO_ENTREPRENEUR = "auto_entrepreneur",
    ENTREPRISE_INDIVIDUELLE = "entreprise_individuelle",
    SARL = "sarl",
    SAS = "sas",
    EURL = "eurl",
    SASU = "sasu",
}

/**
 * Catégories de services professionnels ImuPro
 * Phase 1 (MVP): Homme/Femme à tout faire uniquement
 */
export enum ProServiceCategory {
    // Phase 1 - MVP (Q2 2026)
    HANDYMAN = "handyman", // Homme/Femme à tout faire

    // Phase 2 - Extension (Q3-Q4 2026)
    PLUMBING = "plumbing", // Plomberie
    ELECTRICITY = "electricity", // Électricité
    IT_SUPPORT = "it_support", // Support informatique avancé
    TUTORING = "tutoring", // Soutien scolaire

    // Phase 3 - Services à la personne (2027)
    CHILDCARE = "childcare", // Garde d'enfants
    ELDERLY_CARE = "elderly_care", // Aide aux personnes dépendantes

    // Phase 4 - Beauté & Bien-être (2027)
    HAIRDRESSING = "hairdressing", // Coiffure à domicile
    BEAUTY = "beauty", // Esthétique
    MASSAGE = "massage", // Massage bien-être

    // Future
    TRAINING = "training", // Cours & Formation
}

/**
 * Certification professionnelle
 */
export interface Certification {
    type: string; // Ex: "CAP Plomberie", "BAFA", "Habilitation électrique"
    issuingBody: string; // Organisme émetteur
    validUntil?: Date; // Date d'expiration si applicable
    documentUrl: string; // URL du document dans Storage
    verifiedByAdmin: boolean;
    verifiedAt?: Date;
}

/**
 * Informations commerciales de l'entreprise
 */
export interface BusinessInfo {
    companyName: string;
    siret: string; // 14 chiffres
    legalForm: BusinessType;
    vatNumber?: string; // Si assujetti à la TVA
    creationDate: Date;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
}

/**
 * Assurance professionnelle (RC Pro)
 */
export interface ProfessionalInsurance {
    provider: string; // Ex: "Allianz", "AXA"
    policyNumber: string;
    coverageAmount: number; // Montant de la garantie (ex: 500000 pour 500k€)
    startDate: Date;
    expiryDate: Date;
    documentUrl: string;
    verified: boolean;
    verifiedAt?: Date;
    // Alerte avant expiration
    expirationAlertSent?: boolean;
}

/**
 * Document KYB
 */
export interface KYBDocument {
    type: KYBDocumentType;
    url: string;
    uploadedAt: Date;
    verified: boolean;
    rejectionReason?: string;
    expiryDate?: Date; // Pour les documents avec validité limitée
}

/**
 * Soumission KYB complète
 * Extension de KYCSubmission avec données professionnelles
 */
export interface KYBSubmission {
    id: string;
    userId: string;
    status: KYCStatus; // Réutilisation des statuts KYC

    // Documents KYB
    documents: KYBDocument[];

    // Informations commerciales
    businessInfo: BusinessInfo;

    // Assurance professionnelle
    insurance: ProfessionalInsurance;

    // Certifications
    certifications: Certification[];

    // Catégories de services autorisées
    authorizedCategories: ProServiceCategory[];

    // Métadonnées de soumission
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string; // UID de l'admin
    rejectionReason?: string;
    notes?: string;

    // Vérifications automatiques
    autoVerification?: {
        siretValid: boolean;
        siretVerifiedAt?: Date;
        vatValid?: boolean;
        vatVerifiedAt?: Date;
    };
}

/**
 * Statut de vérification d'un professionnel
 */
export enum ProVerificationStatus {
    NOT_SUBMITTED = "not_submitted", // Pas encore soumis
    PENDING = "pending", // En cours de vérification
    VERIFIED = "verified", // Vérifié et actif
    REJECTED = "rejected", // Rejeté
    EXPIRED = "expired", // Assurance ou certifications expirées
    SUSPENDED = "suspended", // Suspendu temporairement
}
