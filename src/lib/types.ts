

// Types partagés pour le monorepo (générés d'après le schéma Prisma)
// GitHub Copilot

// Enums (valeurs telles qu'elles figurent dans le schéma Prisma)
export enum UserRole {
    client = 'client',
    provider = 'provider',
    admin = 'admin',
    moderator = 'moderator',
}

export enum UserStatus {
    active = 'active',
    suspended = 'suspended',
    closed = 'closed',
}

export enum KYCStatus {
    not_required = 'not_required',
    required = 'required',
    pending = 'pending',
    verified = 'verified',
    rejected = 'rejected',
}

export type TaskStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'canceled';
export type OfferStatus = 'pending' | 'accepted' | 'declined';


// Util type pour les DateTime retournés par Prisma (Date ou ISO string)
export type DateTime = string | Date;

// ----------------------------------------
// Models (interfaces)
// ----------------------------------------

export interface User {
    id: string;
    email: string;
    roles?: UserRole[];
    status?: UserStatus;
    profile?: Profile;
}

export interface Profile {
    displayName: string;
    photoUrl?: string | null;
    bio?: string | null;
}

export interface Task {
    id: string;
    clientId: string;
    category: TaskCategory;
    title: string;
    description: string;
    location: string;
    date: Date;
    price: number;
    status: TaskStatus;
    client?: User | null;
    createdAt?: any;
}


export interface Offer {
    id: string;
    taskId: string;
    providerId: string;
    message: string;
    price: number;
    status: OfferStatus;
    provider: User;
}

export type TaskCategory =
  | 'Courses'
  | 'Jardinage'
  | 'Ménage léger'
  | 'Aide numérique'
  | 'Aide administrative'
  | 'Petits bricolages'
  | 'Garde d’animaux';

export type CategoryKey =
  | 'shopping'
  | 'gardening'
  | 'lightCleaning'
  | 'digitalHelp'
  | 'administrativeHelp'
  | 'handyman'
  | 'petSitting';
