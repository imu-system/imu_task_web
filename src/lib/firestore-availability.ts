/**
 * Firestore Availability Library
 * 
 * Gère les disponibilités des providers dans Firestore:
 * - CRUD disponibilités récurrentes
 * - CRUD blocages de dates
 * - CRUD disponibilités spécifiques
 * - Vérification de disponibilité pour une date/heure
 * - Recherche de créneaux disponibles
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Availability,
  RecurringAvailability,
  SpecificAvailability,
  BlockedPeriod,
  ProviderAvailabilitySettings,
  TimeSlot,
  AvailabilityCheck,
  AvailabilitySearchParams,
  CreateRecurringAvailabilityInput,
  CreateSpecificAvailabilityInput,
  CreateBlockedPeriodInput,
  DayOfWeek,
} from '@/types/availability';

const AVAILABILITY_COLLECTION = 'availabilities';
const SETTINGS_COLLECTION = 'availability_settings';

// ============================================================================
// SETTINGS
// ============================================================================

/**
 * Get provider availability settings
 */
export async function getProviderAvailabilitySettings(
  providerId: string
): Promise<ProviderAvailabilitySettings | null> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, providerId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      providerId,
      timezone: data.timezone || 'Europe/Paris',
      minAdvanceBookingHours: data.minAdvanceBookingHours || 24,
      maxAdvanceBookingDays: data.maxAdvanceBookingDays || 90,
      minBookingDuration: data.minBookingDuration || 60,
      maxBookingDuration: data.maxBookingDuration || 8,
      bufferBetweenBookings: data.bufferBetweenBookings || 30,
      autoAccept: data.autoAccept || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting provider availability settings:', error);
    throw error;
  }
}

/**
 * Update provider availability settings
 */
export async function updateProviderAvailabilitySettings(
  providerId: string,
  settings: Partial<ProviderAvailabilitySettings>
): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, providerId);
    await updateDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating provider availability settings:', error);
    throw error;
  }
}

// ============================================================================
// RECURRING AVAILABILITY
// ============================================================================

/**
 * Create recurring availability
 */
export async function createRecurringAvailability(
  input: CreateRecurringAvailabilityInput
): Promise<string> {
  try {
    const data = {
      providerId: input.providerId,
      type: 'recurring' as const,
      dayOfWeek: input.dayOfWeek,
      timeSlots: input.timeSlots,
      validFrom: input.validFrom ? Timestamp.fromDate(input.validFrom) : null,
      validUntil: input.validUntil ? Timestamp.fromDate(input.validUntil) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, AVAILABILITY_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    console.error('Error creating recurring availability:', error);
    throw error;
  }
}

/**
 * Get all recurring availabilities for a provider
 */
export async function getRecurringAvailabilities(
  providerId: string
): Promise<RecurringAvailability[]> {
  try {
    const q = query(
      collection(db, AVAILABILITY_COLLECTION),
      where('providerId', '==', providerId),
      where('type', '==', 'recurring'),
      orderBy('dayOfWeek', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => ({
      id: docSnap.id,
      providerId: docSnap.data().providerId,
      type: 'recurring',
      dayOfWeek: docSnap.data().dayOfWeek,
      timeSlots: docSnap.data().timeSlots,
      validFrom: docSnap.data().validFrom?.toDate(),
      validUntil: docSnap.data().validUntil?.toDate(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error('Error getting recurring availabilities:', error);
    throw error;
  }
}

/**
 * Update recurring availability
 */
export async function updateRecurringAvailability(
  availabilityId: string,
  updates: Partial<RecurringAvailability>
): Promise<void> {
  try {
    const docRef = doc(db, AVAILABILITY_COLLECTION, availabilityId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating recurring availability:', error);
    throw error;
  }
}

/**
 * Delete recurring availability
 */
export async function deleteRecurringAvailability(availabilityId: string): Promise<void> {
  try {
    const docRef = doc(db, AVAILABILITY_COLLECTION, availabilityId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting recurring availability:', error);
    throw error;
  }
}

// ============================================================================
// SPECIFIC AVAILABILITY
// ============================================================================

/**
 * Create specific availability
 */
export async function createSpecificAvailability(
  input: CreateSpecificAvailabilityInput
): Promise<string> {
  try {
    const data = {
      providerId: input.providerId,
      type: 'specific' as const,
      date: Timestamp.fromDate(input.date),
      timeSlots: input.timeSlots,
      reason: input.reason || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, AVAILABILITY_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    console.error('Error creating specific availability:', error);
    throw error;
  }
}

/**
 * Get specific availabilities for a provider in a date range
 */
export async function getSpecificAvailabilities(
  providerId: string,
  startDate: Date,
  endDate: Date
): Promise<SpecificAvailability[]> {
  try {
    const q = query(
      collection(db, AVAILABILITY_COLLECTION),
      where('providerId', '==', providerId),
      where('type', '==', 'specific'),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate))
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => ({
      id: docSnap.id,
      providerId: docSnap.data().providerId,
      type: 'specific',
      date: docSnap.data().date?.toDate() || new Date(),
      timeSlots: docSnap.data().timeSlots,
      reason: docSnap.data().reason,
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error('Error getting specific availabilities:', error);
    throw error;
  }
}

/**
 * Delete specific availability
 */
export async function deleteSpecificAvailability(availabilityId: string): Promise<void> {
  try {
    const docRef = doc(db, AVAILABILITY_COLLECTION, availabilityId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting specific availability:', error);
    throw error;
  }
}

// ============================================================================
// BLOCKED PERIODS
// ============================================================================

/**
 * Create blocked period
 */
export async function createBlockedPeriod(
  input: CreateBlockedPeriodInput
): Promise<string> {
  try {
    const data = {
      providerId: input.providerId,
      type: 'blocked' as const,
      startDate: Timestamp.fromDate(input.startDate),
      endDate: Timestamp.fromDate(input.endDate),
      reason: input.reason,
      blockType: input.blockType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, AVAILABILITY_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    console.error('Error creating blocked period:', error);
    throw error;
  }
}

/**
 * Get blocked periods for a provider
 */
export async function getBlockedPeriods(
  providerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<BlockedPeriod[]> {
  try {
    let q;
    
    if (startDate && endDate) {
      q = query(
        collection(db, AVAILABILITY_COLLECTION),
        where('providerId', '==', providerId),
        where('type', '==', 'blocked'),
        where('startDate', '<=', Timestamp.fromDate(endDate)),
        where('endDate', '>=', Timestamp.fromDate(startDate))
      );
    } else {
      q = query(
        collection(db, AVAILABILITY_COLLECTION),
        where('providerId', '==', providerId),
        where('type', '==', 'blocked'),
        orderBy('startDate', 'asc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => ({
      id: docSnap.id,
      providerId: docSnap.data().providerId,
      type: 'blocked',
      startDate: docSnap.data().startDate?.toDate() || new Date(),
      endDate: docSnap.data().endDate?.toDate() || new Date(),
      reason: docSnap.data().reason,
      blockType: docSnap.data().blockType,
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error('Error getting blocked periods:', error);
    throw error;
  }
}

/**
 * Update blocked period
 */
export async function updateBlockedPeriod(
  blockId: string,
  updates: Partial<BlockedPeriod>
): Promise<void> {
  try {
    const docRef = doc(db, AVAILABILITY_COLLECTION, blockId);
    
    const data: Record<string, unknown> = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    
    // Convert dates to Timestamps
    if (updates.startDate) {
      data.startDate = Timestamp.fromDate(new Date(updates.startDate));
    }
    if (updates.endDate) {
      data.endDate = Timestamp.fromDate(new Date(updates.endDate));
    }
    
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating blocked period:', error);
    throw error;
  }
}

/**
 * Delete blocked period
 */
export async function deleteBlockedPeriod(blockId: string): Promise<void> {
  try {
    const docRef = doc(db, AVAILABILITY_COLLECTION, blockId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting blocked period:', error);
    throw error;
  }
}

// ============================================================================
// AVAILABILITY CHECK
// ============================================================================

/**
 * Check if provider is available on a specific date and time
 */
export async function checkAvailability(
  providerId: string,
  date: Date,
  requestedSlot: TimeSlot
): Promise<AvailabilityCheck> {
  try {
    // Get day of week
    const dayOfWeek = date.getDay() as DayOfWeek;
    
    // 1. Check for blocked periods
    const blockedPeriods = await getBlockedPeriods(providerId, date, date);
    if (blockedPeriods.length > 0) {
      return {
        isAvailable: false,
        status: 'unavailable',
        availableSlots: [],
        blockedReasons: blockedPeriods.map(b => b.reason),
      };
    }
    
    // 2. Check for specific availability (overrides recurring)
    const specificAvailabilities = await getSpecificAvailabilities(providerId, date, date);
    if (specificAvailabilities.length > 0) {
      const specific = specificAvailabilities[0];
      const hasSlot = specific.timeSlots.some(
        slot => slot.startTime === requestedSlot.startTime && slot.endTime === requestedSlot.endTime
      );
      
      return {
        isAvailable: hasSlot,
        status: hasSlot ? 'available' : 'partially_available',
        availableSlots: specific.timeSlots,
        blockedReasons: [],
      };
    }
    
    // 3. Check recurring availability
    const recurringAvailabilities = await getRecurringAvailabilities(providerId);
    const recurringForDay = recurringAvailabilities.filter(a => a.dayOfWeek === dayOfWeek);
    
    if (recurringForDay.length === 0) {
      return {
        isAvailable: false,
        status: 'unavailable',
        availableSlots: [],
        blockedReasons: ['No recurring availability for this day'],
      };
    }
    
    const allSlots = recurringForDay.flatMap(a => a.timeSlots);
    const hasSlot = allSlots.some(
      slot => slot.startTime === requestedSlot.startTime && slot.endTime === requestedSlot.endTime
    );
    
    return {
      isAvailable: hasSlot,
      status: hasSlot ? 'available' : 'partially_available',
      availableSlots: allSlots,
      blockedReasons: [],
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}

/**
 * Get all available slots for a provider in a date range
 */
export async function searchAvailableSlots(
  params: AvailabilitySearchParams
): Promise<Array<{ date: Date; slots: TimeSlot[] }>> {
  try {
    const { providerId, startDate, endDate } = params;
    const results: Array<{ date: Date; slots: TimeSlot[] }> = [];
    
    // Get recurring availabilities
    const recurring = await getRecurringAvailabilities(providerId);
    
    // Get specific availabilities
    const specific = await getSpecificAvailabilities(providerId, startDate, endDate);
    
    // Get blocked periods
    const blocked = await getBlockedPeriods(providerId, startDate, endDate);
    
    // Iterate through each day in the range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay() as DayOfWeek;
      
      // Check if blocked
      const isBlocked = blocked.some(
        b => currentDate >= b.startDate && currentDate <= b.endDate
      );
      
      if (!isBlocked) {
        // Check for specific availability
        const specificForDay = specific.find(
          s => s.date.toDateString() === currentDate.toDateString()
        );
        
        if (specificForDay) {
          results.push({
            date: new Date(currentDate),
            slots: specificForDay.timeSlots,
          });
        } else {
          // Use recurring availability
          const recurringForDay = recurring.filter(r => r.dayOfWeek === dayOfWeek);
          if (recurringForDay.length > 0) {
            const allSlots = recurringForDay.flatMap(r => r.timeSlots);
            results.push({
              date: new Date(currentDate),
              slots: allSlots,
            });
          }
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return results;
  } catch (error) {
    console.error('Error searching available slots:', error);
    throw error;
  }
}
