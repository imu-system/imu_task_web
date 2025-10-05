# 🧪 Messages Feature - Guide de Tests Manuels

**Date:** 4 octobre 2025  
**Durée estimée:** 30 minutes  
**Serveur:** http://localhost:9002

---

## 📋 Checklist Globale

### Préparation
- [ ] Serveur dev lancé (port 9002)
- [ ] 2 comptes utilisateurs disponibles
- [ ] Navigateur DevTools ouvert (Console + Network)
- [ ] Test sur Chrome/Firefox/Safari

---

## 🎯 PARTIE 1: ConversationList Enhancements (10min)

### 1.1 Search & Filter

**URL:** `/fr/messages` (ou votre locale)

**Actions:**
- [ ] Cliquer sur l'input de recherche
- [ ] Taper un nom d'utilisateur existant
- [ ] **Attendu:** Liste filtrée en temps réel
- [ ] Taper un nom inexistant
- [ ] **Attendu:** Empty state "No conversations found"
- [ ] Effacer la recherche
- [ ] **Attendu:** Toutes les conversations réapparaissent

**Vérifications DevTools:**
```javascript
// Console ne doit PAS montrer:
// - Re-renders excessifs
// - Erreurs de filtrage
```

---

### 1.2 Sort Options

**Actions:**
- [ ] Cliquer sur le dropdown "Sort by"
- [ ] Sélectionner "Most recent"
- [ ] **Attendu:** Conversations triées par date (plus récente en haut)
- [ ] Sélectionner "Alphabetical"
- [ ] **Attendu:** Conversations triées A-Z par nom
- [ ] Sélectionner "Unread first"
- [ ] **Attendu:** Non lues en haut, puis par date

**Test Edge Case:**
- [ ] Avoir 5+ conversations non lues
- [ ] Sélectionner "Unread first"
- [ ] **Attendu:** Toutes les non lues groupées en haut

---

### 1.3 Skeleton Loading

**Actions:**
- [ ] Refresh page (Cmd+R / Ctrl+R)
- [ ] Observer les 2 premières secondes

**Attendu:**
- [ ] Header skeleton (2 lignes)
- [ ] Search & Sort skeleton
- [ ] Tabs skeleton
- [ ] 5 conversation skeletons avec avatar rond + 2 lignes de texte
- [ ] Transition smooth vers vraies données

---

### 1.4 Empty States

**Test 1: No Active Conversations**
- [ ] Archiver toutes les conversations actives
- [ ] **Attendu:** 
  - Icône MessageCircle
  - Texte "No conversations yet"
  - Bouton "New Conversation"

**Test 2: No Archived Conversations**
- [ ] Cliquer sur onglet "Archived"
- [ ] **Attendu:** 
  - Texte "No archived conversations"
  - Pas de bouton

**Test 3: Search No Results**
- [ ] Taper "zzzzz" dans search
- [ ] **Attendu:**
  - Icône Search
  - Texte "No conversations found"

---

### 1.5 Tab Transitions

**Actions:**
- [ ] Cliquer sur "Active" tab
- [ ] Cliquer sur "Archived" tab
- [ ] Alterner rapidement 3-4 fois

**Attendu:**
- [ ] Transition CSS smooth (pas de jump)
- [ ] Compteur mis à jour (ex: "Active (5)")
- [ ] Contenu change fluidement

---

## 🎯 PARTIE 2: MessageThread Improvements (10min)

### 2.1 Date Separators

**Setup:** Ouvrir une conversation avec messages de plusieurs jours

**Actions:**
- [ ] Scroll vers le haut (messages d'hier)
- [ ] **Attendu:** Séparateur "Yesterday" / "Hier"
- [ ] Scroll vers messages d'aujourd'hui
- [ ] **Attendu:** Séparateur "Today" / "Aujourd'hui"
- [ ] Scroll vers messages plus anciens
- [ ] **Attendu:** "January 15, 2025" (format localisé)

**Test i18n:**
- [ ] Changer langue (EN → FR → ES)
- [ ] **Attendu:** Formats de date traduits

**Vérification visuelle:**
```
─────────── Today ───────────
  Message 1
  Message 2
─────────── Yesterday ───────────
  Message 3
```

---

### 2.2 Message Grouping

**Setup:** Envoyer 3 messages rapides (<5min d'intervalle)

**Actions:**
- [ ] Envoyer message 1
- [ ] Envoyer message 2 (immédiatement)
- [ ] Envoyer message 3 (immédiatement)

**Attendu:**
- [ ] **1 seul avatar** (sur message 1)
- [ ] **1 seul nom** (sur message 1)
- [ ] **1 seul timestamp** (sur message 3)
- [ ] Espacement réduit entre messages (mt-1)

**Test délai >5min:**
- [ ] Attendre 5+ minutes (ou modifier date dans DevTools)
- [ ] Envoyer message 4
- [ ] **Attendu:** Nouveau groupe (avatar + nom + timestamp)

**Vérification visuelle:**
```
[Avatar] Alice: Hello
                How are you?
                Are you there?
         just now
         
[Avatar] Bob: I'm good
              Thanks!
         30 seconds ago
```

---

### 2.3 Scroll to Bottom Button

**Setup:** Conversation avec 20+ messages

**Actions:**
- [ ] Scroll vers le haut (>100px du bas)
- [ ] **Attendu:** Bouton ↓ apparaît (centré en bas, flottant)
- [ ] Continuer à scroller vers le haut
- [ ] **Attendu:** Bouton reste visible
- [ ] Cliquer sur le bouton
- [ ] **Attendu:** 
  - Scroll smooth jusqu'en bas
  - Bouton disparaît

**Test auto-hide:**
- [ ] Scroll manuellement vers le bas (proche du bas)
- [ ] **Attendu:** Bouton disparaît quand <100px du bas

---

### 2.4 Smart Auto-Scroll

**Test 1: User at bottom**
- [ ] Être en bas de la conversation
- [ ] Demander à l'autre utilisateur d'envoyer un message
- [ ] **Attendu:** Auto-scroll smooth vers le nouveau message ✅

**Test 2: User reading history**
- [ ] Scroll vers le haut (milieu de la conversation)
- [ ] Demander à l'autre utilisateur d'envoyer un message
- [ ] **Attendu:** 
  - PAS d'auto-scroll ❌
  - Bouton ↓ apparaît pour indiquer nouveau message

**Test 3: Return to bottom**
- [ ] Cliquer sur bouton ↓
- [ ] **Attendu:**
  - Scroll vers le bas
  - Auto-scroll réactivé pour prochains messages

---

## 🎯 PARTIE 3: MessageInput Enhancements (10min)

### 3.1 Character Counter

**Test affichage progressif:**
- [ ] Input vide → **Counter caché** ✅
- [ ] Taper 3000 caractères → **Counter caché** ✅
- [ ] Taper jusqu'à 4000 → **Counter gris affiché** (ex: "1000") ✅
- [ ] Taper jusqu'à 4900 → **Counter toujours gris** (ex: "100") ✅
- [ ] Taper jusqu'à 4950 → **Counter ROUGE** (ex: "50") ✅

**Test limite:**
- [ ] Essayer de taper au-delà de 5000
- [ ] **Attendu:** Impossible (input bloqué)

**Position:**
- [ ] Vérifier counter en bottom-right du textarea
- [ ] Vérifier pas de chevauchement avec texte

**Code test rapide:**
```javascript
// Console DevTools:
'A'.repeat(4500) // Copier-coller dans input
```

---

### 3.2 Keyboard Shortcuts

**Test Enter = Send:**
- [ ] Taper "Hello world"
- [ ] Appuyer sur **Enter**
- [ ] **Attendu:** Message envoyé, input vidé

**Test Shift+Enter = New Line:**
- [ ] Taper "Line 1"
- [ ] Appuyer sur **Shift+Enter**
- [ ] Taper "Line 2"
- [ ] **Attendu:** 
  - Saut de ligne (pas d'envoi)
  - Textarea agrandi (auto-resize)
- [ ] Appuyer sur **Enter**
- [ ] **Attendu:** Message multi-lignes envoyé

**Test hints visuels:**
- [ ] Vérifier texte sous l'input:
  - EN: "Enter to send • Shift+Enter for new line"
  - FR: "Entrée pour envoyer • Maj+Entrée pour nouvelle ligne"

---

### 3.3 Draft Autosave

**Test sauvegarde:**
- [ ] Taper "Draft message test"
- [ ] Attendre 500ms (ne PAS envoyer)
- [ ] Refresh page (Cmd+R)
- [ ] **Attendu:** Message restauré dans l'input ✅

**Test suppression après envoi:**
- [ ] Taper "Message to send"
- [ ] Attendre 500ms
- [ ] Envoyer le message (Enter)
- [ ] Refresh page
- [ ] **Attendu:** Input vide (draft supprimé) ✅

**Test par conversation:**
- [ ] Taper "Draft 1" dans conversation A
- [ ] Attendre 500ms
- [ ] Changer vers conversation B
- [ ] Taper "Draft 2" dans conversation B
- [ ] Attendre 500ms
- [ ] Revenir à conversation A
- [ ] **Attendu:** "Draft 1" restauré ✅
- [ ] Aller à conversation B
- [ ] **Attendu:** "Draft 2" restauré ✅

**Test effacement:**
- [ ] Taper "Test"
- [ ] Attendre 500ms (draft saved)
- [ ] Effacer tout le texte
- [ ] Attendre 500ms
- [ ] Refresh page
- [ ] **Attendu:** Input vide (draft supprimé car vide) ✅

**Vérification localStorage:**
```javascript
// Console DevTools:
Object.keys(localStorage).filter(k => k.startsWith('message_draft_'))
// Devrait montrer les clés par conversation
```

---

## 🎯 PARTIE 4: Performance Tests (5min)

### 4.1 React DevTools Profiler

**Setup:**
- [ ] Installer React DevTools extension
- [ ] Ouvrir Profiler tab

**Test scroll performance:**
- [ ] Start profiling
- [ ] Scroll rapide haut/bas dans thread (10 secondes)
- [ ] Stop profiling
- [ ] **Attendu:** 
  - Flamegraph propre
  - Pas de composants re-rendered excessivement
  - handleScroll memoïzé (pas de nouvelle instance)

**Test dropdown performance:**
- [ ] Start profiling
- [ ] Ouvrir/fermer menu contextuel 5 fois
- [ ] Stop profiling
- [ ] **Attendu:**
  - Handlers stables (useCallback)
  - Pas de re-render des conversations non concernées

---

### 4.2 Memory Leaks

**Test:**
- [ ] Ouvrir 10 conversations différentes rapidement
- [ ] Observer DevTools Memory tab
- [ ] **Attendu:** Pas de croissance mémoire excessive

**Cleanup drafts:**
- [ ] Créer 5 drafts dans 5 conversations
- [ ] Console: `localStorage.length`
- [ ] Envoyer tous les messages
- [ ] Console: `localStorage.length`
- [ ] **Attendu:** Drafts supprimés

---

## 🎯 PARTIE 5: Cross-Browser & Mobile (5min)

### 5.1 Cross-Browser

**Chrome:**
- [ ] Toutes fonctionnalités OK

**Firefox:**
- [ ] Character counter positionné correctement
- [ ] Scroll smooth fonctionne
- [ ] Date separators affichés

**Safari:**
- [ ] Draft localStorage fonctionne
- [ ] Keyboard shortcuts OK
- [ ] Auto-scroll smooth

---

### 5.2 Mobile Responsive

**Test sur mobile (DevTools ou device):**
- [ ] Conversation list visible en sidebar/drawer
- [ ] Search input utilisable
- [ ] Sort dropdown cliquable
- [ ] Message thread scrollable
- [ ] Textarea auto-resize fonctionne
- [ ] Keyboard shortcuts adaptés (mobile keyboard)
- [ ] Scroll to bottom button bien positionné

---

## 📊 Résultats Attendus

### ✅ Success Criteria

**Fonctionnel:**
- [ ] Toutes les 13 fonctionnalités marchent
- [ ] 0 erreur console
- [ ] 0 warning React
- [ ] Traductions correctes (5 langues testées)

**Performance:**
- [ ] Scroll fluide (<60fps)
- [ ] Search responsive (<100ms)
- [ ] Auto-scroll smooth
- [ ] Pas de memory leak

**UX:**
- [ ] Transitions smooth
- [ ] Empty states clairs
- [ ] Hints visibles
- [ ] Mobile utilisable

---

## 🐛 Bugs Potentiels à Surveiller

### ConversationList
- [ ] Search qui ne filtre pas correctement les accents
- [ ] Sort qui ne respecte pas la locale
- [ ] Skeleton qui ne match pas le layout final

### MessageThread
- [ ] Date separators dupliqués
- [ ] Messages groupés incorrectement (>5min groupés)
- [ ] Scroll button qui ne disparaît pas
- [ ] Auto-scroll qui force quand user scroll up

### MessageInput
- [ ] Counter négatif (si limite dépassée)
- [ ] Draft restauré dans mauvaise conversation
- [ ] Shift+Enter qui envoie quand même
- [ ] Textarea qui ne s'agrandit pas

---

## 📝 Template de Rapport

```markdown
# Tests Manuels - Messages Feature

**Date:** 4 octobre 2025
**Testeur:** [Votre nom]
**Durée:** [Temps réel]

## Environnement
- OS: macOS / Windows / Linux
- Browser: Chrome 120 / Firefox 121 / Safari 17
- Device: Desktop / Mobile

## Résultats

### ConversationList (/6)
- [x] Search & Filter
- [x] Sort Options
- [x] Skeleton Loading
- [x] Empty States
- [x] Tab Transitions
- [x] Performance

### MessageThread (/4)
- [x] Date Separators
- [x] Message Grouping
- [x] Scroll to Bottom
- [x] Smart Auto-Scroll

### MessageInput (/3)
- [x] Character Counter
- [x] Keyboard Shortcuts
- [x] Draft Autosave

### Performance (/2)
- [x] React Profiler OK
- [x] No Memory Leaks

## Bugs Trouvés
1. [Description bug 1]
2. [Description bug 2]

## Notes
[Observations additionnelles]
```

---

## 🚀 Après les Tests

### Si tout OK ✅
1. Update ROADMAP.md (Messages 100%)
2. Commit changes
3. Push to main
4. Celebrate! 🎉

### Si bugs trouvés 🐛
1. Noter dans rapport
2. Créer issues GitHub
3. Prioriser fixes
4. Re-test après corrections

---

**Bonne chance pour les tests ! 🧪**
