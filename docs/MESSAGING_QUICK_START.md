# 🚀 Messagerie Avancée - Guide de Démarrage Rapide

**Objectif** : Intégrer la messagerie avancée type WhatsApp dans ImuTask

---

## ✅ Composants Créés

Tous les composants suivants sont **prêts à l'emploi** :

```
src/components/messaging/
├── ✅ conversation-header-advanced.tsx     - Header avec panneau d'infos
├── ✅ conversation-page-advanced.tsx       - Page complète intégrée
├── ✅ message-bubble-advanced.tsx          - Bulles avec menu contextuel
├── ✅ message-input-advanced.tsx           - Input avec pièces jointes
├── ✅ message-reactions.tsx                - Système de réactions emoji
├── ✅ typing-indicator.tsx                 - Indicateur "en train d'écrire"
├── ✅ voice-recorder.tsx                   - Enregistrement vocal
├── ✅ file-upload-preview.tsx              - Preview avant envoi
├── ✅ search-in-conversation.tsx           - Recherche dans conversation
└── ✅ contact-info-panel.tsx               - Panel d'infos (intégré dans header)

src/hooks/
└── ✅ use-messaging-advanced.ts            - Tous les hooks (12 fonctions)
```

---

## 🎯 Étapes d'Intégration

### 1. ✅ Vérifier les dépendances

Les packages suivants doivent être installés :

```bash
# Déjà dans le projet
- react-query / @tanstack/react-query
- firebase / firestore
- next-intl
- tailwindcss
- shadcn/ui components
- emoji-picker-react
- react-textarea-autosize
- date-fns
- use-debounce
```

### 2. 🔄 Remplacer la page de conversation

**Fichier** : `src/app/[locale]/dashboard/messages/[threadId]/page.tsx`

**Avant** :
```tsx
// Ancienne implémentation basique
export default function MessageThreadPage() {
  return <BasicConversationView />;
}
```

**Après** :
```tsx
import { ConversationPageAdvanced } from '@/components/messaging/conversation-page-advanced';

export default function MessageThreadPage() {
  return <ConversationPageAdvanced />;
}
```

**C'est tout !** La page gère automatiquement :
- Récupération du threadId depuis l'URL
- Authentification de l'utilisateur
- Chargement des messages
- Toutes les fonctionnalités avancées

### 3. 📝 Ajouter les traductions i18n

**Fichier** : `src/messages/fr.json`

Ajouter ces clés dans la section `messaging` :

```json
{
  "messaging": {
    "title": "Messages",
    "selectThread": "Sélectionnez une conversation",
    "selectThreadDescription": "Choisissez une conversation dans la liste pour commencer",
    "typeMessage": "Tapez un message...",
    "sending": "Envoi...",
    "sent": "Envoyé",
    "delivered": "Délivré",
    "read": "Lu",
    "failed": "Échec",
    "online": "En ligne",
    "offline": "Hors ligne",
    "typing": "En train d'écrire...",
    "lastSeen": "Vu pour la dernière fois",
    "justNow": "à l'instant",
    "lastSeenMinutes": "il y a {count} minute(s)",
    "lastSeenHours": "il y a {count} heure(s)",
    "yesterday": "hier",
    
    // Actions sur messages
    "reply": "Répondre",
    "edit": "Modifier",
    "delete": "Supprimer",
    "copy": "Copier",
    "forward": "Transférer",
    "pin": "Épingler",
    "unpin": "Désépingler",
    "star": "Marquer en favori",
    "unstar": "Retirer des favoris",
    "messageInfo": "Infos du message",
    
    // Pièces jointes
    "photoOrVideo": "Photo ou vidéo",
    "document": "Document",
    "shareLocation": "Partager ma position",
    
    // Réponse/Édition
    "replyingTo": "Répondre à",
    "editingMessage": "Modification",
    "edited": "modifié",
    
    // PII Warning
    "piiDetected": "Informations sensibles détectées",
    "piiMessage": "Évitez de partager des numéros de téléphone ou emails",
    "sendAnyway": "Envoyer quand même",
    "cancel": "Annuler",
    
    // Conversation
    "contactInfo": "Infos du contact",
    "searchInConversation": "Rechercher dans la conversation",
    "starConversation": "Marquer en favori",
    "unstarConversation": "Retirer des favoris",
    "mute": "Désactiver les notifications",
    "unmute": "Réactiver les notifications",
    "archiveConversation": "Archiver",
    "deleteConversation": "Supprimer la conversation",
    "deleteMessage": "Supprimer le message",
    "deleteMessageConfirm": "Êtes-vous sûr de vouloir supprimer ce message ?",
    "close": "Fermer",
    
    // Médias partagés
    "media": "Médias",
    "documents": "Documents",
    "links": "Liens",
    "noMediaShared": "Aucun média partagé",
    "noDocumentsShared": "Aucun document partagé",
    "noLinksShared": "Aucun lien partagé",
    
    // Appels
    "call": "Appeler",
    "video": "Vidéo",
    
    // Messages épinglés
    "pinnedMessage": "Message épinglé",
    "pinnedMessages": "{count} messages épinglés",
    
    // Recherche
    "search": "Rechercher",
    "searchResults": "{current} de {total}",
    "noResults": "Aucun résultat",
    
    // Erreurs
    "conversationNotFound": "Conversation introuvable",
    "messageSendError": "Erreur lors de l'envoi du message",
    "uploadError": "Erreur lors de l'upload du fichier"
  }
}
```

Dupliquer pour `en.json` et `ja.json` avec les traductions appropriées.

### 4. 🗄️ Mettre à jour Firestore

#### Ajouter les nouveaux champs aux threads existants

Exécuter cette migration dans la console Firebase ou via un script :

```typescript
// scripts/migrate-threads.ts
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function migrateThreads() {
  const threadsRef = collection(db, 'threads');
  const snapshot = await getDocs(threadsRef);
  
  for (const threadDoc of snapshot.docs) {
    await updateDoc(doc(db, 'threads', threadDoc.id), {
      pinnedMessages: [],
      archived: {},
      muted: {},
      mutedUntil: {},
      unreadCount: {},
    });
  }
  
  console.log(`Migrated ${snapshot.size} threads`);
}

migrateThreads();
```

#### Mettre à jour les règles Firestore

**Fichier** : `firestore.rules`

Ajouter ces règles pour les nouvelles fonctionnalités :

```javascript
match /users/{userId}/starredMessages/{messageId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

match /messages/{messageId} {
  // Permettre la mise à jour des réactions et statuts
  allow update: if request.auth != null && (
    request.auth.uid == resource.data.senderId || // Auteur peut tout modifier
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['status', 'readBy', 'deliveredTo', 'reactions', 'readAt', 'deliveredAt'])
  );
}
```

Déployer :
```bash
firebase deploy --only firestore:rules
```

### 5. 🎨 Styles CSS personnalisés (optionnel)

Pour le pattern de fond WhatsApp, ajouter dans `globals.css` :

```css
/* Pattern de fond WhatsApp */
.whatsapp-bg-pattern {
  background-color: #efeae2;
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(0, 0, 0, 0.02) 10px,
      rgba(0, 0, 0, 0.02) 20px
    );
}

.dark .whatsapp-bg-pattern {
  background-color: #0b141a;
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.02) 10px,
      rgba(255, 255, 255, 0.02) 20px
    );
}

/* Animation des réactions */
@keyframes reaction-pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.reaction-animate {
  animation: reaction-pop 0.3s ease-out;
}
```

---

## 🧪 Tester l'implémentation

### 1. Créer une conversation de test

```typescript
// Dans la console du navigateur (page /dashboard/messages)
const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
const { db } = await import('@/lib/firebase');

// Créer un thread de test
const threadRef = await addDoc(collection(db, 'threads'), {
  participants: ['USER_ID_1', 'USER_ID_2'],
  participantsData: [], // Sera hydraté côté client
  isGroup: false,
  pinnedMessages: [],
  archived: {},
  muted: {},
  unreadCount: {},
  lastMessage: 'Message de test',
  lastMessageAt: serverTimestamp(),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

console.log('Thread créé:', threadRef.id);
```

### 2. Envoyer un message de test

Naviguer vers `/dashboard/messages/{threadId}` et :

1. ✅ Taper du texte → Vérifier l'envoi
2. ✅ Cliquer sur emoji → Vérifier le picker
3. ✅ Uploader une image → Vérifier la preview
4. ✅ Cliquer sur micro → Vérifier l'enregistrement
5. ✅ Hover sur message → Vérifier le menu contextuel
6. ✅ Ajouter une réaction → Vérifier l'affichage
7. ✅ Cliquer sur avatar → Vérifier le panneau d'infos
8. ✅ Rechercher du texte → Vérifier la recherche

### 3. Tester les fonctionnalités avancées

#### Répondre à un message
```
1. Hover sur un message
2. Cliquer sur l'icône "Répondre"
3. Vérifier l'affichage du bandeau de réponse
4. Taper et envoyer
5. Vérifier la preview dans la bulle
```

#### Éditer un message
```
1. Hover sur votre message
2. Menu → Modifier
3. Changer le texte
4. Appuyer sur Entrée
5. Vérifier le badge "modifié"
```

#### Épingler un message
```
1. Menu → Épingler
2. Vérifier le bandeau jaune en haut
3. Menu → Désépingler
4. Vérifier la disparition
```

#### Médias partagés
```
1. Envoyer 2-3 images
2. Cliquer sur l'avatar du contact
3. Onglet "Médias"
4. Vérifier la grille d'images
```

---

## 📊 Vérification Firestore

Après les tests, vérifier dans la console Firebase :

### Collection `threads`
```javascript
{
  participants: ["uid1", "uid2"],
  pinnedMessages: ["msgId1"],    // ✅ Si épinglé
  archived: { uid1: false },     // ✅ Champs ajoutés
  muted: { uid1: false },
  unreadCount: { uid1: 0, uid2: 1 },
  lastMessage: "Dernier message",
  lastMessageAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection `messages`
```javascript
{
  threadId: "thread123",
  senderId: "uid1",
  content: "Hello",
  type: "text",
  status: "read",                // ✅ Passe de sent → delivered → read
  reactions: [                   // ✅ Si réactions ajoutées
    {
      emoji: "👍",
      userId: "uid2",
      userName: "Sophie",
      createdAt: Timestamp
    }
  ],
  isEdited: false,               // ✅ true si édité
  editedAt: null,
  replyTo: {                     // ✅ Si réponse à un message
    messageId: "msg123",
    content: "Message original",
    senderId: "uid2",
    type: "text"
  },
  readBy: ["uid1", "uid2"],
  deliveredTo: ["uid1", "uid2"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection `users/{uid}/starredMessages`
```javascript
{
  messageId: "msg123",
  threadId: "thread123",
  starredAt: Timestamp
}
```

---

## 🐛 Troubleshooting

### Problème : Messages ne s'affichent pas

**Solution** :
```typescript
// Vérifier les permissions Firestore
// Console Firebase → Firestore → Rules

match /messages/{messageId} {
  allow read: if request.auth != null;
}
```

### Problème : Upload de fichiers échoue

**Solution** :
```typescript
// Vérifier Firebase Storage rules
// Console Firebase → Storage → Rules

match /messages/{threadId}/{fileName} {
  allow write: if request.auth != null;
  allow read: if request.auth != null;
}
```

### Problème : Indicateur de saisie ne s'affiche pas

**Solution** :
```typescript
// Vérifier que onTyping est bien passé au MessageInput
<MessageInputAdvanced
  threadId={threadId}
  senderId={user.uid}
  senderName={user.name}
  onTyping={(isTyping) => updateTypingStatus(threadId, user.uid, isTyping)}
/>
```

### Problème : Réactions ne s'affichent pas

**Solution** :
```typescript
// Vérifier la structure du champ reactions dans Firestore
// Doit être un Array, pas un Object

// Si mauvaise structure, migration :
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

await updateDoc(doc(db, 'messages', messageId), {
  reactions: []  // Réinitialiser en array vide
});
```

---

## ⚡ Optimisations

### 1. Lazy load des composants lourds

```typescript
// Dans page.tsx
import dynamic from 'next/dynamic';

const ConversationPageAdvanced = dynamic(
  () => import('@/components/messaging/conversation-page-advanced')
    .then(mod => ({ default: mod.ConversationPageAdvanced })),
  { ssr: false, loading: () => <ConversationSkeleton /> }
);
```

### 2. Pagination des messages

```typescript
// Dans useMessages hook
const MESSAGES_PER_PAGE = 50;

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['messages', threadId],
  queryFn: ({ pageParam = 0 }) => fetchMessages(threadId, pageParam, MESSAGES_PER_PAGE),
  getNextPageParam: (lastPage, pages) => 
    lastPage.length === MESSAGES_PER_PAGE ? pages.length : undefined,
});
```

### 3. Virtualisation pour longues listes

```bash
pnpm add react-window
```

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={messages.length}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      <MessageBubbleAdvanced message={messages[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## 📈 Prochaines étapes

1. **Appels audio/vidéo** : Intégrer WebRTC (Agora, Twilio)
2. **Notifications push** : Firebase Cloud Messaging
3. **Chiffrement E2E** : Crypto API browser
4. **Groupes** : Étendre à plus de 2 participants
5. **Stickers & GIFs** : Intégrer Giphy API

---

## 📚 Documentation complète

Pour tous les détails techniques :

📖 **[MESSAGING_ADVANCED_IMPLEMENTATION.md](./MESSAGING_ADVANCED_IMPLEMENTATION.md)**

---

## ✅ Checklist de déploiement

Avant de déployer en production :

- [ ] Toutes les traductions ajoutées (fr, en, ja)
- [ ] Règles Firestore mises à jour et déployées
- [ ] Storage rules configurées
- [ ] Tests E2E passent
- [ ] Optimisations appliquées (lazy load, pagination)
- [ ] Monitoring configuré (Firebase Analytics)
- [ ] Documentation à jour
- [ ] Backup Firestore effectué

---

**Temps d'intégration estimé** : 2-3 heures  
**Difficulté** : Moyenne  
**Prêt pour production** : ✅ Oui

**Bon développement ! 🚀**
