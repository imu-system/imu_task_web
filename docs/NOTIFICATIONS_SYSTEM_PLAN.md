# 🔔 Plan de Mise en Place - Système de Notifications et Badges

**Document**: Plan d'architecture et de mise en œuvre  
**Projet**: ImuTask Web - Système de notifications plateforme  
**Date**: 2024  
**Statut**: 🔷 PLANIFICATION

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Système](#architecture-système)
3. [Modèle de Données](#modèle-de-données)
4. [Composants UI](#composants-ui)
5. [Stratégie d'Intégration](#stratégie-dintégration)
6. [Roadmap d'Implémentation](#roadmap-dimplémentation)
7. [Performance et Scalabilité](#performance-et-scalabilité)
8. [Exemples de Code](#exemples-de-code)

---

## 🎯 Vue d'Ensemble

### Objectifs

Créer un système de notifications complet qui:
- ✅ **Unifie** toutes les notifications de la plateforme (Messages, Tâches, Réservations, Propositions, Profil)
- ✅ **Affiche** des toasts élégants et accessibles pour les événements en temps réel
- ✅ **Comptabilise** les notifications non lues avec badges visuels
- ✅ **Persiste** l'historique des notifications dans Firebase
- ✅ **Supporte** 5 langues (EN, FR, ES, DE, JA)
- ✅ **Optimise** les performances avec Firebase listeners et caching

### Infrastructure Existante

**Déjà en place:**
- 🔥 Firebase Cloud Messaging (FCM) configuré
- 📱 Service Worker pour push notifications (`/public/firebase-messaging-sw.js`)
- 🪝 Hook `use-notifications.ts` pour les messages
- 🎨 Composant Toast (shadcn/ui)
- 🔔 Banner de permission notifications

**À étendre:**
- Système de notifications au-delà des messages
- Centre de notifications centralisé
- Badges de compteurs multi-features
- Types de notifications standardisés

---

## 🏗️ Architecture Système

### Schéma Général

```
┌─────────────────────────────────────────────────────────────┐
│                   ImuTask Platform                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Tasks   │  │ Messages │  │ Bookings │  │ Proposals│  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │              │              │        │
│       └─────────────┴──────────────┴──────────────┘        │
│                         │                                   │
│              ┌──────────▼──────────┐                       │
│              │ Notification Manager │                       │
│              └──────────┬──────────┘                       │
│                         │                                   │
│         ┌───────────────┼───────────────┐                 │
│         │               │               │                 │
│    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐            │
│    │  Toast  │    │  Badge  │    │  Center │            │
│    │ System  │    │ Counter │    │  (UI)   │            │
│    └─────────┘    └─────────┘    └─────────┘            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                  Firebase Backend                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │notifications│  │     users     │  │ FCM Tokens   │     │
│  │ Collection  │  │  (prefs)      │  │              │     │
│  └─────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Flux de Données

**1. Création de Notification:**
```
Événement Feature → Cloud Function → Firestore → Real-time Listener → UI Update
                                   → FCM → Push Notification → Service Worker
```

**2. Affichage Toast:**
```
Listener détecte nouvelle notification → Filtre (foreground/background)
→ Toast affiché → Auto-dismiss (5s) → Marqué comme "shown"
```

**3. Mise à Jour Badge:**
```
Firestore listener → Calcul count unread → State update → Badge re-render
```

---

## 💾 Modèle de Données

### Collection `notifications`

**Structure Firestore:**

```typescript
// /notifications/{notificationId}
{
  id: string;                      // Auto-généré
  userId: string;                  // Destinataire
  type: NotificationType;          // Voir enum ci-dessous
  title: string;                   // Titre localisé
  body: string;                    // Message localisé
  data: Record<string, any>;       // Données contextuelles
  read: boolean;                   // Lu/Non lu
  shown: boolean;                  // Toast déjà affiché
  createdAt: Timestamp;            // Date de création
  readAt?: Timestamp;              // Date de lecture
  expiresAt?: Timestamp;           // Date d'expiration (optionnel)
  priority: 'low' | 'normal' | 'high'; // Priorité d'affichage
  actionUrl?: string;              // URL de redirection
  icon?: string;                   // Icône (optionnel)
  category: NotificationCategory;  // Catégorie pour filtrage
}
```

### Types de Notifications

**TypeScript Enums:**

```typescript
// src/lib/types/notifications.ts

export enum NotificationType {
  // Messages
  NEW_MESSAGE = 'new_message',
  
  // Tasks
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  TASK_COMPLETED = 'task_completed',
  
  // Proposals
  NEW_PROPOSAL = 'new_proposal',
  PROPOSAL_ACCEPTED = 'proposal_accepted',
  PROPOSAL_REJECTED = 'proposal_rejected',
  PROPOSAL_UPDATED = 'proposal_updated',
  
  // Bookings
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_REMINDER = 'booking_reminder',
  BOOKING_COMPLETED = 'booking_completed',
  
  // Reviews
  NEW_REVIEW = 'new_review',
  
  // Profile
  PROFILE_VERIFIED = 'profile_verified',
  PROFILE_UPDATE_REQUIRED = 'profile_update_required',
  
  // Payments
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_SENT = 'payment_sent',
  PAYMENT_FAILED = 'payment_failed',
  
  // System
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  ACCOUNT_SECURITY = 'account_security',
}

export enum NotificationCategory {
  MESSAGES = 'messages',
  TASKS = 'tasks',
  PROPOSALS = 'proposals',
  BOOKINGS = 'bookings',
  REVIEWS = 'reviews',
  PROFILE = 'profile',
  PAYMENTS = 'payments',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',       // Affichage passif
  NORMAL = 'normal', // Toast standard (5s)
  HIGH = 'high',     // Toast persistant + son
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  shown: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  priority: NotificationPriority;
  actionUrl?: string;
  icon?: string;
  category: NotificationCategory;
}
```

### Préférences Utilisateur

**Extension de `users` collection:**

```typescript
// /users/{userId}
{
  // ... autres champs existants
  
  notificationPreferences: {
    enabled: boolean;                              // Activer/désactiver tout
    emailNotifications: boolean;                   // Emails (future)
    pushNotifications: boolean;                    // Push mobile/web
    
    // Par catégorie
    categories: {
      messages: { enabled: boolean; push: boolean; email: boolean; };
      tasks: { enabled: boolean; push: boolean; email: boolean; };
      proposals: { enabled: boolean; push: boolean; email: boolean; };
      bookings: { enabled: boolean; push: boolean; email: boolean; };
      reviews: { enabled: boolean; push: boolean; email: boolean; };
      profile: { enabled: boolean; push: boolean; email: boolean; };
      payments: { enabled: boolean; push: boolean; email: boolean; };
      system: { enabled: boolean; push: boolean; email: boolean; };
    };
    
    // Paramètres avancés
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    quietHoursStart?: string;  // "22:00"
    quietHoursEnd?: string;    // "08:00"
  };
  
  fcmTokens: string[];  // Déjà existant
}
```

---

## 🎨 Composants UI

### 1. NotificationToast

**Fonctionnalités:**
- Affichage toast avec icône personnalisée par type
- Auto-dismiss configurable (3s / 5s / 10s / persistant)
- Boutons d'action (View, Dismiss, Mark as Read)
- Animation d'entrée/sortie fluide
- Queue de notifications (max 3 simultanées)
- Support i18n

**Architecture:**

```typescript
// src/components/notifications/notification-toast.tsx
'use client';

import { useEffect } from 'react';
import { useNotificationManager } from '@/hooks/use-notification-manager';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { getNotificationIcon } from '@/lib/notification-utils';

export function NotificationToastProvider({ children }: { children: React.ReactNode }) {
  const { newNotifications, markAsShown } = useNotificationManager();

  useEffect(() => {
    newNotifications.forEach(notification => {
      if (notification.shown) return;

      const icon = getNotificationIcon(notification.type);
      const autoDismiss = notification.priority === 'high' ? false : 
                         notification.priority === 'normal' ? 5000 : 3000;

      toast({
        title: (
          <div className="flex items-center gap-2">
            {icon}
            <span>{notification.title}</span>
          </div>
        ),
        description: notification.body,
        duration: autoDismiss,
        action: notification.actionUrl ? (
          <ToastAction altText="View" onClick={() => {
            window.location.href = notification.actionUrl!;
            markAsShown(notification.id);
          }}>
            View
          </ToastAction>
        ) : undefined,
      });

      markAsShown(notification.id);
    });
  }, [newNotifications, markAsShown]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
```

### 2. NotificationBadge

**Fonctionnalités:**
- Compteur visuel animé
- Variants: dot (simple point), count (nombre), none
- Couleurs par priorité/catégorie
- Position: top-right, top-left, bottom-right, bottom-left
- Animation pulse pour nouvelles notifications

**Composant:**

```typescript
// src/components/notifications/notification-badge.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  variant?: 'dot' | 'count';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  animate?: boolean;
  className?: string;
}

export function NotificationBadge({
  count,
  variant = 'count',
  position = 'top-right',
  animate = true,
  className,
}: NotificationBadgeProps) {
  if (count === 0) return null;

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
  };

  return (
    <Badge
      variant="destructive"
      className={cn(
        'absolute min-w-5 h-5 flex items-center justify-center p-0 text-[10px] rounded-full',
        positionClasses[position],
        animate && count > 0 && 'animate-pulse',
        className
      )}
    >
      {variant === 'count' ? (count > 99 ? '99+' : count) : ''}
    </Badge>
  );
}
```

### 3. NotificationCenter

**Fonctionnalités:**
- Drawer/Sheet avec liste complète des notifications
- Filtrage par catégorie (All, Messages, Tasks, etc.)
- Tri (Newest, Oldest, Unread)
- Actions groupées (Mark all as read, Clear all)
- Pagination (20 notifications par page)
- Skeleton loading states
- Empty states avec illustrations

**Structure:**

```typescript
// src/components/notifications/notification-center.tsx
'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationList } from './notification-list';
import { NotificationFilters } from './notification-filters';
import { useNotificationManager } from '@/hooks/use-notification-manager';

export function NotificationCenter({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { notifications, totalUnreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationManager();
  const [filter, setFilter] = useState<NotificationCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'unread'>('newest');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            <Badge variant="secondary">{totalUnreadCount} unread</Badge>
          </SheetTitle>
        </SheetHeader>

        <NotificationFilters
          filter={filter}
          onFilterChange={setFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAll}
        />

        <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value={filter}>
            <NotificationList
              notifications={notifications.filter(n => filter === 'all' || n.category === filter)}
              sortBy={sortBy}
              onMarkAsRead={markAsRead}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
```

### 4. NotificationIconButton

**Fonctionnalités:**
- Bouton avec icône Bell
- Badge de compteur intégré
- Ouvre le NotificationCenter au clic
- Animation shake pour nouvelles notifications
- Responsive (mobile/desktop)

**Composant:**

```typescript
// src/components/notifications/notification-icon-button.tsx
'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBadge } from './notification-badge';
import { NotificationCenter } from './notification-center';
import { useNotificationManager } from '@/hooks/use-notification-manager';

export function NotificationIconButton() {
  const [open, setOpen] = useState(false);
  const { totalUnreadCount, hasNewNotifications } = useNotificationManager();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
        aria-label={`Notifications (${totalUnreadCount} unread)`}
      >
        <Bell className={cn(
          'h-5 w-5',
          hasNewNotifications && 'animate-wiggle' // Custom animation
        )} />
        <NotificationBadge count={totalUnreadCount} />
      </Button>

      <NotificationCenter open={open} onOpenChange={setOpen} />
    </>
  );
}
```

---

## 🔌 Stratégie d'Intégration

### Hook Central: `use-notification-manager`

**Responsabilités:**
- Écouter les notifications Firestore en temps réel
- Gérer le state global des notifications
- Fournir les méthodes CRUD (create, markAsRead, delete, etc.)
- Calculer les compteurs (total, par catégorie)
- Gérer la queue de toasts
- Synchroniser avec FCM

**Implémentation:**

```typescript
// src/hooks/use-notification-manager.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notification, NotificationCategory } from '@/lib/types/notifications';

export interface UseNotificationManagerReturn {
  notifications: Notification[];
  newNotifications: Notification[];        // Pas encore montrées
  totalUnreadCount: number;
  unreadCountByCategory: Record<NotificationCategory, number>;
  hasNewNotifications: boolean;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAsShown: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useNotificationManager = (): UseNotificationManagerReturn => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Firestore real-time listener
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          readAt: data.readAt?.toDate(),
          expiresAt: data.expiresAt?.toDate(),
        } as Notification;
      });

      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Computed values
  const newNotifications = notifications.filter(n => !n.shown && !n.read);
  const totalUnreadCount = notifications.filter(n => !n.read).length;
  const hasNewNotifications = newNotifications.length > 0;

  const unreadCountByCategory = notifications.reduce((acc, notif) => {
    if (!notif.read) {
      acc[notif.category] = (acc[notif.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<NotificationCategory, number>);

  // Actions
  const markAsRead = useCallback(async (notificationId: string) => {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, {
      read: true,
      readAt: Timestamp.now(),
    });
  }, []);

  const markAsShown = useCallback(async (notificationId: string) => {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { shown: true });
  }, []);

  const markAllAsRead = useCallback(async () => {
    const batch = writeBatch(db);
    const unreadNotifs = notifications.filter(n => !n.read);
    
    unreadNotifs.forEach(notif => {
      const notifRef = doc(db, 'notifications', notif.id);
      batch.update(notifRef, {
        read: true,
        readAt: Timestamp.now(),
      });
    });

    await batch.commit();
  }, [notifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { deleted: true }); // Soft delete
  }, []);

  const clearAll = useCallback(async () => {
    const batch = writeBatch(db);
    
    notifications.forEach(notif => {
      const notifRef = doc(db, 'notifications', notif.id);
      batch.update(notifRef, { deleted: true });
    });

    await batch.commit();
  }, [notifications]);

  return {
    notifications,
    newNotifications,
    totalUnreadCount,
    unreadCountByCategory,
    hasNewNotifications,
    loading,
    markAsRead,
    markAsShown,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
};
```

### Helpers Firestore

**Création de notifications:**

```typescript
// src/lib/firestore-notifications.ts
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { NotificationType, NotificationCategory, NotificationPriority } from './types/notifications';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  category: NotificationCategory;
  priority?: NotificationPriority;
  actionUrl?: string;
  icon?: string;
  expiresInDays?: number;
}

export async function createNotification(params: CreateNotificationParams): Promise<string> {
  const {
    userId,
    type,
    title,
    body,
    data = {},
    category,
    priority = NotificationPriority.NORMAL,
    actionUrl,
    icon,
    expiresInDays,
  } = params;

  const expiresAt = expiresInDays
    ? Timestamp.fromDate(new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000))
    : null;

  const notificationsRef = collection(db, 'notifications');
  const docRef = await addDoc(notificationsRef, {
    userId,
    type,
    title,
    body,
    data,
    category,
    priority,
    actionUrl,
    icon,
    read: false,
    shown: false,
    createdAt: Timestamp.now(),
    expiresAt,
  });

  return docRef.id;
}

// Exemple: Notification pour nouvelle proposition
export async function notifyNewProposal(
  taskOwnerId: string,
  providerId: string,
  providerName: string,
  taskTitle: string,
  proposalId: string
): Promise<void> {
  await createNotification({
    userId: taskOwnerId,
    type: NotificationType.NEW_PROPOSAL,
    category: NotificationCategory.PROPOSALS,
    priority: NotificationPriority.HIGH,
    title: 'New Proposal Received',
    body: `${providerName} submitted a proposal for "${taskTitle}"`,
    data: {
      proposalId,
      providerId,
      taskTitle,
    },
    actionUrl: `/proposals/${proposalId}`,
    icon: 'file-text',
  });
}

// Exemple: Notification pour réservation confirmée
export async function notifyBookingConfirmed(
  userId: string,
  bookingId: string,
  taskTitle: string,
  scheduledDate: Date
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.BOOKING_CONFIRMED,
    category: NotificationCategory.BOOKINGS,
    priority: NotificationPriority.NORMAL,
    title: 'Booking Confirmed',
    body: `Your booking for "${taskTitle}" is confirmed for ${scheduledDate.toLocaleDateString()}`,
    data: {
      bookingId,
      taskTitle,
      scheduledDate: scheduledDate.toISOString(),
    },
    actionUrl: `/bookings/${bookingId}`,
    icon: 'calendar-check',
  });
}
```

### Intégration avec Features Existantes

**1. Messages:**

```typescript
// src/lib/firestore-messages.ts (modification)
import { createNotification } from './firestore-notifications';
import { NotificationType, NotificationCategory, NotificationPriority } from './types/notifications';

export async function sendMessage(/* params */) {
  // ... existing code

  // Créer notification
  await createNotification({
    userId: recipientId,
    type: NotificationType.NEW_MESSAGE,
    category: NotificationCategory.MESSAGES,
    priority: NotificationPriority.NORMAL,
    title: `New message from ${senderName}`,
    body: content.substring(0, 100), // Preview
    data: {
      conversationId,
      senderId,
      messageId: docRef.id,
    },
    actionUrl: `/messages?conversation=${conversationId}`,
  });
}
```

**2. Proposals:**

```typescript
// src/lib/firestore-proposals.ts (modification)
export async function createProposal(/* params */) {
  // ... existing code

  await notifyNewProposal(
    taskOwnerId,
    providerId,
    providerName,
    taskTitle,
    docRef.id
  );
}

export async function acceptProposal(proposalId: string) {
  // ... existing code

  await createNotification({
    userId: proposal.providerId,
    type: NotificationType.PROPOSAL_ACCEPTED,
    category: NotificationCategory.PROPOSALS,
    priority: NotificationPriority.HIGH,
    title: 'Proposal Accepted! 🎉',
    body: `Your proposal for "${proposal.taskTitle}" has been accepted`,
    data: { proposalId, taskId: proposal.taskId },
    actionUrl: `/proposals/${proposalId}`,
  });
}
```

**3. Tasks:**

```typescript
// src/lib/firestore-tasks.ts (modification)
export async function createTask(/* params */) {
  // ... existing code

  // Notifier les prestataires matchants (future: via Cloud Function)
  await createNotification({
    userId: 'matched_provider_id', // Sera géré par Cloud Function
    type: NotificationType.TASK_CREATED,
    category: NotificationCategory.TASKS,
    priority: NotificationPriority.NORMAL,
    title: 'New Task Available',
    body: `"${taskData.title}" in ${taskData.location}`,
    data: { taskId: docRef.id },
    actionUrl: `/tasks/${docRef.id}`,
  });
}
```

---

## 🗺️ Roadmap d'Implémentation

### Phase 1: Infrastructure Core (8-10h)

**Objectif:** Mettre en place l'architecture de base

**Tâches:**

1. **Modèle de Données** (2h)
   - [ ] Créer `/src/lib/types/notifications.ts` avec enums et interfaces
   - [ ] Définir Firestore security rules pour collection `notifications`
   - [ ] Créer indexes Firestore (userId + createdAt, userId + read + category)

2. **Hook Central** (3h)
   - [ ] Implémenter `use-notification-manager.ts` complet
   - [ ] Ajouter Firestore real-time listener
   - [ ] Implémenter méthodes CRUD (markAsRead, markAllAsRead, delete)
   - [ ] Calculer compteurs (total, par catégorie)
   - [ ] Ajouter tests unitaires

3. **Helpers Firestore** (2h)
   - [ ] Créer `/src/lib/firestore-notifications.ts`
   - [ ] Implémenter `createNotification()`
   - [ ] Ajouter helpers spécifiques (notifyNewProposal, notifyBookingConfirmed, etc.)
   - [ ] Gérer expiration des notifications

4. **Préférences Utilisateur** (1h)
   - [ ] Étendre modèle `users` avec `notificationPreferences`
   - [ ] Créer hook `use-notification-preferences.ts`
   - [ ] Implémenter save/load préférences

**Validation:**
- ✅ Notifications créées en Firestore
- ✅ Listener temps réel fonctionne
- ✅ Compteurs calculés correctement

---

### Phase 2: Composants UI (10-12h)

**Objectif:** Créer les composants visuels

**Tâches:**

1. **NotificationBadge** (1h)
   - [ ] Créer composant avec variants (dot, count)
   - [ ] Ajouter positions (top-right, top-left, etc.)
   - [ ] Animation pulse pour nouveautés
   - [ ] Tests Storybook

2. **NotificationToastProvider** (3h)
   - [ ] Intégrer avec shadcn/ui Toast
   - [ ] Gérer queue de toasts (max 3)
   - [ ] Auto-dismiss par priorité
   - [ ] Icônes dynamiques par type
   - [ ] Actions (View, Dismiss)

3. **NotificationIconButton** (1h)
   - [ ] Bouton avec icône Bell + badge
   - [ ] Animation shake pour nouvelles notifications
   - [ ] Responsive mobile/desktop

4. **NotificationCenter** (5h)
   - [ ] Sheet/Drawer avec liste complète
   - [ ] Filtres par catégorie (Tabs)
   - [ ] Tri (Newest, Oldest, Unread)
   - [ ] Actions groupées (Mark all as read, Clear all)
   - [ ] Pagination (infinite scroll ou load more)
   - [ ] Skeleton loading states
   - [ ] Empty states

5. **NotificationList & NotificationItem** (2h)
   - [ ] Composant liste avec virtualization (react-window)
   - [ ] Composant item avec icône, titre, body, timestamp
   - [ ] Actions swipe (mobile) ou hover (desktop)
   - [ ] Badge "new" pour non lues

**Validation:**
- ✅ Toast s'affiche automatiquement
- ✅ Badge compte correctement
- ✅ Centre de notifications fonctionnel
- ✅ UI accessible (ARIA, keyboard navigation)

---

### Phase 3: Intégration Features (6-8h)

**Objectif:** Connecter avec features existantes

**Tâches:**

1. **Messages** (1h)
   - [ ] Modifier `sendMessage()` pour créer notification
   - [ ] Tester toast + badge pour nouveaux messages
   - [ ] Vérifier pas de doublon avec système existant

2. **Proposals** (2h)
   - [ ] Intégrer dans `createProposal()`
   - [ ] Intégrer dans `acceptProposal()`, `rejectProposal()`
   - [ ] Notifications pour mises à jour de statut

3. **Tasks** (2h)
   - [ ] Notifications pour création de tâche
   - [ ] Notifications pour complétion
   - [ ] Notifications pour providers matchants (future Cloud Function)

4. **Bookings** (1h)
   - [ ] Notifications pour confirmation
   - [ ] Notifications pour rappels (future: scheduled)
   - [ ] Notifications pour annulation

5. **Reviews** (1h)
   - [ ] Notification quand reçu une review
   - [ ] Link vers profil

**Validation:**
- ✅ Toutes les features créent notifications
- ✅ Liens d'action fonctionnent
- ✅ Pas de notifications en doublon

---

### Phase 4: i18n & Polishing (4-5h)

**Objectif:** Support multilingue et finitions

**Tâches:**

1. **Traductions** (2h)
   - [ ] Ajouter clés dans `/public/locales/{lang}/notifications.json`
   - [ ] 5 langues (EN, FR, ES, DE, JA)
   - [ ] Traductions pour tous les types de notifications
   - [ ] Relative time ("2 minutes ago")

2. **Animations** (1h)
   - [ ] Toast slide-in/slide-out
   - [ ] Badge pulse
   - [ ] NotificationCenter transition
   - [ ] Skeleton shimmer

3. **Accessibilité** (1h)
   - [ ] ARIA labels et roles
   - [ ] Keyboard navigation (Tab, Esc, Enter)
   - [ ] Screen reader support
   - [ ] Focus management

4. **Testing** (1h)
   - [ ] Tests unitaires (hooks)
   - [ ] Tests composants (Vitest + React Testing Library)
   - [ ] Tests E2E (Playwright: créer notification → voir toast → ouvrir center)

**Validation:**
- ✅ Support 5 langues
- ✅ Accessible (WCAG AA)
- ✅ Animations fluides
- ✅ Tests passent

---

### Phase 5: Performance & Advanced Features (6-8h)

**Objectif:** Optimiser et ajouter fonctionnalités avancées

**Tâches:**

1. **Performance** (3h)
   - [ ] Implémenter React.memo pour composants
   - [ ] useCallback pour handlers
   - [ ] Virtualization pour longues listes (react-window)
   - [ ] Debounce pour filtres
   - [ ] Firestore pagination (limit 50, startAfter)

2. **Cloud Functions** (3h)
   - [ ] Function `sendNotification()` pour créer notification + FCM push
   - [ ] Function `cleanupExpiredNotifications()` (scheduled daily)
   - [ ] Function `notifyMatchingProviders()` pour nouvelles tâches
   - [ ] Tests Cloud Functions

3. **Préférences Utilisateur** (2h)
   - [ ] Page Settings → Notifications
   - [ ] Toggle par catégorie
   - [ ] Quiet hours
   - [ ] Sound/Vibration on/off

**Validation:**
- ✅ Performance optimale (< 100ms render)
- ✅ Cloud Functions déployées
- ✅ Préférences sauvegardées

---

### Récapitulatif Timeline

| Phase | Durée | Priorité | Statut |
|-------|-------|----------|--------|
| **Phase 1** - Infrastructure | 8-10h | 🔴 CRITIQUE | ⬜ À FAIRE |
| **Phase 2** - Composants UI | 10-12h | 🔴 CRITIQUE | ⬜ À FAIRE |
| **Phase 3** - Intégration | 6-8h | 🟠 HAUTE | ⬜ À FAIRE |
| **Phase 4** - i18n & Polish | 4-5h | 🟡 MOYENNE | ⬜ À FAIRE |
| **Phase 5** - Performance | 6-8h | 🟢 BASSE | ⬜ À FAIRE |
| **TOTAL** | **34-43h** | | |

---

## ⚡ Performance et Scalabilité

### Optimisations Clés

**1. Firestore Queries:**

```typescript
// Indexer notifications par userId + createdAt
// Firebase Console → Firestore → Indexes

// Index composé:
// Collection: notifications
// Fields: userId (Ascending), createdAt (Descending)

// Requête optimisée:
const q = query(
  collection(db, 'notifications'),
  where('userId', '==', userId),
  where('read', '==', false), // Index supplémentaire si filtrage fréquent
  orderBy('createdAt', 'desc'),
  limit(50) // Pagination
);
```

**2. React Performance:**

```typescript
// Memoization des composants lourds
export const NotificationItem = React.memo(({ notification, onMarkAsRead }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.notification.id === nextProps.notification.id &&
         prevProps.notification.read === nextProps.notification.read;
});

// useCallback pour handlers
const handleMarkAsRead = useCallback((id: string) => {
  markAsRead(id);
}, [markAsRead]);

// useMemo pour calculs coûteux
const sortedNotifications = useMemo(() => {
  return [...notifications].sort((a, b) => {
    if (sortBy === 'newest') return b.createdAt.getTime() - a.createdAt.getTime();
    if (sortBy === 'oldest') return a.createdAt.getTime() - b.createdAt.getTime();
    if (sortBy === 'unread') return (a.read ? 1 : 0) - (b.read ? 1 : 0);
    return 0;
  });
}, [notifications, sortBy]);
```

**3. Virtualization:**

```typescript
// Utiliser react-window pour listes longues (> 50 items)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={notifications.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <NotificationItem notification={notifications[index]} />
    </div>
  )}
</FixedSizeList>
```

**4. Caching & Debounce:**

```typescript
// Debounce search/filters
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback((value: string) => {
  setSearchTerm(value);
}, 300);
```

### Scalabilité

**Limites recommandées:**

- **Retention**: 90 jours par défaut (configurable par utilisateur)
- **Max notifications actives par user**: 500 (cleanup automatique)
- **Toast queue**: Max 3 simultanés
- **Pagination**: 50 notifications par page
- **Firestore reads**: ~30-50 par jour par utilisateur actif

**Cleanup automatique:**

```typescript
// Cloud Function (scheduled daily)
export const cleanupExpiredNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const expiredQuery = admin.firestore()
      .collection('notifications')
      .where('expiresAt', '<', now)
      .limit(500);

    const snapshot = await expiredQuery.get();
    const batch = admin.firestore().batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${snapshot.size} expired notifications`);
  });
```

---

## 💻 Exemples de Code

### Exemple Complet: Intégration dans Header

```typescript
// src/components/layout/header.tsx
'use client';

import { NotificationIconButton } from '@/components/notifications/notification-icon-button';
import { NotificationToastProvider } from '@/components/notifications/notification-toast';

export function Header() {
  return (
    <NotificationToastProvider>
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <Logo />
          <nav>
            {/* ... navigation */}
          </nav>
          <div className="flex items-center gap-4">
            <NotificationIconButton />
            <UserMenu />
          </div>
        </div>
      </header>
    </NotificationToastProvider>
  );
}
```

### Exemple: Créer Notification pour Booking

```typescript
// src/app/actions.ts (Server Action)
'use server';

import { createNotification } from '@/lib/firestore-notifications';
import { NotificationType, NotificationCategory, NotificationPriority } from '@/lib/types/notifications';

export async function confirmBooking(bookingId: string, userId: string, taskTitle: string, date: Date) {
  // ... logique de confirmation

  // Créer notification
  await createNotification({
    userId,
    type: NotificationType.BOOKING_CONFIRMED,
    category: NotificationCategory.BOOKINGS,
    priority: NotificationPriority.NORMAL,
    title: 'Booking Confirmed',
    body: `Your booking for "${taskTitle}" is confirmed for ${date.toLocaleDateString()}`,
    data: { bookingId, taskTitle, date: date.toISOString() },
    actionUrl: `/bookings/${bookingId}`,
    icon: 'calendar-check',
    expiresInDays: 30,
  });

  return { success: true };
}
```

### Exemple: Traductions

```json
// public/locales/fr/notifications.json
{
  "types": {
    "new_message": "Nouveau message",
    "new_proposal": "Nouvelle proposition",
    "proposal_accepted": "Proposition acceptée",
    "booking_confirmed": "Réservation confirmée"
  },
  "actions": {
    "view": "Voir",
    "dismiss": "Ignorer",
    "markAsRead": "Marquer comme lu",
    "markAllAsRead": "Tout marquer comme lu",
    "clearAll": "Tout effacer"
  },
  "filters": {
    "all": "Toutes",
    "messages": "Messages",
    "tasks": "Tâches",
    "proposals": "Propositions",
    "bookings": "Réservations"
  },
  "empty": {
    "title": "Aucune notification",
    "description": "Vous êtes à jour !"
  },
  "preferences": {
    "title": "Préférences de notifications",
    "enableAll": "Activer toutes les notifications",
    "categories": {
      "messages": "Messages",
      "tasks": "Tâches",
      "proposals": "Propositions",
      "bookings": "Réservations"
    },
    "quietHours": "Heures de silence",
    "sound": "Son activé",
    "vibration": "Vibration activée"
  }
}
```

---

## ✅ Checklist de Validation

### Infrastructure

- [ ] Collection `notifications` créée dans Firestore
- [ ] Security rules déployées
- [ ] Indexes Firestore configurés
- [ ] Types TypeScript définis (`notifications.ts`)
- [ ] Hook `use-notification-manager` implémenté et testé

### Composants

- [ ] `NotificationBadge` fonctionnel avec animations
- [ ] `NotificationToastProvider` affiche toasts automatiquement
- [ ] `NotificationIconButton` avec badge et ouverture center
- [ ] `NotificationCenter` avec filtres, tri, actions groupées
- [ ] `NotificationList` avec virtualization si > 50 items
- [ ] Tous les composants ont tests unitaires

### Intégrations

- [ ] Messages créent notifications
- [ ] Proposals créent notifications (create, accept, reject)
- [ ] Tasks créent notifications
- [ ] Bookings créent notifications
- [ ] Reviews créent notifications
- [ ] Pas de doublons avec système FCM existant

### i18n

- [ ] 5 langues supportées (EN, FR, ES, DE, JA)
- [ ] Toutes les clés traduites
- [ ] Relative time localisé ("il y a 2 minutes")

### Performance

- [ ] Firestore queries optimisées (indexes)
- [ ] React.memo pour composants lourds
- [ ] useCallback pour handlers
- [ ] useMemo pour calculs coûteux
- [ ] Virtualization pour longues listes
- [ ] Debounce pour filtres/search

### Accessibilité

- [ ] ARIA labels et roles
- [ ] Keyboard navigation fonctionnelle
- [ ] Screen reader compatible
- [ ] Focus management correct
- [ ] Contraste couleurs WCAG AA

### Testing

- [ ] Tests unitaires hooks (90%+ coverage)
- [ ] Tests composants (React Testing Library)
- [ ] Tests E2E (Playwright: toast, badge, center)
- [ ] Tests manuels cross-browser (Chrome, Firefox, Safari)
- [ ] Tests mobile (iOS Safari, Chrome Android)

---

## 🚀 Prochaines Étapes

**Recommandation:** Commencer par **Phase 1** pour établir les fondations.

**Ordre d'exécution suggéré:**

1. **Créer modèle de données** (`notifications.ts`, security rules, indexes)
2. **Implémenter hook central** (`use-notification-manager.ts`)
3. **Créer helpers Firestore** (`firestore-notifications.ts`)
4. **Tester infrastructure** (créer notification manuellement, vérifier listener)
5. **Passer à Phase 2** (composants UI)

**Commande pour démarrer:**

```bash
# Créer fichiers de base
mkdir -p src/lib/types src/components/notifications
touch src/lib/types/notifications.ts
touch src/hooks/use-notification-manager.ts
touch src/lib/firestore-notifications.ts

# Lancer dev server
pnpm dev
```

---

**Document rédigé par:** GitHub Copilot  
**Pour:** ImuTask Platform  
**Version:** 1.0  
**Dernière mise à jour:** 2024

