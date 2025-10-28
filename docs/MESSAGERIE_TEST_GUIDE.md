# 🧪 Guide de Test - Interface Messagerie

**Date**: 28 octobre 2025  
**Objectif**: Tester l'interface actuelle avant ajustements WhatsApp  
**Durée estimée**: 10 minutes

---

## 📋 Checklist de Test

### ✅ Étape 1 : Accéder à la Page de Debug (2 min)

1. **Lancez l'application** (si pas déjà fait)
   ```bash
   pnpm dev
   ```

2. **Connectez-vous** avec votre compte utilisateur
   - URL: `http://localhost:3000`
   - Email et mot de passe de votre compte test

3. **Naviguez vers Messages**
   - Menu dashboard → Messages
   - Ou directement: `http://localhost:3000/dashboard/messages`

4. **Cliquez sur le bouton "🐛 Debug"**
   - En haut à droite de la page (mobile et desktop)
   - Ou directement: `http://localhost:3000/dashboard/messages/debug`

### ✅ Étape 2 : Créer des Threads de Test (1 min)

Sur la page de debug :

1. **Vérifiez l'état actuel**
   - Section "État de la base de données"
   - Normalement : Threads: 0, Messages: 0

2. **Cliquez sur "Créer 4 threads de test"**
   - Bouton vert avec icône "Users"
   - Attendez 3-4 secondes
   - Vous devriez voir : "4 threads de test créés avec succès !"

3. **Rafraîchissez les statistiques**
   - Cliquez sur "Rafraîchir les statistiques"
   - Threads devrait maintenant afficher : 4
   - Messages devrait afficher : 12 (3 messages par thread)

4. **Vérifiez le hook**
   - Section "Hook useUserThreads"
   - `isLoading` : false ✓
   - `Threads chargés` : 4
   - `Erreur` : Aucune

### ✅ Étape 3 : Tester la Liste des Conversations (3 min)

1. **Retournez sur `/dashboard/messages`**
   - Cliquez sur le bouton retour
   - Ou naviguez directement

2. **Vérifiez la liste** (prenez des screenshots !)

   **✓ Vous devriez voir** :
   ```
   ┌─────────────── Messages ──────────────┐
   │  🔍  Rechercher...                    │
   │  [Active ●4]  [Archived]              │
   ├───────────────────────────────────────┤
   │  AM  Alice Martin         12:34   ●   │
   │      Parfait ! Je voulais...          │
   ├───────────────────────────────────────┤
   │  BD  Bob Dupont           12:33   ●   │
   │      Très bien, merci ! Et...         │
   ├───────────────────────────────────────┤
   │  CB  Clara Bernard        12:32   ●   │
   │      Parfait ! Je voulais...          │
   ├───────────────────────────────────────┤
   │  DP  David Petit          12:31   ●   │
   │      Très bien, merci ! Et...         │
   └───────────────────────────────────────┘
   ```

3. **Testez les interactions** :

   **Recherche** :
   - [ ] Cliquez dans la barre de recherche
   - [ ] Tapez "Alice"
   - [ ] Seul le thread avec Alice devrait apparaître
   - [ ] Effacez la recherche → Tous les threads réapparaissent

   **Filtres** :
   - [ ] Cliquez sur l'onglet "Archived"
   - [ ] Liste vide (message "Aucune conversation archivée")
   - [ ] Revenez sur "Active"
   - [ ] Les 4 threads réapparaissent

   **Menu Actions** :
   - [ ] Hover sur un thread
   - [ ] Cliquez sur les 3 points (⋮)
   - [ ] Menu avec "Archive", "Delete" s'affiche
   - [ ] Cliquez en dehors pour fermer

   **Visuel** :
   - [ ] Avatars circulaires avec initiales (AM, BD, CB, DP)
   - [ ] Couleurs d'avatars différentes
   - [ ] Badges unread verts (●) visibles
   - [ ] Timestamps affichés (format relatif)
   - [ ] Hover effect au survol

### ✅ Étape 4 : Tester la Conversation (4 min)

1. **Ouvrez une conversation**
   - Cliquez sur "Alice Martin"
   - Page de conversation devrait s'ouvrir

2. **Vérifiez le Header** (prenez un screenshot !)

   **✓ Vous devriez voir** :
   ```
   ┌────────────────────────────────────────┐
   │ ← 👤 AM Alice Martin  📞 📹 🔍 ⋮     │ ← Header avec gradient ?
   └────────────────────────────────────────┘
   ```

   **Checklist Header** :
   - [ ] Bouton retour (←) visible
   - [ ] Avatar Alice Martin avec initiales "AM"
   - [ ] Nom "Alice Martin" affiché
   - [ ] Boutons Call (📞), Video (📹), Search (🔍), Menu (⋮)
   - [ ] Fond avec gradient vert (si implémenté)
   - [ ] Responsive (sur mobile, boutons adaptés)

3. **Vérifiez les Messages**

   **✓ Vous devriez voir 3 messages** :
   ```
   👤  Bonjour ! Comment allez-vous ?    12:34
   
          Très bien, merci ! Et vous ?   12:34  👤
   
   👤  Parfait ! Je voulais discuter...  12:34
   ```

   **Checklist Messages** :
   - [ ] 3 messages visibles
   - [ ] Messages de gauche (reçus) avec avatar
   - [ ] Messages de droite (envoyés) sans avatar
   - [ ] Bulles avec fond coloré :
     - Reçus : fond blanc ou gris clair
     - Envoyés : fond vert clair (#DCF8C6 ?)
   - [ ] Timestamps (HH:MM) affichés
   - [ ] Queues sur les bulles (triangles pointant vers l'expéditeur)

4. **Testez l'Input**

   **Barre de saisie** :
   - [ ] Input visible en bas
   - [ ] Placeholder "Type a message..." ou équivalent
   - [ ] Bouton emoji (😊) à gauche
   - [ ] Bouton attachments (📎) ou micro (🎤)
   - [ ] Bouton send (➤) à droite

   **Emoji Picker** :
   - [ ] Cliquez sur l'icône emoji
   - [ ] Popover avec emojis s'ouvre
   - [ ] Cliquez sur un emoji → Il apparaît dans l'input
   - [ ] Fermez le popover

   **Envoi de message** :
   - [ ] Tapez "Test message"
   - [ ] Bouton send devient vert (#25D366 ?)
   - [ ] Appuyez Enter ou cliquez send
   - [ ] Message apparaît dans la conversation (à droite)
   - [ ] Auto-scroll vers le bas
   - [ ] Read receipts (✓✓) apparaissent

5. **Testez le Menu Header**

   - [ ] Cliquez sur les 3 points (⋮) dans le header
   - [ ] Menu dropdown s'affiche
   - [ ] Options visibles (Archive, Block, Report, etc.)

### ✅ Étape 5 : Screenshots pour Comparaison

**Prenez des screenshots de** :

1. **Liste des conversations** (pleine largeur)
   - Vue desktop avec les 4 threads
   - Vue mobile (si possible)

2. **Conversation Alice Martin** :
   - Header complet
   - Messages visibles
   - Input de saisie

3. **Détails visuels** :
   - Avatar en gros plan
   - Bulle de message envoyé
   - Bulle de message reçu
   - Emoji picker ouvert
   - Menu actions ouvert

4. **États** :
   - Empty state (onglet "Archived")
   - Résultat de recherche
   - Loading skeleton (si visible au chargement)

---

## 📊 Grille d'Évaluation

Après vos tests, remplissez cette grille :

### Design Général

| Élément | Note /5 | Commentaire |
|---------|---------|-------------|
| Couleurs | ___/5 | Vert WhatsApp présent ? |
| Typographie | ___/5 | Police lisible ? |
| Espacements | ___/5 | Aéré ? Compact ? |
| Cohérence | ___/5 | Uniforme partout ? |

### Liste des Conversations

| Élément | ✓/✗ | Commentaire |
|---------|-----|-------------|
| Avatars colorés | ☐ | Jolies couleurs ? |
| Badges unread | ☐ | Bien visibles ? |
| Timestamps | ☐ | Format OK ? |
| Hover effect | ☐ | Smooth ? |
| Search | ☐ | Rapide ? |
| Filtres tabs | ☐ | 2 suffisent ou besoin de 4 pills ? |

### Conversation

| Élément | ✓/✗ | Commentaire |
|---------|-----|-------------|
| Header moderne | ☐ | Gradient visible ? |
| Bulles messages | ☐ | Couleurs OK ? Queues ? |
| Read receipts | ☐ | ✓✓ visibles ? |
| Emoji picker | ☐ | Facile à utiliser ? |
| Auto-scroll | ☐ | Fluide ? |
| Responsive | ☐ | Mobile OK ? |

### Performance

| Aspect | Note /5 | Commentaire |
|--------|---------|-------------|
| Temps de chargement | ___/5 | < 2s ? |
| Real-time | ___/5 | Instantané ? |
| Fluidité | ___/5 | Lag ? |
| Responsive | ___/5 | Mobile fluide ? |

---

## 🎯 Questions à se Poser

Après vos tests, répondez à ces questions :

### Ressemblance WhatsApp

1. **L'interface ressemble-t-elle déjà à WhatsApp ?**
   - [ ] Oui, beaucoup (80%+)
   - [ ] Moyennement (50-80%)
   - [ ] Peu (< 50%)

2. **Quels sont les 3 plus grandes différences visuelles ?**
   - 1. ___________________________________
   - 2. ___________________________________
   - 3. ___________________________________

3. **Qu'est-ce qui vous plaît le plus ?**
   - ___________________________________

4. **Qu'est-ce qui doit absolument changer ?**
   - ___________________________________

### Priorités d'Ajustements

**Classez par importance (1 = le plus important)** :

- [ ] ___ Changer les tabs en pills (comme WhatsApp)
- [ ] ___ Ajouter fond beige #F0F2F5
- [ ] ___ Ajuster la typographie (Segoe UI)
- [ ] ___ Ajouter banner notification
- [ ] ___ Ajuster les espacements
- [ ] ___ Améliorer les animations
- [ ] ___ Ajouter empty state illustré
- [ ] ___ Autre : _______________________

---

## 📸 Template de Rapport

Une fois vos tests terminés, partagez vos screenshots et remplissez :

```markdown
## Rapport de Test - Interface Messagerie

**Date** : 28 octobre 2025
**Testeur** : [Votre nom]
**Durée** : [X minutes]

### Screenshots
[Collez vos screenshots ici]

### Résumé
- ✅ Ce qui fonctionne bien : ...
- ⚠️ Ce qui doit être amélioré : ...
- ❌ Ce qui ne fonctionne pas : ...

### Comparaison WhatsApp
- Ressemblance globale : [X]%
- Principales différences :
  1. ...
  2. ...
  3. ...

### Priorités pour Option A
1. [Ajustement prioritaire]
2. [Ajustement secondaire]
3. [Ajustement tertiaire]

### Notes additionnelles
[Vos observations...]
```

---

## 🚀 Prochaine Étape

Une fois vos tests terminés et screenshots partagés, nous passerons à **l'Option A** :

### Ajustements Visuels WhatsApp (2h)

Basé sur vos retours, j'implémenterai :

1. **Ajustements critiques** (30 min)
   - Éléments prioritaires que vous avez identifiés

2. **Ajustements moyens** (45 min)
   - Améliorations visuelles importantes

3. **Ajustements mineurs** (30 min)
   - Polissage final, détails

4. **Validation** (15 min)
   - Tests après ajustements
   - Comparaison finale avec WhatsApp Web

---

**Bon test ! Prenez des screenshots et partagez-les pour qu'on passe à l'Option A ! 📸**
