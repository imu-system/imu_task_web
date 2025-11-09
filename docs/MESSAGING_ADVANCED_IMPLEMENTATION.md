# Messagerie Avancée - Implémentation Complète Type WhatsApp

**Date**: 9 Novembre 2025  
**Version**: 2.0  
**Statut**: ✅ Implémentation Complète

---

## 📋 Vue d'ensemble

Ce document détaille l'implémentation complète d'un système de messagerie avancé type WhatsApp pour ImuTask, avec toutes les fonctionnalités modernes attendues par les utilisateurs.

### 🎯 Objectifs

- **Expérience utilisateur moderne** : Interface similaire à WhatsApp/Messenger
- **Fonctionnalités riches** : Médias, audio, réactions, recherche, épinglage
- **Temps réel** : Mises à jour instantanées via Firestore
- **Mobile-first** : Design responsive et tactile-friendly
- **Performance** : Optimisations React Query et lazy loading

---

## 🏗️ Architecture

### Structure des fichiers

```
src/
├── components/messaging/
│   ├── conversation-header-advanced.tsx    ✅ Header avec infos contact
│   ├── conversation-page-advanced.tsx      ✅ Page complète de conversation
│   ├── message-bubble-advanced.tsx         ✅ Bulle de message avec menu
│   ├── message-input-advanced.tsx          ✅ Input avec pièces jointes
│   ├── message-reactions.tsx               ✅ Système de réactions
│   ├── typing-indicator.tsx                ✅ Indicateur de saisie
│   ├── voice-recorder.tsx                  ✅ Enregistrement audio
│   ├── file-upload-preview.tsx             ✅ Prévisualisation fichiers
│   ├── search-in-conversation.tsx          ✅ Recherche dans conversation
│   └── contact-info-panel.tsx              ✅ Panneau d'informations
│
├── hooks/
│   ├── use-messaging.ts                    ✅ Hooks de base
│   └── use-messaging-advanced.ts           ✅ Hooks avancés
│
└── lib/
    ├── types.ts                            ✅ Types TypeScript
    └── firestore-messages.ts               ✅ Helpers Firestore
```

---

## 🎨 Composants Principaux

### 1. ConversationHeaderAdvanced

**Fichier**: `src/components/messaging/conversation-header-advanced.tsx`

#### Fonctionnalités

- ✅ Avatar du contact avec indicateur de présence (online/offline)
- ✅ Nom et statut (dernière vue / en ligne / en train d'écrire)
- ✅ Boutons d'action : appel audio, appel vidéo, recherche
- ✅ Menu contextuel : épingler, archiver, supprimer, muter
- ✅ **Panneau d'informations latéral** avec :
  - Avatar grand format
  - Actions rapides (appel, vidéo, recherche)
  - Onglets pour médias partagés (images/vidéos, documents, liens)
  - Grille de médias cliquables
  - Liste de documents avec téléchargement
  - Historique des liens partagés

#### Props principales

```typescript
interface ConversationHeaderAdvancedProps {
  contactName: string;
  contactAvatar?: string;
  contactStatus?: 'online' | 'offline' | 'typing';
  lastSeen?: Date | string;
  isStarred?: boolean;
  isMuted?: boolean;
  onCall?: () => void;
  onVideoCall?: () => void;
  onSearch?: () => void;
  sharedMedia?: Array<MediaItem>;
  threadId?: string;
}
```

#### Utilisation

```tsx
<ConversationHeaderAdvanced
  contactName="Sophie Dupont"
  contactAvatar="/avatars/sophie.jpg"
  contactStatus="online"
  isStarred={false}
  isMuted={false}
  onCall={handleCall}
  onVideoCall={handleVideoCall}
  onSearch={() => setShowSearch(true)}
  sharedMedia={mediaList}
  threadId={threadId}
/>
```

---

### 2. MessageInputAdvanced

**Fichier**: `src/components/messaging/message-input-advanced.tsx`

#### Fonctionnalités

- ✅ **Textarea auto-redimensionnable** (1-5 lignes)
- ✅ **Emoji Picker** intégré avec recherche
- ✅ **Pièces jointes multiples** :
  - 📷 Photos/Vidéos
  - 📄 Documents (PDF, DOC, XLS)
  - 🎤 Messages vocaux
  - 📍 Localisation (préparé)
- ✅ **Répondre à un message** : bandeau avec preview + annulation
- ✅ **Éditer un message** : mode édition avec ESC pour annuler
- ✅ **Détection PII** : avertissement si numéro de téléphone/email détecté
- ✅ **Indicateur de saisie** : notifie les autres utilisateurs (debounced)
- ✅ **Envoi vocal** : longue pression sur micro (mobile-ready)

#### Props principales

```typescript
interface MessageInputAdvancedProps {
  threadId: string;
  senderId: string;
  senderName: string;
  senderPhotoUrl?: string;
  onTyping?: (isTyping: boolean) => void;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
}
```

#### Raccourcis clavier

- `Enter` : Envoyer le message
- `Shift + Enter` : Nouvelle ligne
- `Escape` : Annuler réponse/édition

---

### 3. MessageBubbleAdvanced

**Fichier**: `src/components/messaging/message-bubble-advanced.tsx`

#### Fonctionnalités

- ✅ **Design responsive** : Bulles adaptées mobile/desktop
- ✅ **Types de messages** :
  - 📝 Texte simple
  - 🖼️ Images avec zoom
  - 🎤 Audio avec lecteur intégré
  - 📎 Fichiers avec icônes par type
  - 📍 Localisation avec carte
- ✅ **Indicateurs de statut** :
  - ⏳ Envoi en cours (spinner)
  - ✓ Envoyé (1 check)
  - ✓✓ Délivré (2 checks gris)
  - ✓✓ Lu (2 checks bleus)
  - ❌ Échec d'envoi
- ✅ **Menu contextuel** (hover + clic droit) :
  - Répondre
  - Copier le texte
  - Transférer
  - Épingler/Désépingler
  - Marquer en favoris
  - Éditer (messages texte uniquement)
  - Supprimer
  - Info message
- ✅ **Réactions emoji** : Ajout rapide de réactions
- ✅ **Badges** : Indicateurs pour messages épinglés/favoris
- ✅ **Preview de réponse** : Affiche le message d'origine

#### Gestion des pièces jointes

```typescript
// Image avec download
<div className="relative group">
  <img src={attachment.url} className="rounded-lg max-w-xs" />
  <Button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
    <Download />
  </Button>
</div>

// Audio avec player
<div className="flex items-center gap-3">
  <Button size="icon"><Play /></Button>
  <div className="flex-1">
    <div className="h-1 bg-muted rounded-full" />
  </div>
  <span>0:45</span>
</div>

// Fichier avec métadonnées
<div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
  <FileIcon type={attachment.mimeType} />
  <div>
    <p>{attachment.name}</p>
    <p className="text-xs">{formatFileSize(attachment.size)}</p>
  </div>
  <Button><Download /></Button>
</div>
```

---

### 4. MessageReactions

**Fichier**: `src/components/messaging/message-reactions.tsx`

#### Fonctionnalités

- ✅ **Réactions emoji** : 👍 ❤️ 😂 😮 😢 🙏
- ✅ **Compteurs groupés** : Affiche le nombre par emoji
- ✅ **Liste des réacteurs** : Tooltip avec noms
- ✅ **Ajout rapide** : Bouton + pour ajouter une réaction
- ✅ **Retrait** : Cliquer sur sa réaction pour la retirer
- ✅ **Animation** : Effet de pop lors de l'ajout

#### Structure de données

```typescript
interface MessageReaction {
  emoji: string;           // "👍", "❤️", etc.
  userId: string;          // ID de l'utilisateur
  userName: string;        // Nom pour affichage
  createdAt: Date;        // Timestamp
}
```

#### Utilisation

```tsx
<MessageReactions
  reactions={message.reactions}
  onReact={(emoji) => handleReact(message.id, emoji)}
  onRemoveReaction={(emoji) => handleRemoveReaction(message.id, emoji)}
  align="left" // ou "right" pour messages propres
/>
```

---

### 5. VoiceRecorder

**Fichier**: `src/components/messaging/voice-recorder.tsx`

#### Fonctionnalités

- ✅ **Enregistrement audio** via MediaRecorder API
- ✅ **Visualisation de forme d'onde** : Canvas animé en temps réel
- ✅ **Timer** : Affichage du temps d'enregistrement
- ✅ **Contrôles** :
  - ⏸️ Pause/Reprendre
  - 🗑️ Annuler
  - ✉️ Envoyer
- ✅ **Lecture avant envoi** : Player pour réécouter
- ✅ **Limite de durée** : 5 minutes max (configurable)
- ✅ **Format** : WebM/Opus pour compatibilité web

#### États du recorder

```typescript
type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';
```

#### Exemple d'utilisation

```tsx
const [showRecorder, setShowRecorder] = useState(false);

<Button onClick={() => setShowRecorder(true)}>
  <Mic />
</Button>

{showRecorder && (
  <VoiceRecorder
    onSend={(blob, duration) => {
      // Upload et envoi
      handleSendAudio(blob, duration);
      setShowRecorder(false);
    }}
    onCancel={() => setShowRecorder(false)}
  />
)}
```

---

### 6. FileUploadPreview

**Fichier**: `src/components/messaging/file-upload-preview.tsx`

#### Fonctionnalités

- ✅ **Preview avant envoi** :
  - 🖼️ Images : Affichage avec crop optionnel
  - 📄 Documents : Icône + métadonnées
  - 🎥 Vidéos : Thumbnail avec durée
- ✅ **Ajout de légende** : Input pour texte d'accompagnement
- ✅ **Édition d'image** :
  - Rotation
  - Crop/Recadrage
  - Filtre (préparé)
- ✅ **Métadonnées** : Nom, taille, type MIME
- ✅ **Boutons d'action** : Annuler / Envoyer

#### Détection du type de fichier

```typescript
const getFileType = (file: File) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'application/pdf') return 'pdf';
  return 'document';
};
```

---

### 7. SearchInConversation

**Fichier**: `src/components/messaging/search-in-conversation.tsx`

#### Fonctionnalités

- ✅ **Recherche textuelle** : Filtre dans les messages
- ✅ **Navigation** : Flèches haut/bas pour résultats
- ✅ **Highlight** : Surlignage du texte trouvé
- ✅ **Compteur** : "3 de 12" résultats
- ✅ **Scroll automatique** : Va au message sélectionné
- ✅ **Recherche temps réel** : Debounced (300ms)
- ✅ **Raccourci** : `Cmd/Ctrl + F` pour ouvrir

#### Utilisation

```tsx
const [showSearch, setShowSearch] = useState(false);

{showSearch && (
  <SearchInConversation
    threadId={threadId}
    onClose={() => setShowSearch(false)}
    onSelectMessage={(messageId) => scrollToMessage(messageId)}
  />
)}
```

---

### 8. TypingIndicator

**Fichier**: `src/components/messaging/typing-indicator.tsx`

#### Fonctionnalités

- ✅ **Animation de points** : 3 points qui rebondissent
- ✅ **Affichage du nom** : "Sophie est en train d'écrire..."
- ✅ **Support multi-utilisateurs** : "Sophie et 2 autres..."
- ✅ **Style WhatsApp** : Bulles grises avec animation

#### Utilisation

```tsx
{typingUsers.length > 0 && (
  <TypingIndicator
    userName={typingUsers[0].name}
    additionalCount={typingUsers.length - 1}
  />
)}
```

---

## 🔗 Hooks Avancés

### Fichier: `src/hooks/use-messaging-advanced.ts`

#### Liste des hooks

| Hook | Description | Mutation/Query |
|------|-------------|----------------|
| `useMessageReactions` | Ajouter/retirer réactions | Mutation |
| `useEditMessage` | Éditer un message | Mutation |
| `useDeleteMessage` | Supprimer un message | Mutation |
| `usePinMessage` | Épingler/désépingler | Mutation |
| `useStarMessage` | Marquer en favoris | Mutation |
| `useForwardMessage` | Transférer à d'autres threads | Mutation |
| `useMarkMessagesAsRead` | Marquer comme lu | Mutation |
| `useSearchMessages` | Rechercher dans conversation | Query |
| `usePinnedMessages` | Récupérer messages épinglés | Query |
| `useSharedMedia` | Récupérer médias partagés | Query |
| `useArchiveThread` | Archiver conversation | Mutation |
| `useMuteThread` | Muter/démuter | Mutation |

#### Exemples d'utilisation

```typescript
// Réactions
const { addReaction, removeReaction } = useMessageReactions(messageId);
addReaction.mutate({ 
  emoji: '👍', 
  userId: user.uid, 
  userName: user.name 
});

// Édition
const editMutation = useEditMessage();
editMutation.mutate({ 
  messageId: 'msg123', 
  newContent: 'Texte modifié' 
});

// Recherche
const { data: results } = useSearchMessages(threadId, 'bonjour');

// Messages épinglés
const { data: pinnedMessages } = usePinnedMessages(threadId);

// Médias partagés
const { data: media } = useSharedMedia(threadId);
```

---

## 🗄️ Structure Firestore

### Collections principales

#### 1. `threads`

```typescript
interface Thread {
  id: string;
  participants: string[];           // IDs des utilisateurs
  participantsData: User[];         // Données complètes (hydraté côté client)
  taskId?: string;                  // Lié à une tâche
  lastMessage?: string;
  lastMessageAt: Date;
  lastMessageSenderId: string;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  
  // Nouveaux champs
  pinnedMessages: string[];         // IDs des messages épinglés
  archived: { [userId: string]: boolean };
  muted: { [userId: string]: boolean };
  mutedUntil: { [userId: string]: Timestamp };
  unreadCount: { [userId: string]: number };
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. `messages`

```typescript
interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderPhotoUrl?: string;
  
  content: string;
  type: MessageType;              // 'text' | 'image' | 'audio' | 'file' | 'location'
  
  // Pièces jointes
  attachments?: MessageAttachment[];
  
  // Réponse à un message
  replyTo?: {
    messageId: string;
    content: string;
    senderId: string;
    senderName: string;
    type: MessageType;
  };
  
  // Métadonnées
  status: MessageStatus;          // 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  reactions: MessageReaction[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  isForwarded: boolean;
  forwardedFrom?: {
    messageId: string;
    originalSenderId: string;
    originalSenderName: string;
  };
  
  readBy: string[];               // IDs des utilisateurs ayant lu
  deliveredTo: string[];          // IDs des utilisateurs ayant reçu
  
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
}
```

#### 3. `users/{userId}/starredMessages`

```typescript
interface StarredMessage {
  messageId: string;
  threadId: string;
  starredAt: Date;
}
```

#### 4. `typing_status` (collection éphémère)

```typescript
interface TypingStatus {
  threadId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  lastUpdate: Date;               // TTL de 5 secondes
}
```

---

## 🎯 Fonctionnalités Complètes

### ✅ Fonctionnalités implémentées

#### Messages
- [x] Envoi de messages texte
- [x] Messages avec pièces jointes (images, vidéos, fichiers)
- [x] Messages vocaux avec enregistrement
- [x] Répondre à un message (quote)
- [x] Éditer un message (texte uniquement)
- [x] Supprimer un message (soft delete)
- [x] Transférer un message
- [x] Copier le contenu d'un message

#### Réactions & Interactions
- [x] Réactions emoji sur les messages
- [x] Compteurs de réactions groupés
- [x] Liste des utilisateurs ayant réagi
- [x] Ajout/retrait de réactions

#### Organisation
- [x] Épingler/désépingler des messages
- [x] Marquer des messages en favoris (starred)
- [x] Archiver des conversations
- [x] Muter des conversations
- [x] Supprimer des conversations

#### Recherche & Navigation
- [x] Recherche dans une conversation
- [x] Navigation entre résultats de recherche
- [x] Highlight du texte recherché
- [x] Scroll automatique vers message

#### Médias partagés
- [x] Galerie de photos/vidéos partagées
- [x] Liste de documents partagés
- [x] Historique des liens partagés
- [x] Téléchargement de fichiers

#### Temps réel
- [x] Indicateur de saisie ("en train d'écrire...")
- [x] Statut de présence (en ligne/hors ligne)
- [x] Dernière vue
- [x] Statuts de lecture (envoyé/délivré/lu)

#### UX/UI
- [x] Interface type WhatsApp
- [x] Design responsive mobile/desktop
- [x] Animations fluides
- [x] Menu contextuel au clic droit
- [x] Raccourcis clavier
- [x] Thème clair/sombre

### 🔜 Fonctionnalités futures (Phase 2)

- [ ] Appels audio/vidéo (WebRTC)
- [ ] Messages éphémères (disparaissent après X temps)
- [ ] Chiffrement de bout en bout (E2EE)
- [ ] Partage de localisation en temps réel
- [ ] Stickers et GIFs animés
- [ ] Mentions (@utilisateur)
- [ ] Groupes de discussion
- [ ] Admin de groupes
- [ ] Permissions personnalisées
- [ ] Sauvegarde et export de conversations

---

## 🚀 Guide d'utilisation

### Intégration dans une page

```tsx
'use client';

import { ConversationPageAdvanced } from '@/components/messaging/conversation-page-advanced';

export default function MessageThreadPage() {
  return <ConversationPageAdvanced />;
}
```

### Création d'une nouvelle conversation

```typescript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function createThread(userId1: string, userId2: string, taskId?: string) {
  const threadRef = await addDoc(collection(db, 'threads'), {
    participants: [userId1, userId2],
    taskId: taskId || null,
    isGroup: false,
    pinnedMessages: [],
    archived: {},
    muted: {},
    unreadCount: { [userId1]: 0, [userId2]: 0 },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return threadRef.id;
}
```

### Envoi d'un message avec pièce jointe

```typescript
import { uploadFileToStorage } from '@/lib/storage';
import { useSendMessage } from '@/hooks/use-messaging';

const sendMessageMutation = useSendMessage();

async function sendImageMessage(file: File, threadId: string) {
  // 1. Upload vers Firebase Storage
  const url = await uploadFileToStorage(file, `messages/${threadId}`);
  
  // 2. Créer le message
  await sendMessageMutation.mutateAsync({
    threadId,
    senderId: user.uid,
    senderName: user.displayName,
    content: '',
    type: 'image',
    attachments: [{
      id: crypto.randomUUID(),
      name: file.name,
      url,
      type: 'image',
      mimeType: file.type,
      size: file.size,
    }],
  });
}
```

---

## 🔒 Sécurité Firestore

### Rules pour les messages

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Threads : lecture/écriture si participant
    match /threads/{threadId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.participants;
      
      allow update: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      allow delete: if false; // Pas de suppression directe
    }
    
    // Messages : lecture si participant du thread, écriture si auteur
    match /messages/{messageId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/threads/$(resource.data.threadId)) &&
        request.auth.uid in get(/databases/$(database)/documents/threads/$(resource.data.threadId)).data.participants;
      
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.senderId;
      
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || // Auteur peut éditer
         request.resource.data.keys().hasOnly(['status', 'readBy', 'deliveredTo', 'reactions'])); // Autres peuvent marquer lu/réagir
      
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.senderId;
    }
    
    // Messages favoris : privé par utilisateur
    match /users/{userId}/starredMessages/{messageId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📱 Responsive Design

### Breakpoints

- **Mobile** : < 768px
  - Liste de threads en plein écran
  - Conversation en plein écran avec bouton retour
  - Actions dans menu hamburger

- **Tablet** : 768px - 1024px
  - Split view : Liste (400px) + Conversation
  - Header compact

- **Desktop** : > 1024px
  - Split view optimisé
  - Panneau d'infos latéral
  - Raccourcis clavier activés

### Classes Tailwind clés

```tsx
// Container principal
<div className="flex h-screen">
  {/* Liste - cachée sur mobile si conversation ouverte */}
  <div className="w-full md:w-[400px] border-r hidden md:block">
    <ThreadList />
  </div>
  
  {/* Conversation */}
  <div className="flex-1 flex flex-col">
    <ConversationPageAdvanced />
  </div>
</div>
```

---

## ⚡ Optimisations Performance

### 1. React Query

- **Invalidation intelligente** : Uniquement les queries concernées
- **Cache persisté** : Réduit les requêtes Firestore
- **Optimistic updates** : UI réactive avant confirmation serveur

### 2. Firestore

- **Pagination** : Chargement des messages par batch de 50
- **Indexes composites** : Pour queries complexes
- **Listeners ciblés** : Souscription uniquement au thread actif

### 3. Images & Médias

- **Lazy loading** : Images chargées à la demande
- **Thumbnails** : Génération côté serveur (Cloud Functions)
- **Compression** : Images optimisées avant upload

### 4. Rendu

- **Virtualisation** : Pour listes de messages longues (react-window)
- **Debouncing** : Recherche et indicateur de saisie
- **Memo** : Composants purs pour éviter re-renders

---

## 🧪 Testing

### Tests E2E avec Playwright

```typescript
// tests/e2e/messaging.spec.ts
import { test, expect } from '@playwright/test';

test('Envoyer un message texte', async ({ page }) => {
  await page.goto('/dashboard/messages/thread123');
  
  // Taper un message
  await page.fill('[data-testid="message-input"]', 'Bonjour!');
  await page.click('[data-testid="send-button"]');
  
  // Vérifier l'affichage
  await expect(page.locator('text=Bonjour!')).toBeVisible();
});

test('Réagir à un message', async ({ page }) => {
  await page.goto('/dashboard/messages/thread123');
  
  // Hover sur message
  await page.hover('[data-testid="message-bubble"]');
  
  // Cliquer sur réaction
  await page.click('[data-testid="add-reaction"]');
  await page.click('[data-testid="emoji-thumbs-up"]');
  
  // Vérifier
  await expect(page.locator('[data-testid="reaction-👍"]')).toBeVisible();
});
```

### Tests unitaires (Jest)

```typescript
// components/messaging/__tests__/message-bubble.test.tsx
import { render, screen } from '@testing-library/react';
import { MessageBubbleAdvanced } from '../message-bubble-advanced';

describe('MessageBubbleAdvanced', () => {
  it('affiche le contenu du message', () => {
    const message = {
      id: '1',
      content: 'Test message',
      senderId: 'user1',
      type: 'text',
      status: 'sent',
      createdAt: new Date(),
    };
    
    render(<MessageBubbleAdvanced message={message} isOwnMessage={true} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});
```

---

## 📊 Métriques & Monitoring

### Métriques clés à suivre

- **Temps de chargement** des conversations
- **Taux de délivrabilité** des messages
- **Latence** d'envoi/réception
- **Taux d'utilisation** des fonctionnalités (réactions, vocaux, etc.)
- **Erreurs** Firestore
- **Quota** Firebase (reads/writes/deletes)

### Firebase Analytics Events

```typescript
import { logEvent } from 'firebase/analytics';

// Message envoyé
logEvent(analytics, 'message_sent', {
  type: 'text',
  has_attachment: false,
  thread_id: threadId,
});

// Réaction ajoutée
logEvent(analytics, 'reaction_added', {
  emoji: '👍',
  message_id: messageId,
});

// Recherche effectuée
logEvent(analytics, 'search_performed', {
  query_length: query.length,
  results_count: results.length,
});
```

---

## 🐛 Debugging

### Console logs utiles

```typescript
// Dans useMessages hook
console.log('[Messages] Fetching messages for thread:', threadId);
console.log('[Messages] Received', messages.length, 'messages');

// Dans useSendMessage
console.log('[Send] Sending message:', { type, hasAttachment });
console.log('[Send] Message sent successfully:', messageId);

// Erreurs Firestore
console.error('[Firestore] Error fetching messages:', error);
```

### React DevTools

- **Components tab** : Vérifier props et state
- **Profiler** : Identifier re-renders inutiles
- **React Query Devtools** : Inspecter cache et mutations

### Firebase Emulator

```bash
firebase emulators:start --only firestore
```

Accéder à l'UI : http://localhost:4000

---

## 📚 Ressources

### Documentation officielle

- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [React Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Inspiration design

- WhatsApp Web
- Facebook Messenger
- Telegram Web
- Slack

---

## 🎓 Bonnes pratiques

### 1. Structure des messages

```typescript
// ✅ BON : Types explicites
interface Message {
  type: 'text' | 'image' | 'audio' | 'file';
  content: string;
  attachments?: Attachment[];
}

// ❌ MAUVAIS : Types implicites
interface Message {
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  fileUrl?: string;
}
```

### 2. Gestion des erreurs

```typescript
// ✅ BON : Try-catch avec feedback utilisateur
try {
  await sendMessage(data);
  toast.success('Message envoyé');
} catch (error) {
  console.error('Send error:', error);
  toast.error('Échec de l\'envoi');
}

// ❌ MAUVAIS : Erreurs silencieuses
await sendMessage(data).catch(() => {});
```

### 3. Optimistic updates

```typescript
// ✅ BON : UI réactive
const mutation = useMutation({
  mutationFn: sendMessage,
  onMutate: async (newMessage) => {
    // Annuler queries en cours
    await queryClient.cancelQueries(['messages']);
    
    // Sauvegarder état précédent
    const previous = queryClient.getQueryData(['messages']);
    
    // Optimistic update
    queryClient.setQueryData(['messages'], (old) => [...old, newMessage]);
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback en cas d'erreur
    queryClient.setQueryData(['messages'], context.previous);
  },
});
```

---

## 🔄 Changelog

### Version 2.0 (9 Novembre 2025)

- ✅ Implémentation complète de tous les composants avancés
- ✅ Hooks pour toutes les fonctionnalités (réactions, épinglage, etc.)
- ✅ Panneau d'informations avec médias partagés
- ✅ Recherche dans conversation
- ✅ Messages vocaux avec enregistrement
- ✅ Preview de fichiers avant envoi
- ✅ Système de réactions
- ✅ Documentation technique complète

### Version 1.0 (28 Octobre 2025)

- ✅ Système de messagerie de base
- ✅ Envoi/réception de messages texte
- ✅ Liste de threads
- ✅ Interface responsive

---

## 📞 Support

Pour toute question ou problème :

1. Consulter ce document
2. Vérifier la console du navigateur
3. Inspecter Firestore dans Firebase Console
4. Utiliser les Firebase Emulators pour déboguer localement

---

**Dernière mise à jour** : 9 Novembre 2025  
**Auteur** : Équipe ImuTask  
**Statut** : ✅ Production Ready
