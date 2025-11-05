# 📋 Phase 4: Système d'Offres & Réservations - Plan Détaillé

**Date de début:** 5 novembre 2025  
**Approche:** Feature par feature (Option B)  
**Priorité:** 🔴 CRITIQUE (MVP bloquant)

---

## 🎯 Objectifs

Implémenter le système complet permettant aux providers de soumettre des offres sur les tâches, aux clients de les comparer et accepter, et de créer automatiquement des réservations (bookings).

**Flow complet:**
```
Task (open) 
  → Provider soumet Offer 
  → Client compare Offers 
  → Client accepte Offer 
  → Booking créé automatiquement 
  → Task status = 'assigned'
  → Autres offers rejetées auto
```

---

## 📊 Vue d'ensemble des Features

| Feature | Temps estimé | Priorité | Dépendances |
|---------|--------------|----------|-------------|
| 1. Soumission Offres | 3h | ⭐⭐⭐ | Tasks existantes |
| 2. Comparaison Offres | 2h | ⭐⭐⭐ | Feature 1 |
| 3. Acceptation/Booking | 2h | ⭐⭐⭐ | Features 1 & 2 |
| 4. Liste Bookings | 2h | ⭐⭐ | Feature 3 |
| 5. Tests E2E | 2h | ⭐⭐ | Toutes |
| **TOTAL** | **11h** | | |

---

## 🗂️ Feature 1: Soumission d'Offres (3h)

### 1.1. Types TypeScript

**Fichier:** `src/types/offer.ts`

```typescript
import { Timestamp } from 'firebase/firestore';

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface Offer {
  id: string;
  taskId: string;
  providerId: string;
  clientId: string; // Dénormalisé depuis task
  
  // Proposition
  proposedPrice: number;
  message: string; // Pourquoi je suis le bon provider
  estimatedDuration?: number; // En heures
  availableFrom?: Timestamp;
  availableTo?: Timestamp;
  
  // Statut
  status: OfferStatus;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  acceptedAt?: Timestamp;
  rejectedAt?: Timestamp;
  rejectionReason?: string;
}

export interface CreateOfferInput {
  taskId: string;
  proposedPrice: number;
  message: string;
  estimatedDuration?: number;
  availableFrom?: Date;
  availableTo?: Date;
}

export interface OfferWithDetails extends Offer {
  // Données enrichies pour affichage
  providerName: string;
  providerAvatar?: string;
  providerRating?: number;
  providerReviewCount?: number;
  providerBadges?: string[];
  taskTitle: string;
  taskBudget: number;
  taskCategory: string;
}
```

### 1.2. Validation Zod

**Fichier:** `src/lib/validations/offer.ts`

```typescript
import { z } from 'zod';

export const createOfferSchema = z.object({
  taskId: z.string().min(1, 'Task ID required'),
  proposedPrice: z.number()
    .min(5, 'Prix minimum 5€')
    .max(10000, 'Prix maximum 10,000€'),
  message: z.string()
    .min(20, 'Message minimum 20 caractères')
    .max(500, 'Message maximum 500 caractères'),
  estimatedDuration: z.number()
    .min(0.5, 'Durée minimum 30 minutes')
    .max(168, 'Durée maximum 1 semaine')
    .optional(),
  availableFrom: z.date().optional(),
  availableTo: z.date().optional(),
}).refine(
  (data) => {
    if (data.availableFrom && data.availableTo) {
      return data.availableTo > data.availableFrom;
    }
    return true;
  },
  {
    message: 'Date de fin doit être après date de début',
    path: ['availableTo'],
  }
);

export type CreateOfferFormData = z.infer<typeof createOfferSchema>;
```

### 1.3. Helper Firestore

**Fichier:** `src/lib/firebase/offers.ts`

```typescript
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Offer, CreateOfferInput } from '@/types/offer';

const OFFERS_COLLECTION = 'offers';

/**
 * Créer une nouvelle offre
 */
export async function createOffer(
  providerId: string,
  input: CreateOfferInput
): Promise<string> {
  // 1. Vérifier que la task existe et est ouverte
  const taskRef = doc(db, 'tasks', input.taskId);
  const taskSnap = await getDoc(taskRef);
  
  if (!taskSnap.exists()) {
    throw new Error('Task not found');
  }
  
  const task = taskSnap.data();
  
  if (task.status !== 'open') {
    throw new Error('Task is not open for offers');
  }
  
  // 2. Vérifier que le provider n'a pas déjà une offre pending
  const existingOffers = await getProviderOffersForTask(providerId, input.taskId);
  const hasPendingOffer = existingOffers.some(o => o.status === 'pending');
  
  if (hasPendingOffer) {
    throw new Error('You already have a pending offer for this task');
  }
  
  // 3. Valider le prix proposé vs budget task
  if (input.proposedPrice > task.budget * 1.5) {
    throw new Error(`Proposed price too high (max ${task.budget * 1.5}€)`);
  }
  
  // 4. Créer l'offre
  const offerData: Omit<Offer, 'id'> = {
    taskId: input.taskId,
    providerId,
    clientId: task.createdBy,
    proposedPrice: input.proposedPrice,
    message: input.message,
    estimatedDuration: input.estimatedDuration,
    availableFrom: input.availableFrom ? Timestamp.fromDate(input.availableFrom) : undefined,
    availableTo: input.availableTo ? Timestamp.fromDate(input.availableTo) : undefined,
    status: 'pending',
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };
  
  const docRef = await addDoc(collection(db, OFFERS_COLLECTION), offerData);
  
  // 5. TODO: Créer notification pour le client
  // await createNotification(task.createdBy, 'new_offer', { offerId: docRef.id });
  
  return docRef.id;
}

/**
 * Récupérer les offres d'un provider pour une task
 */
export async function getProviderOffersForTask(
  providerId: string,
  taskId: string
): Promise<Offer[]> {
  const q = query(
    collection(db, OFFERS_COLLECTION),
    where('providerId', '==', providerId),
    where('taskId', '==', taskId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Offer[];
}

/**
 * Récupérer toutes les offres pour une task
 */
export async function getOffersForTask(taskId: string): Promise<Offer[]> {
  const q = query(
    collection(db, OFFERS_COLLECTION),
    where('taskId', '==', taskId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Offer[];
}

/**
 * Récupérer les offres d'un provider
 */
export async function getProviderOffers(providerId: string): Promise<Offer[]> {
  const q = query(
    collection(db, OFFERS_COLLECTION),
    where('providerId', '==', providerId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Offer[];
}

/**
 * Retirer une offre (provider uniquement si status = pending)
 */
export async function withdrawOffer(offerId: string, providerId: string): Promise<void> {
  const offerRef = doc(db, OFFERS_COLLECTION, offerId);
  const offerSnap = await getDoc(offerRef);
  
  if (!offerSnap.exists()) {
    throw new Error('Offer not found');
  }
  
  const offer = offerSnap.data() as Offer;
  
  if (offer.providerId !== providerId) {
    throw new Error('Unauthorized');
  }
  
  if (offer.status !== 'pending') {
    throw new Error('Can only withdraw pending offers');
  }
  
  await updateDoc(offerRef, {
    status: 'withdrawn',
    updatedAt: serverTimestamp(),
  });
}
```

### 1.4. Hook React

**Fichier:** `src/hooks/useOffers.ts`

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createOffer, 
  getProviderOffers, 
  getOffersForTask,
  withdrawOffer 
} from '@/lib/firebase/offers';
import type { Offer, CreateOfferInput } from '@/types/offer';

export function useProviderOffers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchOffers = async () => {
      try {
        const data = await getProviderOffers(user.uid);
        setOffers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load offers');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [user?.uid]);

  return { offers, loading, error };
}

export function useTaskOffers(taskId: string) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const fetchOffers = async () => {
      try {
        const data = await getOffersForTask(taskId);
        setOffers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load offers');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [taskId]);

  return { offers, loading, error };
}

export function useCreateOffer() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOffer = async (input: CreateOfferInput): Promise<string | null> => {
    if (!user?.uid) {
      setError('Must be logged in');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const offerId = await createOffer(user.uid, input);
      return offerId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create offer';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { submitOffer, loading, error };
}
```

### 1.5. Composant UI: OfferForm

**Fichier:** `src/components/offers/OfferForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useCreateOffer } from '@/hooks/useOffers';
import { createOfferSchema, type CreateOfferFormData } from '@/lib/validations/offer';
import { useTranslations } from 'next-intl';
import { Loader2, Send } from 'lucide-react';

interface OfferFormProps {
  taskId: string;
  taskBudget: number;
  taskTitle: string;
  onSuccess?: () => void;
}

export function OfferForm({ taskId, taskBudget, taskTitle, onSuccess }: OfferFormProps) {
  const t = useTranslations('Offers');
  const router = useRouter();
  const { submitOffer, loading, error } = useCreateOffer();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOfferFormData>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      taskId,
      proposedPrice: taskBudget,
    },
  });

  const onSubmit = async (data: CreateOfferFormData) => {
    const offerId = await submitOffer(data);
    
    if (offerId) {
      setSuccessMessage(t('offerSubmitted'));
      reset();
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Rediriger vers mes offres après 2s
        setTimeout(() => {
          router.push('/dashboard/offers');
        }, 2000);
      }
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{t('submitOffer')}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {t('offerForTask')}: <strong>{taskTitle}</strong>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Prix proposé */}
        <div>
          <Label htmlFor="proposedPrice">{t('proposedPrice')}</Label>
          <div className="relative">
            <Input
              id="proposedPrice"
              type="number"
              step="0.01"
              {...register('proposedPrice', { valueAsNumber: true })}
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              €
            </span>
          </div>
          {errors.proposedPrice && (
            <p className="text-sm text-destructive mt-1">{errors.proposedPrice.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {t('budgetIndicated')}: {taskBudget}€
          </p>
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="message">{t('message')}</Label>
          <Textarea
            id="message"
            rows={4}
            placeholder={t('messagePlaceholder')}
            {...register('message')}
          />
          {errors.message && (
            <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {t('messageHint')}
          </p>
        </div>

        {/* Durée estimée (optionnel) */}
        <div>
          <Label htmlFor="estimatedDuration">{t('estimatedDuration')} ({t('optional')})</Label>
          <div className="relative">
            <Input
              id="estimatedDuration"
              type="number"
              step="0.5"
              placeholder="2"
              {...register('estimatedDuration', { valueAsNumber: true })}
              className="pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {t('hours')}
            </span>
          </div>
          {errors.estimatedDuration && (
            <p className="text-sm text-destructive mt-1">{errors.estimatedDuration.message}</p>
          )}
        </div>

        {/* Message d'erreur global */}
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {t('submit')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
```

### 1.6. Page: Soumettre une Offre

**Fichier:** `src/app/[locale]/tasks/[id]/offer/page.tsx`

```typescript
import { redirect } from '@/navigation';
import { getTask } from '@/lib/firebase/tasks';
import { OfferForm } from '@/components/offers/OfferForm';
import { getTranslations } from 'next-intl/server';

interface OfferPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export default async function OfferPage({ params }: OfferPageProps) {
  const t = await getTranslations('Offers');
  
  // Récupérer la task
  const task = await getTask(params.id);
  
  if (!task) {
    redirect('/tasks');
  }
  
  if (task.status !== 'open') {
    redirect(`/tasks/${params.id}`);
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('submitOfferTitle')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('submitOfferDescription')}
        </p>
      </div>

      <OfferForm
        taskId={params.id}
        taskBudget={task.budget}
        taskTitle={task.title}
      />
    </div>
  );
}
```

### 1.7. Traductions

**Fichier:** `src/messages/fr.json` (ajouter section "Offers")

```json
{
  "Offers": {
    "submitOffer": "Soumettre une offre",
    "submitOfferTitle": "Faire une proposition",
    "submitOfferDescription": "Proposez vos services pour cette tâche",
    "offerForTask": "Offre pour la tâche",
    "proposedPrice": "Prix proposé",
    "budgetIndicated": "Budget indiqué",
    "message": "Votre message",
    "messagePlaceholder": "Expliquez pourquoi vous êtes le meilleur choix pour cette tâche...",
    "messageHint": "Présentez votre expérience, disponibilité et approche",
    "estimatedDuration": "Durée estimée",
    "optional": "optionnel",
    "hours": "heures",
    "cancel": "Annuler",
    "submit": "Envoyer l'offre",
    "submitting": "Envoi en cours...",
    "offerSubmitted": "✓ Offre envoyée avec succès !",
    "viewMyOffers": "Voir mes offres"
  }
}
```

**Fichier:** `src/messages/en.json`

```json
{
  "Offers": {
    "submitOffer": "Submit an offer",
    "submitOfferTitle": "Make a proposal",
    "submitOfferDescription": "Propose your services for this task",
    "offerForTask": "Offer for task",
    "proposedPrice": "Proposed price",
    "budgetIndicated": "Indicated budget",
    "message": "Your message",
    "messagePlaceholder": "Explain why you're the best choice for this task...",
    "messageHint": "Present your experience, availability and approach",
    "estimatedDuration": "Estimated duration",
    "optional": "optional",
    "hours": "hours",
    "cancel": "Cancel",
    "submit": "Send offer",
    "submitting": "Submitting...",
    "offerSubmitted": "✓ Offer submitted successfully!",
    "viewMyOffers": "View my offers"
  }
}
```

### 1.8. Firestore Security Rules

**Fichier:** `firestore.rules` (ajouter)

```javascript
// Offers collection
match /offers/{offerId} {
  // Lecture: provider, client ou admin
  allow read: if request.auth != null && (
    request.auth.uid == resource.data.providerId ||
    request.auth.uid == resource.data.clientId ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
  );
  
  // Création: provider uniquement, pour tasks ouvertes
  allow create: if request.auth != null &&
    request.auth.uid == request.resource.data.providerId &&
    exists(/databases/$(database)/documents/tasks/$(request.resource.data.taskId)) &&
    get(/databases/$(database)/documents/tasks/$(request.resource.data.taskId)).data.status == 'open';
  
  // Modification: provider (withdraw) ou client (accept/reject)
  allow update: if request.auth != null && (
    (request.auth.uid == resource.data.providerId && request.resource.data.status == 'withdrawn') ||
    (request.auth.uid == resource.data.clientId && request.resource.data.status in ['accepted', 'rejected'])
  );
  
  // Suppression: interdite
  allow delete: if false;
}
```

### 1.9. Index Firestore

**Fichier:** `firestore.indexes.json` (ajouter)

```json
{
  "indexes": [
    {
      "collectionGroup": "offers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "providerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "offers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "taskId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "offers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "clientId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## ✅ Feature 1 - Checklist

- [x] Créer types TypeScript (`src/types/offer.ts`)
- [x] Créer validation Zod (`src/lib/validations/offer.ts`)
- [x] Créer helpers Firestore (`src/lib/firebase/offers.ts`)
- [x] Créer hooks React (`src/hooks/useOffers.ts`)
- [x] Créer composant OfferForm (`src/components/offers/OfferForm.tsx`)
- [x] Créer page `/tasks/[id]/offer` (`src/app/[locale]/tasks/[id]/offer/page.tsx`)
- [x] Ajouter traductions FR/EN/JA (`src/messages/*.json`)
- [x] Ajouter Security Rules (`firestore.rules`)
- [x] Ajouter Index Firestore (`firestore.indexes.json`)
- [x] Corriger erreurs TypeScript (catalog-analytics)
- [x] Ajouter bouton "Faire une offre" dans TaskDetailPage (`/tasks/[id]/page.tsx`)
- [x] Ajouter traductions TaskDetail dans EN/JA
- [ ] Déployer Firestore rules et indexes
- [ ] Tests manuels
- [ ] Tests E2E (Feature 5)

**Status:** ✅ **FEATURE 1 COMPLÈTE** - Prête pour tests manuels

---

## 🎯 Prochaines Features

**Feature 2: Comparaison Offres (Client)** ✅ COMPLETE
- ✅ Composant OffersList (filtres status, tri 5 critères, stats)
- ✅ Composant OfferCard avec détails provider (rating, badges, prix)
- ✅ Tri par prix, note, distance, durée, récent
- ✅ Actions: Accepter, Refuser, Message
- ✅ Intégration TaskDetailPage avec handlers
- ✅ Traductions FR/EN/JA (toast notifications)
- ✅ Backend: enrichOffersWithDetails, acceptOffer, rejectOffer
- ✅ Auto-reject autres offres lors acceptation

**Feature 3: Acceptation & Création Booking**
- Cloud Function `acceptOffer()` (migration depuis client)
- Créer booking automatiquement
- Update task status → 'assigned'
- Notifications (client + provider + autres providers)

**Feature 4: Liste Bookings**
- Page `/dashboard/bookings`
- Filtres & statuts
- Actions (cancel, complete, contact)

**Feature 5: Tests E2E**
- Flow complet provider → offer → client → accept → booking
- Edge cases (double offer, task fermée, etc.)

---

**Feature 1:** ✅ COMPLETE  
**Feature 2:** ✅ COMPLETE (prêt pour tests manuels)  
**Feature 3:** ⏳ À DÉMARRER  
**Status:** � 40% Phase 4

