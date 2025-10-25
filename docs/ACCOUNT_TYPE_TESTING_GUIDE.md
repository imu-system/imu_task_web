# 🧪 Guide de Test - Système AccountType

**Date:** 25 octobre 2025  
**Objectif:** Tester le flow complet signup → onboarding → dashboard différencié

---

## ✅ Prérequis

- Serveur dev lancé (`npm run dev` sur port 9002)
- Firebase configuré et connecté
- 3 dashboards créés : `/client`, `/pro`, `/senior`

---

## 🎯 Tests à Effectuer

### **Test 1: Nouveau Compte - Type "Individual"**

**Flow attendu:**
1. ✅ Aller sur `/auth/signup`
2. ✅ Créer compte avec email `test-individual@example.com`
3. ✅ Redirection automatique vers `/onboarding`
4. ✅ Voir 3 cards : Individual, Professional, Senior
5. ✅ Sélectionner "**Particulier**" (Individual)
6. ✅ Cliquer "Continuer"
7. ✅ Toast success ✅ "Profil mis à jour"
8. ✅ Redirection vers `/dashboard` (router)
9. ✅ Router redirige vers `/dashboard/client`
10. ✅ Voir dashboard client (tâches, KPIs, bookings)

**Vérification Firestore:**
```typescript
// users/{uid}/profile
{
  accountType: 'individual',
  displayName: '...',
  // ...
}
```

---

### **Test 2: Nouveau Compte - Type "Professional"**

**Flow attendu:**
1. ✅ Créer compte avec email `test-pro@example.com`
2. ✅ Sur `/onboarding`, sélectionner "**Professionnel**"
3. ✅ Cliquer "Continuer"
4. ✅ Redirection → `/dashboard/pro`
5. ✅ Voir dashboard professionnel (missions, stats, calendrier)

**Vérification Firestore:**
```typescript
{
  accountType: 'professional',
  professionalInfo: {
    isVerified: false // par défaut
  }
}
```

---

### **Test 3: Nouveau Compte - Type "Senior"**

**Flow attendu:**
1. ✅ Créer compte avec email `test-senior@example.com`
2. ✅ Sur `/onboarding`, sélectionner "**Senior**"
3. ✅ Cliquer "Continuer"
4. ✅ Redirection → `/dashboard/senior`
5. ✅ Voir dashboard senior accessible:
   - Texte XXL (24px+)
   - Bouton SOS rouge
   - Gros boutons (60x60px)
   - Prochaines interventions
   - Actions rapides (4 boutons larges)

**Vérification Firestore:**
```typescript
{
  accountType: 'senior',
  seniorInfo: {
    needsAccessibility: false, // par défaut
    hasCaregiver: false
  }
}
```

---

### **Test 4: Utilisateur Sans AccountType (Migration)**

**Setup:**
1. Créer manuellement un user dans Firestore SANS `accountType`
2. Se connecter avec ce compte

**Flow attendu:**
1. ✅ Login réussi
2. ✅ Aller sur `/dashboard`
3. ✅ Router détecte `accountType` manquant
4. ✅ Redirection automatique → `/onboarding`
5. ✅ User sélectionne son type
6. ✅ Firestore mis à jour
7. ✅ Redirection vers dashboard approprié

---

### **Test 5: Navigation Directe (URLs)**

**Tests:**
```bash
# User avec accountType='individual'
/dashboard → redirige vers /dashboard/client ✅

# User avec accountType='professional'
/dashboard → redirige vers /dashboard/pro ✅

# User avec accountType='senior'
/dashboard → redirige vers /dashboard/senior ✅
```

---

### **Test 6: Bouton "Passer" (Skip)**

**Flow:**
1. ✅ Sur `/onboarding`, cliquer "Passer"
2. ✅ Redirection directe vers `/dashboard`
3. ✅ Router voit accountType manquant
4. ✅ Fallback vers `/dashboard/client`

**Note:** Pas idéal, mais fonctionnel. User peut toujours set accountType plus tard via profil.

---

### **Test 7: Google Signup**

**Flow:**
1. ✅ Sur `/auth/signup`, cliquer "Google"
2. ✅ Authentification Google
3. ✅ Redirection → `/onboarding`
4. ✅ Sélectionner type
5. ✅ Redirection vers dashboard approprié

---

## 🔍 Points de Vérification Technique

### **1. Dashboard Router Logic**

Fichier: `/src/app/[locale]/dashboard/page.tsx`

```typescript
// Checklist:
✅ Lecture Firestore: doc(db, 'users', user.uid)
✅ Parsing accountType: userData?.profile?.accountType
✅ Enum comparison: AccountType.individual, .professional, .senior
✅ Fallback sur erreur: /dashboard/client
✅ Loading state: Spinner + message
```

### **2. Onboarding Page**

Fichier: `/src/app/[locale]/onboarding/page.tsx`

```typescript
// Checklist:
✅ updateDoc(userRef, { 'profile.accountType': selectedType })
✅ updatedAt: new Date()
✅ Toast notification
✅ Error handling avec Alert
✅ Skip option fonctionnel
```

### **3. AccountTypeSelector Component**

Fichier: `/src/components/auth/account-type-selector.tsx`

```typescript
// Checklist:
✅ 3 cards affichées
✅ Bilingual (locale='fr' ou 'en')
✅ Selection state (checkmark badge)
✅ onSelect callback déclenché
✅ Styling: gradients, icons, responsive
```

---

## 🐛 Erreurs Potentielles

### **Erreur 1: "Cannot read property 'accountType' of undefined"**

**Cause:** User document n'a pas de champ `profile`

**Solution:**
```typescript
const accountType = userData?.profile?.accountType; // ✅ Safe
```

### **Erreur 2: Redirection infinie**

**Cause:** Router redirige vers `/dashboard` qui re-redirige vers router

**Solution:** Router doit rediriger vers `/dashboard/client` (pas `/dashboard`)

### **Erreur 3: Toast ne s'affiche pas**

**Vérifier:**
```typescript
import { useToast } from '@/components/ui/use-toast';
const { toast } = useToast();
toast({ title: '✅ Message' });
```

---

## 📊 Résultats Attendus

| Test | Statut | Dashboard Destination |
|------|--------|----------------------|
| Individual signup | ✅ | `/dashboard/client` |
| Professional signup | ✅ | `/dashboard/pro` |
| Senior signup | ✅ | `/dashboard/senior` |
| Sans accountType | ✅ | `/onboarding` puis dashboard |
| Skip onboarding | 🟡 | `/dashboard/client` (fallback) |
| Google signup | ✅ | `/onboarding` puis dashboard |

---

## 🚀 Prochaines Étapes

Une fois les tests validés:

1. **Option B** - Personnaliser Dashboard Client
2. **Option C** - Vérifier Dashboard Pro
3. **Option D** - Navigation adaptée (sidebar)

---

## 📝 Notes

- Tous les tests doivent passer avec **0 erreur TypeScript**
- Vérifier dans Firestore Console que `accountType` est bien enregistré
- Tester sur mobile (responsive) pour senior dashboard

---

**Status:** ✅ Prêt pour tests manuels
**Dernière mise à jour:** 25 octobre 2025
