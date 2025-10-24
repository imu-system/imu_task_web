# Configuration des Webhooks Stripe

## Vue d'ensemble

L'endpoint webhook Stripe (`/api/webhooks/stripe`) gère les événements en temps réel de Stripe pour synchroniser l'état des paiements, virements et litiges avec la base de données Firestore.

## Événements gérés

### Paiements

| Événement | Description | Actions |
|-----------|-------------|---------|
| `payment_intent.succeeded` | Paiement réussi | ✅ Met à jour le statut de la transaction<br>📧 Notifie l'utilisateur |
| `payment_intent.payment_failed` | Échec du paiement | ❌ Marque la transaction comme échouée<br>📧 Alerte l'utilisateur |
| `charge.refunded` | Remboursement effectué | 💸 Met à jour le montant remboursé<br>📧 Notifie l'utilisateur |

### Virements (Payouts)

| Événement | Description | Actions |
|-----------|-------------|---------|
| `payout.paid` | Virement effectué | ✅ Met à jour le statut du payout<br>📧 Notifie le professionnel |
| `payout.failed` | Échec du virement | ❌ Marque le payout comme échoué<br>🚨 Alerte le professionnel et les admins |

### Comptes Stripe Connect

| Événement | Description | Actions |
|-----------|-------------|---------|
| `account.updated` | Compte mis à jour | 🔄 Synchronise le statut des comptes bancaires<br>✅ Met à jour charges_enabled/payouts_enabled |

### Litiges (Disputes)

| Événement | Description | Actions |
|-----------|-------------|---------|
| `charge.dispute.created` | Nouveau litige | 🆕 Crée un enregistrement de litige<br>🚨 Alerte les admins et le professionnel |
| `charge.dispute.updated` | Litige mis à jour | 🔄 Synchronise le statut |
| `charge.dispute.closed` | Litige résolu | ✅ Marque comme gagné/perdu<br>📧 Notifie l'issue du litige |

## Configuration

### 1. Variables d'environnement

Ajoutez ces variables dans `.env.local` :

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...              # Clé secrète Stripe
STRIPE_WEBHOOK_SECRET=whsec_...            # Secret du webhook

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 2. Création du webhook dans Stripe Dashboard

1. Allez dans [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur **"Add endpoint"**
3. Configurez l'endpoint :
   - **URL** : `https://votre-domaine.com/api/webhooks/stripe`
   - **Description** : "IMU Task - Production Webhooks"
   - **Version** : Latest API version (`2025-09-30.clover`)

4. Sélectionnez les événements à écouter :

   **Paiements :**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

   **Virements :**
   - `payout.paid`
   - `payout.failed`

   **Comptes :**
   - `account.updated`

   **Litiges :**
   - `charge.dispute.created`
   - `charge.dispute.updated`
   - `charge.dispute.closed`

5. Cliquez sur **"Add endpoint"**
6. Copiez le **Signing secret** (commence par `whsec_...`)
7. Ajoutez-le dans `.env.local` comme `STRIPE_WEBHOOK_SECRET`

### 3. Test en développement (avec Stripe CLI)

Pour tester les webhooks en local :

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks (forward vers localhost)
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe

# Dans un autre terminal, déclencher des événements test
stripe trigger payment_intent.succeeded
stripe trigger payout.paid
stripe trigger charge.dispute.created
```

## Sécurité

### Vérification de la signature

L'endpoint vérifie automatiquement la signature Stripe pour garantir :
- ✅ L'authenticité de l'événement (provient bien de Stripe)
- ✅ L'intégrité du payload (non modifié en transit)
- ❌ Rejet automatique des requêtes sans signature ou avec signature invalide

```typescript
// Le webhook vérifie la signature via :
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

### Logs d'audit

Tous les événements webhook sont enregistrés dans la collection `auditLogs` :

```typescript
{
  action: 'stripe_webhook_received',
  eventType: 'payment_intent.succeeded',
  eventId: 'evt_...',
  livemode: false,
  metadata: { objectId: 'pi_...' },
  createdAt: Timestamp
}
```

## Notifications

Le webhook envoie automatiquement des notifications Firestore aux utilisateurs concernés :

| Événement | Destinataire | Priorité |
|-----------|--------------|----------|
| Paiement réussi | Client | Medium |
| Paiement échoué | Client | Medium |
| Remboursement | Client | Medium |
| Virement effectué | Professionnel | Medium |
| Virement échoué | Professionnel + Admins | **High** 🚨 |
| Nouveau litige | Professionnel + Admins | **High** 🚨 |
| Litige résolu | Professionnel | Medium |

## Monitoring

### Vérifier les webhooks dans Stripe

1. Allez dans **Developers > Webhooks**
2. Cliquez sur votre endpoint
3. Consultez l'onglet **"Recent deliveries"**
4. Vérifiez :
   - ✅ Status code 200 = succès
   - ❌ Status code 4xx/5xx = erreur

### Logs dans l'application

Les logs détaillés sont disponibles dans la console :

```
[Stripe Webhook] Received event: payment_intent.succeeded (evt_...)
[Webhook] Payment Intent succeeded: pi_...
[Webhook] Transaction tx_... updated to succeeded
[Webhook] Notification sent to user uid_...: payment_success
```

### Retry automatique

Stripe retry automatiquement les webhooks échoués :
- 1er retry : immédiat
- 2ème retry : 1 heure plus tard
- 3ème retry : 3 heures plus tard
- Jusqu'à 3 jours maximum

## Dépannage

### ❌ Erreur : "Missing Stripe signature"

**Cause** : L'en-tête `stripe-signature` est absent

**Solution** : Vérifiez que la requête provient bien de Stripe Dashboard ou Stripe CLI

---

### ❌ Erreur : "Webhook signature verification failed"

**Cause** : Le secret webhook est incorrect ou la requête a été modifiée

**Solutions** :
1. Vérifiez `STRIPE_WEBHOOK_SECRET` dans `.env.local`
2. Copiez à nouveau le secret depuis Stripe Dashboard
3. Redémarrez le serveur Next.js

---

### ❌ Erreur : "No transaction found for payment intent"

**Cause** : La transaction n'existe pas encore dans Firestore

**Solutions** :
1. Vérifiez que la transaction a été créée avant le webhook
2. Vérifiez que `stripePaymentIntentId` est bien stocké
3. Consultez les logs Firestore

---

### 🐌 Webhooks lents ou timeout

**Causes possibles** :
- Trop d'opérations Firestore
- Requêtes Stripe API multiples
- Notifications multiples

**Solutions** :
1. Optimisez les requêtes Firestore (utilisez `where` + `limit`)
2. Utilisez `Promise.all()` pour paralléliser
3. Évitez les appels API Stripe inutiles

---

### 📧 Notifications non reçues

**Vérifications** :
1. Vérifiez que la collection `notifications` existe
2. Vérifiez que `userId` est correct dans la transaction
3. Consultez les logs : `[Webhook] Notification sent to user...`
4. Vérifiez les règles Firestore pour `notifications`

## Collections Firestore impactées

| Collection | Opérations | Événements déclencheurs |
|------------|-----------|-------------------------|
| `transactions` | Update (status, timestamps) | payment_intent.*, charge.refunded |
| `payouts` | Update (status, timestamps, error) | payout.paid, payout.failed |
| `bankAccounts` | Update (status, metadata) | account.updated |
| `disputes` | Create, Update | charge.dispute.* |
| `notifications` | Create | Tous les événements |
| `auditLogs` | Create | Tous les événements |

## Exemples de payloads

### payment_intent.succeeded

```json
{
  "id": "evt_...",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_...",
      "amount": 5000,
      "currency": "eur",
      "status": "succeeded",
      "latest_charge": "ch_..."
    }
  }
}
```

### payout.failed

```json
{
  "id": "evt_...",
  "type": "payout.failed",
  "data": {
    "object": {
      "id": "po_...",
      "amount": 12500,
      "currency": "eur",
      "status": "failed",
      "failure_code": "insufficient_funds",
      "failure_message": "Insufficient funds in Stripe account"
    }
  }
}
```

### charge.dispute.created

```json
{
  "id": "evt_...",
  "type": "charge.dispute.created",
  "data": {
    "object": {
      "id": "dp_...",
      "charge": "ch_...",
      "amount": 5000,
      "currency": "eur",
      "reason": "fraudulent",
      "status": "needs_response",
      "evidence_details": {
        "due_by": 1672531200
      }
    }
  }
}
```

## Ressources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Best practices for webhooks](https://stripe.com/docs/webhooks/best-practices)
- [Testing webhooks](https://stripe.com/docs/webhooks/test)

## Support

En cas de problème :
1. Consultez les logs dans Stripe Dashboard > Webhooks
2. Vérifiez les logs serveur Next.js
3. Consultez les logs Firestore dans Firebase Console
4. Contactez l'équipe technique avec l'ID de l'événement webhook
