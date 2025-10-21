# Migration Firestore - Collections Paiements

**Date**: 20 octobre 2025  
**Phase**: Phase 1 - Paiements & Finances  
**Statut**: ✅ Prêt à déployer

---

## 📋 Fichiers créés

### 1. `/firestore-payments.rules`
- Règles de sécurité complètes pour toutes les collections de paiements
- 9 collections couvertes avec règles granulaires
- Helper functions pour vérification rôles

### 2. `/firestore-payments.indexes.json`
- 36 indices composites pour optimisation queries
- Indices pour toutes les combinaisons de filtres utilisées
- Field overrides pour champs uniques (Stripe IDs)

---

## 🗄️ Collections créées

### Collection 1: `transactions`
**Description**: Toutes les transactions financières de la plateforme

**Schéma**:
```typescript
{
  id: string;                        // Auto-généré
  userId: string;                    // ⚡ Indexé
  bookingId?: string;                // ⚡ Indexé
  quoteId?: string;
  invoiceId?: string;
  type: TransactionType;             // ⚡ Indexé
  status: TransactionStatus;         // ⚡ Indexé
  amount: number;                    // En centimes
  currency: string;                  // Default: 'EUR'
  feeAmount?: number;
  netAmount?: number;
  paymentMethod: PaymentMethod;      // ⚡ Indexé
  stripePaymentIntentId?: string;    // ⚡ Unique
  stripeChargeId?: string;
  description: string;
  metadata?: object;
  errorCode?: string;
  errorMessage?: string;
  refundAmount?: number;
  notes?: string;
  createdAt: Timestamp;              // ⚡ Indexé
  updatedAt: Timestamp;
  processedAt?: Timestamp;
  failedAt?: Timestamp;
  refundedAt?: Timestamp;
}
```

**Indices composites**:
- `userId` + `createdAt` (desc)
- `userId` + `status` + `createdAt` (desc)
- `userId` + `type` + `createdAt` (desc)
- `bookingId` + `createdAt` (desc)
- `status` + `createdAt` (desc)
- `type` + `createdAt` (desc)
- `status` + `type` + `createdAt` (desc)
- `paymentMethod` + `createdAt` (desc)

**Règles de sécurité**:
- ✅ Read: Propriétaire ou Admin
- ❌ Create: Système uniquement (Cloud Functions)
- ⚠️ Update: Admin uniquement (champs limités: status, refund, errors, notes)
- ❌ Delete: Interdit

**Taille estimée**: ~10-50k docs (croissance mensuelle)

---

### Collection 2: `payouts`
**Description**: Virements vers les professionnels

**Schéma**:
```typescript
{
  id: string;
  professionalId: string;            // ⚡ Indexé
  userId: string;
  grossAmount: number;               // Montant brut en centimes
  platformFee: number;               // Commission plateforme
  netAmount: number;                 // Montant net viré
  status: PayoutStatus;              // ⚡ Indexé
  frequency?: PayoutFrequency;       // daily, weekly, monthly, manual
  bankAccountId: string;
  stripePayoutId?: string;           // ⚡ Unique
  stripeAccountId?: string;
  transactionIds: string[];          // IDs transactions incluses
  transactionsCount: number;
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectedBy?: string;
  rejectedAt?: Timestamp;
  rejectionReason?: string;
  fraudScore?: number;               // 0-100
  fraudFlags?: string[];
  isReviewed?: boolean;
  reviewedBy?: string;
  notes?: string;
  createdAt: Timestamp;              // ⚡ Indexé
  scheduledAt?: Timestamp;           // ⚡ Indexé
  processedAt?: Timestamp;
  paidAt?: Timestamp;
  failedAt?: Timestamp;
  updatedAt: Timestamp;
}
```

**Indices composites**:
- `professionalId` + `createdAt` (desc)
- `professionalId` + `status` + `createdAt` (desc)
- `status` + `createdAt` (desc)
- `status` + `scheduledAt` (asc)
- `professionalId` + `frequency` + `scheduledAt` (asc)

**Règles de sécurité**:
- ✅ Read: Professionnel concerné ou Admin
- ✅ Create: Professionnel (status = 'pending' uniquement)
- ⚠️ Update: Admin (approve/reject/process)
- ⚠️ Delete: Admin si status = 'pending'

**Taille estimée**: ~1-5k docs (croissance mensuelle)

---

### Collection 3: `wallets`
**Description**: Portefeuilles utilisateurs

**Schéma**:
```typescript
{
  id: string;                        // = userId
  userId: string;
  balance: number;                   // Solde disponible (centimes)
  pendingBalance: number;            // En attente (centimes)
  totalBalance: number;              // Total (centimes)
  currency: string;                  // Default: 'EUR'
  status: WalletStatus;              // active, suspended, frozen, closed
  stripeCustomerId?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
  minimumBalance?: number;
  totalDeposits: number;             // Lifetime total dépôts
  totalWithdrawals: number;          // Lifetime total retraits
  totalTransactions: number;         // Lifetime count
  lastTransactionAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indices**: Aucun (queries simples par ID)

**Règles de sécurité**:
- ✅ Read: Propriétaire ou Admin
- ❌ Create: Système (création utilisateur)
- ❌ Update: Système uniquement (Cloud Functions)
- ❌ Delete: Interdit

**Taille estimée**: ~1-10k docs (= nombre utilisateurs)

---

### Collection 4: `bankAccounts`
**Description**: Comptes bancaires (IBAN) des utilisateurs

**Schéma**:
```typescript
{
  id: string;
  userId: string;                    // ⚡ Indexé
  professionalId?: string;           // ⚡ Indexé
  type: BankAccountType;             // checking, savings, business
  status: BankAccountStatus;         // ⚡ Indexé
  iban: string;                      // ⚠️ CHIFFRÉ (encrypt côté client)
  bic?: string;
  accountHolderName: string;
  bankName: string;
  country: string;
  last4: string;                     // Pour affichage
  maskedIban: string;                // FR**************1234
  isVerified: boolean;
  verificationMethod?: string;       // microdeposit, instant, manual
  verifiedAt?: Timestamp;
  isDefault: boolean;                // ⚡ Indexé
  stripeBankAccountId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**⚠️ IMPORTANT - Sécurité IBAN**:
```typescript
// Chiffrement côté client AVANT envoi Firestore
import { encrypt, decrypt } from '@/lib/crypto';

const encryptedIban = encrypt(iban, userKey);
await addDoc(collection(db, 'bankAccounts'), {
  ...data,
  iban: encryptedIban,
});
```

**Indices composites**:
- `userId` + `isDefault` (desc)
- `userId` + `status`
- `professionalId` + `isDefault` (desc)

**Règles de sécurité**:
- ✅ Read: Propriétaire ou Admin
- ✅ Create: Utilisateur (son propre compte, status = 'pending')
- ⚠️ Update: Propriétaire (isDefault) ou Admin (tout)
- ✅ Delete: Propriétaire ou Admin

**Taille estimée**: ~500-2k docs

---

### Collection 5: `withdrawals`
**Description**: Retraits vers carte/banque (clients)

**Schéma**:
```typescript
{
  id: string;
  userId: string;                    // ⚡ Indexé
  walletId: string;
  amount: number;                    // Montant demandé (centimes)
  feeAmount: number;                 // Frais retrait
  netAmount: number;                 // Montant net transféré
  method: WithdrawalMethod;          // bank_transfer, card
  status: WithdrawalStatus;          // ⚡ Indexé
  bankAccountId?: string;
  cardLast4?: string;
  stripeTransferId?: string;         // ⚡ Unique
  estimatedArrival?: Timestamp;
  processingTime?: string;           // "1-3 business days"
  reason?: string;
  errorMessage?: string;
  createdAt: Timestamp;              // ⚡ Indexé
  processedAt?: Timestamp;
  completedAt?: Timestamp;
  failedAt?: Timestamp;
  updatedAt: Timestamp;
}
```

**Indices composites**:
- `userId` + `createdAt` (desc)
- `userId` + `status` + `createdAt` (desc)
- `status` + `createdAt` (desc)

**Règles de sécurité**:
- ✅ Read: Propriétaire ou Admin
- ✅ Create: Utilisateur (status = 'pending', amount > 0)
- ⚠️ Update: Admin/Système (traitement)
- ❌ Delete: Interdit

**Taille estimée**: ~500-3k docs (mensuel)

---

### Collection 6: `transfers`
**Description**: Transferts internes entre portefeuilles

**Schéma**:
```typescript
{
  id: string;
  fromUserId: string;                // ⚡ Indexé
  toUserId: string;                  // ⚡ Indexé
  fromWalletId: string;
  toWalletId: string;
  amount: number;                    // En centimes
  status: TransferStatus;            // ⚡ Indexé
  bookingId?: string;                // ⚡ Indexé (si lié réservation)
  reason?: string;
  metadata?: object;
  createdAt: Timestamp;              // ⚡ Indexé
  completedAt?: Timestamp;
  failedAt?: Timestamp;
  reversedAt?: Timestamp;
}
```

**Indices composites**:
- `fromUserId` + `createdAt` (desc)
- `toUserId` + `createdAt` (desc)
- `status` + `createdAt` (desc)
- `bookingId` + `createdAt` (desc)

**Règles de sécurité**:
- ✅ Read: Utilisateurs impliqués ou Admin
- ❌ Create: Système uniquement (Cloud Functions)
- ❌ Update: Système uniquement
- ❌ Delete: Interdit

**Taille estimée**: ~5-20k docs (croissance mensuelle)

---

### Collection 7: `bankStatements`
**Description**: Relevés bancaires importés (CSV/PDF)

**Schéma**:
```typescript
{
  id: string;
  fileName: string;
  fileUrl: string;                   // Storage URL
  uploadedBy: string;                // ⚡ Indexé (admin)
  bankAccountId: string;             // ⚡ Indexé
  startDate: Timestamp;              // ⚡ Indexé
  endDate: Timestamp;
  accountNumber?: string;
  totalEntries: number;
  totalDebit: number;                // Total débits
  totalCredit: number;               // Total crédits
  openingBalance: number;
  closingBalance: number;
  matchedCount: number;              // Entrées matchées
  unmatchedCount: number;            // Entrées non-matchées
  parsedAt?: Timestamp;
  createdAt: Timestamp;              // ⚡ Indexé
}
```

**Indices composites**:
- `bankAccountId` + `startDate` (desc)
- `uploadedBy` + `createdAt` (desc)

**Règles de sécurité**:
- ✅ Read/Write: Admin uniquement

**Taille estimée**: ~50-200 docs (mensuel)

---

### Collection 8: `bankStatementEntries`
**Description**: Lignes individuelles des relevés

**Schéma**:
```typescript
{
  id: string;
  statementId: string;               // ⚡ Indexé
  date: Timestamp;                   // ⚡ Indexé
  description: string;
  reference?: string;
  amount: number;                    // Positif = crédit, Négatif = débit
  balance: number;
  isMatched: boolean;                // ⚡ Indexé
  matchedTransactionId?: string;
  matchConfidence?: number;          // 0-100 (AI matching)
  suggestedMatches?: Array<{
    transactionId: string;
    confidence: number;
  }>;
  manuallyValidated?: boolean;
  validatedBy?: string;
  createdAt: Timestamp;
}
```

**Indices composites**:
- `statementId` + `date` (asc)
- `statementId` + `isMatched` + `date` (asc)

**Règles de sécurité**:
- ✅ Read/Write: Admin uniquement

**Taille estimée**: ~1-5k docs (mensuel)

---

### Collection 9: `reconciliations`
**Description**: Rapports de réconciliation bancaire

**Schéma**:
```typescript
{
  id: string;
  statementId: string;
  startDate: Timestamp;              // ⚡ Indexé
  endDate: Timestamp;                // ⚡ Indexé
  status: ReconciliationStatus;      // ⚡ Indexé
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  discrepanciesCount: number;
  platformTotal: number;             // Total plateforme
  bankTotal: number;                 // Total banque
  difference: number;                // Écart
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  notes?: string;
  reportUrl?: string;                // PDF report Storage URL
  createdAt: Timestamp;              // ⚡ Indexé
  completedAt?: Timestamp;
}
```

**Indices composites**:
- `status` + `createdAt` (desc)
- `startDate` + `endDate`

**Règles de sécurité**:
- ✅ Read/Write: Admin uniquement

**Taille estimée**: ~20-100 docs (mensuel)

---

### Collection 10: `commissionRules`
**Description**: Règles de calcul des commissions

**Schéma**:
```typescript
{
  id: string;
  name: string;                      // "Commission Pro Standard"
  description?: string;
  categoryId?: string;               // ⚡ Indexé (si rule spécifique catégorie)
  serviceName?: string;
  professionalId?: string;           // Si rule spécifique pro
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;           // % ou montant fixe (centimes)
  minimumFee?: number;               // Fee minimum (centimes)
  maximumFee?: number;               // Fee maximum (centimes)
  minAmount?: number;                // Montant minimum transaction
  maxAmount?: number;                // Montant maximum transaction
  isActive: boolean;                 // ⚡ Indexé
  priority: number;                  // ⚡ Indexé (pour résolution conflits)
  validFrom?: Timestamp;
  validUntil?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indices composites**:
- `isActive` + `priority` (asc)
- `categoryId` + `isActive` + `priority` (asc)

**Règles de sécurité**:
- ✅ Read: Public (pour calculs côté client)
- ⚠️ Write: Admin uniquement

**Taille estimée**: ~10-50 docs (règles)

---

### Collection 11: `paymentAnalytics`
**Description**: Métriques agrégées (générées par Cloud Functions)

**Schéma**:
```typescript
{
  id: string;                        // Format: "daily_2024-10-20"
  period: 'daily' | 'weekly' | 'monthly'; // ⚡ Indexé
  startDate: Timestamp;              // ⚡ Indexé
  endDate: Timestamp;
  totalVolume: number;               // Volume total (centimes)
  paymentVolume: number;             // Paiements
  payoutVolume: number;              // Virements
  refundVolume: number;              // Remboursements
  transactionCount: number;
  successfulCount: number;
  failedCount: number;
  successRate: number;               // %
  averageAmount: number;
  platformRevenue: number;           // Total commissions
  stripeFees: number;                // Total frais Stripe
  netRevenue: number;                // Revenus nets
  paymentMethodBreakdown: {
    card: number;
    bank_transfer: number;
    wallet: number;
    // ...
  };
  topProfessionals?: Array<{
    professionalId: string;
    volume: number;
    count: number;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indices composites**:
- `period` + `startDate` (desc)

**Règles de sécurité**:
- ✅ Read: Admin uniquement
- ❌ Write: Système uniquement (Cloud Functions)

**Taille estimée**: ~30-100 docs (mensuel)

---

## 🚀 Déploiement

### Étape 1: Fusionner les règles Firestore

**Option A: Fusion manuelle** (recommandée)

Ouvrir `/firestore.rules` et ajouter le contenu de `/firestore-payments.rules` :

```bash
# Copier les helper functions au début
# Copier toutes les match {} pour les collections paiements
```

**Option B: Importer directement**

```bash
# Backup actuel
cp firestore.rules firestore.rules.backup

# Fusionner
cat firestore-payments.rules >> firestore.rules
```

### Étape 2: Fusionner les indices

Ouvrir `/firestore.indexes.json` et ajouter les indices de `/firestore-payments.indexes.json` :

```json
{
  "indexes": [
    // ... indices existants
    // ... ajouter indices de firestore-payments.indexes.json
  ],
  "fieldOverrides": [
    // ... field overrides existants
    // ... ajouter field overrides de firestore-payments.indexes.json
  ]
}
```

### Étape 3: Déployer via Firebase CLI

```bash
# Installer Firebase CLI (si pas déjà fait)
npm install -g firebase-tools

# Login
firebase login

# Déployer règles
firebase deploy --only firestore:rules

# Déployer indices
firebase deploy --only firestore:indexes
```

### Étape 4: Vérifier déploiement

```bash
# Console Firebase → Firestore → Règles
# Vérifier que les nouvelles règles sont actives

# Console Firebase → Firestore → Indices
# Vérifier que les indices se créent (peut prendre 5-10 min)
```

---

## 🧪 Tests de sécurité

### Test 1: Transaction - User ne peut pas modifier
```typescript
// ❌ Devrait échouer
await updateDoc(doc(db, 'transactions', txId), {
  amount: 99999
});
// Erreur: "Missing or insufficient permissions"
```

### Test 2: Payout - Professional peut créer
```typescript
// ✅ Devrait réussir
await addDoc(collection(db, 'payouts'), {
  professionalId: currentUserId,
  status: 'pending',
  netAmount: 5000,
  // ...
});
```

### Test 3: Wallet - User ne peut pas modifier balance
```typescript
// ❌ Devrait échouer
await updateDoc(doc(db, 'wallets', userId), {
  balance: 999999
});
```

### Test 4: BankAccount - User peut ajouter son IBAN
```typescript
// ✅ Devrait réussir
await addDoc(collection(db, 'bankAccounts'), {
  userId: currentUserId,
  iban: encryptedIban,
  status: 'pending',
  // ...
});
```

---

## 📊 Monitoring

### Métriques à surveiller

1. **Nombre de transactions par jour**
   - Query: `transactions` where `createdAt` >= today
   - Seuil alerte: > 10k/jour

2. **Payouts en attente**
   - Query: `payouts` where `status` == 'pending'
   - Seuil alerte: > 50

3. **Taux d'échec transactions**
   - Query: `transactions` where `status` == 'failed'
   - Calcul: failed / total
   - Seuil alerte: > 5%

4. **Réconciliations non-matchées**
   - Query: `bankStatementEntries` where `isMatched` == false
   - Seuil alerte: > 20%

---

## ✅ Checklist déploiement

- [ ] Types TypeScript créés (`src/types/payments.ts`) ✅
- [ ] Règles Firestore créées (`firestore-payments.rules`) ✅
- [ ] Indices créés (`firestore-payments.indexes.json`) ✅
- [ ] Règles fusionnées dans `firestore.rules`
- [ ] Indices fusionnés dans `firestore.indexes.json`
- [ ] Règles déployées (`firebase deploy --only firestore:rules`)
- [ ] Indices déployés (`firebase deploy --only firestore:indexes`)
- [ ] Tests sécurité exécutés (4 tests minimum)
- [ ] Monitoring configuré (alertes + dashboards)
- [ ] Documentation équipe mise à jour

---

## 🔗 Ressources

- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [PCI DSS Compliance](https://stripe.com/docs/security/guide) - Pour stockage IBAN

---

**Status**: ✅ Prêt pour déploiement  
**Prochaine étape**: Fusionner règles et déployer, puis commencer implémentation pages admin
