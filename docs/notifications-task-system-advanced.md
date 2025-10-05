# Système de Notification de Tâches - Guide Avancé

## 🎯 Vue d'ensemble

Ce document décrit le système intelligent de notification des providers lors de la création de nouvelles tâches.

**Date :** 5 octobre 2025  
**Version :** 2.0 (Amélioré avec skill mapping)

---

## 🏗️ Architecture

### Composants principaux

1. **`firestore-tasks.ts`** - Gestion CRUD des tâches + notifications
2. **`firestore-users.ts`** - Queries de providers avec filtres avancés
3. **`skill-mapping.ts`** - Système de synonymes et catégories de skills
4. **`firestore-notifications.ts`** - Création des notifications

---

## 🔧 Fonctions Helper

### 1. `getProvidersBySkill()` - Base

**Signature :**
```typescript
getProvidersBySkill(
    skill: string,
    options?: {
        onlyAvailable?: boolean;
        maxResults?: number;
    }
): Promise<User[]>
```

**Exemple d'utilisation :**
```typescript
// Recherche simple
const providers = await getProvidersBySkill('Plumbing');

// Avec filtres
const providers = await getProvidersBySkill('Plumbing', {
    onlyAvailable: true,  // Seulement les disponibles
    maxResults: 20        // Maximum 20 résultats
});
```

**Query Firestore :**
```typescript
query(
    collection(db, 'users'),
    where('isProvider', '==', true),
    where('skills', 'array-contains', skill),
    where('availability', '==', true)  // Si onlyAvailable=true
)
```

**Index requis :**
- Collection: `users`
- Fields: `isProvider` (Ascending), `skills` (Arrays)
- Optional: `+ availability` (Ascending) si filtrage par disponibilité

---

### 2. `getProvidersByMultipleSkills()` - Recherche étendue

**Signature :**
```typescript
getProvidersByMultipleSkills(
    skills: string[],
    options?: {
        onlyAvailable?: boolean;
        maxResults?: number;
    }
): Promise<User[]>
```

**Exemple d'utilisation :**
```typescript
// Recherche avec plusieurs skills
const providers = await getProvidersByMultipleSkills(
    ['Plumbing', 'Plumber', 'Pipe Repair'],
    { onlyAvailable: true, maxResults: 50 }
);
```

**Logique :**
1. Exécute `getProvidersBySkill()` pour chaque skill en parallèle
2. Collecte tous les résultats
3. Déduplique par `user.id`
4. Applique `maxResults` sur le résultat final

**Déduplication :**
```typescript
const uniqueProvidersMap = new Map<string, User>();
providersArrays.forEach(providers => {
    providers.forEach(provider => {
        if (!uniqueProvidersMap.has(provider.id)) {
            uniqueProvidersMap.set(provider.id, provider);
        }
    });
});
```

---

### 3. `getAvailableProviders()` - Tous les providers disponibles

**Signature :**
```typescript
getAvailableProviders(): Promise<User[]>
```

**Utilité :**
- Dashboard admin
- Vue d'ensemble des providers
- Statistiques

**Query Firestore :**
```typescript
query(
    collection(db, 'users'),
    where('isProvider', '==', true),
    where('availability', '==', true)
)
```

---

## 🗂️ Système de Skill Mapping

### Fichier : `skill-mapping.ts`

**Objectif :** Mapper les catégories de tâches vers des skills similaires pour améliorer le matching.

### Structure de `SKILL_SYNONYMS`

```typescript
export const SKILL_SYNONYMS: Record<string, string[]> = {
    'Plumbing': ['Plumber', 'Pipe Repair', 'Water Systems', 'Plomberie'],
    'Electrical': ['Electrician', 'Wiring', 'Electrical Repair', 'Électricien'],
    // ... 40+ catégories
};
```

### Fonctions utilitaires

#### `getRelatedSkills(category: string): string[]`

Retourne la catégorie + tous les synonymes.

**Exemple :**
```typescript
getRelatedSkills('Plumbing')
// Retourne: ['Plumbing', 'Plumber', 'Pipe Repair', 'Water Systems', 'Plomberie']
```

#### `normalizeSkill(skill: string): string`

Normalise un skill (lowercase + trim).

**Exemple :**
```typescript
normalizeSkill('  PLUMBING  ')
// Retourne: 'plumbing'
```

#### `findBestMatchingSkill(target, available): string | null`

Trouve le meilleur match parmi les skills disponibles.

**Exemple :**
```typescript
const availableSkills = ['Plumber', 'Electrician', 'Carpenter'];
findBestMatchingSkill('plumbing', availableSkills)
// Retourne: 'Plumber' (partial match)
```

#### `getSkillCategory(skillName: string): string`

Reverse lookup : skill → catégorie principale.

**Exemple :**
```typescript
getSkillCategory('Plumber')
// Retourne: 'Plumbing'

getSkillCategory('Électricien')
// Retourne: 'Electrical'
```

#### `getAllCategories(): string[]`

Retourne toutes les catégories principales (40+).

#### `getCategoryStats()`

Statistiques par catégorie.

**Retour :**
```typescript
[
    { category: 'Plumbing', synonymCount: 4 },
    { category: 'Electrical', synonymCount: 4 },
    // ...
]
```

---

## 📊 Flux de notification dans `createTask()`

### Étape par étape

```typescript
export async function createTask(userId: string, taskData: CreateTaskData) {
    // 1. Créer la tâche dans Firestore
    const docRef = await addDoc(tasksRef, newTask);
    
    // 2. Obtenir les skills similaires
    const relatedSkills = getRelatedSkills(taskData.category);
    // Ex: 'Plumbing' → ['Plumbing', 'Plumber', 'Pipe Repair', 'Water Systems', 'Plomberie']
    
    console.log(`🔍 Searching providers with skills: ${relatedSkills.join(', ')}`);
    
    // 3. Rechercher providers avec l'un de ces skills
    const providers = await getProvidersByMultipleSkills(relatedSkills, {
        onlyAvailable: true,
        maxResults: 50
    });
    
    // 4. Extraire la localisation
    let taskLocation = extractLocation(taskData.location);
    
    // 5. Envoyer notifications en parallèle
    await Promise.all(
        providers.map(provider =>
            notifyNewTask(
                provider.id,
                docRef.id,
                taskData.title,
                taskData.category,
                taskLocation
            )
        )
    );
    
    console.log(`✅ Notified ${providers.length} providers`);
}
```

### Gestion d'erreurs

```typescript
try {
    // ... logique de notification
} catch (notifError) {
    console.error('⚠️ Failed to send new task notifications:', notifError);
    // ⚠️ IMPORTANT: Ne pas throw - échec de notif ne bloque pas la création
}
```

**Principe :** Les notifications sont un bonus, pas un bloquant. Si elles échouent, la tâche est quand même créée.

---

## 🧪 Exemples de scénarios

### Scénario 1 : Tâche "Plumbing" standard

**Input :**
```typescript
await createTask('client_123', {
    title: 'Fix kitchen sink',
    category: 'Plumbing',
    location: 'Paris, France',
    budget: 150,
    description: 'Sink is leaking'
});
```

**Flux :**
1. Tâche créée avec ID `task_abc123`
2. `getRelatedSkills('Plumbing')` → `['Plumbing', 'Plumber', 'Pipe Repair', 'Water Systems', 'Plomberie']`
3. `getProvidersByMultipleSkills()` cherche providers avec l'un de ces skills
4. Résultat : 12 providers trouvés (8 avec "Plumbing", 3 avec "Plumber", 1 avec "Plomberie")
5. Déduplication : 12 providers uniques
6. 12 notifications envoyées

**Logs :**
```
✅ Task created successfully with ID: task_abc123
🔍 Searching providers with skills: Plumbing, Plumber, Pipe Repair, Water Systems, Plomberie
✅ Found 12 unique providers across 5 skills
✅ Notified 12 providers about new task
```

---

### Scénario 2 : Skill rare sans synonymes

**Input :**
```typescript
await createTask('client_456', {
    title: 'Custom furniture',
    category: 'Custom Woodworking',  // Pas dans SKILL_SYNONYMS
    location: 'Lyon',
    budget: 500
});
```

**Flux :**
1. Tâche créée avec ID `task_def456`
2. `getRelatedSkills('Custom Woodworking')` → `['Custom Woodworking']` (pas de synonymes)
3. `getProvidersByMultipleSkills()` cherche avec skill exact uniquement
4. Résultat : 2 providers trouvés
5. 2 notifications envoyées

**Logs :**
```
✅ Task created successfully with ID: task_def456
🔍 Searching providers with skills: Custom Woodworking
✅ Found 2 unique providers across 1 skills
✅ Notified 2 providers about new task
```

---

### Scénario 3 : Aucun provider disponible

**Input :**
```typescript
await createTask('client_789', {
    title: 'Rare service',
    category: 'Quantum Computing Support',
    location: 'Remote',
    budget: 1000
});
```

**Flux :**
1. Tâche créée avec ID `task_ghi789`
2. `getRelatedSkills()` → `['Quantum Computing Support']`
3. `getProvidersByMultipleSkills()` cherche
4. Résultat : 0 providers trouvés
5. Aucune notification envoyée

**Logs :**
```
✅ Task created successfully with ID: task_ghi789
🔍 Searching providers with skills: Quantum Computing Support
ℹ️ No available providers found with matching skills
💡 Consider broadening search or adding more providers with "Quantum Computing Support" skill
```

---

### Scénario 4 : Limite de 50 providers atteinte

**Input :**
```typescript
await createTask('client_abc', {
    title: 'General cleaning',
    category: 'Cleaning',  // Skill très commun
    location: 'Paris',
    budget: 80
});
```

**Flux :**
1. Tâche créée
2. `getRelatedSkills('Cleaning')` → `['Cleaning', 'House Cleaning', 'Deep Cleaning', 'Maid Service', 'Ménage']`
3. Recherche trouve 150 providers
4. **Limite appliquée :** Seulement 50 premiers notifiés
5. 50 notifications envoyées

**Logs :**
```
✅ Task created successfully with ID: task_jkl012
🔍 Searching providers with skills: Cleaning, House Cleaning, Deep Cleaning, Maid Service, Ménage
⚠️ Limited results to 50 providers
✅ Found 50 unique providers across 5 skills
✅ Notified 50 providers about new task
```

---

## 🎨 Améliorations futures possibles

### 1. Filtrage géographique

**Concept :** Ne notifier que les providers dans un rayon X km.

**Implémentation :**
```typescript
interface GeoOptions {
    latitude: number;
    longitude: number;
    radiusKm: number;
}

async function getProvidersNearby(skill: string, geo: GeoOptions) {
    // Utiliser Firestore Geohashing ou Algolia
    // Filtrer providers par distance
}
```

### 2. Système de préférences provider

**Concept :** Providers définissent leurs préférences de notification.

**Schéma User :**
```typescript
interface User {
    // ... existing fields
    notificationPreferences?: {
        taskCategories: string[];     // Catégories souhaitées
        minBudget?: number;           // Budget minimum
        maxDistance?: number;         // Distance max en km
        preferredLocations?: string[]; // Villes préférées
    };
}
```

### 3. Scoring et priorisation

**Concept :** Notifier les meilleurs providers en premier.

**Critères de score :**
- Rating moyen (5 étoiles = +10 pts)
- Nombre de tâches complétées (+1 pt par tâche)
- Taux d'acceptation (+5 pts si >80%)
- Dernière activité (-2 pts si inactif >30j)

**Implémentation :**
```typescript
function scoreProvider(provider: User): number {
    let score = 0;
    score += (provider.rating || 0) * 10;
    score += (provider.completedTasks || 0);
    score += provider.acceptanceRate > 0.8 ? 5 : 0;
    // ...
    return score;
}

providers.sort((a, b) => scoreProvider(b) - scoreProvider(a));
```

### 4. Rate limiting par provider

**Concept :** Ne pas spammer un provider avec trop de notifications.

**Règle :** Max 10 notifications de nouvelles tâches par jour.

**Implémentation :**
```typescript
// Compter notifications envoyées aujourd'hui
const todayNotifCount = await countNotifications(providerId, 'today', 'TASK_CREATED');

if (todayNotifCount >= 10) {
    console.log(`⚠️ Provider ${providerId} already received 10 task notifications today`);
    return; // Skip
}
```

### 5. A/B Testing de stratégies

**Concept :** Tester différentes stratégies de matching.

**Stratégies :**
- A: Skill exact uniquement
- B: Skills + synonymes (actuel)
- C: Skills + synonymes + ML similarity
- D: Géolocalisation prioritaire

**Métriques :**
- Taux de réponse providers
- Temps moyen avant acceptation
- Satisfaction client

---

## 📈 Métriques et monitoring

### Métriques clés

1. **Taux de matching** : % de tâches avec ≥1 provider notifié
2. **Nombre moyen de providers notifiés** par tâche
3. **Taux de réponse** : % providers qui consultent la notification
4. **Taux d'acceptation** : % qui font une proposition

### Logs à surveiller

```typescript
// Success
'✅ Notified X providers about new task'

// Warning
'ℹ️ No available providers found with matching skills'
'⚠️ Limited results to 50 providers'

// Error
'⚠️ Failed to send new task notifications: [error]'
```

### Dashboard recommandé

**Grafana / Firebase Analytics :**
- Graphique : Notifications envoyées par jour
- Graphique : Distribution par catégorie
- Alerte : Si 0 providers trouvés >10 fois/jour
- Alerte : Si erreur notification >5%

---

## 🔒 Index Firestore requis

### Index 1 : Base (isProvider + skills)

```json
{
  "collectionGroup": "users",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "isProvider", "order": "ASCENDING" },
    { "fieldPath": "skills", "arrayConfig": "CONTAINS" }
  ]
}
```

### Index 2 : Avec disponibilité

```json
{
  "collectionGroup": "users",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "isProvider", "order": "ASCENDING" },
    { "fieldPath": "availability", "order": "ASCENDING" },
    { "fieldPath": "skills", "arrayConfig": "CONTAINS" }
  ]
}
```

**Création automatique :** Ces index seront créés automatiquement en développement lors de la première query. En production, déployez-les via Firebase Console ou `firestore deploy --only indexes`.

---

## ✅ Checklist de déploiement

- [ ] Index Firestore créés
- [ ] Vérifier SKILL_SYNONYMS complet (40+ catégories)
- [ ] Tester avec tâche réelle
- [ ] Vérifier logs console
- [ ] Monitorer erreurs pendant 48h
- [ ] Ajuster `maxResults` si nécessaire
- [ ] Documenter nouvelles catégories ajoutées

---

## 📚 Références

- **Firestore Queries :** https://firebase.google.com/docs/firestore/query-data/queries
- **Composite Indexes :** https://firebase.google.com/docs/firestore/query-data/index-overview
- **Array Membership :** https://firebase.google.com/docs/firestore/query-data/queries#array_membership

---

**Auteur :** AI Assistant  
**Date création :** 5 octobre 2025  
**Dernière mise à jour :** 5 octobre 2025  
**Version :** 2.0
