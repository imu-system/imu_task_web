# 💬 Messagerie ImuTask - Documentation Technique

**Date de création** : 27 octobre 2025  
**Statut** : ✅ Phase 1 complétée (Thread Creation & Types) - En cours Phase 2 (Interface)  
**Version** : 1.0

---

## 📋 Table des matières

1. [Architecture Technique](#architecture-technique)
2. [Spécifications Fonctionnelles](#spécifications-fonctionnelles)
3. [Implémentation](#implémentation)
4. [Interfaces Utilisateur](#interfaces-utilisateur)
5. [Sécurité & PII Detection](#sécurité)

---

## 🏗️ Architecture Technique

### Stack Technologique

```typescript
// Core
- Firebase Firestore (base de données temps réel)
- React Query (gestion état + cache)
- TypeScript (typage strict)

// Collections Firestore
- threads/         (conversations entre users)
- messages/        (messages individuels)

// Fichiers implémentés
✅ src/lib/types.ts                    (Thread, Message, ThreadStatus, MessageType)
✅ src/lib/firestore-threads.ts        (CRUD threads + real-time subscriptions)
✅ src/lib/firestore-messages.ts       (CRUD messages + PII detection)
✅ src/hooks/use-messaging.ts          (React Query hooks)
```

### Types TypeScript

```typescript
// Thread (Conversation)
export type Thread = {
  id: string;
  participants: string[];                    // [clientId, providerId]
  participantsData?: {
    [userId: string]: {
      displayName: string;
      photoUrl?: string;
      accountType?: AccountType;
    };
  };
  taskId?: string;                          // Tâche associée
  taskTitle?: string;                       // Titre tâche (denormalized)
  bookingId?: string;                       // Booking associé
  bookingStatus?: BookingStatus;
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: Date | string;
  };
  lastMessageAt: Date | string;
  unreadCount: {
    [userId: string]: number;               // Compteur non-lus par user
  };
  status: ThreadStatus;                     // 'active' | 'archived' | 'blocked'
  createdAt: Date | string;
  updatedAt: Date | string;
  typingUsers?: string[];                   // IDs users en train d'écrire
};

// Message
export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  senderName?: string;                      // Denormalized pour affichage
  senderPhotoUrl?: string;
  content: string;
  type: MessageType;                        // 'text' | 'image' | 'file' | 'audio' | 'system'
  attachments?: MessageAttachment[];
  readBy: string[];                         // User IDs ayant lu
  createdAt: Date | string;
  updatedAt?: Date | string;
  systemMetadata?: {                        // Si type='system'
    action?: 'offer_accepted' | 'payment_validated' | 'dispute_opened' | 'booking_created';
    relatedId?: string;
  };
  containsPII?: boolean;                    // Détection infos personnelles
  piiWarningShown?: boolean;
};
```

### Fonctions Firestore Implémentées

#### Threads (`src/lib/firestore-threads.ts`)

```typescript
✅ createThread()              - Créer nouvelle conversation (auto-dedupe)
✅ getThread()                 - Récupérer thread par ID
✅ getUserThreads()            - Liste threads user (avec filtres)
✅ updateThread()              - Mettre à jour thread
✅ markThreadAsRead()          - Marquer comme lu
✅ incrementUnreadCount()      - Incrémenter compteur non-lus
✅ archiveThread()             - Archiver conversation
✅ deleteThread()              - Supprimer (admin only)
✅ subscribeToThread()         - Subscription temps réel (1 thread)
✅ subscribeToUserThreads()    - Subscription temps réel (tous threads user)
✅ setTypingStatus()           - Indicateur "est en train d'écrire"
✅ getTotalUnreadCount()       - Compteur total non-lus
✅ searchThreads()             - Recherche par titre/nom
```

#### Messages (`src/lib/firestore-messages.ts`)

```typescript
✅ sendMessage()               - Envoyer message texte/média
✅ sendSystemMessage()         - Message système auto-généré
✅ getThreadMessages()         - Récupérer messages d'un thread
✅ getMessage()                - Récupérer message par ID
✅ markMessageAsRead()         - Marquer message lu
✅ markAllMessagesAsRead()     - Marquer tous messages thread lus
✅ updateMessage()             - Mettre à jour message
✅ subscribeToThreadMessages() - Subscription temps réel messages
✅ subscribeToMessage()        - Subscription temps réel 1 message
✅ getUnreadMessageCount()     - Compteur non-lus par thread
✅ hasUserSentMessages()       - Check si user a envoyé messages
✅ detectPII()                 - Détection infos personnelles (email, tel, adresse)
```

#### React Query Hooks (`src/hooks/use-messaging.ts`)

```typescript
✅ useUserThreads()            - Liste threads + real-time
✅ useThread()                 - Thread unique + real-time
✅ useUnreadCount()            - Compteur total non-lus
✅ useSearchThreads()          - Recherche threads
✅ useThreadMessages()         - Messages thread + real-time
✅ useCreateThread()           - Mutation créer thread
✅ useSendMessage()            - Mutation envoyer message (optimistic update)
✅ useSendSystemMessage()      - Mutation message système
✅ useMarkThreadAsRead()       - Mutation marquer lu
✅ useMarkAllMessagesAsRead()  - Mutation tout marquer lu
✅ useArchiveThread()          - Mutation archiver
✅ useUpdateThread()           - Mutation update thread
```

---

## 📱 Spécifications Fonctionnelles

La messagerie est un module critique pour une plateforme comme ImuTask, car elle est le cœur de la coordination et de la confiance entre utilisateurs. Une conception claire et fonctionnelle est primordiale pour éviter les frustrations et assurer le bon déroulement des missions.

### Objectifs

L'objectif est de rendre la communication fluide, traçable et sécurisée, tout en offrant une expérience utilisateur intuitive sur mobile et web.

---

## 🎨 Interfaces Utilisateur

### 1. Vue Générale : Liste des Conversations

**Route** : `/dashboard/messages`  
**Statut implémentation** : 🔄 En cours

C'est la page d'accueil du module messagerie, présentant toutes les conversations actives ou passées.

#### 1.1. En-tête de la Page

```tsx
// Composant : <MessagesPageHeader />
- Titre : "Messages" ou "Mes Conversations"
- Bouton "Nouvelle Conversation" (optionnel/contextuel)
  → Si un utilisateur veut initier une conversation sans passer par une tâche
  → Ex: question générale à un prestataire post-mission
```

#### 1.2. Barres de Recherche et Filtres

```tsx
// Composant : <ThreadFilters />
- Champ de recherche :
  → Recherche dans noms correspondants, titres tâches, contenu messages
  → Hook : useSearchThreads(userId, searchQuery)
  
- Filtres (Type de rôle) :
  → "Toutes", "En tant que Client", "En tant que Prestataire"
  
- Filtres (Statut de la tâche) :
  → "Actives" (tâches en cours, en attente d'offre/acceptation)
  → "Archivées" (tâches terminées ou annulées)
  → "Non lues" (unreadCount > 0)
  
// Implémentation technique
const { data: threads } = useUserThreads(userId, {
  status: filterStatus,    // 'active' | 'archived'
  onlyUnread: showUnread   // boolean
});
```

#### 1.3. Liste des Conversations (Threads)

```tsx
// Composant : <ThreadList />
// Hook : useUserThreads(userId)

Chaque élément représente un "thread" de conversation (lié à une tâche ou interlocuteur)

Informations affichées par thread :
┌─────────────────────────────────────────────────────────┐
│ [Photo]  Nom Correspondant                    [Pastille]│
│          Titre de la Mission                            │
│          "Dernièr message preview..."                   │
│          Status Mission  •  il y a 2h                   │
└─────────────────────────────────────────────────────────┘

Données thread accessibles :
- thread.participantsData[otherUserId].displayName
- thread.participantsData[otherUserId].photoUrl
- thread.taskTitle
- thread.bookingStatus (afficher avec couleur/icône)
- thread.lastMessage.content (extrait 100 chars)
- thread.lastMessageAt (formaté en relatif)
- thread.unreadCount[currentUserId] (pastille si > 0)

Options contextuelles (swipe mobile / survol web) :
- Archiver → useArchiveThread()
- Signaler → (à implémenter Phase 2)
```

### 2. Vue Détaillée : Fenêtre de Conversation

**Route** : `/dashboard/messages/[threadId]`  
**Statut implémentation** : ⏳ Non commencé

Une fois un thread sélectionné, l'utilisateur accède à la conversation spécifique.

#### 2.1. En-tête de la Conversation

```tsx
// Composant : <ConversationHeader />
// Hook : useThread(threadId)

┌─────────────────────────────────────────────────────────┐
│ [←]  [Photo] Nom Correspondant              [⋮ Actions] │
│      Titre de la Tâche (cliquable)                      │
└─────────────────────────────────────────────────────────┘

Éléments :
- Bouton "Retour" → navigate('/dashboard/messages')
- Photo de profil + Nom du correspondant
  → thread.participantsData[otherUserId]
  
- Titre de la Tâche (cliquable)
  → <Link href={`/dashboard/tasks/${thread.taskId}`}>
      {thread.taskTitle}
    </Link>
    
- Bouton "Actions" (menu kebab) :
  • "Ouvrir un litige" (si booking en cours/terminé)
  • "Signaler cet utilisateur"
  • "Bloquer cet utilisateur" → updateThread({ status: 'blocked' })
  • "Archiver la conversation" → useArchiveThread()
  • "Appeler l'utilisateur" (WebRTC, si V2)
```

#### 2.2. Zone de Messages (Historique)

```tsx
// Composant : <MessageList />
// Hook : useThreadMessages(threadId)

const { data: messages } = useThreadMessages(threadId);
// ✅ Temps réel automatique via subscribeToThreadMessages()

Affichage chronologique des messages (bulle de conversation) :
┌─────────────────────────────────────────────────────────┐
│                                     [Message envoyé]  ●●│
│  [Message reçu]                                         │
│  [Date: Aujourd'hui 14:32]                              │
│                              [Message envoyé avec PII ⚠️│
│  [📷 Image attachment]                                  │
│  [🤖 Message système: "L'offre a été acceptée"]         │
└─────────────────────────────────────────────────────────┘

Marquage temporel :
- Date et heure de chaque message ou groupe de messages
- Format relatif : "Il y a 5 min", "Aujourd'hui 14:32", "Hier"

Indicateurs de lecture :
- Double coche grise : message envoyé
- Double coche bleue : message lu (senderId in message.readBy)
- "Vu par X" en bas du dernier message

Types de messages supportés :
1. Texte : message.type === 'text'
   → Affichage content standard
   
2. Pièces jointes : message.type === 'image' | 'file'
   → Images : aperçu + click pour agrandir
   → PDF/docs : icône + nom fichier + bouton téléchargement
   → message.attachments[] array
   
3. Messages système : message.type === 'system'
   → Style différent (centré, gris)
   → Ex: "L'offre a été acceptée", "Le paiement a été validé"
   → message.systemMetadata.action

Message d'alerte PII :
if (message.containsPII && !message.piiWarningShown) {
  // Afficher warning banner
  "⚠️ Attention, nous avons détecté une information personnelle sensible.
   Évitez de partager email, téléphone ou adresse sur la plateforme."
}

// Auto-scroll vers le bas sur nouveau message
useEffect(() => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }
}, [messages]);
```

#### 2.3. Pied de Conversation (Zone de Saisie)

```tsx
// Composant : <MessageInput />
// Hook : useSendMessage()

const sendMessageMutation = useSendMessage();

const handleSend = async () => {
  // Détection PII avant envoi
  const hasPII = detectPII(messageContent);
  
  if (hasPII) {
    // Montrer confirmation dialog
    const confirmed = await confirmDialog(
      "Votre message contient des informations personnelles. Continuer ?"
    );
    if (!confirmed) return;
  }
  
  await sendMessageMutation.mutateAsync({
    threadId,
    senderId: currentUserId,
    senderName: currentUser.displayName,
    senderPhotoUrl: currentUser.photoUrl,
    content: messageContent,
    type: 'text',
  });
  
  setMessageContent('');
};

Éléments interface :
┌─────────────────────────────────────────────────────────┐
│ [📎] [Écrire un message...]              [🎤]  [Envoyer]│
└─────────────────────────────────────────────────────────┘

- Champ de texte : <textarea> avec auto-resize
- Bouton "Envoyer" : disabled si content.trim() === ''
- Bouton "Joindre Fichier / Photo" :
  → <input type="file" accept="image/*,.pdf,.doc,.docx" />
  → Upload vers Firebase Storage
  → Créer MessageAttachment
  
- Bouton "Enregistrer Audio" (V2) :
  → WebRTC audio recording
  → Upload MP3 vers Storage
```

#### 2.4. Barre d'Informations Contextuelles

```tsx
// Composant : <ThreadContextBar />
// Position : Fixe en haut ou déroulante

Affiche statut actuel de la tâche/booking :
┌─────────────────────────────────────────────────────────┐
│ 📋 Mission planifiée le 15/03 à 14h00                   │
│ [Marquer comme commencée]  [Proposer de replanifier]    │
└─────────────────────────────────────────────────────────┘

Boutons d'action rapide (selon status + rôle) :
- "Accepter l'offre" (si client et offre en attente)
- "Proposer une contre-offre" (si client)
- "Marquer comme commencée" (si prestataire et booking planifié)
- "Marquer comme terminée" (si prestataire et booking en cours)
- "Proposer de replanifier"
- "Annuler la tâche"
```

### 3. Widget Messagerie (Mini-Mode)

**Statut implémentation** : ⏳ Phase 2

Quand l'utilisateur navigue sur d'autres pages de l'application (tableau de bord, détails de tâche, profil), un widget discret permet un accès rapide à la messagerie.

#### 3.1. Sur Mobile : Pastille Flottante (FAB)

```tsx
// Composant : <MessagesFAB />
// Position : fixed bottom-right

const { data: unreadCount } = useUnreadCount(userId);

<FloatingActionButton>
  <MessageCircle />
  {unreadCount > 0 && (
    <Badge variant="destructive">{unreadCount}</Badge>
  )}
</FloatingActionButton>

// Click → navigate('/dashboard/messages')
```

#### 3.2. Sur Web : Barre/Widget de Messagerie Discrète

```tsx
// Composant : <MessagesWidget />
// Position : Navigation principale

Icône "Messages" dans menu nav avec pastille non-lus :
[💬 Messages (3)]

Optionnel (V2) - Mini chat widget :
┌─────────────────────────────────┐
│ Messages (3 non lus)        [×] │
├─────────────────────────────────┤
│ [Photo] Jean Dupont             │
│         "Merci beaucoup..."     │
├─────────────────────────────────┤
│ [Photo] Marie Martin            │
│         "Rendez-vous confirmé"  │
├─────────────────────────────────┤
│ [Voir tous les messages]        │
└─────────────────────────────────┘
```

---

## 🔒 Sécurité & PII Detection

### Détection d'Informations Personnelles

```typescript
// Implémenté dans src/lib/firestore-messages.ts

const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?[\d\s.-]{6,}/g,
  address: /\b\d{1,5}\s+(?:rue|avenue|boulevard|place|allée|impasse|chemin)\s+[a-z\s]+,?\s*\d{5}\s+[a-z\s]+\b/gi,
};

export function detectPII(content: string): boolean {
  return Object.values(PII_PATTERNS).some(pattern => pattern.test(content));
}
```

### Workflow de Sécurité

```
1. User écrit message avec email/tél
   ↓
2. detectPII() → true
   ↓
3. Afficher warning avant envoi :
   "⚠️ Évitez de partager vos coordonnées directes.
    Utilisez la messagerie sécurisée ImuTask."
   [Annuler] [Envoyer quand même]
   ↓
4. Si envoi confirmé :
   - Message créé avec containsPII: true
   - Flag pour modération/audit
   ↓
5. Destinataire voit message avec banner :
   "⚠️ Ce message contient des infos personnelles.
    Privilégiez les échanges sur la plateforme."
```

### Audit Log

```typescript
// Tous les messages sont conservés pour résolution litiges
// Collection : messages/
// Fields :
- createdAt (timestamp)
- senderId, threadId
- content (encrypted if PII detected)
- systemMetadata (pour messages système)

// Règles Firestore Security :
- Users peuvent lire leurs propres threads
- Users peuvent envoyer messages dans leurs threads
- Admins peuvent lire tous messages (modération)
```

---

## 🔔 Interactions & Comportements Clés

### Synchronisation en Temps Réel

```typescript
// Implémenté via Firestore onSnapshot()

// Threads
useEffect(() => {
  const unsubscribe = subscribeToUserThreads(userId, (threads) => {
    queryClient.setQueryData(messagingKeys.threadsList(userId), threads);
  });
  return () => unsubscribe();
}, [userId]);

// Messages
useEffect(() => {
  const unsubscribe = subscribeToThreadMessages(threadId, (messages) => {
    queryClient.setQueryData(messagingKeys.threadMessages(threadId), messages);
  });
  return () => unsubscribe();
}, [threadId]);

✅ Les messages s'affichent instantanément sans refresh
✅ Compteurs non-lus mis à jour en temps réel
✅ Indicateurs "lu" synchronisés automatiquement
```

### Notifications

```typescript
// 3 types de notifications :

1. Push Notifications (mobile) :
   - Via Firebase Cloud Messaging (FCM)
   - Trigger : nouveau message reçu hors app
   - Payload : sender name, message preview, threadId
   
2. In-app Notifications :
   - Pastille rouge sur icône Messages
   - Badge avec nombre non-lus
   - Update via useUnreadCount()
   
3. Email Notifications :
   - Si user offline > 30 min
   - Digest des messages manqués
   - Link vers thread concerné
```

### Indicateurs de Saisie

```typescript
// "X est en train d'écrire..."

const [isTyping, setIsTyping] = useState(false);
const typingTimeoutRef = useRef<NodeJS.Timeout>();

const handleTyping = () => {
  if (!isTyping) {
    setTypingStatus(threadId, currentUserId, true);
    setIsTyping(true);
  }
  
  // Reset timeout
  clearTimeout(typingTimeoutRef.current);
  typingTimeoutRef.current = setTimeout(() => {
    setTypingStatus(threadId, currentUserId, false);
    setIsTyping(false);
  }, 3000);
};

// Affichage
{thread.typingUsers?.includes(otherUserId) && (
  <TypingIndicator name={otherUser.displayName} />
)}
```

### Scrolling & Pagination

```typescript
// Chargement infini des messages plus anciens

const { data: messages } = useThreadMessages(threadId);
// Par défaut : 50 derniers messages

// TODO Phase 2 : Infinite scroll
const loadMoreMessages = () => {
  const oldestMessage = messages[0];
  // Fetch 50 messages before oldestMessage.createdAt
};

// Auto-scroll vers bas sur nouveau message
useEffect(() => {
  if (isAtBottom && newMessageReceived) {
    scrollToBottom();
  }
}, [messages]);
```

---

## ✅ Statut Implémentation

### ✅ Phase 1 : Backend & Types (COMPLÉTÉ - 27 oct 2025)

- [x] Types TypeScript (Thread, Message, MessageType, ThreadStatus)
- [x] Firestore threads CRUD (12 fonctions)
- [x] Firestore messages CRUD (11 fonctions)
- [x] PII detection system
- [x] React Query hooks (12 hooks)
- [x] Real-time subscriptions (threads + messages)
- [x] Optimistic updates (sendMessage)

**Fichiers créés** :
- `src/lib/types.ts` (types messaging ajoutés)
- `src/lib/firestore-threads.ts` (500+ lignes)
- `src/lib/firestore-messages.ts` (400+ lignes)
- `src/hooks/use-messaging.ts` (350+ lignes)

### 🔄 Phase 2 : Interface Liste Threads (EN COURS)

- [ ] Page `/dashboard/messages`
- [ ] Composant `<ThreadList />`
- [ ] Composant `<ThreadFilters />`
- [ ] Composant `<ThreadListItem />`
- [ ] Empty state (aucune conversation)
- [ ] Loading states
- [ ] Responsive design (mobile/web)

**Fichiers à créer** :
- `src/app/[locale]/dashboard/messages/page.tsx`
- `src/components/messaging/thread-list.tsx`
- `src/components/messaging/thread-list-item.tsx`
- `src/components/messaging/thread-filters.tsx`

### ⏳ Phase 3 : Interface Conversation Détaillée

- [ ] Page `/dashboard/messages/[threadId]`
- [ ] Composant `<ConversationHeader />`
- [ ] Composant `<MessageList />`
- [ ] Composant `<MessageBubble />`
- [ ] Composant `<MessageInput />`
- [ ] Composant `<ThreadContextBar />`
- [ ] Upload fichiers/images
- [ ] PII warning UI
- [ ] Typing indicators
- [ ] Read receipts display

**Fichiers à créer** :
- `src/app/[locale]/dashboard/messages/[threadId]/page.tsx`
- `src/components/messaging/conversation-header.tsx`
- `src/components/messaging/message-list.tsx`
- `src/components/messaging/message-bubble.tsx`
- `src/components/messaging/message-input.tsx`
- `src/components/messaging/thread-context-bar.tsx`

### ⏳ Phase 4 : Features Avancées

- [ ] Widget messagerie (FAB mobile)
- [ ] Mini-chat widget (web)
- [ ] Notifications push (FCM)
- [ ] Email notifications
- [ ] Infinite scroll messages
- [ ] Audio messages (V2)
- [ ] WebRTC calls (V2)

### ⏳ Phase 5 : Tests & Polish

- [ ] Tests e2e Playwright (15 tests)
- [ ] Tests unitaires hooks
- [ ] Tests Firestore Security Rules
- [ ] i18n (FR + EN)
- [ ] Accessibility (ARIA labels)
- [ ] Performance optimization

---

## 📊 Métriques Implémentation

**Backend (Phase 1)** :
- ✅ 1,250+ lignes de code
- ✅ 35+ fonctions TypeScript
- ✅ 12 React Query hooks
- ✅ 0 erreur TypeScript
- ✅ Real-time sync opérationnel
- ✅ PII detection fonctionnel

**Frontend (Phases 2-4)** :
- 🔄 ~800 lignes estimées (Phase 2)
- ⏳ ~1,200 lignes estimées (Phase 3)
- ⏳ ~400 lignes estimées (Phase 4)

**Total estimé** : ~3,650 lignes pour système complet

---

## 🚀 Prochaines Étapes

1. **Créer page `/dashboard/messages`** (2h)
   - Layout avec sidebar threads
   - Filtres et recherche
   - Liste threads avec real-time

2. **Créer page `/dashboard/messages/[threadId]`** (4h)
   - Header conversation
   - Liste messages scrollable
   - Input message avec PII detection
   - Upload fichiers

3. **Tests E2E** (2h)
   - Créer thread
   - Envoyer message
   - Marquer comme lu
   - Recherche threads
   - PII detection

**Durée totale estimée Phase 2-3** : 8h  
**Date cible** : 28-29 octobre 2025

---

*Document mis à jour le 27 octobre 2025*
C'est la page d'accueil du module messagerie, présentant toutes les conversations actives ou passées.
* 1.1. En-tête de la Page :
    * Titre : "Messages" ou "Mes Conversations"
    * Bouton "Nouvelle Conversation" (optionnel/contextuel) : Si un utilisateur veut initier une conversation sans passer par une tâche (ex: question générale à un prestataire post-mission, après avoir accédé à son profil).
* 1.2. Barres de Recherche et Filtres :
    * Champ de recherche : Permet de rechercher dans les noms de correspondants, les titres de tâches ou le contenu des messages.
    * Filtres (Type de rôle) : "Toutes", "En tant que Client", "En tant que Prestataire".
    * Filtres (Statut de la tâche) : "Actives" (tâches en cours, en attente d'offre/acceptation), "Archivées" (tâches terminées ou annulées), "Non lues".
* 1.3. Liste des Conversations (Threads) :
    * Chaque élément de la liste représente un "thread" de conversation (généralement lié à une tâche spécifique ou un interlocuteur).
    * Informations affichées par thread :
        * Photo de profil du correspondant
        * Nom du correspondant (Client ou Prestataire)
        * Titre de la Mission associée (ex: "Courses pour le 15/03", "Aide montage meuble") - Très important !
        * Statut de la Mission (ex: "En attente d'offre", "Offre acceptée", "En cours", "Terminée", "Litige") - Couleur ou icône.
        * Extrait du dernier message
        * Heure/date du dernier message
        * Indicateur "Non lu" (pastille numérique ou visuel)
    * Options contextuelles au swipe (mobile) ou survol (web) : Archiver, Signaler.

2. Vue Détaillée : Fenêtre de Conversation ( /dashboard/messages/:threadId )
Une fois un thread sélectionné, l'utilisateur accède à la conversation spécifique.
* 2.1. En-tête de la Conversation :
    * Bouton "Retour" vers la liste des conversations.
    * Photo de profil et Nom du correspondant.
    * Titre de la Tâche associée (cliquable, menant à la page de détail de la tâche : /dashboard/tasks/:taskId).
    * Bouton "Actions" (menu kebab ou trois points) :
        * "Ouvrir un litige" (si la tâche est en cours ou terminée)
        * "Signaler cet utilisateur"
        * "Bloquer cet utilisateur"
        * "Archiver la conversation"
        * "Appeler l'utilisateur" (WebRTC, si V2 et consentements)
* 2.2. Zone de Messages (Historique) :
    * Affichage chronologique des messages (bulle de conversation).
    * Marquage temporel : Date et heure de chaque message ou groupe de messages.
    * Indicateurs de lecture : (ex: double coche grise / bleue, "vu par X").
    * Types de messages supportés :
        * Texte : Message standard.
        * Pièces jointes : Images (aperçu), PDF, documents (icône + nom de fichier, téléchargeable).
        * Messages système/automatiques : Ex: "L'offre a été acceptée", "Le paiement a été validé", "Un litige a été ouvert".
    * Message d'alerte (si détection PII) : "Attention, nous avons détecté une information personnelle sensible..."
* 2.3. Pied de Conversation (Zone de Saisie) :
    * Champ de texte : Pour écrire un nouveau message.
    * Bouton "Envoyer".
    * Bouton "Joindre Fichier / Photo" : Accès à la galerie/appareil photo ou sélecteur de fichiers.
    * Bouton "Enregistrer Audio" (si V2) : Pour envoyer un message vocal.
* 2.4. Barre d'Informations Contextuelles (optionnelle, position fixe ou déroulante) :
    * Statut actuel de la tâche : "Offre en attente du client", "Mission planifiée le JJ/MM à HH:MM", "Paiement en attente de validation".
    * Boutons d'action rapide liés à la tâche :
        * "Accepter l'offre" (si client et offre en attente)
        * "Proposer une contre-offre" (si client)
        * "Marquer comme commencée" (si prestataire et tâche planifiée)
        * "Marquer comme terminée" (si prestataire et tâche en cours)
        * "Proposer de replanifier"
        * "Annuler la tâche"

3. Version Miniature / Widget au Pied de Page (Mode "Mini-Messagerie" sur d'autres pages)
Quand l'utilisateur navigue sur d'autres pages de l'application (tableau de bord, détails de tâche, profil), un widget discret permet un accès rapide à la messagerie.
* 3.1. Sur Mobile : Pastille Flottante (Floating Action Button - FAB)
    * Une icône "Bulle de discussion" (💬) en bas à droite de l'écran.
    * Une pastille rouge avec le nombre de messages non lus si > 0.
    * Taper dessus ouvre la page /dashboard/messages.
* 3.2. Sur Web : Barre/Widget de Messagerie Discrète
    * Icône "Bulle de discussion" ou "Messages" dans le menu de navigation principal (avec pastille de non-lus).
    * Optionnel (V2) : Un petit widget qui s'ouvre en bas à droite de l'écran (type "chat bot") :
        * Affiche le dernier message non lu ou un aperçu des 2-3 dernières conversations.
        * Permet de répondre rapidement sans quitter la page actuelle (pour un seul thread).
        * Un bouton "Voir tous les messages" ramène à la page complète.

4. Interactions & Comportements Clés
* Synchronisation en Temps Réel : Les messages doivent s'afficher instantanément.
* Notifications : Push notifications (mobile), notifications in-app (pastille), notifications email (si l'utilisateur est hors ligne ou n'a pas ouvert l'app depuis un temps).
* Indicateurs de Saisie : "X est en train d'écrire..." pour une interaction plus naturelle.
* Scrolling : Chargement infini des messages plus anciens.
* Sécurité :
    * Détection PII (Personally Identifiable Information) : Alerte l'utilisateur s'il essaie d'envoyer un numéro de téléphone, email, adresse.
    * Interdiction d'envoi de contacts directs pour encourager les échanges sur la plateforme.
    * Audit Log des messages pour la résolution des litiges.

Cette structuration permet de couvrir tous les cas d'usage principaux, de la gestion des conversations à la communication en temps réel, tout en intégrant des fonctionnalités de sécurité et de professionnalisation essentielles pour ImuTask.
