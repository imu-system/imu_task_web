# Plan d'Implémentation : Formulaires Spécifiques par Catégorie

**Date:** 3 novembre 2025  
**Objectif:** Implémenter des formulaires dynamiques avec champs spécifiques selon la catégorie de service sélectionnée  
**Document de référence:** `docs/CREATE_MISSION.md`

---

## 📋 Vue d'Ensemble

### Problématique Actuelle
Le formulaire `CreateTaskForm` utilise un formulaire générique pour toutes les catégories :
- ✅ Titre
- ✅ Description
- ✅ Catégorie
- ✅ Adresse
- ✅ Date/Heure (timeWindow)
- ✅ Prix
- ✅ Durée estimée
- ✅ Nombre de prestataires

**Manque:** Champs spécifiques par catégorie (ex: surface pour ménage, race du chien pour dog walking, etc.)

### Solution Proposée
Ajouter un système de **champs dynamiques conditionnels** qui s'affichent selon la catégorie sélectionnée.

---

## 🏗️ Architecture Technique

### 1. Structure de Données

#### 1.1. Nouveau Type: `TaskSpecificFields`

```typescript
// src/lib/types/task-specific-fields.ts

/**
 * Base interface pour tous les champs spécifiques
 */
export interface BaseSpecificFields {
  categoryId: string;
  subcategoryId?: string;
}

/**
 * 1. Aide à Domicile & Petits Travaux
 */
export interface CleaningSpecificFields extends BaseSpecificFields {
  // 1.1. Ménage & Entretien
  propertyType?: 'apartment' | 'house' | 'office' | 'other';
  propertyTypeOther?: string;
  surfaceArea?: 'under_30' | '30_60' | '60_100' | 'over_100';
  roomsCount?: {
    bedrooms?: number;
    bathrooms?: number;
    toilets?: number;
  };
  serviceType?: 'one_time' | 'deep_clean' | 'moving_clean' | 'specific';
  specificCleaningTasks?: ('windows' | 'oven' | 'fridge')[];
  frequency?: 'one_time' | 'weekly' | 'biweekly' | 'monthly';
  materialsProvidedBy?: 'client' | 'provider' | 'provider_paid';
  access?: 'easy' | 'difficult';
  accessDetails?: string;
}

export interface HandymanSpecificFields extends BaseSpecificFields {
  // 1.2. Petit Bricolage & Assemblage
  taskType?: 'assemble' | 'hang' | 'fix' | 'install' | 'repair' | 'other';
  furnitureDetails?: {
    brand?: string;
    type?: string;
    packageCount?: number;
    size?: 'small' | 'medium' | 'large';
  };
  toolsProvidedBy?: 'client' | 'provider';
  workHeight?: 'ground' | 'medium' | 'high';
  wallType?: 'plaster' | 'concrete' | 'wood';
  materialDetails?: string;
}

export interface OrganizationSpecificFields extends BaseSpecificFields {
  // 1.3. Rangement & Organisation
  areasToOrganize?: ('closet' | 'library' | 'cellar' | 'garage' | 'kitchen' | 'office' | 'other')[];
  goal?: 'declutter' | 'sort' | 'classify' | 'optimize';
  volumeEstimate?: 'small' | 'medium' | 'large';
}

/**
 * 2. Courses & Livraisons
 */
export interface GroceryShoppingSpecificFields extends BaseSpecificFields {
  // 2.1. Courses Alimentaires
  storeType?: 'supermarket' | 'local_market' | 'bio_store' | 'other';
  storeName?: string;
  shoppingList?: string; // URL to photo or text
  volumeEstimate?: 'small' | 'medium' | 'large';
  specialNeeds?: ('fresh' | 'heavy' | 'frozen')[];
  paymentMethod?: 'cash' | 'client_card' | 'provider_advance';
}

export interface PackageDeliverySpecificFields extends BaseSpecificFields {
  // 2.2. Récupération & Dépôt de Colis
  serviceType?: 'pickup' | 'dropoff' | 'mail';
  locationName?: string;
  locationAddress?: string;
  packageSize?: 'small' | 'medium' | 'large_heavy';
  trackingNumber?: string;
  paymentMethod?: 'cash' | 'provider_advance';
}

/**
 * 3. Aide Numérique & Administrative
 */
export interface TechHelpSpecificFields extends BaseSpecificFields {
  // 3.1. Aide Informatique
  deviceType?: 'smartphone' | 'tablet' | 'laptop' | 'desktop' | 'smart_tv' | 'internet_box';
  operatingSystem?: 'windows' | 'macos' | 'ios' | 'android' | 'linux' | 'other';
  issueType?: 'installation' | 'training' | 'troubleshooting' | 'backup' | 'other';
  specificIssue?: string;
  remoteAccessPossible?: boolean;
}

export interface AdminHelpSpecificFields extends BaseSpecificFields {
  // 3.2. Aide Administrative
  taskType?: 'form_filling' | 'scanning' | 'email' | 'filing' | 'writing';
  softwareNeeded?: ('word' | 'excel' | 'powerpoint' | 'pdf')[];
  confidentialityLevel?: 'sensitive' | 'normal';
  hasPrinterScanner?: boolean;
}

/**
 * 4. Déménagement & Manutention
 */
export interface MovingSpecificFields extends BaseSpecificFields {
  // 4.1. Aide au Déménagement
  volumeEstimate?: 'few_boxes' | 'studio' | 't2' | 'cellar';
  peopleRequired?: number;
  fromFloor?: number;
  fromHasElevator?: boolean;
  toFloor?: number;
  toHasElevator?: boolean;
  heavyItems?: {
    description: string;
    photos?: string[];
  }[];
  vehicleNeeded?: 'client_has' | 'short_distance' | 'provider_needed';
}

export interface HandlingSpecificFields extends BaseSpecificFields {
  // 4.2. Manutention Simple
  taskType?: 'move_furniture' | 'to_cellar' | 'carry_groceries';
  itemsDescription?: string;
  photos?: string[];
  floorsCount?: number;
  hasElevator?: boolean;
}

/**
 * 5. Accompagnement & Présence
 */
export interface AccompanimentSpecificFields extends BaseSpecificFields {
  // 5.1. Accompagnement de Personnes
  accompanimentType?: 'medical' | 'walk' | 'shopping' | 'social' | 'visit';
  fromAddress?: string;
  toAddress?: string;
  duration?: number; // minutes
  specialNeeds?: ('reduced_mobility' | 'wheelchair' | 'hearing' | 'visual')[];
  transportMode?: 'walking' | 'public_transport' | 'client_car';
}

export interface CompanionshipSpecificFields extends BaseSpecificFields {
  // 5.2. Compagnie & Loisirs
  activityType?: 'conversation' | 'reading' | 'games' | 'cultural' | 'walk';
  duration?: number; // minutes
  clientInterests?: string;
}

/**
 * 6. Jardinage & Extérieur
 */
export interface GardeningSpecificFields extends BaseSpecificFields {
  // 6.1. Entretien Jardin
  placeType?: 'garden' | 'balcony' | 'courtyard' | 'driveway';
  surfaceArea?: 'under_50' | '50_150' | 'over_150';
  serviceType?: ('mowing' | 'leaf_raking' | 'weeding' | 'watering' | 'planting' | 'terrace_cleaning' | 'hedge_trimming')[];
  toolsProvidedBy?: 'client' | 'provider';
  wasteDisposal?: 'green_bin' | 'compost' | 'provider_removes';
}

/**
 * 7. Garde d'Animaux
 */
export interface DogWalkingSpecificFields extends BaseSpecificFields {
  // 7.1. Promenade de Chien
  dogBreed?: string;
  dogSize?: 'small' | 'medium' | 'large';
  temperament?: ('sociable' | 'reactive' | 'calm' | 'energetic')[];
  walksPerDay?: number;
  walkDuration?: number; // minutes
  specialNeeds?: {
    medication?: boolean;
    feeding?: boolean;
  };
  equipment?: ('leash' | 'muzzle' | 'waste_bags')[];
}

export interface PetSittingSpecificFields extends BaseSpecificFields {
  // 7.2. Visite à Domicile
  petType?: 'dog' | 'cat' | 'rodent' | 'fish' | 'bird';
  petCount?: number;
  absenceStartDate?: Date;
  absenceEndDate?: Date;
  visitsPerDay?: number;
  tasks?: ('feeding' | 'litter' | 'play' | 'medication' | 'water_plants')[];
}

/**
 * 8. Aide Événementielle
 */
export interface EventHelpSpecificFields extends BaseSpecificFields {
  // 8.1. Soutien Logistique Événementiel
  eventType?: 'birthday' | 'family_reception' | 'association' | 'small_business';
  guestCount?: number;
  serviceType?: ('setup' | 'cleanup' | 'serving' | 'greeting' | 'preparation')[];
  duration?: number; // hours
  heavyEquipment?: string;
}

/**
 * Union type de tous les champs spécifiques
 */
export type TaskSpecificFields =
  | CleaningSpecificFields
  | HandymanSpecificFields
  | OrganizationSpecificFields
  | GroceryShoppingSpecificFields
  | PackageDeliverySpecificFields
  | TechHelpSpecificFields
  | AdminHelpSpecificFields
  | MovingSpecificFields
  | HandlingSpecificFields
  | AccompanimentSpecificFields
  | CompanionshipSpecificFields
  | GardeningSpecificFields
  | DogWalkingSpecificFields
  | PetSittingSpecificFields
  | EventHelpSpecificFields;
```

#### 1.2. Mise à Jour de `CreateTaskData`

```typescript
// src/lib/firestore-tasks.ts

export interface CreateTaskData {
    title: string;
    description: string;
    category: string;
    location: string;
    budget: number;
    deadline?: Date | null;
    specificFields?: TaskSpecificFields; // ← NOUVEAU
}
```

#### 1.3. Mise à Jour du Type `Task`

```typescript
// src/lib/types.ts

export type Task = {
  id: string;
  title: string;
  description: string;
  // ... autres champs existants
  specificFields?: TaskSpecificFields; // ← NOUVEAU
  // ...
}
```

---

## 🎨 Composants UI

### 2. Composants de Formulaire Spécifiques

#### 2.1. Structure des Composants

```
src/components/task-forms/
├── index.ts                          # Exports
├── specific-fields/
│   ├── CleaningFields.tsx            # Ménage
│   ├── HandymanFields.tsx            # Bricolage
│   ├── OrganizationFields.tsx        # Rangement
│   ├── GroceryFields.tsx             # Courses
│   ├── PackageFields.tsx             # Colis
│   ├── TechHelpFields.tsx            # Aide informatique
│   ├── AdminHelpFields.tsx           # Aide administrative
│   ├── MovingFields.tsx              # Déménagement
│   ├── HandlingFields.tsx            # Manutention
│   ├── AccompanimentFields.tsx       # Accompagnement
│   ├── CompanionshipFields.tsx       # Compagnie
│   ├── GardeningFields.tsx           # Jardinage
│   ├── DogWalkingFields.tsx          # Dog walking
│   ├── PetSittingFields.tsx          # Pet sitting
│   └── EventHelpFields.tsx           # Événementiel
└── SpecificFieldsSelector.tsx        # Composant qui choisit quel formulaire afficher
```

#### 2.2. Exemple: `CleaningFields.tsx`

```typescript
'use client';

import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';
import { CleaningSpecificFields } from '@/lib/types/task-specific-fields';

interface CleaningFieldsProps {
  form: UseFormReturn<any>;
}

export function CleaningFields({ form }: CleaningFieldsProps) {
  const t = useTranslations('TaskForms.Cleaning');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('title')}</h3>

      {/* Type de lieu */}
      <FormField
        control={form.control}
        name="specificFields.propertyType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('propertyType.label')}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('propertyType.placeholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="apartment">{t('propertyType.apartment')}</SelectItem>
                <SelectItem value="house">{t('propertyType.house')}</SelectItem>
                <SelectItem value="office">{t('propertyType.office')}</SelectItem>
                <SelectItem value="other">{t('propertyType.other')}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Surface */}
      <FormField
        control={form.control}
        name="specificFields.surfaceArea"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('surfaceArea.label')}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('surfaceArea.placeholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="under_30">{t('surfaceArea.under30')}</SelectItem>
                <SelectItem value="30_60">{t('surfaceArea.30to60')}</SelectItem>
                <SelectItem value="60_100">{t('surfaceArea.60to100')}</SelectItem>
                <SelectItem value="over_100">{t('surfaceArea.over100')}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Nombre de pièces */}
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="specificFields.roomsCount.bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('rooms.bedrooms')}</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specificFields.roomsCount.bathrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('rooms.bathrooms')}</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specificFields.roomsCount.toilets"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('rooms.toilets')}</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Type de prestation */}
      <FormField
        control={form.control}
        name="specificFields.serviceType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('serviceType.label')}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('serviceType.placeholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="one_time">{t('serviceType.oneTime')}</SelectItem>
                <SelectItem value="deep_clean">{t('serviceType.deepClean')}</SelectItem>
                <SelectItem value="moving_clean">{t('serviceType.movingClean')}</SelectItem>
                <SelectItem value="specific">{t('serviceType.specific')}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Matériel fourni par */}
      <FormField
        control={form.control}
        name="specificFields.materialsProvidedBy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('materialsProvidedBy.label')}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('materialsProvidedBy.placeholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="client">{t('materialsProvidedBy.client')}</SelectItem>
                <SelectItem value="provider">{t('materialsProvidedBy.provider')}</SelectItem>
                <SelectItem value="provider_paid">{t('materialsProvidedBy.providerPaid')}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
```

#### 2.3. `SpecificFieldsSelector.tsx`

```typescript
'use client';

import { UseFormReturn } from 'react-hook-form';
import { CleaningFields } from './specific-fields/CleaningFields';
import { HandymanFields } from './specific-fields/HandymanFields';
import { GroceryFields } from './specific-fields/GroceryFields';
// ... autres imports

interface SpecificFieldsSelectorProps {
  form: UseFormReturn<any>;
  categorySlug?: string;
}

export function SpecificFieldsSelector({ form, categorySlug }: SpecificFieldsSelectorProps) {
  if (!categorySlug) return null;

  // Map des slugs vers les composants
  switch (categorySlug) {
    case 'menage-entretien':
      return <CleaningFields form={form} />;
    case 'petit-bricolage':
      return <HandymanFields form={form} />;
    case 'rangement':
      return <OrganizationFields form={form} />;
    case 'courses-alimentaires':
      return <GroceryFields form={form} />;
    case 'colis-livraison':
      return <PackageFields form={form} />;
    case 'aide-informatique':
      return <TechHelpFields form={form} />;
    case 'aide-administrative':
      return <AdminHelpFields form={form} />;
    case 'demenagement':
      return <MovingFields form={form} />;
    case 'manutention':
      return <HandlingFields form={form} />;
    case 'accompagnement':
      return <AccompanimentFields form={form} />;
    case 'compagnie':
      return <CompanionshipFields form={form} />;
    case 'jardinage':
      return <GardeningFields form={form} />;
    case 'dog-walking':
      return <DogWalkingFields form={form} />;
    case 'pet-sitting':
      return <PetSittingFields form={form} />;
    case 'aide-evenementielle':
      return <EventHelpFields form={form} />;
    default:
      return null;
  }
}
```

---

## 🌐 Traductions (i18n)

### 3. Structure des Traductions

#### 3.1. `src/messages/fr.json`

```json
{
  "TaskForms": {
    "Cleaning": {
      "title": "Détails du ménage",
      "propertyType": {
        "label": "Type de lieu",
        "placeholder": "Sélectionner le type",
        "apartment": "Appartement",
        "house": "Maison",
        "office": "Bureau",
        "other": "Autre"
      },
      "surfaceArea": {
        "label": "Surface estimée",
        "placeholder": "Sélectionner la surface",
        "under30": "Moins de 30m²",
        "30to60": "30-60m²",
        "60to100": "60-100m²",
        "over100": "Plus de 100m²"
      },
      "rooms": {
        "bedrooms": "Chambres",
        "bathrooms": "Salles de bain",
        "toilets": "WC"
      },
      "serviceType": {
        "label": "Type de prestation",
        "placeholder": "Sélectionner le type",
        "oneTime": "Nettoyage ponctuel",
        "deepClean": "Grand ménage",
        "movingClean": "Nettoyage déménagement",
        "specific": "Nettoyage spécifique"
      },
      "materialsProvidedBy": {
        "label": "Matériel/Produits",
        "placeholder": "Qui fournit le matériel ?",
        "client": "Fournis par moi",
        "provider": "Fournis par le prestataire",
        "providerPaid": "Fournis par le prestataire (coût additionnel)"
      }
    },
    "Handyman": {
      "title": "Détails du bricolage",
      "taskType": {
        "label": "Type de tâche",
        "placeholder": "Sélectionner la tâche",
        "assemble": "Monter un meuble",
        "hang": "Accrocher (cadre, étagère)",
        "fix": "Fixer (tringle, miroir)",
        "install": "Installer (luminaire)",
        "repair": "Réparer",
        "other": "Autre"
      }
      // ... autres champs
    },
    "Grocery": {
      "title": "Détails des courses",
      "storeType": {
        "label": "Type de magasin",
        "placeholder": "Sélectionner le magasin",
        "supermarket": "Supermarché",
        "localMarket": "Marché local",
        "bioStore": "Épicerie Bio",
        "other": "Autre"
      }
      // ... autres champs
    }
    // ... autres catégories
  }
}
```

#### 3.2. `src/messages/en.json`

```json
{
  "TaskForms": {
    "Cleaning": {
      "title": "Cleaning details",
      "propertyType": {
        "label": "Property type",
        "placeholder": "Select type",
        "apartment": "Apartment",
        "house": "House",
        "office": "Office",
        "other": "Other"
      },
      "surfaceArea": {
        "label": "Estimated area",
        "placeholder": "Select area",
        "under30": "Under 30m²",
        "30to60": "30-60m²",
        "60to100": "60-100m²",
        "over100": "Over 100m²"
      }
      // ... autres traductions
    }
  }
}
```

---

## 🔧 Intégration dans `CreateTaskForm`

### 4. Modification de `CreateTaskForm.tsx`

```typescript
// src/components/create-task-form.tsx

import { SpecificFieldsSelector } from './task-forms/SpecificFieldsSelector';

// Dans le composant CreateTaskForm
export function CreateTaskForm() {
  // ... code existant

  // Récupérer le slug de la catégorie sélectionnée
  const selectedCategoryId = form.watch('categoryId');
  const selectedCategory = taskCategories.find(c => c.id === selectedCategoryId);
  const categorySlug = selectedCategory?.slug;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ... champs existants */}
        
        {/* Catégorie */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            // ... code existant
          )}
        />

        {/* ✨ NOUVEAU: Champs spécifiques conditionnels */}
        {categorySlug && (
          <div className="border-t pt-6 mt-6">
            <SpecificFieldsSelector 
              form={form} 
              categorySlug={categorySlug} 
            />
          </div>
        )}

        {/* ... reste du formulaire */}
      </form>
    </Form>
  );
}
```

---

## 💾 Firestore

### 5. Mise à Jour des Rules Firestore

```javascript
// firestore.rules

match /tasks/{taskId} {
  allow create: if request.auth != null && 
    request.resource.data.keys().hasAll(['title', 'description', 'category', 'location', 'budget']) &&
    // specificFields est optionnel mais doit être un objet si présent
    (!request.resource.data.keys().hasAny(['specificFields']) || 
     request.resource.data.specificFields is map);
  
  // ... autres règles
}
```

### 6. Index Firestore

Aucun index composite supplémentaire nécessaire pour `specificFields` (champ nested object non utilisé dans les queries).

---

## 🧪 Tests

### 7. Plan de Test

#### 7.1. Tests Unitaires
- ✅ Chaque composant de champs spécifiques affiche correctement
- ✅ Validation Zod pour chaque type de champs
- ✅ SpecificFieldsSelector retourne le bon composant selon le slug

#### 7.2. Tests E2E
- ✅ Créer une tâche "Ménage" avec champs spécifiques
- ✅ Vérifier que les données sont sauvegardées dans Firestore
- ✅ Vérifier que les champs changent quand on change de catégorie
- ✅ Tester les traductions FR/EN

---

## 📈 Roadmap d'Implémentation

### Phase 1: Setup de Base (2h)
- [ ] Créer `src/lib/types/task-specific-fields.ts`
- [ ] Mettre à jour `CreateTaskData` et `Task` types
- [ ] Créer structure de dossiers `src/components/task-forms/`

### Phase 2: Premier Composant Pilote (3h)
- [ ] Implémenter `CleaningFields.tsx` complètement
- [ ] Créer traductions FR/EN pour Cleaning
- [ ] Intégrer dans `CreateTaskForm`
- [ ] Tester création tâche avec champs cleaning

### Phase 3: Catégories Prioritaires (6h)
- [ ] `GroceryFields.tsx` (Courses)
- [ ] `DogWalkingFields.tsx` (Dog walking)
- [ ] `HandymanFields.tsx` (Bricolage)
- [ ] Traductions associées

### Phase 4: Catégories Secondaires (8h)
- [ ] Toutes les catégories restantes (11 composants)
- [ ] Traductions complètes

### Phase 5: Polish & Tests (4h)
- [ ] Validation Zod pour tous les champs
- [ ] Tests E2E
- [ ] Documentation
- [ ] Revue UX/UI

**Total estimé:** 23h (3 jours)

---

## 🎯 Bénéfices Attendus

### Pour les Clients
- ✅ **Précision:** Décrire exactement leurs besoins
- ✅ **Rapidité:** Formulaire guidé vs description libre
- ✅ **Meilleur matching:** Prestataires reçoivent infos structurées

### Pour les Prestataires
- ✅ **Clarté:** Toutes les infos avant d'accepter
- ✅ **Préparation:** Savoir quel matériel apporter
- ✅ **Efficacité:** Moins de back-and-forth

### Pour la Plateforme
- ✅ **Qualité:** Données structurées pour analytics
- ✅ **Matching:** Algorithme peut utiliser champs spécifiques
- ✅ **SEO:** Données structurées pour Google Rich Results

---

## 📝 Notes Techniques

### Performance
- Les composants de champs spécifiques sont **lazy-loaded** (pas tous chargés d'un coup)
- Utiliser `React.lazy()` + `Suspense` si nécessaire

### Validation
- Champs spécifiques sont **optionnels** (ne pas bloquer soumission)
- Mais fortement **recommandés** (afficher badge "Compléter pour meilleur matching")

### Migration des Données Existantes
- Tâches existantes n'ont pas `specificFields` → OK (optionnel)
- Pas de migration nécessaire

---

**Prochaine étape:** Commencer Phase 1 (Setup de Base)
