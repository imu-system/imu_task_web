# Firestore Collections Setup - Phase 1

## ✅ Fichiers créés

1. **`firestore-payments.rules`** - Règles de sécurité (11 collections)
2. **`firestore-payments.indexes.json`** - 36 indices composites
3. **`src/lib/crypto.ts`** - Chiffrement IBAN
4. **`scripts/deploy-firestore-payments.sh`** - Script de déploiement
5. **`src/types/payments.ts`** - Types TypeScript (déjà existant)

## 🚀 Déploiement rapide

```bash
# Donner permissions
chmod +x scripts/deploy-firestore-payments.sh

# Déployer
./scripts/deploy-firestore-payments.sh
```

## 📊 Collections

| Collection | Description | Indices |
|------------|-------------|---------|
| `transactions` | Toutes les transactions | 8 |
| `payouts` | Virements pros | 5 |
| `wallets` | Portefeuilles | 0 |
| `bankAccounts` | IBANs (chiffrés) | 3 |
| `withdrawals` | Retraits users | 3 |
| `transfers` | Transferts internes | 4 |
| `bankStatements` | Relevés bancaires | 2 |
| `bankStatementEntries` | Lignes relevés | 2 |
| `reconciliations` | Rapports récon | 2 |
| `commissionRules` | Règles commissions | 2 |
| `paymentAnalytics` | Métriques | 1 |

## 🔒 Sécurité

- **Transactions**: Read (owner/admin), Write (système uniquement)
- **Payouts**: Create (pro), Update (admin)
- **Wallets**: Read (owner/admin), Write (système)
- **BankAccounts**: Read/Write (owner/admin), IBAN chiffré
- **Withdrawals**: Create (user), Update (admin)

## 🎯 Prochaine étape

Connecter `/admin/payments/transactions` à Firestore (voir `docs/PHASE1_IMPLEMENTATION_PLAN.md`)
