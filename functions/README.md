# Cloud Functions - IMU Task Web

## 📋 Vue d'ensemble

Cloud Functions pour automatiser et optimiser le système de notifications.

### Fonctions disponibles

| Fonction | Type | Description | Fréquence |
|----------|------|-------------|-----------|
| `cleanupOldNotifications` | Scheduled | Supprime les notifications > 30 jours | Quotidien (2 AM) |
| `updateNotificationCounters` | Firestore Trigger | Met à jour les compteurs utilisateur | Temps réel |
| `sendPushNotification` | Firestore Trigger | Envoie push FCM sur création | Temps réel |
| `sendDailyDigest` | Scheduled | Envoie email résumé quotidien | Quotidien (8 AM) |

## 🚀 Installation

### 1. Installer les dépendances

```bash
cd functions
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

## 🔧 Configuration

### Variables d'environnement

```bash
# Dans Firebase Console > Functions > Configuration
firebase functions:config:set email.from="noreply@imu-task.web.app"
firebase functions:config:set email.provider="sendgrid"
firebase functions:config:set email.api_key="YOUR_API_KEY"
```

### Timezone

Toutes les fonctions scheduled utilisent `Europe/Paris`.

## 📦 Déploiement

### Déployer toutes les fonctions

```bash
npm run deploy
```

### Déployer une fonction spécifique

```bash
firebase deploy --only functions:cleanupOldNotifications
firebase deploy --only functions:updateNotificationCounters
firebase deploy --only functions:sendPushNotification
firebase deploy --only functions:sendDailyDigest
```

## 🧪 Tests locaux

### Lancer l'émulateur

```bash
npm run serve
```

Accès à l'interface: http://localhost:4000

### Tester une fonction HTTP

```bash
curl http://localhost:5001/imu-task/europe-west1/cleanupOldNotifications
```

## 📊 Monitoring

### Voir les logs

```bash
# Tous les logs
npm run logs

# Logs d'une fonction spécifique
firebase functions:log --only cleanupOldNotifications

# Logs en temps réel
firebase functions:log --only sendPushNotification --follow
```

### Métriques Firebase Console

- **Invocations**: Nombre d'exécutions
- **Durée**: Temps d'exécution moyen
- **Mémoire**: Utilisation RAM
- **Erreurs**: Taux d'échec

## 🔒 Sécurité

### Permissions requises

Les Cloud Functions nécessitent:
- `firestore.documents.read` - Lecture Firestore
- `firestore.documents.write` - Écriture Firestore
- `cloudmessaging.messages.create` - Envoi FCM
- `firebaseauth.users.get` - Lecture utilisateurs

### Rate limiting

Les fonctions Firestore Trigger sont automatiquement rate-limited par Firebase.

## 💰 Coûts

### Free Tier (Spark Plan)

- **Invocations**: 2M/mois
- **GB-seconds**: 400K/mois
- **Réseau sortant**: 5 GB/mois

### Estimation mensuelle (Blaze Plan)

| Fonction | Invocations/jour | Coût/mois |
|----------|------------------|-----------|
| cleanupOldNotifications | 1 | ~$0.01 |
| updateNotificationCounters | 10,000 | ~$0.40 |
| sendPushNotification | 5,000 | ~$0.20 |
| sendDailyDigest | 1 | ~$0.01 |
| **TOTAL** | | **~$0.62/mois** |

## 🐛 Debugging

### Erreurs communes

**1. Module not found**
```bash
cd functions && npm install
```

**2. Permission denied**
```bash
firebase login
firebase use --add
```

**3. Timeout (>60s)**
```typescript
export const myFunction = functions
  .runWith({ timeoutSeconds: 300 })
  .https.onRequest(...);
```

## 📚 Documentation

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Cloud Scheduler](https://cloud.google.com/scheduler/docs)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)

## 🔄 Workflow CI/CD

```yaml
# .github/workflows/deploy-functions.yml
name: Deploy Cloud Functions

on:
  push:
    branches: [main]
    paths:
      - 'functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: cd functions && npm ci
      - name: Build
        run: cd functions && npm run build
      - name: Deploy
        run: firebase deploy --only functions
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## 📝 Changelog

### Version 1.0.0 (5 Oct 2025)

- ✅ Cleanup old notifications (30+ days)
- ✅ Real-time counter updates
- ✅ FCM push notifications
- ✅ Daily email digest

---

**Maintenu par**: IMU Task Team  
**Support**: support@imu-task.web.app
