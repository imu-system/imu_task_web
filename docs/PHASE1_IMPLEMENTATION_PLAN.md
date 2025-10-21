# Phase 1 : Paiements & Finances - Plan d'Implémentation

**Date**: 20 octobre 2025  
**Sprint**: Phase 1 - Semaines 1-6  
**Objectif**: Système complet de gestion des paiements et finances

---

## 📋 Vue d'ensemble

### Objectifs de la Phase 1
1. ✅ **Types TypeScript créés** (src/types/payments.ts - 700+ lignes)
2. 🔄 **Pages Admin Payments** à connecter à Firestore
3. ⏳ **Pages User Wallet** à créer
4. ⏳ **Collections Firestore** à définir
5. ⏳ **Stripe Integration** à configurer

---

## 🎯 Sprint 1 : Admin Payments (Semaines 1-2)

### Tâche 1.1 : Collections Firestore

#### Collections à créer

**1. `transactions`** (Collection principale)
```typescript
{
  id: string;                        // Auto-generated
  userId: string;                    // Index
  bookingId?: string;                // Index
  type: TransactionType;             // Index
  status: TransactionStatus;         // Index
  amount: number;                    // En centimes
  currency: string;
  feeAmount?: number;
  netAmount?: number;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string;    // Index
  description: string;
  metadata?: object;
  createdAt: Timestamp;              // Index
  updatedAt: Timestamp;
  processedAt?: Timestamp;
}

// Indices Firestore requis:
- userId + createdAt (desc)
- bookingId + createdAt (desc)
- status + createdAt (desc)
- type + createdAt (desc)
- stripePaymentIntentId (unique)
```

**2. `payouts`**
```typescript
{
  id: string;
  professionalId: string;            // Index
  userId: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  status: PayoutStatus;              // Index
  bankAccountId: string;
  stripePayoutId?: string;
  transactionIds: string[];
  transactionsCount: number;
  approvedBy?: string;
  approvedAt?: Timestamp;
  fraudScore?: number;
  createdAt: Timestamp;              // Index
  scheduledAt?: Timestamp;
  paidAt?: Timestamp;
}

// Indices:
- professionalId + createdAt (desc)
- status + createdAt (desc)
```

**3. `wallets`**
```typescript
{
  id: string;                        // userId
  userId: string;
  balance: number;                   // En centimes
  pendingBalance: number;
  totalBalance: number;
  currency: string;
  status: WalletStatus;
  stripeCustomerId?: string;
  totalDeposits: number;
  totalWithdrawals: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**4. `bankAccounts`**
```typescript
{
  id: string;
  userId: string;                    // Index
  professionalId?: string;
  type: BankAccountType;
  status: BankAccountStatus;
  iban: string;                      // Chiffré
  accountHolderName: string;
  bankName: string;
  last4: string;
  maskedIban: string;
  isVerified: boolean;
  isDefault: boolean;
  stripeBankAccountId?: string;
  createdAt: Timestamp;
}

// Indices:
- userId + isDefault
```

**5. `withdrawals`**
```typescript
{
  id: string;
  userId: string;                    // Index
  walletId: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  method: WithdrawalMethod;
  status: WithdrawalStatus;          // Index
  bankAccountId?: string;
  stripeTransferId?: string;
  createdAt: Timestamp;              // Index
  completedAt?: Timestamp;
}

// Indices:
- userId + createdAt (desc)
- status + createdAt (desc)
```

**6. `transfers`**
```typescript
{
  id: string;
  fromUserId: string;                // Index
  toUserId: string;                  // Index
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  status: TransferStatus;
  bookingId?: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
```

**7. `bankStatements`**
```typescript
{
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  startDate: Timestamp;
  endDate: Timestamp;
  bankAccountId: string;
  totalEntries: number;
  matchedCount: number;
  unmatchedCount: number;
  createdAt: Timestamp;
}
```

**8. `reconciliations`**
```typescript
{
  id: string;
  statementId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: ReconciliationStatus;
  totalTransactions: number;
  matchedTransactions: number;
  difference: number;
  reviewedBy?: string;
  createdAt: Timestamp;
}
```

**9. `commissionRules`**
```typescript
{
  id: string;
  name: string;
  categoryId?: string;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  minimumFee?: number;
  maximumFee?: number;
  isActive: boolean;
  priority: number;
  validFrom?: Timestamp;
  validUntil?: Timestamp;
  createdAt: Timestamp;
}
```

#### Règles de sécurité Firestore

Créer fichier : `firestore-payments.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Transactions - Read: user own or admin, Write: system only
    match /transactions/{transactionId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin'])
      );
      allow write: if false; // Only via Cloud Functions
    }
    
    // Payouts - Read: professional/admin, Write: admin only
    match /payouts/{payoutId} {
      allow read: if request.auth != null && (
        resource.data.professionalId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin'])
      );
      allow create: if request.auth != null && request.resource.data.professionalId == request.auth.uid;
      allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin']);
    }
    
    // Wallets - Read: owner or admin, Write: system only
    match /wallets/{walletId} {
      allow read: if request.auth != null && (
        walletId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin'])
      );
      allow write: if false; // Only via Cloud Functions
    }
    
    // Bank Accounts - Read/Write: owner or admin
    match /bankAccounts/{accountId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin'])
      );
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Withdrawals - Read: owner or admin, Create: owner, Update: admin
    match /withdrawals/{withdrawalId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin'])
      );
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin']);
    }
    
    // Transfers - Read: involved users or admin, Write: system only
    match /transfers/{transferId} {
      allow read: if request.auth != null && (
        resource.data.fromUserId == request.auth.uid ||
        resource.data.toUserId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin'])
      );
      allow write: if false; // Only via Cloud Functions
    }
    
    // Bank Statements - Admin only
    match /bankStatements/{statementId} {
      allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin']);
    }
    
    // Reconciliations - Admin only
    match /reconciliations/{reconId} {
      allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin']);
    }
    
    // Commission Rules - Read: all, Write: admin only
    match /commissionRules/{ruleId} {
      allow read: if true;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin']);
    }
  }
}
```

---

### Tâche 1.2 : Mise à jour /admin/payments/transactions/page.tsx

**État actuel** : Page existante avec données mockées  
**État cible** : Page connectée à Firestore

#### Modifications à apporter

**1. Supprimer les données mockées (ligne 40)**
```typescript
// SUPPRIMER:
const mockTransactions = [...]
```

**2. Ajouter imports Firestore**
```typescript
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  startAfter,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Transaction, TransactionStatus, TransactionType, formatAmount } from '@/types/payments';
```

**3. Remplacer le state (lignes ~50-60)**
```typescript
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [loading, setLoading] = useState(true);
const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
const [hasMore, setHasMore] = useState(true);

// Analytics state
const [analytics, setAnalytics] = useState({
  totalVolume: 0,
  totalTransactions: 0,
  successfulTransactions: 0,
  failedTransactions: 0,
  platformRevenue: 0,
  averageAmount: 0,
});
```

**4. Ajouter fonction fetchTransactions**
```typescript
const fetchTransactions = async (loadMore = false) => {
  try {
    setLoading(true);

    let q = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(25)
    );

    // Appliquer filtres
    if (statusFilter !== 'all') {
      q = query(q, where('status', '==', statusFilter));
    }
    if (dateFilter?.from) {
      const fromDate = Timestamp.fromDate(dateFilter.from);
      q = query(q, where('createdAt', '>=', fromDate));
    }
    if (dateFilter?.to) {
      const toDate = Timestamp.fromDate(dateFilter.to);
      q = query(q, where('createdAt', '<=', toDate));
    }

    // Pagination
    if (loadMore && lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];

    if (loadMore) {
      setTransactions(prev => [...prev, ...docs]);
    } else {
      setTransactions(docs);
    }

    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    setHasMore(docs.length === 25);
    
    // Calculer analytics
    calculateAnalytics(docs);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    toast({
      title: 'Erreur',
      description: 'Impossible de charger les transactions',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};
```

**5. Ajouter fonction calculateAnalytics**
```typescript
const calculateAnalytics = (txs: Transaction[]) => {
  const totalVolume = txs.reduce((sum, tx) => sum + tx.amount, 0);
  const totalTransactions = txs.length;
  const successfulTransactions = txs.filter(tx => tx.status === 'completed').length;
  const failedTransactions = txs.filter(tx => tx.status === 'failed').length;
  const platformRevenue = txs.reduce((sum, tx) => sum + (tx.feeAmount || 0), 0);
  const averageAmount = totalTransactions > 0 ? totalVolume / totalTransactions : 0;

  setAnalytics({
    totalVolume,
    totalTransactions,
    successfulTransactions,
    failedTransactions,
    platformRevenue,
    averageAmount,
  });
};
```

**6. Ajouter fonction exportToCSV**
```typescript
const exportToCSV = async () => {
  try {
    setExporting(true);

    // Fetch all transactions
    let q = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc')
    );

    if (statusFilter !== 'all') {
      q = query(q, where('status', '==', statusFilter));
    }

    const snapshot = await getDocs(q);
    const allTransactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];

    // Generate CSV
    const headers = ['ID', 'Date', 'Type', 'Status', 'User', 'Amount', 'Fee', 'Net', 'Method', 'Description'];
    const rows = allTransactions.map(tx => [
      tx.id,
      format(tx.createdAt.toDate(), 'dd/MM/yyyy HH:mm'),
      tx.type,
      tx.status,
      tx.userId,
      formatAmount(tx.amount),
      tx.feeAmount ? formatAmount(tx.feeAmount) : '0 €',
      tx.netAmount ? formatAmount(tx.netAmount) : formatAmount(tx.amount),
      tx.paymentMethod,
      tx.description,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  } catch (error) {
    console.error('Error exporting CSV:', error);
  } finally {
    setExporting(false);
  }
};
```

**7. Modifier le tableau pour utiliser le nouveau format**
```typescript
// Remplacer les colonnes pour utiliser Transaction type
<TableCell>{format(tx.createdAt.toDate(), 'dd/MM/yyyy HH:mm')}</TableCell>
<TableCell className="font-mono text-xs">{tx.id.slice(0, 12)}...</TableCell>
<TableCell>{tx.type}</TableCell>
<TableCell>{formatAmount(tx.amount)}</TableCell>
<TableCell>
  <div className="text-sm">
    <div>Plateforme: {formatAmount(tx.feeAmount || 0)}</div>
    <div className="text-muted-foreground">Stripe: {formatAmount(tx.netAmount ? tx.amount - tx.netAmount : 0)}</div>
  </div>
</TableCell>
<TableCell><Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge></TableCell>
```

**8. Ajouter useEffect pour fetch initial**
```typescript
useEffect(() => {
  if (user && user.roles?.includes(UserRole.admin)) {
    fetchTransactions(false);
  }
}, [user]); // eslint-disable-line react-hooks/exhaustive-deps
```

**9. Ajouter bouton "Load More" en bas du tableau**
```typescript
{hasMore && (
  <div className="mt-4 flex justify-center">
    <Button
      variant="outline"
      onClick={() => fetchTransactions(true)}
      disabled={loading}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Charger plus
    </Button>
  </div>
)}
```

**10. Ajouter cartes Analytics en haut**
```typescript
{/* Analytics Cards */}
<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
      <DollarSign className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{formatAmount(analytics.totalVolume)}</div>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Transactions</CardTitle>
      <TrendingUp className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{analytics.totalTransactions}</div>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Taux Succès</CardTitle>
      <CreditCard className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {analytics.totalTransactions > 0
          ? Math.round((analytics.successfulTransactions / analytics.totalTransactions) * 100)
          : 0}%
      </div>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Échecs</CardTitle>
      <AlertCircle className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{analytics.failedTransactions}</div>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Revenus Plateforme</CardTitle>
      <DollarSign className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{formatAmount(analytics.platformRevenue)}</div>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Montant Moyen</CardTitle>
      <DollarSign className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{formatAmount(Math.round(analytics.averageAmount))}</div>
    </CardContent>
  </Card>
</div>
```

#### Résultat attendu
- ✅ Chargement transactions depuis Firestore
- ✅ Pagination avec "Load More"
- ✅ Filtres fonctionnels (status, date, search)
- ✅ Analytics calculées en temps réel
- ✅ Export CSV complet
- ✅ Performance optimisée avec indices

---

### Tâche 1.3 : Créer /admin/payments/payouts/page.tsx

**Description**: Page de gestion des virements vers professionnels

#### Fonctionnalités clés
1. Liste payouts avec filtres (status, professional, date)
2. Validation admin (approve/reject)
3. Détection fraude avec score
4. Export SEPA pour banque
5. Historique rejets

#### Composants UI
- Table payouts avec colonnes :
  * Professional (nom + SIRET)
  * Montant brut / Commission / Net
  * IBAN masqué
  * Status badge
  * Fraud score indicator
  * Actions (approve, reject, review)
- Dialog validation avec :
  * Vérification données pro
  * Historique transactions incluses
  * Notes admin
- Dialog rejet avec raison

#### Queries Firestore
```typescript
// Fetch payouts
const q = query(
  collection(db, 'payouts'),
  where('status', '==', 'pending'),
  orderBy('createdAt', 'desc'),
  limit(25)
);

// Fetch professional data
const proDoc = await getDoc(doc(db, 'professionals', payoutData.professionalId));
const userData = await getDoc(doc(db, 'users', payoutData.userId));
```

#### Actions admin
```typescript
// Approve payout
await updateDoc(doc(db, 'payouts', payoutId), {
  status: 'approved',
  approvedBy: adminId,
  approvedAt: Timestamp.now(),
});

// Reject payout
await updateDoc(doc(db, 'payouts', payoutId), {
  status: 'rejected',
  rejectedBy: adminId,
  rejectedAt: Timestamp.now(),
  rejectionReason: reason,
});
```

---

### Tâche 1.4 : Créer /admin/payments/transfers/page.tsx

**Description**: Monitoring transferts entre comptes en temps réel

#### Fonctionnalités
- Liste transfers avec filtres
- Vue détail transfer (from → to)
- Graphique évolution transfers
- Alertes échecs

---

### Tâche 1.5 : Créer /admin/payments/recon/page.tsx

**Description**: Réconciliation bancaire automatique

#### Fonctionnalités complexes
1. Upload CSV relevé bancaire
2. Parsing automatique lignes
3. Matching algorithm (fuzzy matching)
4. Vue écarts
5. Validation manuelle admin
6. Export rapport PDF

#### Algorithm matching
```typescript
function matchTransactions(bankEntry, platformTransactions) {
  const matches = [];
  
  for (const tx of platformTransactions) {
    let score = 0;
    
    // Montant exact
    if (Math.abs(bankEntry.amount - tx.amount) < 100) score += 50;
    
    // Date proche (±3 jours)
    const daysDiff = Math.abs(bankEntry.date - tx.createdAt) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 3) score += 30;
    
    // Description similaire (Levenshtein)
    const similarity = levenshtein(bankEntry.description, tx.description);
    score += (1 - similarity / 100) * 20;
    
    if (score >= 70) {
      matches.push({ transactionId: tx.id, confidence: score });
    }
  }
  
  return matches.sort((a, b) => b.confidence - a.confidence);
}
```

---

## 🎯 Sprint 2 : User Wallet (Semaines 3-4)

### Tâche 2.1 : Créer /dashboard/wallet/page.tsx

**Description**: Portefeuille utilisateur principal

#### UI Components
1. **Header**
   - Solde disponible (grand format)
   - Solde en attente
   - Total

2. **Graphique**
   - Évolution solde (30 derniers jours)
   - Dépenses vs Revenus (si pro)

3. **Actions rapides**
   - Ajouter fonds (→ modal Stripe)
   - Retirer (→ /wallet/withdraw)
   - Historique (→ /wallet/transactions)

4. **Dernières transactions** (5 récentes)
   - Type, montant, date, statut

#### Firestore queries
```typescript
// Fetch wallet
const walletDoc = await getDoc(doc(db, 'wallets', userId));

// Fetch recent transactions
const q = query(
  collection(db, 'transactions'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(5)
);
```

#### Stripe integration - Add Funds
```typescript
// Client-side
const handleAddFunds = async (amount: number) => {
  const response = await fetch('/api/stripe/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({ amount, currency: 'eur', userId }),
  });
  
  const { clientSecret } = await response.json();
  
  // Stripe Elements UI
  const { error } = await stripe.confirmCardPayment(clientSecret);
  
  if (!error) {
    toast({ title: 'Fonds ajoutés avec succès' });
    refreshWallet();
  }
};
```

---

### Tâche 2.2 : Créer /dashboard/wallet/transactions/page.tsx

**Description**: Historique complet transactions utilisateur

#### Features
- Pagination infinie
- Filtres (type, status, date)
- Recherche par description
- Export PDF/CSV
- Catégorisation dépenses (si activée)

---

### Tâche 2.3 : Créer /dashboard/wallet/payouts/page.tsx

**Description**: Gestion retraits professionnels

#### Restricted access
```typescript
if (!user?.roles?.includes(UserRole.professional)) {
  return <Redirect to="/dashboard/wallet" />;
}
```

#### Features
1. Demander virement
   - Montant disponible au retrait
   - Compte bancaire sélectionné (ou ajouter)
   - Commission plateforme affichée
   - Délai estimé (3-5 jours ouvrés)

2. Historique virements
   - Liste avec statuts
   - Tracking (pending → processing → paid)

3. Gestion comptes bancaires
   - Ajouter IBAN
   - Vérifier compte (micro-deposits)
   - Définir par défaut

---

### Tâche 2.4 : Créer /dashboard/wallet/withdraw/page.tsx

**Description**: Retrait vers carte bancaire (clients)

#### Features
- Sélection montant
- Calcul frais (ex: 2% min 0.50€)
- Montant net reçu
- Délai (1-3 jours)
- Confirmation

---

## 🎯 Sprint 3 : Stripe Integration (Semaines 5-6)

### Tâche 3.1 : Configuration Stripe

#### Variables environnement (.env.local)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
```

#### Installation packages
```bash
pnpm add @stripe/stripe-js stripe
```

---

### Tâche 3.2 : API Routes

**1. /api/stripe/create-payment-intent**
```typescript
// Add funds to wallet
export async function POST(req: Request) {
  const { amount, currency, userId } = await req.json();
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: { userId, type: 'deposit' },
    automatic_payment_methods: { enabled: true },
  });
  
  return Response.json({ clientSecret: paymentIntent.client_secret });
}
```

**2. /api/stripe/create-payout**
```typescript
// Create payout to professional
export async function POST(req: Request) {
  const { amount, professionalId, stripeAccountId } = await req.json();
  
  const payout = await stripe.payouts.create(
    { amount, currency: 'eur' },
    { stripeAccount: stripeAccountId }
  );
  
  // Update Firestore
  await addDoc(collection(db, 'payouts'), {
    professionalId,
    amount,
    status: 'processing',
    stripePayoutId: payout.id,
    createdAt: Timestamp.now(),
  });
  
  return Response.json({ payoutId: payout.id });
}
```

**3. /api/stripe/webhook**
```typescript
// Handle Stripe events
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  
  const event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    case 'payout.paid':
      await handlePayoutPaid(event.data.object);
      break;
    case 'payout.failed':
      await handlePayoutFailed(event.data.object);
      break;
  }
  
  return Response.json({ received: true });
}
```

---

### Tâche 3.3 : Cloud Functions (si nécessaire)

**functions/src/payments.ts**

```typescript
// On payout approval, create Stripe payout
export const processApprovedPayout = functions.firestore
  .document('payouts/{payoutId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Si status changed to 'approved'
    if (before.status !== 'approved' && after.status === 'approved') {
      const { amount, professionalId } = after;
      
      // Get professional Stripe account
      const proDoc = await admin.firestore()
        .collection('professionals')
        .doc(professionalId)
        .get();
      
      const stripeAccountId = proDoc.data()?.stripeConnectAccountId;
      
      if (!stripeAccountId) {
        throw new Error('No Stripe account for professional');
      }
      
      // Create Stripe payout
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const payout = await stripe.payouts.create(
        { amount, currency: 'eur', method: 'instant' },
        { stripeAccount: stripeAccountId }
      );
      
      // Update payout doc
      await change.after.ref.update({
        status: 'processing',
        stripePayoutId: payout.id,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

// On transaction created, update wallet balance
export const updateWalletBalance = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate(async (snap, context) => {
    const transaction = snap.data();
    const { userId, type, amount, status } = transaction;
    
    if (status !== 'completed') return;
    
    const walletRef = admin.firestore().collection('wallets').doc(userId);
    
    // Increment or decrement based on type
    const increment = ['payment', 'deposit', 'refund'].includes(type) 
      ? amount 
      : -amount;
    
    await walletRef.update({
      balance: admin.firestore.FieldValue.increment(increment),
      totalBalance: admin.firestore.FieldValue.increment(increment),
      totalTransactions: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
```

---

## 📝 Checklist Phase 1

### Setup
- [ ] Créer collections Firestore (9 collections)
- [ ] Créer indices composites
- [ ] Configurer règles sécurité
- [ ] Installer packages Stripe
- [ ] Configurer variables env

### Admin Pages
- [ ] `/admin/payments/transactions` - Connecter Firestore ✅ (instructions fournies)
- [ ] `/admin/payments/payouts` - Créer page
- [ ] `/admin/payments/transfers` - Créer page
- [ ] `/admin/payments/recon` - Créer page

### User Pages
- [ ] `/dashboard/wallet` - Créer page
- [ ] `/dashboard/wallet/transactions` - Créer page
- [ ] `/dashboard/wallet/payouts` - Créer page
- [ ] `/dashboard/wallet/withdraw` - Créer page

### API Routes
- [ ] `/api/stripe/create-payment-intent`
- [ ] `/api/stripe/create-payout`
- [ ] `/api/stripe/webhook`
- [ ] `/api/stripe/connect/onboard`

### Cloud Functions
- [ ] `processApprovedPayout`
- [ ] `updateWalletBalance`
- [ ] `calculateDailyAnalytics`

### Tests
- [ ] Tests unitaires helpers (formatAmount, calculateCommission)
- [ ] Tests E2E wallet flow
- [ ] Tests E2E payout flow
- [ ] Tests webhook Stripe

### Documentation
- [ ] Guide utilisation wallet (users)
- [ ] Guide gestion payouts (admins)
- [ ] Guide intégration Stripe
- [ ] Clés traduction FR/EN/JA

---

## 🚀 Déploiement

### Prérequis
1. Compte Stripe en mode test
2. Stripe Connect activé
3. Webhooks configurés
4. Firebase plan Blaze (Cloud Functions)

### Steps
1. Deploy Firestore rules
2. Deploy Cloud Functions
3. Configure Stripe webhooks
4. Test en environnement staging
5. Deploy production

---

## 📚 Ressources

- [Stripe Docs - Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Docs - Payouts](https://stripe.com/docs/payouts)
- [Stripe Docs - Connect](https://stripe.com/docs/connect)
- [Firebase Docs - Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Docs - Cloud Functions](https://firebase.google.com/docs/functions)

---

**Estimation totale Phase 1** : 6 semaines (120h de dev)

**Prochaine étape** : Commencer par Tâche 1.1 (Collections Firestore) puis Tâche 1.2 (Connexion /admin/payments/transactions).
