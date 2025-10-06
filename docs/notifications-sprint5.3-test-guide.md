# 🧪 Guide de Test React Query - Sprint 5.3

**Date:** 5 octobre 2025  
**Objectif:** Valider l'implémentation complète de React Query pour les notifications  
**Durée estimée:** 30 minutes

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Accès à la Page de Test](#accès-à-la-page-de-test)
3. [Tests de Base](#tests-de-base)
4. [Tests Avancés](#tests-avancés)
5. [Tests de Performance](#tests-de-performance)
6. [Checklist de Validation](#checklist-de-validation)
7. [Résolution de Problèmes](#résolution-de-problèmes)

---

## 🔧 Prérequis

### Vérifications Initiales

✅ **React Query installé** (confirmé dans conversation précédente)
```bash
npm list @tanstack/react-query
# Devrait afficher v5.56.2
```

✅ **Provider intégré dans le layout** (vient d'être fait)
- Fichier: `src/app/[locale]/layout.tsx`
- ReactQueryProvider enveloppe AuthProvider

✅ **Serveur de développement en cours**
```bash
npm run dev
# Devrait être déjà running sur http://localhost:3000
```

✅ **Utilisateur authentifié**
- Vous devez être connecté pour voir les notifications
- Si non connecté, la page affichera "Authentication Required"

---

## 🌐 Accès à la Page de Test

### URL de Test

```
http://localhost:3000/fr/notifications-playground/test
```

**Autres locales disponibles:**
- Anglais: `/en/notifications-playground/test`
- Espagnol: `/es/notifications-playground/test`
- Allemand: `/de/notifications-playground/test`
- Japonais: `/ja/notifications-playground/test`

### Première Visite

Lors de la première visite, vous devriez voir :

1. **Header** : "🧪 React Query Test Playground"
2. **5 cartes de statistiques** :
   - Unread Count (nombre de non-lus)
   - Cached Items (éléments en cache)
   - Active Queries (requêtes actives)
   - Stale Queries (requêtes obsolètes)
   - Performance (taux de succès du cache)

3. **Controls & Filters** :
   - Toggle "Show Unread Only"
   - Toggle "Show Statistics"
   - Filtres par catégorie (TASKS, MESSAGES, etc.)
   - Boutons d'action (Mark All, Invalidate, Clear)

4. **Liste de Notifications** :
   - Scroll infini automatique
   - 20 notifications par page
   - Bouton "Load More" en fallback

5. **Debug Information** :
   - Onglet Queries (état des requêtes)
   - Onglet Cache (données en cache)
   - Onglet Config (configuration React Query)

---

## ✅ Tests de Base

### Test 1: Affichage Initial

**Objectif:** Vérifier que les notifications se chargent correctement

**Étapes:**
1. Ouvrir la page `/fr/notifications-playground/test`
2. Observer le chargement initial (spinner)
3. Vérifier que les notifications apparaissent

**Résultats attendus:**
- ✅ Spinner visible pendant <1 seconde
- ✅ Liste de notifications apparaît
- ✅ Compteur "Unread Count" affiche un nombre > 0 (si vous avez des notifications non lues)
- ✅ "Cached Items" augmente après le chargement

**Capture d'écran suggérée:** État initial avec notifications chargées

---

### Test 2: Infinite Scroll (Auto-Load)

**Objectif:** Valider le chargement automatique au scroll

**Étapes:**
1. Scroller vers le bas de la liste
2. Observer le comportement quand vous atteignez le bas
3. Continuer à scroller

**Résultats attendus:**
- ✅ Indicateur de chargement apparaît en bas (spinner)
- ✅ 20 nouvelles notifications se chargent automatiquement
- ✅ Pas de saut/glitch dans le scroll
- ✅ "Cached Items" augmente de 20

**Métrique de performance:**
- Temps de chargement < 500ms (grâce aux indexes Firestore)
- Transition fluide sans lag

---

### Test 3: Filtre "Unread Only"

**Objectif:** Tester le filtre des notifications non lues

**Étapes:**
1. Activer le toggle "Show Unread Only"
2. Observer le changement dans la liste
3. Désactiver le toggle

**Résultats attendus:**
- ✅ Seules les notifications non lues s'affichent
- ✅ Compteur "Unread Count" correspond au nombre affiché
- ✅ Pas de rechargement complet (utilise le cache)
- ✅ Désactiver le toggle affiche toutes les notifications

**Optimisation observée:**
- Changement quasi-instantané (<100ms)
- Pas de requête Firestore si données déjà en cache

---

### Test 4: Filtre par Catégorie

**Objectif:** Valider les filtres de catégorie

**Étapes:**
1. Cliquer sur un bouton de catégorie (ex: "TASKS")
2. Observer les notifications filtrées
3. Vérifier le badge avec le nombre
4. Cliquer sur "All"

**Résultats attendus:**
- ✅ Seules les notifications de la catégorie sélectionnée apparaissent
- ✅ Badge affiche le bon nombre (correspond à countsByCategory)
- ✅ Retour à "All" affiche toutes les notifications
- ✅ Les emojis correspondent aux catégories (📋 pour TASKS, 💬 pour MESSAGES, etc.)

---

### Test 5: Optimistic Update - Mark as Read

**Objectif:** Tester les mises à jour optimistes

**Étapes:**
1. Trouver une notification non lue (point bleu à gauche)
2. Cliquer sur le bouton "Check" (Mark as Read) au survol
3. Observer la vitesse de changement

**Résultats attendus:**
- ✅ **Changement INSTANTANÉ** (<10ms) - pas d'attente du serveur
- ✅ Point bleu disparaît immédiatement
- ✅ Fond devient transparent (perd bg-primary/5)
- ✅ Compteur "Unread Count" décrémente instantanément
- ✅ Si erreur Firestore → rollback automatique (notification redevient non lue)

**Performance clé:**
- UI update: <10ms (optimistic)
- Firestore write: ~200-500ms (en arrière-plan)
- Total perçu par l'utilisateur: <10ms ✨

---

### Test 6: Optimistic Update - Dismiss

**Objectif:** Tester la suppression visuelle (dismiss)

**Étapes:**
1. Survoler une notification
2. Cliquer sur le bouton "X" (Dismiss)
3. Observer le comportement

**Résultats attendus:**
- ✅ Notification disparaît IMMÉDIATEMENT de la liste
- ✅ Compteur "Cached Items" décrémente
- ✅ Pas de "trou" dans la liste (les autres remontent)
- ✅ Si erreur → notification réapparaît

---

### Test 7: Optimistic Update - Delete

**Objectif:** Tester la suppression permanente

**Étapes:**
1. Survoler une notification
2. Cliquer sur le bouton "Trash" (Delete)
3. Vérifier qu'elle ne réapparaît pas après rechargement

**Résultats attendus:**
- ✅ Notification disparaît instantanément
- ✅ "Cached Items" et "Unread Count" se mettent à jour
- ✅ Rechargement de la page → notification toujours absente
- ✅ Rollback si erreur

---

## 🚀 Tests Avancés

### Test 8: Mark All as Read (Batch Operation)

**Objectif:** Tester l'opération en masse

**Étapes:**
1. Vérifier qu'il y a plusieurs notifications non lues
2. Cliquer sur "Mark All as Read"
3. Observer les changements

**Résultats attendus:**
- ✅ TOUTES les notifications non lues deviennent lues instantanément
- ✅ Compteur "Unread Count" passe à 0
- ✅ Tous les points bleus disparaissent
- ✅ Toutes les notifications perdent leur fond coloré

**Performance:**
- UI update: <50ms pour 100 notifications
- Batch write Firestore: ~1-2 secondes (en arrière-plan)

---

### Test 9: Cache Invalidation

**Objectif:** Forcer le rechargement des données

**Étapes:**
1. Noter le nombre de "Cached Items"
2. Cliquer sur "Invalidate Cache"
3. Observer le rechargement

**Résultats attendus:**
- ✅ Toutes les requêtes deviennent "Stale" (voir onglet Debug > Queries)
- ✅ Rechargement automatique depuis Firestore
- ✅ Données rafraîchies (nouvelles notifications apparaissent si ajoutées entre-temps)
- ✅ "Stale Queries" augmente puis redescend

---

### Test 10: Clear Cache (Suppression Totale)

**Objectif:** Supprimer toutes les données en cache

**Étapes:**
1. Cliquer sur "Clear Cache" (bouton rouge)
2. Observer le comportement

**Résultats attendus:**
- ✅ "Cached Items" passe à 0
- ✅ "Active Queries" diminue drastiquement
- ✅ Liste de notifications se recharge depuis zéro
- ✅ Spinner de chargement réapparaît brièvement

**Utilisation:**
- Test de performance (mesurer temps de chargement à froid)
- Reset complet pour tester un scénario fresh

---

### Test 11: Pagination (Load More Button)

**Objectif:** Tester le bouton de chargement manuel

**Étapes:**
1. Désactiver JavaScript temporairement (ou simuler)
2. Cliquer sur "Load More" en bas de liste

**Résultats attendus:**
- ✅ 20 nouvelles notifications se chargent
- ✅ Bouton "Load More" reste visible s'il y a plus de données
- ✅ Affiche "No more notifications" quand tout est chargé
- ✅ Compteur de pages augmente (voir Debug > Queries)

---

### Test 12: Window Focus Refetch

**Objectif:** Valider le rechargement automatique au retour de focus

**Étapes:**
1. Ouvrir la page de test
2. Passer à un autre onglet pendant 30 secondes
3. Revenir à l'onglet de test

**Résultats attendus:**
- ✅ Rechargement automatique déclenché
- ✅ Nouvelles notifications apparaissent (si ajoutées pendant ce temps)
- ✅ Compteurs mis à jour
- ✅ Indicateur de chargement subtil (pas de spinner complet)

**Configuration validée:**
- refetchOnWindowFocus: true ✅
- staleTime: 2 minutes

---

### Test 13: Network Error Handling

**Objectif:** Tester la gestion des erreurs réseau

**Étapes:**
1. Ouvrir DevTools > Network
2. Activer "Offline" (simuler perte de connexion)
3. Essayer de marquer une notification comme lue
4. Observer le comportement

**Résultats attendus:**
- ✅ UI update optimiste se produit (change immédiatement)
- ✅ Retry automatique (3 tentatives avec backoff exponentiel)
- ✅ Si échec après 3 tentatives → rollback vers état initial
- ✅ Message d'erreur utilisateur (toast ou inline)

**Retry Policy Validée:**
- Tentative 1: immédiate
- Tentative 2: après 1 seconde
- Tentative 3: après 2 secondes
- Abandon: après ~3 secondes total

---

## 📊 Tests de Performance

### Test 14: Cache Hit Rate

**Objectif:** Mesurer l'efficacité du cache

**Étapes:**
1. Charger la page (1er load)
2. Noter le "Cache hit rate" dans la carte "Performance"
3. Rafraîchir la page (F5)
4. Renoter le taux

**Résultats attendus:**
- **1er load:** Cache hit rate: 0% (normal)
- **2ème load:** Cache hit rate: ~80% (données encore fraîches)
- **Après 2 minutes:** staleTime expiré → refetch mais cache utilisé pendant le chargement

**Métrique de succès:**
- Taux de cache > 70% après 2ème visite
- Économie de 80% des lectures Firestore

---

### Test 15: Firestore Read Count

**Objectif:** Valider la réduction des lectures Firestore

**Étapes:**
1. Ouvrir Firebase Console > Firestore > Usage
2. Noter le nombre de lectures avant test
3. Naviguer sur la page de test pendant 5 minutes
   - Scroll infini (charger 100 notifications)
   - Filtres (changer de catégorie 5 fois)
   - Mark as Read (10 notifications)
4. Renoter le nombre de lectures

**Calcul attendu:**

**SANS React Query (ancien système):**
- Scroll: 5 pages × 1 read = **5 reads**
- Filtres: 5 changements × 1 read = **5 reads**
- Mark as Read: 10 × 1 read = **10 reads**
- Refetch automatiques: ~**10 reads**
- **Total: ~30 reads**

**AVEC React Query (nouveau système):**
- Scroll: 5 pages × 1 read = **5 reads** (initial)
- Filtres: 0 reads (cache) = **0 reads**
- Mark as Read: 10 × 1 write = **10 writes** (pas de reads)
- Refetch: ~2 reads (staleTime 2min)
- **Total: ~7 reads + 10 writes**

**Économie: ~77% de lectures en moins** ✨

---

### Test 16: UI Responsiveness (Optimistic Updates)

**Objectif:** Mesurer la vitesse des mises à jour UI

**Étapes:**
1. Ouvrir DevTools > Performance
2. Démarrer l'enregistrement
3. Cliquer sur "Mark as Read" sur une notification
4. Arrêter l'enregistrement
5. Analyser la timeline

**Résultats attendus:**
- **Time to Interactive:** <10ms
- **DOM update:** <5ms
- **Firestore write:** ~200-500ms (async, non-bloquant)

**Comparaison:**

| Métrique | Ancien Système | React Query | Amélioration |
|----------|----------------|-------------|--------------|
| UI Update | ~500ms | <10ms | **98% plus rapide** |
| Perceived Latency | ~500ms | <10ms | **Instantané** |
| User Frustration | Élevé | Aucun | ✨ |

---

### Test 17: Memory Usage

**Objectif:** Vérifier que le cache ne consomme pas trop de mémoire

**Étapes:**
1. Ouvrir DevTools > Memory
2. Prendre un snapshot initial
3. Charger 500 notifications (scroll intensif)
4. Prendre un snapshot final
5. Comparer

**Résultats attendus:**
- Heap size increase: <10 MB pour 500 notifications
- Garbage collection: déclenchée après gcTime (30 minutes)
- Pas de memory leak visible

**Configuration validée:**
- gcTime: 30 minutes → nettoyage automatique des données non utilisées
- staleTime: 2 minutes → évite le cache éternel

---

## ✅ Checklist de Validation Complète

### Fonctionnalités Core

- [ ] **Infinite Scroll Auto-Load** : Fonctionne sans clic manuel
- [ ] **Load More Button** : Fallback fonctionnel
- [ ] **Filter Unread Only** : Affiche uniquement non-lus
- [ ] **Filter by Category** : 8 catégories fonctionnent
- [ ] **Mark as Read (Single)** : Update instantanée
- [ ] **Mark as Unread** : Fonctionne (si implémenté dans UI)
- [ ] **Dismiss Notification** : Suppression visuelle instantanée
- [ ] **Delete Notification** : Suppression permanente
- [ ] **Mark All as Read** : Batch operation fonctionne

### Performance

- [ ] **Cache Hit Rate** : >70% après 2ème visite
- [ ] **Firestore Reads** : -80% vs ancien système
- [ ] **Optimistic Updates** : <10ms perçu
- [ ] **Page Load** : <1s pour 20 notifications
- [ ] **Scroll Performance** : 60 FPS maintenu
- [ ] **Memory Usage** : <10MB pour 500 notifications

### UX

- [ ] **Loading States** : Spinners appropriés
- [ ] **Error States** : Messages clairs
- [ ] **Empty States** : "No notifications" affiché
- [ ] **Hover Actions** : Apparaissent au survol
- [ ] **Category Emojis** : Corrects (📋 💬 💼 📅 💰 ⭐ 👤 ⚙️)
- [ ] **Priority Badges** : Couleurs correctes (low/normal/high)
- [ ] **Timestamps** : Format relatif (ex: "5 minutes ago")

### Robustesse

- [ ] **Network Errors** : Retry + Rollback fonctionnent
- [ ] **Offline Mode** : Pas de crash, retry automatique
- [ ] **Concurrent Updates** : Pas de conflit de cache
- [ ] **Window Focus Refetch** : Rechargement au retour de focus
- [ ] **Stale Data Handling** : Refetch automatique après 2 min

### Debug

- [ ] **Query Count** : Visible dans stats
- [ ] **Cache Size** : Nombre d'items correct
- [ ] **Stale Queries** : Identifiables dans debug panel
- [ ] **Query Keys** : Lisibles et logiques
- [ ] **DevTools** : React Query DevTools fonctionne (dev mode)

---

## 🐛 Résolution de Problèmes

### Problème 1: "Authentication Required" s'affiche

**Cause:** Pas d'utilisateur connecté

**Solution:**
```bash
# Aller à la page de login
http://localhost:3000/fr/auth/login

# Ou créer un compte test
http://localhost:3000/fr/auth/signup
```

---

### Problème 2: Aucune notification ne s'affiche

**Cause:** Base de données vide

**Solution:**
```typescript
// Créer des notifications de test depuis la console Firebase
// Ou utiliser la fonction de création manuelle

// Vérifier dans Firestore Console:
// Collection: notifications
// Filtrer par: userId == votre_user_id
```

**Alternative:** Créer une notification depuis l'app (trigger depuis une autre feature)

---

### Problème 3: React Query DevTools ne s'affiche pas

**Cause:** Mode production ou import incorrect

**Solution:**
```bash
# Vérifier que vous êtes en dev mode
echo $NODE_ENV  # devrait afficher "development"

# Vérifier l'import dans provider.tsx
# Ligne 2: import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

# Position DevTools: Bottom-right de l'écran
```

---

### Problème 4: Optimistic Update ne fonctionne pas

**Causes possibles:**
1. Cache vide (1ère visite)
2. Erreur Firestore silencieuse
3. Query key mismatch

**Debug:**
```typescript
// Ouvrir Debug > Queries
// Chercher la query avec votre notification
// Vérifier:
// - observers: >0
// - data: contient la notification
// - isStale: false (si récent)

// Vérifier console pour erreurs Firestore
```

---

### Problème 5: Infinite Scroll ne charge pas

**Causes:**
1. hasNextPage = false (toutes les données chargées)
2. Intersection Observer pas supporté (très vieux navigateur)
3. Erreur Firestore (check console)

**Debug:**
```typescript
// Dans Debug > Queries, chercher la query active
// Vérifier:
// - data.pages.length (nombre de pages)
// - hasNextPage (devrait être true si plus de données)

// Fallback: utiliser le bouton "Load More"
```

---

### Problème 6: Cache ne se vide pas avec "Clear Cache"

**Cause:** Queries restent actives (observers)

**Solution:**
```typescript
// Fermer tous les composants qui utilisent les queries
// Ou rafraîchir la page complète (F5)

// Le cache se vide automatiquement après gcTime (30 min)
```

---

## 📈 Métriques de Succès Sprint 5.3

| Métrique | Objectif | Résultat Attendu |
|----------|----------|------------------|
| **Firestore Reads Reduction** | -80% | ✅ Validé via test 15 |
| **UI Update Speed** | <10ms | ✅ Validé via test 16 |
| **Cache Hit Rate** | >70% | ✅ Validé via test 14 |
| **Page Load Time** | <1s | ✅ Validé visiblement |
| **Infinite Scroll FPS** | 60 FPS | ✅ Smooth scrolling |
| **Memory Footprint** | <10MB/500 items | ✅ Validé via test 17 |

---

## 🎯 Prochaines Étapes après Tests

Si tous les tests passent :

### Option A: Sprint 5.4 - Tests Automatisés
- Jest unit tests pour les 9 hooks
- Playwright E2E pour les scénarios critiques
- Performance benchmarks automatisés

### Option B: Sprint 5.5 - Monitoring
- Firebase Performance Monitoring
- Analytics events (notification_created, notification_read, etc.)
- Error tracking (Sentry/Crashlytics)
- Metrics dashboard

### Option C: Déploiement Production
- Deploy Firestore indexes (`firebase deploy --only firestore:indexes`)
- Deploy Cloud Functions (`firebase deploy --only functions`)
- Deploy app (`npm run build && firebase deploy`)

---

## 📝 Rapport de Test (Template)

Après avoir complété tous les tests, remplir ce rapport :

```markdown
# Rapport de Test React Query - Sprint 5.3

**Date:** [Date du test]
**Testeur:** [Votre nom]
**Environnement:** Dev / Staging / Production
**Navigateur:** Chrome/Firefox/Safari [Version]

## Résultats Globaux

- Tests passés: __/17
- Tests échoués: __/17
- Taux de réussite: __%

## Tests Critiques (Must-Pass)

- [ ] Test 2: Infinite Scroll
- [ ] Test 5: Optimistic Update - Mark as Read
- [ ] Test 6: Optimistic Update - Dismiss
- [ ] Test 12: Window Focus Refetch
- [ ] Test 15: Firestore Read Count

## Bugs Identifiés

| ID | Test | Description | Sévérité | Statut |
|----|------|-------------|----------|--------|
| 1  |      |             |          |        |

## Recommandations

- [ ] Passer au Sprint 5.4 (Tests)
- [ ] Passer au Sprint 5.5 (Monitoring)
- [ ] Corriger bugs avant de continuer
- [ ] Déployer en production

## Notes

[Vos observations ici]
```

---

## 🎉 Conclusion

Une fois tous les tests validés, vous aurez confirmé que :

✅ React Query est parfaitement intégré  
✅ Le caching réduit les coûts Firestore de 80%  
✅ Les optimistic updates offrent une UX instantanée  
✅ L'infinite scroll est fluide et performant  
✅ Toutes les features (9 hooks) fonctionnent  

**Vous serez prêt pour le Sprint 5.4 (Tests) ou 5.5 (Monitoring) !** 🚀
