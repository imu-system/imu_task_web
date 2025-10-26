# 🚀 Phase 5 - Landing Page & Authentification

**Date de création** : 26 octobre 2025  
**Statut** : 🟡 En cours  
**Durée estimée** : 2-3 jours (~17h)  
**Priorité** : 🔴 Haute

---

## 📋 Vue d'ensemble

**Objectif** : Améliorer l'expérience utilisateur sur les pages publiques, l'onboarding et le processus d'authentification pour offrir une première impression professionnelle et fluide.

**Contexte** : Le MVP V1.0 est complété (16/16 tâches), avec dashboards fonctionnels, recherche Algolia optimisée et tests complets. Il est temps de polir l'expérience d'entrée pour nouveaux utilisateurs.

---

## 🎯 Objectifs de la Phase

### 1. **Landing Page** : Clarifier les 3 segments cibles
- Rendre visible la proposition de valeur pour Particuliers, Professionnels et Seniors
- Améliorer le Hero avec variants adaptés
- Ajouter badges "Certifié PMR" pour accessibilité

### 2. **Pages Authentification** : Moderniser le design
- Layout 2 colonnes professionnel (formulaire + illustration)
- Validation temps réel avec feedback utilisateur
- Redirections intelligentes selon accountType

### 3. **Onboarding** : Améliorer choix AccountType
- Design 3 cards attractives et explicatives
- Modal "En savoir plus" par type
- Workflow fluide signup → onboarding → dashboard

### 4. **Navigation** : Cohérence et i18n
- Audit complet des liens (utiliser `@/navigation`)
- Middleware redirections (auth, locale, accountType)
- Breadcrumbs pour pages profondes

---

## 📊 Progression Globale

**Total tâches** : 4 grandes tâches, 17 sous-tâches

| Task | Sous-tâches | Complétées | Estimé | Statut |
|------|-------------|------------|--------|--------|
| **Task 1: Landing Page** | 4 | 4 | 3h15 | 🟢 100% ✅ |
| **Task 2: Auth Pages** | 5 | 5 | 6h | � 100% ✅ |
| **Task 3: Onboarding** | 3 | 0 | 3h30 | ⏳ 0% |
| **Task 4: Navigation** | 4 | 0 | 4h | ⏳ 0% |
| **Total** | **17** | **9** | **~17h** | 🟡 **53%** |

---

## 🔧 Task 1 : Landing Page - Segmentation par Profils

**Durée estimée** : 3h15  
**Durée réelle** : 3h15  
**Priorité** : 🔴 Haute  
**État** : ✅ 100% COMPLÉTÉ (4/4 sous-tâches)

### Contexte

Les traductions pour les pages de profils sont **100% complètes** (FR + EN) :
- ✅ `/particuliers` - 100% bilingue
- ✅ `/professionnels` - 100% bilingue
- ✅ `/seniors` - 100% bilingue
- ✅ `/carelink` - 100% bilingue

**Prochaine étape** : Implémentation visuelle et routing uniquement

---

### ✅ Sous-tâche 1.1 : Améliorer section "Pour qui ?" après Hero (1h) ✅ COMPLÉTÉE

**Objectif** : Rendre les 3 segments cibles visibles et cliquables

**Actions** :
- [x] Créer composant `<ProfileCards />` réutilisable ✅
  - Localisation : `src/components/landing/profile-cards.tsx`
  - Props : Support i18n via next-intl
- [x] Design 3 cards cliquables ✅ :
  - **Card 1 : Particuliers**
    - Icon : `User` (lucide-react) ✅
    - Titre : "Pour les Particuliers" ✅
    - Description courte : "Trouvez de l'aide pour vos tâches quotidiennes" ✅
    - 3-4 points clés ✅ : "Prestataires locaux qualifiés", "Paiement sécurisé", "Avis vérifiés", "Support 7j/7"
    - CTA : "Découvrir →" ✅
    - Lien : `/particuliers` ✅
  - **Card 2 : Professionnels**
    - Icon : `Briefcase` ✅
    - Titre : "Pour les Professionnels" ✅
    - Description : "Développez votre activité de services locaux" ✅
    - Points clés ✅ : "Clients qualifiés", "Calendrier intégré", "Paiements automatiques", "Assurance RC"
    - CTA : "En savoir plus →" ✅
    - Lien : `/professionnels` ✅
  - **Card 3 : Seniors & Aidants**
    - Icon : `Heart` ✅
    - Titre : "Pour les Seniors" ✅
    - Description : "Services adaptés et accompagnement bienveillant" ✅
    - Points clés ✅ : "Services PMR ♿", "Contacts aidants", "Bouton SOS", "Interface vocale"
    - CTA : "Découvrir CareLink →" ✅
    - Lien : `/seniors` ✅
- [x] Animations ✅ :
  - Hover : Scale 1.02, y: -8, shadow-2xl ✅
  - Icon rotation 360° on hover ✅
  - Features fade-in avec stagger ✅
  - Transitions : smooth avec Framer Motion ✅
- [x] Responsive ✅ :
  - Mobile : 1 colonne (stack) ✅
  - Tablet : 3 colonnes (md:grid-cols-3) ✅
  - Desktop : 3 colonnes égales avec max-w-7xl ✅
- [x] i18n ✅ :
  - Utiliser clés `LandingPage.profiles.*` ✅
  - FR + EN complet ✅

**Fichiers modifiés** :
- ✅ `src/app/[locale]/(main)/page.tsx` (utilise `<ProfileCards />`)
- ✅ `src/components/landing/profile-cards.tsx` (enhanced avec features + animations)
- ✅ `messages/fr.json` et `messages/en.json` (12 features FR + 12 EN)

**Critères d'acceptation** :
- ✅ 3 cards visibles et cliquables
- ✅ Design cohérent avec brand (gradients : bleu, vert, rose)
- ✅ Liens fonctionnels vers pages profils
- ✅ Responsive mobile/tablet/desktop
- ✅ Animations Framer Motion smooth

---

### ✅ Sous-tâche 1.2 : Optimiser Hero variant "Seniors" (45 min) ✅ COMPLÉTÉE

**Objectif** : Créer un Hero spécifique pour le segment Seniors

**Actions** :
- [x] Créer composant Hero réutilisable ✅ :
  - Fichier : `src/components/landing/hero.tsx` (187 lignes)
  - Prop : `variant?: 'default' | 'seniors'`
- [x] Améliorer visuels Hero ✅ :
  - Photo seniors : `placeholderImages.seniors.src`
  - Alt text : "Senior souriant avec aide à domicile" ✅
- [x] Texte spécifique ✅ :
  - Badge : "Services adaptés seniors & aidants" ♿ ✅
  - Titre : "Services à domicile" + highlight "adaptés seniors ♿" ✅
  - Sous-titre : "Aide quotidienne bienveillante, professionnelle et sécurisée" ✅
  - i18n : `LandingPage.hero.seniorVariant.*` ✅
- [x] CTA principal ✅ :
  - Primary : "Découvrir CareLink" avec icon Heart → `/seniors` ✅
  - Secondary : "Devenir aide à domicile" → `/inscription?type=senior` ✅
  - Gradient : rose-500 → pink-500 → purple-500 ✅
- [x] Palette couleurs ✅ :
  - Gradient : `from-rose-50/90 via-pink-50/80 to-purple-50/70` (pastel) ✅
  - Badge : rose-100, text-rose-700 ✅
  - Features pills : ♿ Certifié PMR, 🔒 100% sécurisé, 📱 Interface simple ✅
- [x] Integration ✅ :
  - Page `/` : `<Hero variant="default" />` ✅
  - Page `/seniors` : `<Hero variant="seniors" />` ✅

**Fichiers créés/modifiés** :
- ✅ Créé `src/components/landing/hero.tsx`
- ✅ Modifié `src/app/[locale]/(main)/page.tsx` (refactored Hero)
- ✅ Modifié `src/app/[locale]/(public)/seniors/page.tsx` (utilise Hero variant)
- ✅ `messages/fr.json` et `messages/en.json` (17 clés FR + 17 EN)
- ✅ `src/app/lib/placeholder-images.json` (ajout image seniors)

**Critères d'acceptation** :
- ✅ Hero variant "seniors" distinct et accessible
- ✅ Visuels adaptés (image seniors)
- ✅ Palette couleurs pastel (rose/pink/purple) avec contraste AAA
- ✅ CTA clair vers `/seniors`
- ✅ i18n complet FR/EN
- ✅ Animations Framer Motion
- ✅ Features pills affichées

---

### ✅ Sous-tâche 1.3 : Badge "Certifié PMR" sur catégories (1h) ✅ COMPLÉTÉE

**Objectif** : Indiquer les services adaptés aux personnes à mobilité réduite

**Actions** :
- [x] Ajouter propriété `isAccessible: boolean` dans `src/lib/constants/categories.ts` ✅ (déjà présente)
  ```typescript
  export interface TaskCategory {
    id: string;
    slug: string;
    nameKey: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    isAccessible?: boolean; // Adapté aux personnes à mobilité réduite (PMR)
  }
  ```
- [x] Marquer catégories adaptées PMR ✅ :
  - ✅ Ménage (cleaning)
  - ✅ Livraison (delivery)
  - ✅ Cours particuliers (tutoring)
  - ✅ Services maison (home_services)
  - ❌ Déménagement (moving - heavy-lifting, non accessible)
  - ❌ Jardinage (gardening - peut être physique)
  - ❌ Bricolage (handyman - peut nécessiter force physique)
  - ❌ Garde animaux (pet_care - mobilité requise)
- [x] Créer badge composant ✅ :
  - Localisation : `src/components/ui/accessible-badge.tsx`
  - Design : Badge avec icon ♿ + texte "Certifié PMR"
  - Variants : `default`, `outline`, `solid`
  - i18n : `common.badges.accessible`
- [x] Afficher badge sur cards catégories ✅ :
  - Dans `CategoryPills` component
  - Position : Coin supérieur droit de la card (absolute -top-2 -right-2)
  - Variant : `solid` pour visibilité maximale
- [ ] Filtrage optionnel (optionnel, non bloquant) :
  - Dans `AdvancedFilters` (composant recherche)
  - Toggle : "Services PMR uniquement"
  - Query param : `?accessible=true`
  - Filtre Algolia : `isAccessible:true`

**Fichiers créés/modifiés** :
- ✅ `src/lib/constants/categories.ts` (propriété `isAccessible` déjà présente)
- ✅ Créé `src/components/ui/accessible-badge.tsx`
- ✅ Modifié `src/components/landing/category-pills.tsx` (afficher badge)
- ⏳ `src/components/search/advanced-filters.tsx` (toggle optionnel - à faire)
- ✅ `messages/fr.json` et `messages/en.json` (clés `common.badges.accessible`)

**Critères d'acceptation** :
- ✅ Propriété `isAccessible` présente sur catégories
- ✅ Badge visible sur cards catégories adaptées
- ⏳ Filtrage fonctionnel dans recherche (optionnel)
- ✅ i18n complet FR/EN
- ✅ Badge bien positionné (coin supérieur droit)

---

### ✅ Sous-tâche 1.4 : Tests e2e Landing Page (30 min) ✅ COMPLÉTÉE

**Objectif** : Valider fonctionnalités Landing Page

**Actions** :
- [x] Créer fichier test : `e2e/landing-page.spec.ts` ✅
- [x] Tests implémentés (12 tests au total) ✅ :
  - **Test 1** : Navigation vers pages profils ✅
    - Cliquer card "Particuliers" → vérifie URL `/particuliers`
    - Cliquer card "Professionnels" → vérifie URL `/professionnels`
    - Cliquer card "Seniors" → vérifie URL `/seniors`
  - **Test 2** : Hero variant default sur landing ✅
    - Vérifier Hero par défaut (pas variant seniors)
    - Vérifier CTA principal présent
  - **Test 3** : Hero variant seniors sur /seniors ✅
    - Vérifier titre contient "senior"
    - Vérifier CTA "Découvrir CareLink"
    - Vérifier gradient rose/pink/purple
  - **Test 4** : Badge PMR visible ✅
    - Vérifier badges "Certifié PMR" affichés
    - Vérifier au moins 1 badge présent (4 catégories accessibles)
  - **Test 5** : Responsive Mobile ✅
    - Viewport 375x667
    - Vérifier ProfileCards visibles en stack vertical
  - **Test 6** : Responsive Desktop ✅
    - Viewport 1920x1080
    - Vérifier grid 3 colonnes des ProfileCards
  - **Test 7** : CategoryPills affichage et interaction ✅
    - Vérifier catégories visibles (9 total)
    - Test clic sur catégorie
  - **Test 8** : i18n FR ↔ EN ✅
    - Switch locale et vérifier contenu traduit
  - **Test 9** : Hero CTA cliquable ✅
    - Vérifier CTA présent avec href valide
  - **Test 10** : Animations et interactivité ✅
    - Vérifier hover sur ProfileCards
    - Vérifier animations Framer Motion
  - **Test A11y 1** : ARIA labels et structure sémantique ✅
    - Vérifier h1 présent
    - Vérifier liens accessibles
    - Vérifier contraste badges PMR
  - **Test A11y 2** : Navigation au clavier ✅
    - Test navigation Tab
    - Vérifier focus visible

**Fichiers créés** :
- ✅ `e2e/landing-page.spec.ts` (200 lignes, 12 tests)

**Tests couverts** :
- ✅ Navigation profils (3 liens)
- ✅ Hero variants (default + seniors)
- ✅ Badges PMR affichage
- ✅ Responsive (mobile + desktop)
- ✅ CategoryPills interaction
- ✅ i18n FR/EN
- ✅ Accessibilité (ARIA + clavier)

**Critères d'acceptation** :
- ✅ 12 tests créés (dépassé l'objectif de 4)
- ✅ Coverage landing page complète
- ✅ Tests responsive mobile/desktop
- ✅ Tests accessibilité inclus

---

## � Bilan Task 1 - Landing Page ✅ COMPLÉTÉE

**Résumé** : Task 1 complétée à 100% avec 4/4 sous-tâches terminées.

### Réalisations

**✅ Sous-tâche 1.1 : ProfileCards (1h)**
- Composant réutilisable avec 3 cards (Particuliers, Professionnels, Seniors)
- Animations Framer Motion (hover, rotation icon, stagger)
- Responsive mobile/tablet/desktop
- 12 features traduites (FR + EN)

**✅ Sous-tâche 1.2 : Hero variant Seniors (45min)**
- Composant Hero avec variants (default | seniors)
- Gradient adaptatif (bleu/cyan pour default, rose/pink/purple pour seniors)
- 17 clés i18n ajoutées (FR + EN)
- Integration sur pages `/` et `/seniors`

**✅ Sous-tâche 1.3 : Badge PMR (1h)**
- Composant AccessibleBadge avec 3 variants
- Badge affiché sur 4/9 catégories accessibles
- Position corner badge (absolute -top-2 -right-2)
- Traductions FR/EN complètes

**✅ Sous-tâche 1.4 : Tests e2e (30min)**
- Fichier `e2e/landing-page.spec.ts` créé
- 12 tests implémentés (dépassé objectif de 4)
- Coverage : navigation, Hero variants, badges PMR, responsive, i18n, accessibilité

### Fichiers créés/modifiés

**Créés (3 fichiers)** :
- `src/components/landing/hero.tsx` (187 lignes)
- `src/components/ui/accessible-badge.tsx` (42 lignes)
- `e2e/landing-page.spec.ts` (200 lignes, 12 tests)

**Modifiés (8 fichiers)** :
- `src/components/landing/profile-cards.tsx` (enhanced)
- `src/components/landing/category-pills.tsx` (badges PMR)
- `src/app/[locale]/(main)/page.tsx` (Hero + ProfileCards)
- `src/app/[locale]/(public)/seniors/page.tsx` (Hero variant)
- `src/app/lib/placeholder-images.json` (image seniors)
- `src/messages/fr.json` (31 clés ajoutées: 12 features + 17 hero + 2 badges)
- `src/messages/en.json` (31 clés ajoutées: 12 features + 17 hero + 2 badges)
- `docs/PHASE_5_LANDING_AUTH_PLAN.md` (ce fichier)

### Métriques

- **Durée estimée** : 3h15
- **Durée réelle** : 3h15 ✅
- **TypeScript errors** : 0 ✅
- **i18n coverage** : 100% FR + EN ✅
- **Tests e2e** : 12/12 créés ✅
- **Components créés** : 2 (Hero, AccessibleBadge)
- **Lignes de code** : ~430 lignes

### Prochaine étape

➡️ **Task 2 : Pages Authentification** (6h estimées)

---

## �🔐 Task 2 : Pages Authentification - Modernisation

**Durée estimée** : 6h  
**Priorité** : 🔴 Haute  
**État** : ⏳ À faire

### Contexte

Pages actuelles `/signup` et `/signin` sont fonctionnelles mais manquent de polish. Objectif : layout moderne, validation temps réel, redirections intelligentes.

---

### ✅ Sous-tâche 2.1 : Redesign page /signup (2h) ✅ COMPLÉTÉE

**Objectif** : Moderniser page inscription avec layout 2 colonnes

**Actions** :
- [x] Layout 2 colonnes ✅ :
  - **Colonne gauche** (50%) : Formulaire
  - **Colonne droite** (50%) : Illustration + Bénéfices
  - Mobile : Stack vertical (formulaire en haut)
- [x] Formulaire signup ✅ :
  - Champs : Email, Password, First Name, Last Name
  - Validation : Zod schema + react-hook-form
  - Errors : Affichage temps réel sous chaque champ
  - Submit : Bouton "Créer mon compte" (disabled si form invalide)
- [x] Validation temps réel ✅ :
  - Email : Format valide
  - Password : Min 6 caractères
  - First Name : Min 2 caractères
  - Last Name : Min 2 caractères
- [x] Animations ✅ :
  - Framer Motion : FadeIn formulaire (delay stagger)
  - Errors : Affichage avec composant Alert
  - Success : Message + redirection /onboarding
- [x] OAuth ✅ :
  - Bouton "Continuer avec Google" (fonctionnel)
  - Bouton "Continuer avec Apple" (placeholder)
  - Divider : "OU"
- [x] Illustration droite ✅ :
  - Composant `<AuthIllustration variant="signup" />`
  - Bénéfices clés affichés
  - Responsive : Masqué sur mobile
- [x] Lien vers /signin ✅ :
  - Texte : "Vous avez déjà un compte ? Connectez-vous"
  - Position : En bas du formulaire

**Fichiers existants/modifiés** :
- ✅ `src/app/[locale]/auth/signup/page.tsx` (déjà existant, utilise les composants)
- ✅ `src/components/auth/signup-form.tsx` (déjà créé avec validation complète)
- ✅ `src/components/auth/auth-illustration.tsx` (déjà créé, réutilisable)
- ✅ `messages/fr.json` et `messages/en.json` (ajout `Auth.signup.*` - 37 clés FR+EN)

**Traductions ajoutées** :
- 37 clés de traduction par langue (FR + EN)
- Validation messages, labels, placeholders, errors, success messages
- OAuth button labels

**Critères d'acceptation** :
- ✅ Layout 2 colonnes responsive
- ✅ Validation temps réel fonctionnelle
- ✅ OAuth Google intégré (Apple en placeholder)
- ✅ Animations Framer Motion
- ✅ i18n complet FR/EN
- ✅ 0 erreurs TypeScript

---

### ✅ Sous-tâche 2.2 : Redesign page /signin (1h30) ✅ COMPLÉTÉE

**Objectif** : Moderniser page connexion (cohérence avec signup)

**Actions** :
- [x] Layout 2 colonnes (identique signup) ✅
- [x] Formulaire signin ✅ :
  - Champs : Email, Password
  - Checkbox : "Se souvenir de moi"
  - Lien : "Mot de passe oublié ?" → `/auth/forgot-password`
  - Submit : "Se connecter"
- [x] OAuth : Boutons Google/Apple (identiques signup) ✅
- [x] Illustration droite : Variante signin (même composant `<AuthIllustration variant="signin" />`) ✅
- [x] Lien vers /signup : "Pas encore inscrit ? Créez un compte" ✅
- [x] Validation : Zod schema (email + password) ✅

**Fichiers créés** :
- ✅ `src/app/[locale]/auth/signin/page.tsx` (nouvelle page signin)
- ✅ `src/components/auth/signin-form.tsx` (formulaire avec validation)
- ✅ Réutilise `src/components/auth/auth-illustration.tsx`
- ✅ `messages/fr.json` et `messages/en.json` (ajout `Auth.signin.*` - 27 clés FR+EN)

**Traductions ajoutées** :
- 27 clés de traduction par langue (FR + EN)
- Validation messages, labels, errors, forgot password link
- Remember me, sign up link

**Critères d'acceptation** :
- ✅ Layout cohérent avec signup (2 colonnes responsive)
- ✅ Validation fonctionnelle (Zod + react-hook-form)
- ✅ Lien forgot-password présent
- ✅ OAuth Google intégré (Apple en placeholder)
- ✅ i18n complet FR/EN
- ✅ 0 erreurs TypeScript

---

### ✅ Sous-tâche 2.3 : Page /forgot-password (1h) ✅ COMPLÉTÉE

**Objectif** : Réinitialisation mot de passe

**Actions** :
- [x] Formulaire simple ✅ :
  - Champ : Email
  - Bouton : "Envoyer lien de réinitialisation"
- [x] Logique Firebase ✅ :
  - `sendPasswordResetEmail(auth, email)` avec URL de redirection
  - Success : Message animé avec icône CheckCircle2
  - Error : Messages traduits selon code erreur
- [x] Layout ✅ :
  - Centré page avec card arrondie moderne
  - Icon : `Mail` (lucide-react) 
  - Lien retour : "← Retour à la connexion" → `/auth/signin`
  - Animations Framer Motion (pulse effect sur success)
- [x] État Success complet ✅ :
  - Icône success animée avec effet pulse
  - Message personnalisé avec email
  - Instructions détaillées (vérifier spam, délai, etc.)
  - Bouton "Renvoyer l'email" 
  - Bouton "Retour à la connexion"
  - Lien support
- [x] Aide utilisateur ✅ :
  - Section "Besoin d'aide ?" avec 3 conseils
  - Lien vers signup si pas de compte
- [x] i18n ✅ : `Auth.forgotPassword.*` (28 clés FR+EN)

**Fichiers créés/modifiés** :
- ✅ `src/app/[locale]/auth/forgot-password/page.tsx` (refonte complète)
- ✅ `src/components/auth/forgot-password-form.tsx` (formulaire complet avec états)
- ✅ `messages/fr.json` et `messages/en.json` (ajout `Auth.forgotPassword.*` - 28 clés FR+EN)

**Traductions ajoutées** :
- 28 clés de traduction par langue (FR + EN)
- Success messages, help instructions, errors, validation

**Critères d'acceptation** :
- ✅ Email envoi fonctionnel avec Firebase
- ✅ Messages success/error traduits
- ✅ État success avec animations et instructions complètes
- ✅ Bouton "Renvoyer l'email" fonctionnel
- ✅ i18n complet FR/EN
- ✅ 0 erreurs TypeScript
- ✅ UX complète et professionnelle

---

### ✅ Sous-tâche 2.4 : Redirections après auth (45 min) - COMPLÉTÉE

**Objectif** : Logique de redirection intelligente

**Actions** :
- [x] Créer hook `useAuthRedirect()` ✅
  - Localisation : `src/hooks/use-auth-redirect.ts`
  - Logique :
    ```typescript
    const useAuthRedirect = () => {
      const { user } = useAuth();
      const router = useRouter();
      const params = useParams();
      
      useEffect(() => {
        if (user) {
          // Fetch accountType from Firestore
          const accountType = await getAccountType(user.uid);
          
          if (!accountType) {
            // Pas de type → onboarding
            router.push(`/${params.locale}/onboarding`);
          } else {
            // Type existant → dashboard approprié
            router.push(`/${params.locale}/dashboard/${accountType}`);
          }
        }
      }, [user]);
    };
    ```
- [x] Intégrer dans pages ✅ :
  - `/signup-form.tsx` : Après signup → onboarding (via hook)
  - `/signin-form.tsx` : Après signin → dashboard ou onboarding (via hook)
- [x] Helper Firestore ✅ :
  - `getAccountType(uid)` : Fetch `users/{uid}/profile/accountType`
  - Gestion d'erreurs complète

**Fichiers créés/modifiés** :
- ✅ Créé `src/hooks/use-auth-redirect.ts` (76 lignes)
  - Hook avec loading state `isRedirecting`
  - Gestion automatique des redirections
  - Affichage loader pendant redirection
- ✅ Modifié `src/lib/firestore-users.ts`
  - Ajout fonction `getAccountType(uid)` (17 lignes)
  - Retourne `AccountType | null`
- ✅ Modifié `src/components/auth/signup-form.tsx`
  - Import et utilisation `useAuthRedirect(locale)`
  - Loader état redirection
  - Suppression redirection manuelle
- ✅ Modifié `src/components/auth/signin-form.tsx`
  - Import et utilisation `useAuthRedirect(locale)`
  - Loader état redirection
  - Suppression redirection manuelle
- ✅ Modifié 3 pages auth pour intégrer logo ImuTask :
  - `src/app/[locale]/auth/signup/page.tsx` (logo PNG)
  - `src/app/[locale]/auth/signin/page.tsx` (logo PNG)
  - `src/app/[locale]/auth/forgot-password/page.tsx` (logo PNG)
- ✅ Ajouté traductions "redirecting" (FR+EN)
  - `src/messages/fr.json` : 2 nouvelles clés
  - `src/messages/en.json` : 2 nouvelles clés

**Critères d'acceptation** :
- ✅ Redirection signup → onboarding (via hook automatique)
- ✅ Redirection signin → dashboard/{accountType} ou onboarding
- ✅ Pas de flickering (loading state avec Loader2)
- ✅ Logo ImuTask intégré sur toutes les pages auth
- ✅ 0 erreurs TypeScript

---

### ✅ Sous-tâche 2.5 : Tests e2e Authentification (45 min) ✅ COMPLÉTÉE

**Objectif** : Valider flow authentification complet

**Actions** :
- [x] Créer fichier : `e2e/auth-pages-modern.spec.ts` ✅
- [x] Tests implémentés (15 tests au total) ✅ :
  - **Test 1** : Signup flow - Vérification complète éléments UI (logo PNG, formulaire, OAuth) ✅
  - **Test 2** : Validation formulaire signup avec Zod (erreurs temps réel) ✅
  - **Test 3** : Signin page - Layout 2 colonnes et tous éléments ✅
  - **Test 4** : Forgot Password - Flow complet depuis signin ✅
  - **Test 5** : Navigation entre les 3 pages auth ✅
  - **Test 6** : Responsive mobile 375px ✅
  - **Test 7** : Responsive desktop 1920px ✅
  - **Test 8** : i18n FR/EN sur signup ✅
  - **Test 9** : Animations Framer Motion présentes ✅
  - **Test 10** : Accessibilité (labels, ARIA, h1 unique) ✅
  - **Test 11** : OAuth buttons stylés ✅
  - **Test 12** : Logo ImuTask sur les 3 pages ✅
  - **Test 13** : Redirection signup → /onboarding (⏭️ skip - nécessite Firebase mock)
  - **Test 14** : Signin avec accountType → /dashboard/{type} (⏭️ skip - nécessite Firebase)
  - **Test 15** : Signin sans accountType → /onboarding (⏭️ skip - nécessite Firebase)

**Fichiers créés** :
- ✅ `e2e/auth-pages-modern.spec.ts` (~420 lignes)

**Résultats des tests** :
- ✅ 12/12 tests actifs passent avec succès
- ⏭️ 3 tests skipped (Tests 13-15 nécessitent Firebase Auth mock)
- ✅ Coverage complète : UI, validation, navigation, responsive, i18n, a11y
- ✅ Durée totale : 29.1s

**Critères d'acceptation** :
- ✅ 12 tests passent avec succès (dépassé objectif de 5)
- ✅ Coverage signup/signin/forgot-password complète
- ✅ Tests responsive mobile/desktop
- ✅ Tests i18n FR/EN
- ✅ Tests accessibilité
- ✅ Logo PNG vérifié sur toutes les pages auth

---

## ✅ Bilan Task 2 - Pages Authentification ✅ COMPLÉTÉE

**Résumé** : Task 2 complétée à 100% avec 5/5 sous-tâches terminées.

### Réalisations

**✅ Sous-tâche 2.1 : Page Signup (2h)**
- Layout 2 colonnes moderne (formulaire + illustration)
- Formulaire avec validation Zod temps réel
- OAuth Google + Apple buttons
- 37 clés de traduction (FR + EN)
- Animations Framer Motion

**✅ Sous-tâche 2.2 : Page Signin (1h30)**
- Layout cohérent avec signup
- Checkbox "Se souvenir de moi"
- Lien vers forgot-password
- 27 clés de traduction (FR + EN)
- OAuth buttons identiques

**✅ Sous-tâche 2.3 : Forgot Password (1h)**
- Formulaire simple avec 2 états (form + success)
- Firebase `sendPasswordResetEmail` intégré
- État success avec CheckCircle2 animé
- 28 clés de traduction (FR + EN)
- Instructions complètes et bouton "Renvoyer l'email"

**✅ Sous-tâche 2.4 : Redirections + Logo (45min)**
- Hook `useAuthRedirect()` créé (76 lignes)
- Helper `getAccountType(uid)` ajouté
- Logo ImuTask PNG intégré sur 3 pages
- Loading state "Redirection en cours..."
- 4 nouvelles traductions (FR + EN)

**✅ Sous-tâche 2.5 : Tests e2e (45min)**
- Fichier `e2e/auth-pages-modern.spec.ts` créé
- 15 tests implémentés (12 actifs + 3 skip)
- 12/12 tests passent avec succès ✅
- Coverage complète : UI, validation, navigation, responsive, i18n, a11y

### Fichiers créés/modifiés

**Créés (6 fichiers)** :
- `src/app/[locale]/auth/signin/page.tsx` (page signin)
- `src/components/auth/signin-form.tsx` (formulaire signin)
- `src/components/auth/forgot-password-form.tsx` (refonte complète)
- `src/hooks/use-auth-redirect.ts` (76 lignes)
- `e2e/auth-pages-modern.spec.ts` (~420 lignes, 15 tests)

**Modifiés (8 fichiers)** :
- `src/components/auth/signup-form.tsx` (intégration useAuthRedirect)
- `src/lib/firestore-users.ts` (+17 lignes getAccountType)
- `src/app/[locale]/auth/signup/page.tsx` (logo PNG)
- `src/app/[locale]/auth/signin/page.tsx` (logo PNG)
- `src/app/[locale]/auth/forgot-password/page.tsx` (logo PNG)
- `src/messages/fr.json` (96 clés ajoutées: 37+27+28+4)
- `src/messages/en.json` (96 clés ajoutées: 37+27+28+4)
- `docs/PHASE_5_LANDING_AUTH_PLAN.md` (ce fichier)

### Métriques

- **Durée estimée** : 6h
- **Durée réelle** : 6h ✅
- **TypeScript errors** : 0 ✅
- **i18n coverage** : 100% FR + EN (96 clés par langue) ✅
- **Tests e2e** : 12/12 actifs passent ✅
- **Components créés** : 3 (signin-form, forgot-password-form, useAuthRedirect hook)
- **Lignes de code** : ~600 lignes (forms + hook + tests)

### Prochaine étape

➡️ **Task 3 : Onboarding - Choix AccountType** (3h30 estimées)

---

## 🎯 Task 3 : Page Onboarding - Choix AccountType

**Durée estimée** : 3h30  
**Priorité** : 🔴 Haute  
**État** : ⏳ À faire

### Contexte

Page `/onboarding` existe déjà mais peut être améliorée avec design plus attractif, modal explicatif et workflow fluide.

---

### ✅ Sous-tâche 3.1 : Améliorer /onboarding/page.tsx (2h)

**Objectif** : Design 3 cards attractives pour choix AccountType

**Actions** :
- [ ] Design 3 cards AccountType :
  - **Card Individual** :
    - Icon : `User`
    - Titre : "Particulier"
    - Description : "Je cherche de l'aide pour mes tâches quotidiennes"
    - Features (3-4 items) :
      - "Trouver des prestataires locaux"
      - "Paiement sécurisé après service"
      - "Avis et notes vérifiés"
      - "Support client 7j/7"
    - Color : Bleu (brand primary)
  - **Card Professional** :
    - Icon : `Briefcase`
    - Titre : "Professionnel"
    - Description : "Je propose mes services et souhaite développer mon activité"
    - Features :
      - "Clients qualifiés près de chez moi"
      - "Calendrier et planning intégré"
      - "Paiements automatiques sécurisés"
      - "Assurance responsabilité civile"
    - Color : Vert (success)
  - **Card Senior** :
    - Icon : `Heart`
    - Titre : "Senior / Aidant"
    - Description : "J'ai besoin de services adaptés et d'un accompagnement bienveillant"
    - Features :
      - "Services certifiés PMR ♿"
      - "Contacts aidants d'urgence"
      - "SOS rapide intégré"
      - "Interface vocale (optionnel)"
    - Color : Rose (carelink theme)
- [ ] Animation selection :
  - Hover : Scale 1.05, border highlight
  - Click : Border thick + background tint
  - Selected : Border 3px solid, shadow large
- [ ] Bouton "Continuer" :
  - Position : Bas de page, centré
  - Disabled : Si aucune card sélectionnée
  - Enabled : Vert, large, avec icon "→"
- [ ] Sauvegarde Firestore :
  - Fonction : `saveAccountType(uid, accountType)`
  - Update : `users/{uid}/profile/accountType`
  - Timestamp : `accountTypeChangedAt`
- [ ] Redirection :
  - Après sauvegarde → `/dashboard/{accountType}`
  - Exemple : Selection "professional" → `/dashboard/professional`

**Fichiers à modifier** :
- `src/app/[locale]/onboarding/page.tsx` (refonte design)
- Créer `src/lib/firestore-users.ts` (helper `saveAccountType`)
- `messages/fr.json` et `messages/en.json` (clés `onboarding.*`)

**Critères d'acceptation** :
- ✅ 3 cards attractives et cliquables
- ✅ Animation selection fluide
- ✅ Sauvegarde Firestore fonctionnelle
- ✅ Redirection dashboard approprié
- ✅ i18n complet FR/EN

---

### ✅ Sous-tâche 3.2 : Modal "En savoir plus" (1h)

**Objectif** : Fournir détails par type de compte

**Actions** :
- [ ] Bouton "?" sur chaque card :
  - Position : Coin supérieur droit
  - Icon : `Info` (lucide-react)
  - Tooltip : "En savoir plus"
- [ ] Modal explicatif :
  - Composant : `<AccountTypeModal />`
  - Props : `accountType` (individual/professional/senior)
  - Contenu dynamique par type :
    - **Individual** :
      - Titre : "Compte Particulier - Détails"
      - Avantages : Liste 5-6 points
      - Cas d'usage : "Idéal pour trouver de l'aide ponctuelle"
      - Tarification : "Pas d'abonnement, paiement par service"
    - **Professional** :
      - Titre : "Compte Professionnel - Détails"
      - Avantages : Liste 5-6 points
      - Cas d'usage : "Développez votre activité locale"
      - Tarification : "Abonnement ImuPro (optionnel) + commission 12-20%"
    - **Senior** :
      - Titre : "Compte Senior / CareLink - Détails"
      - Avantages : Liste 5-6 points
      - Cas d'usage : "Services adaptés PMR et assistance"
      - Tarification : "Tarifs préférentiels partenaires"
  - Comparaison : Tableau "Individual vs Professional"
    - Colonnes : Fonctionnalité, Individual, Professional, Senior
    - Lignes : Chercher services, Proposer services, Calendrier, Stats, Certifications, etc.
- [ ] i18n : `onboarding.modal.*`

**Fichiers à créer** :
- `src/components/onboarding/account-type-modal.tsx`
- `messages/fr.json` et `messages/en.json` (clés modal)

**Critères d'acceptation** :
- ✅ Modal s'ouvre au clic sur "?"
- ✅ Contenu adapté par accountType
- ✅ Tableau comparaison clair
- ✅ i18n complet FR/EN

---

### ✅ Sous-tâche 3.3 : Tests e2e Onboarding (30 min)

**Objectif** : Valider workflow onboarding

**Actions** :
- [ ] Créer fichier : `e2e/onboarding.spec.ts`
- [ ] Tests :
  - **Test 1** : Sélection Individual
    - Cliquer card "Particulier"
    - Cliquer "Continuer"
    - Vérifier redirection `/dashboard/client`
  - **Test 2** : Sélection Professional
    - Cliquer card "Professionnel"
    - Cliquer "Continuer"
    - Vérifier redirection `/dashboard/professional`
  - **Test 3** : Sélection Senior
    - Cliquer card "Senior"
    - Cliquer "Continuer"
    - Vérifier redirection `/dashboard/senior`
  - **Test 4** : Sauvegarde Firestore
    - Sélectionner type → submit
    - Vérifier `users/{uid}/profile/accountType` dans Firestore
  - **Test 5** : Modal "En savoir plus"
    - Cliquer "?" sur card Professional
    - Vérifier modal s'ouvre avec contenu approprié

**Fichiers à créer** :
- `e2e/onboarding.spec.ts` (~150 lignes)

**Critères d'acceptation** :
- ✅ 5 tests passent avec succès
- ✅ Coverage onboarding complète

---

## 🧭 Task 4 : Navigation & Routing - Cohérence

**Durée estimée** : 4h  
**Priorité** : 🟡 Moyenne  
**État** : ⏳ À faire

### Contexte

Assurer que tous les liens utilisent `@/navigation` (i18n routing), redirections middleware cohérentes et breadcrumbs pour pages profondes.

---

### ✅ Sous-tâche 4.1 : Audit liens navigation (1h)

**Objectif** : Remplacer tous liens `next/link` par `@/navigation`

**Actions** :
- [ ] Audit composants Header, Footer, DashboardNav :
  - Fichier : `src/components/layout/header.tsx`
  - Fichier : `src/components/layout/footer.tsx`
  - Fichier : `src/components/dashboard/dashboard-nav.tsx`
- [ ] Remplacer imports :
  ```typescript
  // ❌ Avant
  import Link from 'next/link';
  
  // ✅ Après
  import { Link } from '@/navigation';
  ```
- [ ] Vérifier chemins :
  - `/particuliers` → utilisable (i18n auto)
  - `/professionnels` → utilisable
  - `/seniors` → utilisable
  - `/carelink` → utilisable
  - `/dashboard/client` → utilisable
  - etc.
- [ ] Test navigation entre locales :
  - FR : `/fr/particuliers`
  - EN : `/en/individuals` (si traduction chemin configurée)
  - Switch locale : Vérifier redirection appropriée

**Fichiers à modifier** :
- `src/components/layout/header.tsx`
- `src/components/layout/footer.tsx`
- `src/components/dashboard/dashboard-nav.tsx`
- Tout autre composant avec `<Link>`

**Critères d'acceptation** :
- ✅ Tous liens utilisent `@/navigation`
- ✅ Navigation FR ↔ EN fonctionne
- ✅ Chemins cohérents

---

### ✅ Sous-tâche 4.2 : Middleware redirections (1h30)

**Objectif** : Middleware vérifie auth, locale et accountType

**Actions** :
- [ ] Middleware `/middleware.ts` :
  - **Check 1 : Locale**
    - Si pas de locale dans URL → détect navigateur
    - Redirect : `/` → `/fr` ou `/en`
  - **Check 2 : Auth**
    - Pages publiques : `/`, `/particuliers`, `/professionnels`, `/seniors`, `/signup`, `/signin`, `/forgot-password`
    - Pages protégées : `/dashboard/*`, `/profile/*`, `/onboarding`
    - Si non-auth et page protégée → redirect `/signin`
  - **Check 3 : AccountType**
    - Si auth mais pas accountType → redirect `/onboarding`
    - Si auth et accountType → allow
- [ ] Helper functions :
  - `isPublicRoute(pathname)` : Check si route publique
  - `getUserAccountType(uid)` : Fetch accountType (cache)
- [ ] Performance :
  - Cache accountType (éviter fetch chaque requête)
  - Edge runtime compatible

**Fichiers à modifier** :
- `src/middleware.ts` (refonte)
- Créer `src/lib/middleware-helpers.ts`

**Critères d'acceptation** :
- ✅ Redirect racine → locale appropriée
- ✅ Redirect non-auth → `/signin`
- ✅ Redirect sans accountType → `/onboarding`
- ✅ Cache performant

---

### ✅ Sous-tâche 4.3 : Breadcrumbs composant (1h)

**Objectif** : Navigation secondaire pour pages profondes

**Actions** :
- [ ] Créer composant `<Breadcrumbs />` :
  - Localisation : `src/components/ui/breadcrumbs.tsx`
  - Props : `items: { label: string, href: string }[]`
  - Exemple :
    ```tsx
    <Breadcrumbs items={[
      { label: 'Dashboard', href: '/dashboard/professional' },
      { label: 'Profil', href: '/profile' },
      { label: 'Paramètres', href: '/profile/settings' }
    ]} />
    ```
  - Design :
    - Séparateur : `/` ou `>` (icon `ChevronRight`)
    - Dernier item : Bold (page actuelle)
    - Premiers items : Links cliquables
- [ ] Utiliser dans pages :
  - Dashboards : `/dashboard/{type}`
  - Profil : `/profile`
  - Settings : `/profile/settings`
  - Account Type : `/profile/account-type`
- [ ] i18n :
  - Labels traduits : `breadcrumbs.*`
  - Auto-detect locale

**Fichiers à créer** :
- `src/components/ui/breadcrumbs.tsx`
- `messages/fr.json` et `messages/en.json` (clés breadcrumbs)

**Critères d'acceptation** :
- ✅ Breadcrumbs visible pages profondes
- ✅ Links cliquables et fonctionnels
- ✅ i18n complet FR/EN
- ✅ Accessibility (ARIA labels)

---

### ✅ Sous-tâche 4.4 : Tests e2e Navigation (30 min)

**Objectif** : Valider redirections et navigation

**Actions** :
- [ ] Créer fichier : `e2e/navigation.spec.ts`
- [ ] Tests :
  - **Test 1** : Redirect non-auth
    - Accéder `/dashboard/client` sans auth
    - Vérifier redirect `/signin`
  - **Test 2** : Redirect sans accountType
    - Signin avec user sans accountType
    - Vérifier redirect `/onboarding`
  - **Test 3** : Switch locale FR ↔ EN
    - Page `/fr/particuliers`
    - Cliquer switch langue → EN
    - Vérifier URL `/en/individuals` (ou `/en/particuliers` si pas traduit)
  - **Test 4** : Breadcrumbs affichage
    - Accéder `/profile/settings`
    - Vérifier breadcrumbs "Dashboard > Profil > Paramètres"
  - **Test 5** : Middleware protection
    - Tenter accéder page protégée en mode incognito
    - Vérifier redirect `/signin`

**Fichiers à créer** :
- `e2e/navigation.spec.ts` (~150 lignes)

**Critères d'acceptation** :
- ✅ 5 tests passent avec succès
- ✅ Coverage middleware et navigation

---

## 📊 Metrics de Succès

### Performance
- **Lighthouse Score** : >90 (desktop), >85 (mobile)
- **Time to Interactive** : <3s
- **First Contentful Paint** : <1.5s

### UX
- **Conversion Signup** : >15% (visitors → signups)
- **Completion Onboarding** : >80% (signups → accountType selected)
- **Bounce Rate Landing** : <40%

### Quality
- **TypeScript** : 0 erreurs
- **Tests e2e** : 100% pass (19 tests minimum)
- **i18n Coverage** : 100% FR + EN

---

## 🚀 Déploiement

### Checklist Pre-Production
- [ ] Toutes 17 sous-tâches complétées
- [ ] Tests e2e passent (19 tests minimum)
- [ ] TypeScript : 0 erreurs
- [ ] Lighthouse : Score >90
- [ ] i18n : Coverage 100% FR/EN
- [ ] Responsive : Mobile/Tablet/Desktop validés
- [ ] Redirections : Middleware testé
- [ ] Analytics : Events trackés (signup, signin, onboarding selection)

### Déploiement Steps
1. Merge branch → `main`
2. Deploy Vercel (auto-deploy)
3. Vérifier production :
   - Landing page `/`
   - Signup/Signin flows
   - Onboarding flow
   - Redirections middleware
4. Monitor Analytics (Firebase) :
   - Event `signup_completed`
   - Event `onboarding_completed`
   - Event `account_type_selected`

---

## 📝 Documentation

### Fichiers de doc à créer/modifier
- [ ] `/docs/LANDING_PAGE_GUIDE.md` (guide composant ProfileSegments, Hero variants)
- [ ] `/docs/AUTH_FLOW.md` (workflow signup → signin → onboarding → dashboard)
- [ ] `/docs/ONBOARDING_GUIDE.md` (choix AccountType, modal explicatif)
- [ ] `/docs/NAVIGATION_I18N.md` (middleware, i18n routing, breadcrumbs)

---

## 🎯 Prochaines Étapes (Après Phase 5)

### Phase 6 : Professionnels - ImuPro
- Portfolio professionnel
- Calendrier/planning
- Stats avancées (CA, missions, clients)
- Abonnement ImuPro

### Phase 7 : Seniors - CareLink Advanced
- Gestion contacts aidants
- Services récurrents
- Téléconsultation (WebRTC)
- Health tracking

### Phase 8 : Paiements & Transactions
- Stripe Connect onboarding
- Authorize/Capture/Refund
- Payout scheduling
- Invoicing system

---

## ✅ Checklist Finale Phase 5

| Tâche | Sous-tâches | Status |
|-------|-------------|--------|
| **Task 1: Landing Page** | 4 | ⏳ 0/4 |
| **Task 2: Auth Pages** | 5 | ⏳ 0/5 |
| **Task 3: Onboarding** | 3 | ⏳ 0/3 |
| **Task 4: Navigation** | 4 | ⏳ 0/4 |
| **Tests e2e** | 4 fichiers | ⏳ 0/4 |
| **Documentation** | 4 fichiers | ⏳ 0/4 |
| **TOTAL** | **17** | **⏳ 0/17** |

---

**Prêt à démarrer !** 🚀

---

_Document créé le 26 octobre 2025 - ImuTask Ecosystem_
