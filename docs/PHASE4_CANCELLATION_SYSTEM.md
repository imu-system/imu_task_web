# Phase 4: Système d'Annulation de Réservations - Documentation

**Date:** 6 novembre 2025  
**Statut:** ✅ Complété  
**Version:** 1.0.0

---

## 📋 Vue d'ensemble

Le **Système d'Annulation de Réservations** permet aux clients et prestataires d'annuler des bookings avec calcul automatique des remboursements selon le timing et la politique d'annulation.

### 🎯 Objectifs

1. **Transparence** : Montrer les frais avant confirmation
2. **Équité** : Politiques différenciées selon timing et rôle
3. **Flexibilité** : 3 niveaux de politique (flexible, modérée, stricte)
4. **Automatisation** : Calcul remboursement + pénalités en temps réel

---

## 🏗️ Architecture

### Fichiers créés/modifiés

```
src/
├── lib/
│   ├── cancellation-policies.ts        [NEW] (280 lignes)
│   └── firestore-bookings.ts            [MODIFIED] (+75 lignes)
├── components/
│   └── bookings/
│       └── cancellation-dialog.tsx      [NEW] (248 lignes)
└── messages/
    ├── fr.json                          [MODIFIED] (+22 clés)
    └── en.json                          [MODIFIED] (+22 clés)
```

**Total:** ~603 lignes de code + 44 clés i18n

---

## 💼 Business Logic: Politiques d'Annulation

### 1. Politique Modérée (Par Défaut)

```typescript
DEFAULT_CANCELLATION_POLICY = {
  type: 'moderate',
  refundRules: [
    { hoursBeforeStart: 48,  clientRefundPercent: 100, providerPenaltyPercent: 0  },
    { hoursBeforeStart: 24,  clientRefundPercent: 75,  providerPenaltyPercent: 10 },
    { hoursBeforeStart: 12,  clientRefundPercent: 50,  providerPenaltyPercent: 15 },
    { hoursBeforeStart: 0,   clientRefundPercent: 0,   providerPenaltyPercent: 20 }
  ]
}
```

**Règles:**
- **>48h avant** : 100% remboursement, 0% pénalité
- **24-48h avant** : 75% remboursement, 10% pénalité provider (si annulation client)
- **12-24h avant** : 50% remboursement, 15% pénalité
- **<12h avant** : 0% remboursement, 20% pénalité

### 2. Politique Flexible

```typescript
FLEXIBLE_POLICY = {
  type: 'flexible',
  refundRules: [
    { hoursBeforeStart: 24,  clientRefundPercent: 100, providerPenaltyPercent: 0  },
    { hoursBeforeStart: 12,  clientRefundPercent: 75,  providerPenaltyPercent: 5  },
    { hoursBeforeStart: 0,   clientRefundPercent: 50,  providerPenaltyPercent: 10 }
  ]
}
```

**Utilisée pour:** Tutoring, Digital Help, Shopping

### 3. Politique Stricte

```typescript
STRICT_POLICY = {
  type: 'strict',
  refundRules: [
    { hoursBeforeStart: 72,  clientRefundPercent: 100, providerPenaltyPercent: 0  },
    { hoursBeforeStart: 48,  clientRefundPercent: 50,  providerPenaltyPercent: 15 },
    { hoursBeforeStart: 24,  clientRefundPercent: 25,  providerPenaltyPercent: 20 },
    { hoursBeforeStart: 0,   clientRefundPercent: 0,   providerPenaltyPercent: 30 }
  ]
}
```

**Utilisée pour:** Plumbing, Urgent, Healthcare, Eldercare

---

## 🧮 Calcul des Frais

### Fonction `calculateCancellationFees()`

```typescript
interface CancellationCalculation {
  canCancel: boolean                  // Booking annulable ?
  refundAmount: number                // Montant remboursé (cents)
  refundPercent: number               // % remboursement
  providerPenalty: number             // Pénalité provider (cents)
  platformFee: number                 // Frais plateforme retenus (cents)
  reason: string                      // Raison de la politique appliquée
  hoursBeforeStart: number            // Heures avant début
}
```

### Exemples de Calcul

#### Exemple 1: Client annule 30h avant (Politique Modérée)
```typescript
Input:
  - bookingAmount: 5000 (50€)
  - scheduledDate: dans 30h
  - cancelledBy: 'client'
  - policy: DEFAULT_CANCELLATION_POLICY

Output:
  - canCancel: true
  - refundPercent: 75%
  - refundAmount: 3750 (37.50€)
  - platformFee: 1250 (12.50€)
  - providerPenalty: 0
  - reason: "Annulation 24-48h avant"
```

#### Exemple 2: Provider annule 10h avant
```typescript
Input:
  - bookingAmount: 8000 (80€)
  - scheduledDate: dans 10h
  - cancelledBy: 'provider'
  - policy: DEFAULT_CANCELLATION_POLICY

Output:
  - canCancel: true
  - refundPercent: 100% (toujours pour provider cancellation)
  - refundAmount: 8000 (80€)
  - providerPenalty: 1600 (16€ = 20% du montant)
  - platformFee: 0
  - reason: "Annulation moins de 12h avant - Annulation par le prestataire (remboursement complet client)"
```

#### Exemple 3: Annulation impossible (service déjà passé)
```typescript
Input:
  - bookingAmount: 3000 (30€)
  - scheduledDate: il y a 2h (passé)
  - cancelledBy: 'client'

Output:
  - canCancel: false
  - refundAmount: 0
  - platformFee: 3000
  - reason: "Le service a déjà commencé ou est terminé"
```

---

## 🎨 Interface Utilisateur

### Composant `CancellationDialog`

**Features:**
- ✅ Calcul temps réel avant ouverture
- ✅ Affichage visuel des montants (cards avec icônes)
- ✅ Breakdown détaillé (original, refund, fees, penalty)
- ✅ Textarea obligatoire pour raison
- ✅ Validation avant confirmation
- ✅ Loading state pendant API call
- ✅ Responsive design (max-w-2xl, overflow-y-auto)

**Props:**
```typescript
interface CancellationDialogProps {
  bookingId: string
  bookingAmount: number           // En cents
  scheduledDate: Date | string
  cancelledBy: 'client' | 'provider'
  onConfirm: (reason: string) => Promise<void>
  trigger?: React.ReactNode       // Custom trigger button
}
```

**Usage:**
```tsx
<CancellationDialog
  bookingId={booking.id}
  bookingAmount={booking.amount}
  scheduledDate={booking.scheduledDate}
  cancelledBy={userRole === 'client' ? 'client' : 'provider'}
  onConfirm={async (reason) => {
    const calc = await cancelBooking(
      booking.id,
      reason,
      userRole === 'client' ? 'client' : 'provider',
      userId
    );
    console.log('Refund:', calc.refundAmount);
  }}
/>
```

### Écrans

#### 1. Dialog - Vue normale (48h avant)
```
┌─────────────────────────────────────┐
│ ⚠️ Annuler cette réservation       │
│ Consultez les frais d'annulation...│
├─────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐   │
│ │ 🕐 Temps     │ │ 💰 Remb.    │   │
│ │ 2 j         │ │ 100%        │   │
│ └─────────────┘ └─────────────┘   │
│                                     │
│ ℹ️ Détails du remboursement         │
│ Montant initial:        50.00€     │
│ Montant remboursé:      50.00€ ✅  │
│ Frais plateforme:        0.00€     │
│                                     │
│ ℹ️ Annulation plus de 48h avant    │
│                                     │
│ Raison de l'annulation *            │
│ ┌─────────────────────────────────┐│
│ │ [Textarea: Imprévu personnel...]││
│ └─────────────────────────────────┘│
│                                     │
│ [Retour] [Confirmer l'annulation]  │
└─────────────────────────────────────┘
```

#### 2. Dialog - Vue pénalité (10h avant, provider annule)
```
┌─────────────────────────────────────┐
│ ⚠️ Annuler cette réservation       │
├─────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐   │
│ │ 🕐 Temps     │ │ 💰 Remb.    │   │
│ │ 10 h        │ │ 100%        │   │
│ └─────────────┘ └─────────────┘   │
│                                     │
│ ℹ️ Détails du remboursement         │
│ Montant initial:        80.00€     │
│ Montant remboursé:      80.00€ ✅  │
│ Pénalité prestataire:   16.00€ ⚠️  │
│                                     │
│ ℹ️ Annulation moins de 12h avant - │
│    Annulation par le prestataire   │
│    (remboursement complet client)  │
│                                     │
│ Raison de l'annulation *            │
│ ┌─────────────────────────────────┐│
│ │ [Textarea obligatoire...]       ││
│ └─────────────────────────────────┘│
│                                     │
│ [Retour] [Confirmer l'annulation]  │
└─────────────────────────────────────┘
```

#### 3. Dialog - Annulation impossible
```
┌─────────────────────────────────────┐
│ ⚠️ Annuler cette réservation       │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐  │
│ │ ⚠️ Annulation impossible       │  │
│ │ Le service a déjà commencé ou  │  │
│ │ est terminé                    │  │
│ └───────────────────────────────┘  │
│                                     │
│ [Retour]                            │
└─────────────────────────────────────┘
```

---

## 🔥 Firestore: Modifications

### Collection `bookings` - Nouveaux champs

```typescript
interface Booking {
  // ... champs existants
  
  // Champs d'annulation (ajoutés)
  cancelledBy?: 'client' | 'provider'
  refundAmount?: number         // En cents
  refundPercent?: number        // 0-100
  providerPenalty?: number      // En cents
  platformFee?: number          // En cents
}
```

### Fonction `cancelBooking()` - Signature mise à jour

**Avant:**
```typescript
async function cancelBooking(
  bookingId: string,
  reason: string
): Promise<void>
```

**Après:**
```typescript
async function cancelBooking(
  bookingId: string,
  reason: string,
  cancelledBy: 'client' | 'provider',
  userId: string
): Promise<CancellationCalculation>
```

**Workflow:**
1. ✅ Récupérer booking
2. ✅ Vérifier permissions (userId = clientId ou providerId)
3. ✅ Vérifier status (pending ou confirmed uniquement)
4. ✅ Vérifier scheduledDate existe
5. ✅ Calculer frais via `calculateCancellationFees()`
6. ✅ Vérifier `canCancel = true`
7. ✅ Mettre à jour Firestore (status, reason, cancelledAt, refund data)
8. ✅ Envoyer notification au destinataire
9. ✅ (TODO) Déclencher remboursement Stripe
10. ✅ Retourner CancellationCalculation

---

## 🌐 Internationalisation (i18n)

### Nouvelles clés ajoutées

**Namespace:** `Bookings.Cancellation`

| Clé | FR | EN |
|-----|----|----|
| `cancelButton` | Annuler la réservation | Cancel Booking |
| `title` | Annuler cette réservation | Cancel this booking |
| `description` | Consultez les frais d'annulation avant de confirmer. Le remboursement dépend du timing. | Review cancellation fees before confirming. Refund amount depends on timing. |
| `cannotCancel` | Annulation impossible | Cannot cancel |
| `timeRemaining` | Temps restant | Time remaining |
| `untilStart` | avant le début | until start |
| `refundPercent` | Remboursement | Refund |
| `ofTotal` | du montant total | of total amount |
| `refundBreakdown` | Détails du remboursement | Refund breakdown |
| `originalAmount` | Montant initial | Original amount |
| `refundAmount` | Montant remboursé | Refund amount |
| `platformFee` | Frais de plateforme retenus | Platform fee retained |
| `providerPenalty` | Pénalité prestataire | Provider penalty |
| `reasonLabel` | Raison de l'annulation | Cancellation reason |
| `reasonPlaceholder` | Veuillez expliquer pourquoi vous annulez cette réservation... | Please explain why you're cancelling this booking... |
| `reasonHint` | Cette raison sera partagée avec l'autre partie. | This reason will be shared with the other party. |
| `goBack` | Retour | Go Back |
| `confirmCancel` | Confirmer l'annulation | Confirm Cancellation |
| `minutes` | min | min |
| `hours` | h | h |
| `days` | j | d |

**Total:** 22 clés × 2 langues = **44 entrées**

---

## 🧪 Tests

### Test Manual Checklist

#### Scénario 1: Client annule 72h avant
- [ ] Ouvrir dialog → Affiche 100% refund
- [ ] Entrer raison → Button activé
- [ ] Confirmer → Booking status = 'cancelled'
- [ ] Vérifier notification provider reçue
- [ ] Vérifier refundAmount = bookingAmount

#### Scénario 2: Client annule 10h avant
- [ ] Ouvrir dialog → Affiche 0% refund
- [ ] Vérifier platformFee = bookingAmount
- [ ] Confirmer → Aucun remboursement

#### Scénario 3: Provider annule 5h avant
- [ ] Ouvrir dialog → Affiche 100% refund + penalty
- [ ] Vérifier providerPenalty = 20% amount
- [ ] Confirmer → Client notifié avec refund complet

#### Scénario 4: Tentative annulation après début
- [ ] Ouvrir dialog → Message "Annulation impossible"
- [ ] Button "Confirmer" désactivé
- [ ] Raison textarea disabled

#### Scénario 5: Raison manquante
- [ ] Laisser textarea vide
- [ ] Button "Confirmer" disabled
- [ ] Pas de call API

### Tests Unitaires (à créer)

```typescript
// src/lib/__tests__/cancellation-policies.test.ts

describe('calculateCancellationFees', () => {
  test('100% refund when >48h before', () => {
    const result = calculateCancellationFees(
      5000,
      addHours(new Date(), 50),
      'client',
      DEFAULT_CANCELLATION_POLICY
    );
    expect(result.refundPercent).toBe(100);
    expect(result.refundAmount).toBe(5000);
  });

  test('Provider cancellation always 100% refund + penalty', () => {
    const result = calculateCancellationFees(
      8000,
      addHours(new Date(), 5),
      'provider',
      DEFAULT_CANCELLATION_POLICY
    );
    expect(result.refundPercent).toBe(100);
    expect(result.providerPenalty).toBe(1600); // 20%
  });

  test('Cannot cancel after scheduled date', () => {
    const result = calculateCancellationFees(
      3000,
      subHours(new Date(), 2),
      'client',
      DEFAULT_CANCELLATION_POLICY
    );
    expect(result.canCancel).toBe(false);
  });
});
```

---

## 🚀 Intégration

### 1. Remplacer ancien dialog dans BookingCard

**Avant:**
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Cancel</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <Textarea value={cancelReason} onChange={...} />
    <AlertDialogAction onClick={handleCancel}>Confirm</AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>
```

**Après:**
```tsx
import { CancellationDialog } from '@/components/bookings/cancellation-dialog';

<CancellationDialog
  bookingId={booking.id}
  bookingAmount={booking.amount}
  scheduledDate={booking.scheduledDate!}
  cancelledBy={userRole === 'client' ? 'client' : 'provider'}
  onConfirm={handleCancelWithRefund}
/>
```

### 2. Handler mis à jour

```tsx
const handleCancelWithRefund = async (reason: string) => {
  try {
    const calc = await cancelBooking(
      booking.id,
      reason,
      userRole === 'client' ? 'client' : 'provider',
      userId
    );

    toast({
      title: 'Réservation annulée',
      description: `Remboursement: ${calc.refundAmount / 100}€ (${calc.refundPercent}%)`,
    });

    onUpdate?.(); // Refresh booking list
  } catch (error) {
    toast({
      title: 'Erreur',
      description: error.message,
      variant: 'destructive',
    });
  }
};
```

---

## 💳 Intégration Stripe (TODO - Phase 7)

### Fonction `processRefund()` à créer

```typescript
async function processRefund(
  paymentIntentId: string,
  refundAmount: number
): Promise<Stripe.Refund> {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: refundAmount, // En cents
    reason: 'requested_by_customer',
    metadata: {
      refund_type: 'cancellation',
      calculated_by: 'cancellation_policy'
    }
  });
}
```

**Appel dans `cancelBooking()`:**
```typescript
// Ligne 397 de firestore-bookings.ts
if (cancellationCalc.refundAmount > 0 && booking.paymentIntentId) {
  await processRefund(booking.paymentIntentId, cancellationCalc.refundAmount);
}
```

---

## 📊 Métriques & KPIs

### Métriques à tracker

1. **Taux d'annulation global**
   - Formule: `(bookings cancelled / total bookings) * 100`
   - Target: <15%

2. **Délai moyen d'annulation**
   - Formule: `AVG(hoursBeforeStart)` pour tous cancellations
   - Target: >48h

3. **Distribution annulations par timing**
   - >48h: ? %
   - 24-48h: ? %
   - 12-24h: ? %
   - <12h: ? %

4. **Remboursements totaux par mois**
   - Formule: `SUM(refundAmount)` WHERE `status = 'cancelled'`

5. **Pénalités providers par mois**
   - Formule: `SUM(providerPenalty)` WHERE `cancelledBy = 'provider'`

6. **Revenus retenus (platform fees)**
   - Formule: `SUM(platformFee)` WHERE `status = 'cancelled'`

### Firestore Query Exemple

```typescript
const cancellationStats = await db
  .collection('bookings')
  .where('status', '==', 'cancelled')
  .where('cancelledAt', '>=', startOfMonth)
  .get();

const stats = {
  totalCancelled: cancellationStats.size,
  totalRefunded: cancellationStats.docs.reduce((sum, doc) => 
    sum + (doc.data().refundAmount || 0), 0
  ),
  avgHoursBeforeStart: cancellationStats.docs.reduce((sum, doc) => {
    const scheduled = doc.data().scheduledDate.toDate();
    const cancelled = doc.data().cancelledAt.toDate();
    const hours = (scheduled - cancelled) / (1000 * 60 * 60);
    return sum + hours;
  }, 0) / cancellationStats.size
};
```

---

## 🔄 Workflow Complet

### Diagramme de Séquence

```
Client/Provider          CancellationDialog          cancelBooking()           Firestore
      │                        │                           │                       │
      │─────(1) Click Cancel──>│                           │                       │
      │                        │                           │                       │
      │                        │───(2) Calculate Fees─────>│                       │
      │                        │<────(refund %)────────────│                       │
      │                        │                           │                       │
      │<───(3) Show Dialog─────│                           │                       │
      │    (timing, refund,    │                           │                       │
      │     penalty)           │                           │                       │
      │                        │                           │                       │
      │─────(4) Enter Reason──>│                           │                       │
      │                        │                           │                       │
      │─────(5) Confirm───────>│                           │                       │
      │                        │───(6) Call API───────────>│                       │
      │                        │                           │──(7) Validate────────>│
      │                        │                           │                       │
      │                        │                           │──(8) Update Doc──────>│
      │                        │                           │                       │
      │                        │                           │──(9) Notify Other Party
      │                        │                           │                       │
      │                        │<──(10) Return Calc────────│                       │
      │<───(11) Toast Success──│                           │                       │
      │                        │                           │                       │
```

---

## 📝 Notes Techniques

### 1. Gestion des fuseaux horaires

**Problème:** `scheduledDate` peut être dans un fuseau différent de l'utilisateur.

**Solution actuelle:**
- Toutes les dates Firestore en UTC
- `new Date()` côté client en local time
- Calcul `hoursBeforeStart` en UTC → Pas de problème si les deux dates en UTC

**À vérifier:**
- [ ] Test avec utilisateur en JST (Tokyo, UTC+9)
- [ ] Test avec date schedulée minuit local

### 2. Course de conditions (Race Conditions)

**Scénario:** Client ouvre dialog, attend 2h, puis confirme → Politique changée ?

**Solution:**
- ✅ Recalcul à l'ouverture du dialog (`useEffect` quand `open = true`)
- ✅ Validation côté serveur dans `cancelBooking()`
- ⚠️ Potentiel décalage entre affichage et résultat final (acceptable)

**Amélioration possible:**
```typescript
// Dans CancellationDialog, recalculer toutes les 60 secondes
useEffect(() => {
  if (open) {
    const interval = setInterval(() => {
      const calc = calculateCancellationFees(...);
      setCalculation(calc);
    }, 60000); // 1 min
    
    return () => clearInterval(interval);
  }
}, [open]);
```

### 3. Montants en cents

**Pourquoi ?**
- Éviter erreurs d'arrondi (0.1 + 0.2 = 0.30000000000000004)
- Standard Stripe (tous montants en cents)

**Formatage:**
```typescript
const formatCurrency = (amountInCents: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amountInCents / 100);
};

formatCurrency(5000); // "50,00 €"
```

---

## ✅ Checklist Déploiement

### Pré-production
- [ ] Tests unitaires `cancellation-policies.test.ts` (0/10)
- [ ] Tests E2E scénarios annulation (0/4)
- [ ] Vérifier traductions FR/EN complètes (✅)
- [ ] Code review sécurité (permissions userId)
- [ ] Performance test (1000 bookings simultanés)

### Production
- [ ] Déployer Firestore rules (collection bookings)
- [ ] Ajouter indexes Firestore (`status`, `cancelledAt`)
- [ ] Configurer monitoring annulations (>20/jour = alert)
- [ ] Intégrer Stripe refunds (Phase 7)
- [ ] Documentation utilisateur (FAQ annulations)
- [ ] Support client briefing (politiques, délais)

### Post-déploiement
- [ ] Monitorer taux annulation J+7
- [ ] Analyser distribution timing annulations
- [ ] Ajuster politiques si taux >15%
- [ ] Feedback utilisateurs (satisfaction refund process)

---

## 🎓 Lessons Learned

### Ce qui a bien fonctionné
- ✅ **Calcul centralisé** : Une seule fonction `calculateCancellationFees()` pour toute la logique
- ✅ **UI transparente** : Affichage détaillé rassure utilisateurs
- ✅ **Politiques modulaires** : Facile d'ajouter/modifier selon catégorie
- ✅ **Types TypeScript** : `CancellationCalculation` interface très claire

### Défis rencontrés
- ⚠️ **Complexité timing** : Gérer fuseaux horaires + dates passées
- ⚠️ **UX pénalités** : Afficher pénalité provider sans décourager annulation légitime
- ⚠️ **Validation double** : Client-side + server-side = code dupliqué

### Améliorations futures
- 🔮 **Politiques par catégorie** : Auto-sélection selon `task.category`
- 🔮 **Historique annulations** : Badge "Annuleur fréquent" si >30%
- 🔮 **Remboursement asynchrone** : Queue BullMQ pour Stripe refunds
- 🔮 **Emails de confirmation** : Envoyer récapitulatif PDF après annulation
- 🔮 **Analytics dashboard** : Graphiques annulations par timing/catégorie

---

## 📚 Références

- [Stripe Refunds API](https://stripe.com/docs/api/refunds)
- [Airbnb Cancellation Policies](https://www.airbnb.com/help/article/475) (inspiration)
- [Firebase Timestamp Documentation](https://firebase.google.com/docs/reference/js/v8/firebase.firestore.Timestamp)
- [Next-intl i18n Guide](https://next-intl-docs.vercel.app/)

---

**Documentation créée par:** GitHub Copilot  
**Dernière révision:** 6 novembre 2025  
**Version:** 1.0.0
