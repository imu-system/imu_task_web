# 🐛 Suivi des Bugs et Problèmes - ImuTask Web

**Dernière mise à jour:** 3 octobre 2025

---

## 🔴 Bugs Critiques (Bloquants)

### BUG-001: Configuration Firebase manquante
- **Statut:** ✅ **RÉSOLU** (3 octobre 2025)
- **Priorité:** CRITIQUE
- **Impact:** Bloque toute l'authentification et la persistence
- **Solution:**
  - ✅ Créé `/src/lib/firebase.ts` avec initialisation Firebase
  - ✅ Créé `/.env.local` avec les vraies clés Firebase
  - ✅ Créé `/firebase.json`, `firestore.rules`, `storage.rules`
  - ✅ Testé avec succès sur `/fr/test-firebase`
- **Temps de résolution:** 30 minutes
- **Voir:** [FIREBASE_CONFIG_COMPLETED.md](./FIREBASE_CONFIG_COMPLETED.md)

---

### BUG-002: Pages d'authentification non fonctionnelles
**Statut:** 🔴 Ouvert  
**Priorité:** Critique  
**Créé le:** 3 octobre 2025  
**Assigné à:** Non assigné

**Description:**
Les pages de connexion et d'inscription (`/auth/login` et `/auth/signup`) sont purement visuelles et ne sont pas connectées à un système d'authentification.

**Impact:**
- Les utilisateurs ne peuvent pas se connecter
- Les formulaires ne soumettent pas de données
- Les boutons "Login with Google" ne font rien

**Fichiers affectés:**
- `/src/app/[locale]/auth/login/page.tsx`
- `/src/app/[locale]/auth/signup/page.tsx`

**Solution proposée:**
1. Créer un contexte d'authentification
2. Implémenter les fonctions de connexion/inscription
3. Ajouter la validation côté serveur
4. Implémenter OAuth Google
5. Gérer les erreurs et les redirections

**Code à modifier:**
```tsx
// Dans login/page.tsx - Le bouton Link doit devenir un vrai bouton
<Button type="submit" className="w-full" asChild>
  <Link href="/">{t('loginButton')}</Link>
</Button>
```

---

### BUG-003: Formulaire de création de tâche non connecté à la base de données
**Statut:** 🔴 Ouvert  
**Priorité:** Critique  
**Créé le:** 3 octobre 2025  
**Assigné à:** Non assigné

**Description:**
Le composant `NewTaskForm` valide correctement les données mais ne les sauvegarde nulle part.

**Impact:**
- Les tâches créées ne sont pas persistées
- Pas de feedback réel à l'utilisateur
- Impossible de tester le flux complet

**Fichiers affectés:**
- `/src/components/new-task-form.tsx`

**Solution proposée:**
1. Créer une collection Firestore `tasks`
2. Implémenter une fonction `createTask` dans `/src/lib/tasks.ts`
3. Ajouter la logique de sauvegarde dans `onSubmit`
4. Gérer les erreurs de création
5. Rediriger vers la page de la tâche créée

**Code concerné (ligne ~106-116):**
```typescript
const onSubmit = (data: FormData) => {
  console.log('Form submitted:', data);
  setIsSubmitted(true);
  toast({
    title: 'Task Created Successfully!',
    description: 'Your task has been posted and providers will be notified.',
  });
};
```

---

## 🟡 Bugs Importants (À corriger prochainement)

### BUG-004: Dashboard utilise des données statiques
**Statut:** 🟡 Ouvert  
**Priorité:** Haute  
**Créé le:** 3 octobre 2025  
**Assigné à:** Non assigné

**Description:**
Les tableaux de bord client et prestataire affichent uniquement des données de test importées de `placeholder-data.ts`.

**Impact:**
- Les utilisateurs ne voient pas leurs vraies données
- Les statistiques sont fictives
- Pas de données en temps réel

**Fichiers affectés:**
- `/src/components/dashboards/client-dashboard.tsx`
- `/src/components/dashboards/provider-dashboard.tsx`
- `/src/app/[locale]/(app)/dashboard/page.tsx`
- `/src/app/[locale]/dashboard/page.tsx`

**Solution proposée:**
1. Créer des hooks pour récupérer les données utilisateur
2. Connecter aux collections Firestore
3. Calculer les statistiques dynamiquement
4. Ajouter un état de chargement

---

### BUG-005: Détection du rôle utilisateur codée en dur
**Statut:** 🟡 Ouvert  
**Priorité:** Haute  
**Créé le:** 3 octobre 2025  
**Assigné à:** Non assigné

**Description:**
Dans `/src/app/[locale]/dashboard/page.tsx`, le rôle utilisateur est défini en dur (`const userRole: string = 'provider';`).

**Impact:**
- Tous les utilisateurs voient le même dashboard
- Impossible de différencier clients et prestataires
- Logique métier non fonctionnelle

**Fichiers affectés:**
- `/src/app/[locale]/dashboard/page.tsx`

**Solution proposée:**
```typescript
// Récupérer depuis le contexte d'authentification
const { user } = useAuth();
const userRole = user?.role || 'client';
```

---

### BUG-006: Middleware d'authentification manquant
**Statut:** 🟡 Ouvert  
**Priorité:** Haute  
**Créé le:** 3 octobre 2025  
**Assigné à:** Non assigné

**Description:**
Le middleware actuel (`/src/middleware.ts`) ne gère que l'internationalisation. Il n'y a pas de protection des routes nécessitant une authentification.

**Impact:**
- N'importe qui peut accéder aux pages protégées
- Pas de redirection vers login si non authentifié
- Sécurité compromise

**Fichiers affectés:**
- `/src/middleware.ts`

**Solution proposée:**
1. Vérifier le token d'authentification dans le middleware
2. Rediriger vers `/auth/login` si non authentifié
3. Définir une liste de routes publiques
4. Gérer les redirections post-login

---

### BUG-007: Variables d'environnement non configurées
**Statut:** 🟡 Ouvert  
**Priorité:** Haute  
**Créé le:** 3 octobre 2025  
**Assigné à:** Non assigné

**Description:**
Pas de fichier `.env.local` ou `.env.example` pour guider la configuration.

**Impact:**
- Configuration Firebase impossible
- Secrets exposés potentiellement
- Difficultés pour d'autres développeurs

**Solution proposée:**
Créer `.env.example`:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Genkit AI
GOOGLE_GENAI_API_KEY=

# Stripe (pour les paiements)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

---

## 🟢 Bugs Mineurs (Backlog)

### BUG-008: Erreurs de linting Markdown dans blueprint.md
**Statut:** 🟢 Ouvert  
**Priorité:** Faible  
**Créé le:** 3 octobre 2025  
**Assigné à:** Non assigné

**Description:**
Le fichier `/docs/blueprint.md` a des erreurs de linting:
- MD026: Ponctuation finale dans les titres
- MD047: Pas de nouvelle ligne à la fin du fichier

**Impact:**
- Aucun impact fonctionnel
- Problèmes d'affichage potentiels

**Solution:**
Corriger les titres et ajouter une nouvelle ligne finale.

---

### BUG-009: TypeScript build errors ignorés
**Statut:** 🟢 Ouvert  
**Priorité:** Moyenne  
**Créé le:** 3 octobre 2025  
**Assigné à:** Non assigné

**Description:**
Dans `next.config.mjs`, les erreurs TypeScript et ESLint sont ignorées:
```javascript
typescript: {
  ignoreBuildErrors: true,
},
eslint: {
  ignoreDuringBuilds: true,
},
```

**Impact:**
- Erreurs TypeScript cachées
- Qualité du code compromise
- Bugs potentiels en production

**Solution proposée:**
1. Corriger toutes les erreurs TypeScript
2. Retirer ces flags
3. Configurer ESLint correctement

---

### BUG-010: Composants placeholder vides
**Statut:** 🟢 Ouvert  
**Priorité:** Faible  
**Créé le:** 3 octobre 2025  
**Assigné à:** Non assigné

**Description:**
Plusieurs dossiers de features contiennent uniquement des fichiers placeholder:
- `/src/features/auth/components/placeholder.tsx`
- `/src/features/bookings/components/placeholder.tsx`
- Etc.

**Impact:**
- Confusion sur ce qui est implémenté
- Structure incomplète

**Solution:**
Implémenter les composants ou retirer les placeholders.

---

### BUG-011: Instrumentation non configurée
**Statut:** 🟢 Ouvert  
**Priorité:** Faible  
**Créé le:** 3 octobre 2025  
**Assigné à:** Non assigné

**Description:**
Le fichier `/src/app/instrumentation.ts` contient uniquement un TODO pour Sentry/analytics.

**Impact:**
- Pas de monitoring d'erreurs
- Impossible de tracker les problèmes en production

**Solution:**
1. Configurer Sentry ou alternative
2. Ajouter Analytics (Google Analytics, Vercel Analytics, etc.)

---

### BUG-012: README non mis à jour
**Statut:** 🟢 Ouvert  
**Priorité:** Faible  
**Créé le:** 3 octobre 2025  
**Assigné à:** Non assigné

**Description:**
Le README.md contient encore le contenu par défaut de Firebase Studio et ne reflète pas le projet ImuTask.

**Impact:**
- Documentation inadéquate
- Difficultés pour les nouveaux contributeurs

**Solution:**
Réécrire le README avec:
- Description du projet
- Instructions d'installation
- Guide de contribution
- Architecture

---

## 📋 Problèmes de Configuration

### CONFIG-001: Firebase Emulators non configurés
**Statut:** 🟡 Ouvert  
**Priorité:** Moyenne  
**Créé le:** 3 octobre 2025

**Description:**
Dans `.idx/dev.nix`, les émulateurs Firebase sont désactivés:
```nix
services.firebase.emulators = {
  detect = false; # Disabling because we are using prod backends right now
  projectId = "demo-app";
  services = ["auth" "firestore"];
};
```

**Impact:**
- Développement directement en production (risqué)
- Pas de tests locaux isolés
- Coûts Firebase potentiels en dev

**Solution:**
1. Créer un `firebase.json`
2. Activer les émulateurs locaux
3. Utiliser les émulateurs pour le développement

---

### CONFIG-002: Absence de tests
**Statut:** 🟡 Ouvert  
**Priorité:** Moyenne  
**Créé le:** 3 octobre 2025

**Description:**
Aucun test unitaire, d'intégration ou E2E n'est présent dans le projet.

**Impact:**
- Risque élevé de régressions
- Difficultés pour refactoriser
- Qualité du code incertaine

**Solution:**
1. Configurer Jest pour les tests unitaires
2. Ajouter React Testing Library
3. Configurer Playwright ou Cypress pour E2E
4. Créer des tests pour les composants critiques

---

## 🎯 Plan d'Action Prioritaire

### Cette semaine (3-9 octobre 2025)
1. ✅ Créer les documents de suivi
2. 🔄 Configurer Firebase (BUG-001)
3. 🔄 Créer le fichier .env.example (BUG-007)
4. 🔄 Implémenter l'authentification de base (BUG-002)

### Semaine prochaine (10-16 octobre 2025)
1. Connecter le formulaire de tâches à Firestore (BUG-003)
2. Implémenter le middleware d'authentification (BUG-006)
3. Corriger les erreurs TypeScript (BUG-009)
4. Mettre à jour le README (BUG-012)

### Dans 2 semaines (17-23 octobre 2025)
1. Connecter les dashboards aux vraies données (BUG-004)
2. Configurer les émulateurs Firebase (CONFIG-001)
3. Ajouter les premiers tests (CONFIG-002)

---

## 📊 Statistiques

- **Total de bugs:** 12 bugs + 2 problèmes de configuration
- **Critiques:** 3
- **Importants:** 4
- **Mineurs:** 5
- **Bugs résolus:** 0
- **Taux de résolution:** 0%

---

## 📝 Template pour nouveaux bugs

```markdown
### BUG-XXX: Titre du bug
**Statut:** 🔴/🟡/🟢 Ouvert/En cours/Résolu
**Priorité:** Critique/Haute/Moyenne/Faible
**Créé le:** Date
**Assigné à:** Nom
**Résolu le:** Date (si applicable)

**Description:**
Description détaillée du problème

**Impact:**
Quel est l'impact sur l'application?

**Fichiers affectés:**
- Liste des fichiers

**Solution proposée:**
Étapes pour résoudre

**Étapes de reproduction:**
1. Étape 1
2. Étape 2
3. Résultat observé vs attendu
```

---

**Dernière révision:** 3 octobre 2025  
**Prochaine révision:** 10 octobre 2025
