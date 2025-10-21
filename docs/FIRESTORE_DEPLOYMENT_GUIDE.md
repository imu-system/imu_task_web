# 🔥 Déploiement Collections Firestore - Paiements

Guide de déploiement pour les collections de paiements (Phase 1).

---

## 📋 Pré-requis

### 1. Firebase CLI

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Vérifier l'installation
firebase --version

# Se connecter
firebase login

# Lister les projets disponibles
firebase projects:list
```

### 2. Sélectionner le projet

```bash
# Sélectionner le projet imu_task_web
firebase use <project-id>

# Vérifier le projet actif
firebase projects:list
```

---

## 🚀 Méthode 1 : Script automatique (Recommandé)

### Dry run (test sans déployer)

```bash
# Donner les permissions d'exécution
chmod +x scripts/deploy-firestore-payments.sh

# Tester sans déployer
./scripts/deploy-firestore-payments.sh --dry-run
```

### Déploiement complet

```bash
# Déployer règles + indices
./scripts/deploy-firestore-payments.sh
```

### Déploiement partiel

```bash
# Seulement les règles
./scripts/deploy-firestore-payments.sh --rules-only

# Seulement les indices
./scripts/deploy-firestore-payments.sh --indexes-only
```

---

## 🔧 Méthode 2 : Déploiement manuel

### Étape 1 : Fusionner les règles

```bash
# 1. Ouvrir firestore.rules
code firestore.rules

# 2. Ouvrir firestore-payments.rules
code firestore-payments.rules

# 3. Copier les helper functions de firestore-payments.rules
#    vers le début de firestore.rules (après rules_version)

# 4. Copier tous les match {} blocks de firestore-payments.rules
#    dans le service cloud.firestore {} de firestore.rules
```

### Étape 2 : Fusionner les indices

```bash
# Option A: Script Node.js
node scripts/merge-firestore-indexes.js

# Option B: Manuellement
# 1. Ouvrir firestore.indexes.json et firestore-payments.indexes.json
# 2. Copier tous les objets du tableau "indexes" de payments vers le fichier principal
# 3. Copier tous les objets du tableau "fieldOverrides"
# 4. Vérifier qu'il n'y a pas de doublons
```

### Étape 3 : Déployer

```bash
# Déployer les règles
firebase deploy --only firestore:rules

# Déployer les indices
firebase deploy --only firestore:indexes
```

---

## ✅ Vérifications post-déploiement

### 1. Console Firebase

```bash
# Ouvrir la console
open https://console.firebase.google.com/project/<project-id>/firestore
```

**Vérifier dans l'interface :**

1. **Firestore → Règles**
   - Les règles doivent être publiées
   - Vérifier la date de dernière publication
   - Pas d'erreurs de syntaxe

2. **Firestore → Indices**
   - Vérifier que les nouveaux indices sont en cours de création
   - Statut : "Building" → "Enabled" (5-10 minutes)
   - Total attendu : ~36 indices composites

### 2. Test des règles de sécurité

Créer un fichier de test : `tests/firestore.rules.test.ts`

```typescript
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
// TODO: Implémenter tests

// Test 1: User ne peut pas modifier transactions
await assertFails(
  updateDoc(doc(db, 'transactions', txId), { amount: 99999 })
);

// Test 2: Professional peut créer payout
await assertSucceeds(
  addDoc(collection(db, 'payouts'), {
    professionalId: userId,
    status: 'pending',
    netAmount: 5000
  })
);

// Test 3: User ne peut pas modifier wallet balance
await assertFails(
  updateDoc(doc(db, 'wallets', userId), { balance: 999999 })
);

// Test 4: User peut ajouter son IBAN
await assertSucceeds(
  addDoc(collection(db, 'bankAccounts'), {
    userId: currentUserId,
    iban: encryptedIban,
    status: 'pending'
  })
);
```

### 3. Vérifier les indices

```bash
# Dans la console Firebase, vérifier que tous les indices sont "Enabled"
# Si un indice reste "Building" > 30 minutes, contacter le support
```

---

## 📊 Collections déployées

| Collection | Documents estimés | Règles | Indices |
|------------|------------------|--------|---------|
| `transactions` | 10-50k/mois | ✅ | 8 |
| `payouts` | 1-5k/mois | ✅ | 5 |
| `wallets` | = nb users | ✅ | 0 |
| `bankAccounts` | 500-2k | ✅ | 3 |
| `withdrawals` | 500-3k/mois | ✅ | 3 |
| `transfers` | 5-20k/mois | ✅ | 4 |
| `bankStatements` | 50-200/mois | ✅ | 2 |
| `bankStatementEntries` | 1-5k/mois | ✅ | 2 |
| `reconciliations` | 20-100/mois | ✅ | 2 |
| `commissionRules` | 10-50 | ✅ | 2 |
| `paymentAnalytics` | 30-100/mois | ✅ | 1 |

**Total : 11 collections, ~36 indices composites**

---

## 🔐 Sécurité

### Règles principales

1. **Transactions**
   - ✅ Read: Propriétaire ou Admin
   - ❌ Create: Système uniquement
   - ⚠️ Update: Admin (champs limités)
   - ❌ Delete: Interdit

2. **Payouts**
   - ✅ Read: Professionnel ou Admin
   - ✅ Create: Professionnel (status = pending)
   - ⚠️ Update: Admin (approve/reject)
   - ⚠️ Delete: Admin si pending

3. **Wallets**
   - ✅ Read: Propriétaire ou Admin
   - ❌ Write: Système uniquement

4. **BankAccounts**
   - ✅ Read: Propriétaire ou Admin
   - ✅ Create: Utilisateur (son compte)
   - ⚠️ Update: Propriétaire (isDefault) ou Admin
   - ✅ Delete: Propriétaire ou Admin

### Chiffrement IBAN

Les IBANs sont chiffrés côté client avant stockage :

```typescript
import { encrypt, maskIban } from '@/lib/crypto';

// Chiffrer avant envoi
const encryptedIban = await encrypt(iban, userKey);
const maskedIban = maskIban(iban);

await addDoc(collection(db, 'bankAccounts'), {
  iban: encryptedIban,  // Chiffré
  maskedIban,           // Pour affichage
  // ...
});
```

---

## 🐛 Troubleshooting

### Erreur : "Missing or insufficient permissions"

**Cause** : Les règles ne sont pas déployées correctement.

**Solution** :
```bash
# Re-déployer les règles
firebase deploy --only firestore:rules

# Vérifier dans la console Firebase
```

### Erreur : "The query requires an index"

**Cause** : Un indice composite manque.

**Solution** :
```bash
# Cliquer sur le lien dans l'erreur pour créer l'indice automatiquement
# OU re-déployer les indices
firebase deploy --only firestore:indexes
```

### Les indices restent "Building" longtemps

**Normal** : La création peut prendre 5-30 minutes selon le volume de données.

**Problème** : Si > 1 heure, vérifier :
1. Console Firebase → Firestore → Indices
2. Statut de chaque indice
3. Erreurs éventuelles

**Solution** :
```bash
# Supprimer et recréer l'indice problématique
firebase firestore:indexes
```

### Erreur de fusion des règles

**Cause** : Conflit avec les règles existantes.

**Solution** :
```bash
# Utiliser le backup pour restaurer
cp firestore-backup-YYYYMMDD-HHMMSS/firestore.rules.backup firestore.rules

# Fusionner manuellement avec attention
```

---

## 📚 Documentation

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

## 🎯 Prochaines étapes

Après le déploiement réussi :

1. ✅ Marquer la tâche "Phase 1 - Firestore Collections Setup" comme complétée
2. 🚀 Commencer l'implémentation des pages :
   - `/admin/payments/transactions` (connecter Firestore)
   - `/admin/payments/payouts`
   - `/admin/payments/transfers`
   - `/admin/payments/recon`
3. 🔌 Configurer Stripe integration
4. 🧪 Tests E2E des flux de paiement

---

**Status** : ✅ Prêt pour déploiement  
**Durée estimée** : 15-30 minutes (+ 5-30 min création indices)  
**Dernière mise à jour** : 20 octobre 2025
