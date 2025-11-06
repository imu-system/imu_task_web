/**
 * Provider Availability System Types
 * 
 * Gère les disponibilités des prestataires pour:
 * - Créneaux horaires récurrents (ex: Lundi 9h-17h)
 * - Blocages de dates spécifiques (vacances, congés)
 * - Exceptions (disponible un jour normalement bloqué)
 * - Intégration avec système d'offres
 */

import { Timestamp } from 'firebase/firestore';

// Types de disponibilité
export type AvailabilityType = 'recurring' | 'specific' | 'blocked';

// Jours de la semaine
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Dimanche, 6 = Samedi

// Statut de disponibilité
export type AvailabilityStatus = 'available' | 'partially_available' | 'unavailable';

/**
 * Créneau horaire (time slot)
 */
export interface TimeSlot {
  startTime: string; // Format "HH:mm" (ex: "09:00")
  endTime: string;   // Format "HH:mm" (ex: "17:00")
}

/**
 * Disponibilité récurrente (ex: tous les lundis 9h-17h)
 */
export interface RecurringAvailability {
  id?: string;
  providerId: string;
  type: 'recurring';
  
  // Jour de la semaine
  dayOfWeek: DayOfWeek;
  
  // Créneaux horaires pour ce jour
  timeSlots: TimeSlot[];
  
  // Plage de validité (optionnel)
  validFrom?: Date | Timestamp;
  validUntil?: Date | Timestamp;
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Disponibilité spécifique (une date précise)
 */
export interface SpecificAvailability {
  id?: string;
  providerId: string;
  type: 'specific';
  
  // Date spécifique
  date: Date | Timestamp;
  
  // Créneaux horaires pour cette date
  timeSlots: TimeSlot[];
  
  // Raison (optionnel)
  reason?: string; // Ex: "Exception - Disponible exceptionnellement"
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Blocage de disponibilité (vacances, congés, etc.)
 */
export interface BlockedPeriod {
  id?: string;
  providerId: string;
  type: 'blocked';
  
  // Période bloquée
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  
  // Raison du blocage
  reason: string; // Ex: "Vacances", "Congé maladie", "Indisponible"
  
  // Type de blocage
  blockType: 'vacation' | 'sick_leave' | 'personal' | 'other';
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Union type pour toutes les disponibilités
 */
export type Availability = RecurringAvailability | SpecificAvailability | BlockedPeriod;

/**
 * Configuration générale de disponibilité d'un provider
 */
export interface ProviderAvailabilitySettings {
  providerId: string;
  
  // Fuseau horaire
  timezone: string; // Ex: "Europe/Paris"
  
  // Délai minimum de réservation (en heures)
  minAdvanceBookingHours: number; // Ex: 24 = doit réserver 24h à l'avance
  
  // Délai maximum de réservation (en jours)
  maxAdvanceBookingDays: number; // Ex: 90 = max 90 jours à l'avance
  
  // Durée minimum d'une mission (en minutes)
  minBookingDuration: number; // Ex: 60 = minimum 1h
  
  // Durée maximum d'une mission (en heures)
  maxBookingDuration: number; // Ex: 8 = maximum 8h
  
  // Buffer entre deux missions (en minutes)
  bufferBetweenBookings: number; // Ex: 30 = 30min entre chaque mission
  
  // Accepte les réservations automatiquement si créneau disponible
  autoAccept: boolean;
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Résultat de vérification de disponibilité
 */
export interface AvailabilityCheck {
  isAvailable: boolean;
  status: AvailabilityStatus;
  availableSlots: TimeSlot[];
  blockedReasons: string[];
  nextAvailableDate?: Date;
}

/**
 * Paramètres pour chercher des disponibilités
 */
export interface AvailabilitySearchParams {
  providerId: string;
  startDate: Date;
  endDate: Date;
  minDuration?: number; // En minutes
  preferredTimeSlots?: TimeSlot[];
}

/**
 * Input pour créer une disponibilité récurrente
 */
export interface CreateRecurringAvailabilityInput {
  providerId: string;
  dayOfWeek: DayOfWeek;
  timeSlots: TimeSlot[];
  validFrom?: Date;
  validUntil?: Date;
}

/**
 * Input pour créer une disponibilité spécifique
 */
export interface CreateSpecificAvailabilityInput {
  providerId: string;
  date: Date;
  timeSlots: TimeSlot[];
  reason?: string;
}

/**
 * Input pour créer un blocage
 */
export interface CreateBlockedPeriodInput {
  providerId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  blockType: 'vacation' | 'sick_leave' | 'personal' | 'other';
}

/**
 * Vue calendrier (pour affichage UI)
 */
export interface CalendarDay {
  date: Date;
  status: AvailabilityStatus;
  timeSlots: TimeSlot[];
  blockedReasons: string[];
  hasBookings: boolean;
  bookingsCount: number;
}

/**
 * Statistiques de disponibilité
 */
export interface AvailabilityStats {
  totalAvailableHours: number; // Par semaine
  averageBookedHours: number;  // Par semaine
  utilizationRate: number;     // Pourcentage (0-100)
  upcomingBlockedDays: number;
  recurringDaysCount: number;
}
