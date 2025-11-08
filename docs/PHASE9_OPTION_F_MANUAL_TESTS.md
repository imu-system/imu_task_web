# Phase 9 - Option F : Tests Manuels - Checklist

**Date** : 8 novembre 2025  
**Status** : 🔄 EN COURS  
**URL** : http://localhost:9002

---

## ✅ Prérequis

- [x] Serveur dev démarré (`pnpm dev` sur port 9002)
- [ ] Authentifié en tant qu'admin (pour dashboard admin)
- [ ] Authentifié en tant que provider (pour dashboard pro)
- [ ] Authentifié en tant que client (pour dashboard client)

---

## 📋 Test 1 : localStorage Persistence

**Objectif** : Vérifier que les filtres sont sauvegardés après rafraîchissement

### Étapes

1. **Se connecter** à l'un des dashboards :
   - Admin : http://localhost:9002/fr/dashboard/admin
   - Provider : http://localhost:9002/fr/dashboard/pro
   - Client : http://localhost:9002/fr/dashboard/client

2. **Ouvrir les filtres** (bouton "Filtres" sur mobile ou Card sur desktop)

3. **Appliquer des filtres** :
   - Date : "7 derniers jours"
   - Catégories : Sélectionner 2-3 catégories (ex: "Courses & Livraisons", "Aide Numérique")
   - Status : "Actives"
   - Search : Taper "aide" ou "jardin"

4. **Ouvrir DevTools** (F12) → Console

5. **Vérifier localStorage** :
   ```javascript
   // Taper dans la console :
   localStorage.getItem('dashboard-filters-[VOTRE_USER_ID]')
   ```
   
   **Attendu** : JSON avec vos filtres
   ```json
   {
     "dateRangePreset": "last7days",
     "dateRange": { "from": "...", "to": "..." },
     "categories": ["courses_livraisons", "aide_numerique"],
     "status": "active",
     "searchQuery": "aide"
   }
   ```

6. **Rafraîchir la page** (F5 ou Cmd+R)

7. **Vérifier** :
   - [ ] Les filtres sont toujours appliqués
   - [ ] Le badge "Filtres actifs" affiche le bon nombre
   - [ ] Les valeurs dans les composants de filtres sont correctes

### Résultat

- [ ] ✅ RÉUSSI : Filtres restaurés depuis localStorage
- [ ] ❌ ÉCHOUÉ : [Décrire le problème]

---

## 📋 Test 2 : URL Params Sync

**Objectif** : Vérifier que les filtres sont synchronisés avec l'URL (shareable)

### Étapes

1. **Appliquer des filtres** sur un dashboard (voir Test 1)

2. **Observer l'URL** :
   - L'URL devrait contenir des query params
   - Exemple : `?datePreset=last7days&categories=courses_livraisons,aide_numerique&status=active&q=aide`

3. **Copier l'URL complète**

4. **Ouvrir un nouvel onglet** (Cmd+T)

5. **Coller l'URL** et valider

6. **Vérifier** :
   - [ ] Les filtres sont automatiquement appliqués
   - [ ] Les mêmes filtres qu'avant
   - [ ] Pas besoin de cliquer ou configurer quoi que ce soit

### Résultat

- [ ] ✅ RÉUSSI : Filtres restaurés depuis URL params (shareable)
- [ ] ❌ ÉCHOUÉ : [Décrire le problème]

---

## 📋 Test 3 : Debounce Search (300ms)

**Objectif** : Vérifier que le search n'envoie pas de requêtes à chaque frappe

### Étapes

1. **Ouvrir DevTools** (F12) → Network tab

2. **Ouvrir les filtres**

3. **Taper rapidement** dans la barre de recherche :
   - Taper : "j" → "a" → "r" → "d" → "i" → "n" (très vite)

4. **Observer le Network tab** :
   - Pendant que vous tapez : **aucune requête**
   - Après 300ms d'inactivité : **1 seule requête/filtrage**

5. **Vérifier dans la console** :
   ```javascript
   // Si vous voulez voir les logs, ajoutez temporairement dans use-dashboard-filters.ts :
   console.log('Filters applied:', filters)
   ```

6. **Vérifier** :
   - [ ] Pas de requêtes pendant la frappe rapide
   - [ ] 1 seule requête après 300ms d'arrêt
   - [ ] Pas de spam/flickering

### Résultat

- [ ] ✅ RÉUSSI : Debounce fonctionne (300ms, pas de spam)
- [ ] ❌ ÉCHOUÉ : [Décrire le problème]

---

## 📋 Test 4 : Filtres Combinés

**Objectif** : Vérifier que tous les filtres s'appliquent en mode ET (AND)

### Étapes

1. **Appliquer TOUS les filtres en même temps** :
   - Date : "Ce mois-ci" (ou "7 derniers jours")
   - Catégories : Sélectionner 2-3 catégories
   - Status : "Complétées" (ou "Actives")
   - Search : Taper un mot-clé (ex: "aide")

2. **Vérifier les résultats affichés** :
   - Chaque item doit respecter **TOUS** les critères :
     - Date dans la range sélectionnée
     - Catégorie dans la liste sélectionnée
     - Status correspond au filtre
     - Titre/description contient le mot-clé

3. **Tester plusieurs combinaisons** :
   - Date + Status seulement
   - Catégories + Search seulement
   - Date + Catégories + Status + Search (tout)

4. **Vérifier** :
   - [ ] Les résultats respectent tous les filtres appliqués
   - [ ] Pas de faux positifs (items qui ne devraient pas apparaître)
   - [ ] Le count/badge affiche le bon nombre de filtres actifs

### Résultat

- [ ] ✅ RÉUSSI : Filtres combinés fonctionnent en mode ET
- [ ] ❌ ÉCHOUÉ : [Décrire le problème]

---

## 📋 Test 5 : Reset Filters Button

**Objectif** : Vérifier que le bouton "Réinitialiser" reset tous les filtres

### Étapes

1. **Appliquer plusieurs filtres** (voir Test 4)

2. **Cliquer sur "Réinitialiser tous les filtres"** (en bas du composant)

3. **Vérifier que tout revient aux valeurs par défaut** :
   - Date : "30 derniers jours" (défaut)
   - Catégories : Aucune sélectionnée
   - Status : "Tous"
   - Search : Vide

4. **Vérifier l'URL** :
   - Query params supprimés (URL propre)

5. **Vérifier localStorage** :
   ```javascript
   localStorage.getItem('dashboard-filters-[USER_ID]')
   ```
   - Devrait contenir les valeurs par défaut

6. **Vérifier** :
   - [ ] Tous les filtres réinitialisés
   - [ ] URL propre (pas de query params)
   - [ ] localStorage mis à jour
   - [ ] Badge "Filtres actifs" disparaît (ou affiche 0)

### Résultat

- [ ] ✅ RÉUSSI : Reset fonctionne (retour aux valeurs par défaut)
- [ ] ❌ ÉCHOUÉ : [Décrire le problème]

---

## 📋 Test 6 : Responsive Layouts

**Objectif** : Vérifier Card (desktop) et Sheet (mobile)

### Étapes Desktop (>= 1024px)

1. **Ouvrir dashboard avec fenêtre large** (> 1024px)

2. **Admin dashboard** :
   - [ ] Card pleine largeur visible
   - [ ] Pas de bouton "Filtres"
   - [ ] Tous les filtres accessibles directement

3. **Provider dashboard** :
   - [ ] Sidebar Card (280px) à gauche
   - [ ] Contenu principal à droite
   - [ ] Pas de bouton "Filtres"

4. **Client dashboard** :
   - [ ] Card visible (desktop) ou Sheet (selon implémentation)

### Étapes Mobile (< 1024px)

1. **Réduire la fenêtre** (< 1024px) ou utiliser DevTools mobile emulator

2. **Vérifier sur tous les dashboards** :
   - [ ] Card disparaît
   - [ ] Bouton "Filtres" apparaît (avec badge count)
   - [ ] Cliquer sur le bouton ouvre le Sheet depuis la gauche
   - [ ] Sheet a une largeur de 300-400px
   - [ ] Tous les filtres accessibles dans le Sheet
   - [ ] Fermer le Sheet (X ou clic à l'extérieur) fonctionne

3. **Tester la transition** :
   - Redimensionner la fenêtre de desktop → mobile → desktop
   - Vérifier que le switch Card ↔ Sheet est fluide

### Résultat

- [ ] ✅ RÉUSSI : Responsive fonctionne (Card desktop, Sheet mobile)
- [ ] ❌ ÉCHOUÉ : [Décrire le problème]

---

## 📋 Test 7 : Production Build Functionality

**Objectif** : Vérifier que tout fonctionne en production

### Étapes

1. **Stopper le dev server** (Ctrl+C dans le terminal)

2. **Build production** :
   ```bash
   pnpm build
   ```
   - Devrait compiler sans erreur
   - Warnings next-intl acceptables

3. **Démarrer production server** :
   ```bash
   pnpm start
   ```

4. **Ouvrir l'app** : http://localhost:9002

5. **Répéter les tests 1-6** en mode production :
   - [ ] Test 1 : localStorage persistence
   - [ ] Test 2 : URL params sync
   - [ ] Test 3 : Debounce search
   - [ ] Test 4 : Filtres combinés
   - [ ] Test 5 : Reset button
   - [ ] Test 6 : Responsive

6. **Vérifier la console** :
   - [ ] Pas d'erreurs
   - [ ] Pas de warnings critiques
   - [ ] Filtrage performant (pas de lag)

### Résultat

- [ ] ✅ RÉUSSI : Production build fonctionne parfaitement
- [ ] ❌ ÉCHOUÉ : [Décrire le problème]

---

## 📊 Résumé Final

### Tests Réussis

- [ ] Test 1 : localStorage Persistence
- [ ] Test 2 : URL Params Sync
- [ ] Test 3 : Debounce Search
- [ ] Test 4 : Filtres Combinés
- [ ] Test 5 : Reset Button
- [ ] Test 6 : Responsive Layouts
- [ ] Test 7 : Production Build

**Total** : __ / 7 tests réussis

### Problèmes Détectés

_(À remplir si des problèmes sont trouvés)_

1. **[Test X] - [Titre du problème]**
   - Description :
   - Steps to reproduce :
   - Expected :
   - Actual :
   - Priorité : 🔴 Bloquant / 🟡 Mineur / 🟢 Nice-to-have

### Notes Additionnelles

_(Observations, suggestions d'amélioration, etc.)_

---

## ✅ Validation Finale

- [ ] Tous les tests manuels effectués
- [ ] Problèmes documentés (si existants)
- [ ] Corrections apportées (si nécessaires)
- [ ] Re-test des corrections
- [ ] **Option F 100% validée et prête pour production**

---

**Testeur** : Nathan Imogo  
**Date de complétion** : __________  
**Durée des tests** : __________ minutes
