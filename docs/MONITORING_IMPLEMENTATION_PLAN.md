# Configuration du Monitoring Firebase - Plan d'Implémentation

## 📋 Vue d'Ensemble

Ce document détaille les étapes pour configurer le monitoring complet du système d'authentification et de gestion des rôles utilisateurs dans Firebase.

## 🎯 Objectifs

1. **Performance Monitoring** : Tracker la durée des opérations auth et Firestore
2. **Analytics Events** : Collecter des événements custom pour l'analyse
3. **Error Tracking** : Capturer et analyser les erreurs en production
4. **Alertes** : Recevoir des notifications pour les incidents critiques

## 1️⃣ Performance Monitoring

### Installation

```bash
# Firebase Performance déjà inclus dans firebase package
# Vérifier dans package.json
pnpm list firebase
```

### Configuration

Créer `/src/lib/performance-monitoring.ts` :

```typescript
import { getPerformance, trace } from 'firebase/performance';
import { app } from './firebase';

const perf = getPerformance(app);

/**
 * Wrapper pour tracer une opération d'authentification
 */
export async function traceAuthOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, string>
): Promise<T> {
  const t = trace(perf, operationName);
  
  // Ajouter des attributs personnalisés
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      t.putAttribute(key, value);
    });
  }
  
  t.start();
  
  try {
    const result = await operation();
    t.stop();
    return result;
  } catch (error) {
    t.putAttribute('error', 'true');
    t.stop();
    throw error;
  }
}

/**
 * Wrapper pour tracer une opération Firestore
 */
export async function traceFirestoreOperation<T>(
  collection: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  return traceAuthOperation(
    `firestore_${collection}_${operation}`,
    fn,
    { collection, operation }
  );
}
```

### Intégration dans AuthContext

Modifier `/src/contexts/AuthContext.tsx` :

```typescript
import { traceAuthOperation } from '@/lib/performance-monitoring';

// Dans la fonction signUp
const signUp = async (email: string, password: string, displayName?: string) => {
  return traceAuthOperation('auth_signup', async () => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(userCredential.user.uid, email, displayName);
    return userCredential.user;
  }, { method: 'email' });
};

// Dans la fonction signIn
const signIn = async (email: string, password: string) => {
  return traceAuthOperation('auth_signin', async () => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }, { method: 'email' });
};

// Dans la fonction signInWithGoogle
const signInWithGoogle = async () => {
  return traceAuthOperation('auth_signin', async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    // ... reste du code
  }, { method: 'google' });
};
```

### Métriques à Tracker

- `auth_signup_duration` : Temps d'inscription
- `auth_signin_duration` : Temps de connexion
- `firestore_users_create` : Création document utilisateur
- `firestore_users_read` : Lecture document utilisateur
- `firestore_users_update` : Mise à jour document utilisateur
- `cloud_function_assign_role` : Durée d'attribution de rôle
- `cloud_function_remove_role` : Durée de retrait de rôle

### Visualisation

1. Firebase Console > Performance
2. Filtrer par traces custom
3. Analyser les percentiles (p50, p90, p99)
4. Identifier les opérations lentes

## 2️⃣ Analytics Events

### Installation

```bash
# Firebase Analytics déjà inclus dans firebase package
pnpm list firebase
```

### Configuration

Créer `/src/lib/analytics-events.ts` :

```typescript
import { getAnalytics, logEvent } from 'firebase/analytics';
import { app } from './firebase';

const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

/**
 * Logger un événement d'authentification
 */
export function logAuthEvent(
  eventName: string,
  params?: Record<string, any>
) {
  if (!analytics) return;
  
  logEvent(analytics, eventName, {
    timestamp: new Date().toISOString(),
    ...params,
  });
}

/**
 * Logger un événement de rôle
 */
export function logRoleEvent(
  action: 'assign' | 'remove' | 'upgrade',
  role: string,
  userId?: string
) {
  if (!analytics) return;
  
  logEvent(analytics, 'role_change', {
    action,
    role,
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Logger un événement de provider
 */
export function logProviderEvent(
  eventName: string,
  params?: Record<string, any>
) {
  if (!analytics) return;
  
  logEvent(analytics, eventName, {
    timestamp: new Date().toISOString(),
    ...params,
  });
}
```

### Événements à Logger

#### Authentification
- `user_signed_up` : Nouvel utilisateur inscrit
- `user_signed_in` : Utilisateur connecté
- `user_signed_out` : Utilisateur déconnecté
- `auth_error` : Erreur d'authentification

#### Rôles
- `role_change` : Changement de rôle (assign/remove)
- `provider_registered` : Client devient prestataire
- `admin_action` : Action admin effectuée

#### Engagement
- `task_created` : Nouvelle mission créée
- `proposal_submitted` : Proposition soumise
- `booking_confirmed` : Réservation confirmée

### Intégration dans le Code

#### AuthContext

```typescript
import { logAuthEvent } from '@/lib/analytics-events';

const signUp = async (email, password, displayName) => {
  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(user.uid, email, displayName);
    
    // Logger l'événement
    logAuthEvent('user_signed_up', {
      method: 'email',
      has_display_name: !!displayName,
    });
    
    return user;
  } catch (error) {
    logAuthEvent('auth_error', {
      error_code: error.code,
      operation: 'signup',
    });
    throw error;
  }
};
```

#### Become Provider Page

```typescript
import { logRoleEvent, logProviderEvent } from '@/lib/analytics-events';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    await addUserRole(user.uid, UserRole.provider);
    await updateUserDocument(uid, { skills, availability, profile });
    
    // Logger les événements
    logRoleEvent('upgrade', 'provider', user.uid);
    logProviderEvent('provider_registered', {
      skills_count: skills.length,
      hourly_rate: hourlyRate,
      has_location: !!location,
    });
    
    setSuccess('Votre compte prestataire a été créé avec succès !');
    router.push('/dashboard/provider');
  } catch (error) {
    // ...
  }
};
```

### Analyse des Données

1. Firebase Console > Analytics > Events
2. Créer des audiences personnalisées (ex: "Prestataires actifs")
3. Configurer des conversions (ex: "provider_registered")
4. Analyser les funnels (signup → provider → first_booking)

## 3️⃣ Error Tracking avec Sentry

### Installation

```bash
pnpm add @sentry/nextjs
```

### Configuration Initiale

```bash
npx @sentry/wizard@latest -i nextjs
```

Le wizard créera automatiquement :
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Modifications dans `next.config.mjs`

### Configuration Custom

Créer `/src/lib/error-tracking.ts` :

```typescript
import * as Sentry from '@sentry/nextjs';

/**
 * Capturer une erreur d'authentification
 */
export function captureAuthError(
  error: any,
  context: {
    operation: string;
    userId?: string;
    metadata?: Record<string, any>;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'auth');
    scope.setTag('operation', context.operation);
    
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }
    
    if (context.metadata) {
      scope.setContext('metadata', context.metadata);
    }
    
    Sentry.captureException(error);
  });
}

/**
 * Capturer une erreur de Cloud Function
 */
export function captureCloudFunctionError(
  error: any,
  context: {
    functionName: string;
    params?: Record<string, any>;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'cloud_function');
    scope.setTag('function_name', context.functionName);
    
    if (context.params) {
      scope.setContext('params', context.params);
    }
    
    Sentry.captureException(error);
  });
}

/**
 * Capturer une erreur de Firestore
 */
export function captureFirestoreError(
  error: any,
  context: {
    collection: string;
    operation: string;
    documentId?: string;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'firestore');
    scope.setTag('collection', context.collection);
    scope.setTag('operation', context.operation);
    
    if (context.documentId) {
      scope.setContext('document', { id: context.documentId });
    }
    
    Sentry.captureException(error);
  });
}
```

### Intégration dans le Code

#### AuthContext

```typescript
import { captureAuthError } from '@/lib/error-tracking';

const signUp = async (email, password, displayName) => {
  try {
    // ... code d'inscription
  } catch (error) {
    captureAuthError(error, {
      operation: 'signup',
      metadata: { has_display_name: !!displayName },
    });
    throw error;
  }
};
```

#### Cloud Functions Client

```typescript
import { captureCloudFunctionError } from '@/lib/error-tracking';

const handleSubmit = async () => {
  try {
    await assignUserRole({ targetUid, role });
  } catch (error) {
    captureCloudFunctionError(error, {
      functionName: 'assignUserRole',
      params: { targetUid, role },
    });
    setError(error.message);
  }
};
```

### Error Boundaries

Créer `/src/components/error-boundary.tsx` :

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    Sentry.withScope((scope) => {
      scope.setContext('errorInfo', errorInfo);
      Sentry.captureException(error);
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container max-w-2xl mx-auto py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Une erreur s'est produite</AlertTitle>
            <AlertDescription>
              Nous avons été notifiés de ce problème et travaillons à le résoudre.
            </AlertDescription>
          </Alert>
          <Button
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Recharger la page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Utiliser dans `/src/app/[locale]/layout.tsx` :

```typescript
import { ErrorBoundary } from '@/components/error-boundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

## 4️⃣ Alertes et Notifications

### Firebase Alerts (Console)

1. Firebase Console > Alerts
2. Créer des alertes pour :
   - **Cloud Functions Errors** : > 10 erreurs/minute
   - **Auth Failures** : > 50 échecs/heure
   - **Performance Degradation** : p99 > 5s
   - **Crashlytics** : Nouveau crash détecté

### Sentry Alerts

1. Sentry Dashboard > Alerts
2. Créer des alertes pour :
   - **High Error Rate** : > 100 erreurs/heure
   - **New Error** : Première occurrence d'une erreur
   - **Regression** : Erreur résolue qui réapparaît
   - **Performance** : Transaction duration > 3s

### Slack Integration

1. Firebase Console > Project Settings > Integrations
2. Configurer Slack webhook
3. Choisir les types de notifications :
   - Déploiements Cloud Functions
   - Alertes critiques
   - Crashlytics

## 5️⃣ Dashboard de Monitoring

### Métriques Clés à Surveiller

#### Authentification
- Taux de conversion signup
- Temps moyen de connexion
- Taux d'échec auth
- Méthodes d'auth préférées (email vs Google)

#### Rôles
- Nombre de providers actifs
- Taux de conversion client → provider
- Temps moyen avant upgrade provider
- Opérations admin par jour

#### Performance
- Durée des Cloud Functions (p50, p90, p99)
- Temps de chargement des pages
- Latence des requêtes Firestore
- Taux d'erreur par endpoint

#### Engagement
- DAU/MAU (Daily/Monthly Active Users)
- Retention 7j, 30j
- Temps moyen de session
- Pages vues par session

### Outils de Visualisation

1. **Firebase Console** : Vue d'ensemble rapide
2. **Sentry Dashboard** : Analyse détaillée des erreurs
3. **Google Analytics** : Comportement utilisateur
4. **Custom Dashboard** : Créer avec Firebase Admin SDK + Chart.js

## 📝 Checklist d'Implémentation

### Phase 1 : Performance Monitoring
- [ ] Créer `performance-monitoring.ts`
- [ ] Intégrer dans AuthContext
- [ ] Tracer les opérations Firestore
- [ ] Tracer les Cloud Functions
- [ ] Vérifier les traces dans Firebase Console

### Phase 2 : Analytics
- [ ] Créer `analytics-events.ts`
- [ ] Logger les événements auth
- [ ] Logger les événements de rôles
- [ ] Logger les événements de provider
- [ ] Configurer les conversions dans Firebase

### Phase 3 : Error Tracking
- [ ] Installer Sentry
- [ ] Créer `error-tracking.ts`
- [ ] Intégrer dans AuthContext
- [ ] Créer Error Boundaries
- [ ] Tester la capture d'erreurs

### Phase 4 : Alertes
- [ ] Configurer Firebase Alerts
- [ ] Configurer Sentry Alerts
- [ ] Intégrer Slack
- [ ] Tester les notifications

### Phase 5 : Dashboard
- [ ] Définir les KPIs
- [ ] Créer des rapports custom
- [ ] Configurer les exports de données
- [ ] Former l'équipe aux outils

## 🚀 Commandes Utiles

```bash
# Tester les traces de performance
pnpm dev
# Naviguer vers /sign-up et compléter le formulaire
# Vérifier Firebase Console > Performance après quelques minutes

# Tester les événements analytics
# Naviguer vers différentes pages
# Vérifier Firebase Console > Analytics > Events (délai 24h)

# Tester Sentry
# Déclencher une erreur intentionnelle
# Vérifier Sentry Dashboard immédiatement

# Déployer les configurations
firebase deploy --only hosting,functions
```

## 📊 Résultats Attendus

Après implémentation complète :

- **Visibilité** : Vue complète des performances et erreurs
- **Réactivité** : Alertes en temps réel pour les incidents
- **Analyse** : Données pour optimiser l'expérience utilisateur
- **Fiabilité** : Détection et résolution rapides des bugs

---

**Estimation de temps** : 8-12 heures  
**Priorité** : Haute (critique pour la production)  
**Dépendances** : Firebase plan Blaze, compte Sentry (gratuit disponible)

