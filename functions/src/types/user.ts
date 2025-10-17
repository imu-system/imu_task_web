/**
 * Types partagés pour les Cloud Functions
 * Note: Ces types sont dupliqués depuis src/lib/types.ts car les Cloud Functions
 * ne peuvent pas importer directement depuis le projet Next.js
 */

export enum UserRole {
    client = 'client',
    provider = 'provider',
    admin = 'admin',
}

export interface UserProfile {
    displayName?: string;
    bio?: string;
    phone?: string;
    location?: string;
    hourlyRate?: number;
    skills?: string[];
    availability?: boolean;
}

export interface User {
    uid: string;
    email: string;
    roles: UserRole[];
    profile: UserProfile;
    createdAt: Date;
    updatedAt: Date;
}
