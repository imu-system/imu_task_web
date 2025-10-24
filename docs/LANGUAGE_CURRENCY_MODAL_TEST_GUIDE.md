# Guide de test rapide - Language & Currency Modal

## Étapes de test

### 1. Page d'accueil (Landing Page)

**Desktop :**
1. Ouvrir http://localhost:9002
2. Regarder le header en haut à droite
3. Chercher le bouton avec l'icône **Globe** 🌍
4. Le bouton doit afficher : `🇫🇷 FR | € EUR` (ou langue/devise actuelle)
5. **Cliquer sur le bouton**

**Résultat attendu :**
- Modal s'ouvre au centre de l'écran
- Titre : "Langue & Devise"
- Description visible
- 2 onglets : "Langue & Région" | "Devise"
- Onglet "Langue & Région" actif par défaut
- Border radius rounded-3xl visible

### 2. Onglet Langue & Région

**Test de l'interface :**
1. Vérifier la barre de recherche avec icône 🔍
2. Vérifier les 3 options de langues :
   - 🇫🇷 Français | France (avec check ✓ si sélectionné)
   - 🇺🇸 English | United States
   - 🇯🇵 日本語 | 日本
3. Hover sur une option → fond change (bg-accent/50)
4. Option sélectionnée → bordure bleue (border-primary)

**Test de la recherche :**
1. Taper "Anglais" dans la recherche
2. Seul "English" doit apparaître
3. Taper "xyz" → Message "Aucune langue trouvée"
4. Effacer → Toutes les langues réapparaissent

**Test du changement de langue :**
1. Cliquer sur "English"
2. Modal se ferme
3. URL change : `/` → `/en`
4. Toute l'interface passe en anglais
5. Bouton affiche maintenant : `🇺🇸 EN | € EUR`

### 3. Onglet Devise

**Cliquer sur l'onglet "Devise" :**

**Test de l'interface :**
1. Vérifier le texte descriptif en haut
2. Vérifier les 8 options de devises :
   - 🇪🇺 Euro | EUR | €
   - 🇺🇸 US Dollar | USD | $
   - 🇬🇧 British Pound | GBP | £
   - 🇯🇵 Japanese Yen | JPY | ¥
   - 🇨🇦 Canadian Dollar | CAD | C$
   - 🇦🇺 Australian Dollar | AUD | A$
   - 🇨🇭 Swiss Franc | CHF | Fr
   - 🇨🇳 Chinese Yuan | CNY | ¥

**Test du changement de devise :**
1. Cliquer sur "US Dollar"
2. Modal se ferme
3. Bouton affiche maintenant : `🇺🇸 EN | $ USD`
4. (Note : Le changement de devise est local pour l'instant)

### 4. Mobile

**Ouvrir DevTools → Mode responsive (iPhone/Android) :**

1. Cliquer sur le menu hamburger ☰ en haut à droite
2. Sheet s'ouvre à droite
3. Scroller vers le bas
4. Section "Mobile Language Switcher"
5. Bouton pleine largeur avec bordure (variant="outline")
6. **Cliquer sur le bouton**

**Résultat attendu :**
- Modal s'ouvre (même design que desktop)
- Plus compact sur petit écran
- ScrollArea fonctionne pour les listes
- Tout reste accessible

### 5. Dashboard

**Si connecté, aller sur /dashboard :**

1. Header du dashboard (DashboardHeader)
2. Chercher le bouton Globe entre "Create" et "Messages"
3. **Cliquer dessus**

**Résultat attendu :**
- Même modal
- Même fonctionnalités
- Design cohérent

## Checklist visuelle

### Design
- [ ] Modal : rounded-3xl visible
- [ ] DialogTitle : text-2xl, font-headline
- [ ] Tabs : rounded-2xl, grid-cols-2
- [ ] TabsTrigger : rounded-xl
- [ ] Input recherche : rounded-2xl, h-12
- [ ] Boutons sélection : rounded-2xl, border-2
- [ ] Drapeaux emoji : bien visibles (text-3xl)
- [ ] Check icons : couleur primary, visible sur sélection

### Couleurs (ImuTask palette)
- [ ] Primary (bleu #3B82F6) : bordures sélectionnées, check icons
- [ ] Border : bordures non-sélectionnées
- [ ] Accent : hover states
- [ ] Muted-foreground : textes secondaires

### Animations
- [ ] Hover sur langue/devise : transition smooth
- [ ] Border change : animation fluide
- [ ] Modal open/close : Dialog animation native
- [ ] Tab switch : transition douce

### Responsive
- [ ] Desktop (>1024px) : Modal centré, max-w-[600px]
- [ ] Tablet (768-1024px) : Modal centré, adapté
- [ ] Mobile (<768px) : Modal plein écran ou adapté
- [ ] Bouton trigger : texte caché sur mobile (sm:inline)

## Tests de traductions

### Français (par défaut)
- [ ] Titre : "Langue & Devise"
- [ ] Description : "Personnalisez votre expérience..."
- [ ] Onglet 1 : "Langue & Région"
- [ ] Onglet 2 : "Devise"
- [ ] Recherche : "Rechercher une langue..."
- [ ] Devise description : "Sélectionnez votre devise préférée pour afficher les prix."
- [ ] Langues : "Français", "Anglais", "Japonais"
- [ ] Pays : "France", "États-Unis", "Japon"
- [ ] Devises : "Euro", "Dollar américain", "Livre sterling"...
- [ ] No results : "Aucune langue trouvée"

### English
1. Changer en anglais
2. Rouvrir le modal
3. Vérifier :
   - [ ] Title : "Language & Currency"
   - [ ] Description : "Customize your experience..."
   - [ ] Tab 1 : "Language & Region"
   - [ ] Tab 2 : "Currency"
   - [ ] Search : "Search for a language..."
   - [ ] Languages : "French", "English", "Japanese"
   - [ ] Countries : "France", "United States", "Japan"
   - [ ] Currencies : "Euro", "US Dollar", "British Pound"...
   - [ ] No results : "No languages found"

### Japanese (ja)
1. Changer en japonais
2. Rouvrir le modal
3. Vérifier les traductions japonaises
   - [ ] Tous les textes en japonais

## Bugs à vérifier

### Fonctionnels
- [ ] Recherche vide ne crash pas
- [ ] Sélection langue ferme le modal
- [ ] Sélection devise ferme le modal
- [ ] État check icon correct après sélection
- [ ] Retour arrière navigateur fonctionne
- [ ] Pas de double modal si click rapide

### Visuels
- [ ] Pas de flash de contenu non stylé
- [ ] ScrollArea smooth
- [ ] Textes ne débordent pas
- [ ] Drapeaux alignés correctement
- [ ] Grid responsive (pas cassé)

### Accessibilité
- [ ] Tab keyboard navigation fonctionne
- [ ] Escape ferme le modal
- [ ] Focus visible sur éléments
- [ ] Screen reader labels (sr-only) présents
- [ ] Contrast ratio suffisant (textes lisibles)

## Performance

- [ ] Modal s'ouvre rapidement (<100ms)
- [ ] Recherche instantanée (pas de lag)
- [ ] Pas de re-render inutile
- [ ] Pas d'erreur console

## Console Checks

Ouvrir DevTools → Console :
- [ ] Pas d'erreur rouge
- [ ] Pas d'avertissement hydration
- [ ] Pas d'erreur de traduction (MISSING_MESSAGE)

## Si problème détecté

1. Noter le problème exact
2. Screenshot si possible
3. Vérifier la console
4. Vérifier l'onglet Network (erreurs API?)
5. Reporter avec détails

## Validation finale

Si tous les tests passent :
- ✅ Le modal fonctionne parfaitement
- ✅ Design conforme à ImuTask
- ✅ Traductions correctes
- ✅ Responsive OK
- ✅ Accessibilité OK

**Statut de la tâche : COMPLETED ✅**
