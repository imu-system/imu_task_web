# 💬 Messagerie ImuTask - Documentation Technique

**Date de création** : 27 octobre 2025  
**Statut** : ✅ Phase 1, 2, 3 & Options A.1-A.4 complétées + Tests E2E prêts  
**Version** : 1.5  
**Dernière mise à jour** : 2 novembre 2025

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

> **⚠️ IMPORTANT - Design Moderne Requis**  
> L'interface messagerie doit être **moderne, fluide et intuitive** comme WhatsApp/Telegram.  
> **Objectif** : Éviter l'aspect "prototype" et offrir une UX professionnelle familière.

### 🎨 Principes de Design (Inspirés WhatsApp)

#### 1. Palette de Couleurs
```scss
// Mode Clair
$primary-green: #25D366;      // Actions principales (bouton envoyer)
$chat-bg: #EFEAE2;            // Fond zone messages (beige clair)
$message-sent: #DCF8C6;       // Bulle message envoyé (vert clair)
$message-received: #FFFFFF;   // Bulle message reçu (blanc)
$header-bg: #075E54;          // Header conversation (vert foncé)
$sidebar-bg: #FFFFFF;         // Liste threads (blanc)

// Mode Sombre
$dark-bg: #0B141A;            // Fond général
$dark-header: #1F2C33;        // Header
$dark-sidebar: #111B21;       // Sidebar
$dark-message-sent: #005C4B;  // Bulle envoyée
$dark-message-received: #202C33; // Bulle reçue
```

#### 2. Typographie
```scss
$font-primary: 'Segoe UI', 'Helvetica Neue', sans-serif;
$font-size-message: 14.2px;
$font-size-name: 16px;
$font-size-preview: 13px;
$line-height-message: 1.5;
```

#### 3. Animations & Transitions
```scss
// Animations fluides
$transition-fast: 150ms ease-out;
$transition-normal: 250ms ease-out;
$message-appear: slideInUp 200ms ease-out;
$hover-scale: scale(1.02);
```

### 1. Vue Générale : Liste des Conversations

**Route** : `/dashboard/messages`  
**Statut implémentation** : ✅ Complété - 🎨 À moderniser (Design WhatsApp-like)

C'est la page d'accueil du module messagerie, présentant toutes les conversations actives ou passées.

#### 1.1. En-tête de la Page (Style WhatsApp)

```tsx
// Composant : <MessagesPageHeader />
// Design : Header moderne avec actions rapides

┌──────────────────────────────────────────────────────────────┐
│ [Photo User] Messages                    [🔍] [⋮ Menu]      │
└──────────────────────────────────────────────────────────────┘

Éléments :
- Photo de profil user actuel (cliquable → paramètres)
- Titre "Messages" (typography bold, 20px)
- Icône Recherche (loupe) → Ouvre barre recherche fullscreen
- Menu kebab (3 points verticaux) :
  • Nouvelle conversation
  • Paramètres messagerie
  • Archiver toutes les conversations lues
  
Styling :
- Background : gradient subtle (#075E54 → #128C7E)
- Height : 60px
- Box-shadow : 0 1px 3px rgba(0,0,0,0.12)
- Sticky position (reste visible au scroll)
```

#### 1.2. Barre de Recherche Fullscreen (Style WhatsApp)

```tsx
// Composant : <ThreadSearchBar />
// Activation : Click sur icône loupe dans header

┌──────────────────────────────────────────────────────────────┐
│ [←] [🔍 Rechercher conversations...]         [×]             │
└──────────────────────────────────────────────────────────────┘

Design :
- Overlay fullscreen avec backdrop blur
- Input focus auto avec animation slide-down
- Résultats en temps réel pendant la frappe
- Highlight des termes recherchés en jaune
- Groupement des résultats :
  • Messages (contenu)
  • Contacts (noms)
  • Tâches (titres)

// Hook technique
const { data: results } = useSearchThreads(userId, searchQuery, {
  enabled: searchQuery.length > 2
});

// Debounce 300ms pour éviter trop de requêtes
const debouncedSearch = useDebounce(searchQuery, 300);
```

#### 1.3. Onglets de Filtrage (Pills Style)

```tsx
// Composant : <ThreadFilterTabs />
// Position : Sous le header, sticky scroll

┌──────────────────────────────────────────────────────────────┐
│  [Tous (12)]  [Non lues (3)]  [Groupes]  [Archivées]        │
└──────────────────────────────────────────────────────────────┘

Design :
- Pills horizontales avec scroll si overflow
- Active pill : background primary-green, text white
- Inactive pills : background muted, text gray
- Badge count entre parenthèses
- Smooth horizontal scroll avec fade edges
- Transition 200ms sur switch

Filtres disponibles :
- "Tous" → Toutes conversations actives
- "Non lues" → unreadCount > 0
- "Groupes" → Conversations multi-participants (V2)
- "Archivées" → status === 'archived'
- "Tâches" → Filtre par catégorie tâche (optionnel)
```

#### 1.4. Liste des Conversations (Style WhatsApp Premium)

```tsx
// Composant : <ThreadList /> - Version moderne
// Hook : useUserThreads(userId)

┌──────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Avatar]  Jean Dupont                    ✓✓  14:32     │ │
│ │  48x48    Plomberie urgente                  [Badge 2] │ │
│ │           "D'accord, je confirme pour demain"           │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Avatar]  Marie Martin                   ✓   Hier      │ │
│ │           Cours de cuisine                              │ │
│ │           🎤 Message vocal (0:15)                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Avatar]  Pierre Laurent                    Lundi      │ │
│ │           Réparation vélo                    📌 Épinglé│ │
│ │           📷 Photo                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

Design détaillé par thread item :

1. Avatar (48x48px) :
   - Border-radius : 50%
   - Ring vert si online (2px solid #25D366)
   - Placeholder avec initiales si pas de photo
   - Badge rôle en overlay : "PRO" badge doré si ImuPro

2. Zone principale (flex-1) :
   - **Ligne 1** : Nom + Timestamp
     • Nom : font-weight 600, 16px, truncate
     • Timestamp : 13px, gray-500, right-aligned
     • Icônes lecture : ✓ (envoyé), ✓✓ (livré), ✓✓ bleu (lu)
   
   - **Ligne 2** : Titre tâche
     • 13px, gray-600, italic, truncate
     • Icon métier en prefix (🔧 🍳 🚴)
   
   - **Ligne 3** : Preview dernier message
     • 14px, gray-700 si non lu (bold), gray-500 si lu
     • Icons préfixe : 🎤 (audio), 📷 (image), 📄 (fichier)
     • Truncate 60 caractères
     • "Vous: " si message envoyé par user

3. Zone droite :
   - Badge non-lus : 
     • Circle 20x20px, bg-primary-green
     • White text, font-weight 600
     • Position : top-right
   
   - Icône épinglé 📌 (si pinned)
   - Icône muté 🔇 (si notifications off)

4. Interactions :
   - Hover : background gray-50, cursor pointer
   - Active/Selected : background green-50, border-left 4px green
   - Swipe left (mobile) : Révèle boutons
     • Archive (icône boîte)
     • Mute (icône cloche barrée)
     • Delete (icône poubelle, rouge)
   - Long press : Mode sélection multiple
   
5. Animations :
   - Appear : fadeInUp 200ms
   - New message : subtle bounce + highlight flash
   - Swipe : spring animation avec resistance
   
6. States spéciaux :
   - **Typing indicator** : 
     "Jean est en train d'écrire..." en vert italique
     Animation 3 dots pulsants
   
   - **Draft message** :
     "Brouillon: [contenu]..." en rouge si message non envoyé
   
   - **System message preview** :
     🤖 "L'offre a été acceptée" en gris italic

// Code styling
const threadItemClasses = cn(
  "flex items-start gap-3 px-4 py-3",
  "transition-all duration-200",
  "hover:bg-muted/50 cursor-pointer",
  "border-b border-gray-100 last:border-0",
  isSelected && "bg-primary/5 border-l-4 border-l-primary",
  hasUnread && "bg-blue-50/30"
);
```

### 2. Vue Détaillée : Fenêtre de Conversation (WhatsApp-Style)

**Route** : `/dashboard/messages/[threadId]`  
**Statut implémentation** : ⏳ Non commencé - 🎨 Design moderne requis

Une fois un thread sélectionné, l'utilisateur accède à la conversation spécifique.

**Layout Desktop (Split View)** :
```
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────────┬──────────────────────────────────────────┐   │
│ │              │  [Header Conversation]                   │   │
│ │  Liste       ├──────────────────────────────────────────┤   │
│ │  Threads     │                                          │   │
│ │  (400px)     │  Zone Messages                           │   │
│ │              │  (Background pattern subtil)             │   │
│ │              │                                          │   │
│ │              ├──────────────────────────────────────────┤   │
│ │              │  [Input Message]                         │   │
│ └──────────────┴──────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

**Layout Mobile (Fullscreen)** :
```
┌────────────────────────────────┐
│  [Header Conversation]         │
├────────────────────────────────┤
│                                │
│  Zone Messages Fullscreen      │
│  (scroll infini)               │
│                                │
├────────────────────────────────┤
│  [Input Message + Actions]     │
└────────────────────────────────┘
```

#### 2.1. En-tête de la Conversation (Header Premium)

```tsx
// Composant : <ConversationHeader />
// Hook : useThread(threadId)
// Design : Header moderne type WhatsApp avec gradient

┌──────────────────────────────────────────────────────────────┐
│ [←] [Avatar]  Jean Dupont                [📞] [📹] [⋮]      │
│              En ligne • Actif il y a 2 min                   │
│              📋 Plomberie urgente                            │
└──────────────────────────────────────────────────────────────┘

Layout détaillé :

1. **Zone Gauche** :
   - Bouton retour [←] (mobile only, 40x40px tap target)
   - Avatar 40x40px avec ring vert si online
   - Info user (flex column) :
     • Nom : font-weight 600, 17px, white/dark text
     • Status : 
       - "En ligne" (vert, pulsant dot)
       - "En train d'écrire..." (vert, animated dots)
       - "Actif il y a X min" (gris)
     • Titre tâche : 13px, cliquable, underline on hover
       → Icon tâche en prefix (🔧 🏠 🍳)

2. **Zone Droite** - Actions rapides :
   - [📞] Appel audio (hover → tooltip "Appeler")
   - [📹] Appel vidéo (hover → tooltip "Visio")
   - [🔍] Recherche dans conversation
   - [⋮] Menu actions (dropdown) :
     
     **Dropdown Menu** :
     ├─ 📋 Voir la tâche
     ├─ 📌 Épingler conversation
     ├─ 🔇 Couper notifications
     ├─ 🎨 Personnaliser (wallpaper, emoji rapide)
     ├─ ─────────────────
     ├─ ⚠️ Ouvrir un litige
     ├─ 🚫 Bloquer utilisateur
     ├─ 📢 Signaler
     └─ 🗄️ Archiver

3. **Styling** :
   - Background : gradient (#075E54 → #128C7E) ou dark (#1F2C33)
   - Height : 64px
   - Box-shadow : 0 2px 5px rgba(0,0,0,0.1)
   - Sticky top : 0
   - z-index : 10
   - Backdrop blur si scroll

4. **Click sur Avatar/Nom** :
   → Ouvre drawer latéral "Infos Contact" :
   ┌────────────────────────────┐
   │ [Photo grande 128x128]     │
   │ Nom Complet                │
   │ @username                  │
   │ ──────────────────────     │
   │ 🏆 Note : 4.8/5 (124)     │
   │ ✅ Missions : 87 complétées│
   │ 📍 Paris 15ème            │
   │ ──────────────────────     │
   │ [Voir profil complet]      │
   │ [Bloquer]  [Signaler]      │
   └────────────────────────────┘
```

#### 2.2. Zone de Messages (Design WhatsApp Premium)

```tsx
// Composant : <MessageList />
// Hook : useThreadMessages(threadId)

const { data: messages } = useThreadMessages(threadId);
// ✅ Temps réel automatique via subscribeToThreadMessages()

**Background** :
- Pattern subtil type WhatsApp (triangles géométriques opacity 0.03)
- Ou wallpaper personnalisable (V2)
- Gradient overlay top/bottom pour smooth edges

**Structure Messages** :

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌──────────── AUJOURD'HUI ────────────┐                    │
│                                                              │
│  ┌────────────────────────────────┐                         │
│  │ Salut ! Tu es disponible       │   👤 Avatar             │
│  │ demain pour la mission ?       │   Jean                  │
│  │                        14:23 ✓ │                         │
│  └────────────────────────────────┘                         │
│                                                              │
│              ┌──────────────────────────────────┐           │
│         Moi  │ Oui, parfait ! Confirme l'heure  │           │
│              │                    14:25 ✓✓      │           │
│              └──────────────────────────────────┘           │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │ 📷 [Image Preview 200x150]           │                   │
│  │ Voici le matériel nécessaire         │                   │
│  │                          14:26 ✓     │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  ┌─────────────────────────────────────────────┐            │
│  │ 🤖 Système : L'offre a été acceptée         │            │
│  │            Rendez-vous planifié le 15/03    │            │
│  └─────────────────────────────────────────────┘            │
│                                                              │
│           ┌───────────────────────────────────┐             │
│      Moi  │ ⚠️ [PII DÉTECTÉ]                 │             │
│           │ Mon numéro : 06 12 34 56 78      │             │
│           │ Évitez de partager vos coordonnées│            │
│           │                     14:28 ✓✓     │             │
│           └───────────────────────────────────┘             │
│                                                              │
└──────────────────────────────────────────────────────────────┘

**Design Bulles Messages** :

1. **Message Reçu** (gauche) :
   ```scss
   .message-received {
     background: white; // ou #202C33 dark mode
     border-radius: 8px 8px 8px 0px; // Queue coin bas-gauche
     padding: 8px 12px;
     max-width: 65%;
     box-shadow: 0 1px 2px rgba(0,0,0,0.08);
     
     // Triangle queue SVG
     &::before {
       content: '';
       position: absolute;
       left: -8px;
       bottom: 0;
       border: 8px solid transparent;
       border-right-color: white;
     }
   }
   ```

2. **Message Envoyé** (droite) :
   ```scss
   .message-sent {
     background: #DCF8C6; // vert clair ou #005C4B dark
     border-radius: 8px 8px 0px 8px; // Queue coin bas-droit
     padding: 8px 12px;
     max-width: 65%;
     margin-left: auto;
     box-shadow: 0 1px 2px rgba(0,0,0,0.08);
   }
   ```

3. **Message Système** (centré) :
   ```scss
   .message-system {
     background: rgba(0,0,0,0.05);
     border-radius: 8px;
     padding: 6px 12px;
     font-size: 13px;
     text-align: center;
     margin: 0 auto;
     max-width: 80%;
     color: gray-600;
   }
   ```

**Marquage Temporel (Sticky Dates)** :
```tsx
// Dates séparatrices sticky au scroll
┌────────────────────────────────┐
│      AUJOURD'HUI               │  ← Sticky top
└────────────────────────────────┘

- Format relatif intelligent :
  • "Aujourd'hui" si date === today
  • "Hier" si date === yesterday
  • "Lundi" si < 7 jours
  • "15 mars" si année courante
  • "15 mars 2024" si année passée

- Timestamp dans bulle :
  • Format : "14:32" (24h) ou "2:32 PM" (12h selon locale)
  • Position : bottom-right de la bulle
  • Font-size : 11px, opacity 0.6
  • Affiche heure uniquement si > 5min d'écart entre messages

**Indicateurs de Lecture (Checkmarks)** :
```tsx
// Position : Après le timestamp dans bulles envoyées

✓   - Message envoyé (gris)
✓✓  - Message livré (gris) 
✓✓  - Message lu (bleu #4FC3F7)

// Implémentation
const getReadStatus = (message: Message) => {
  if (!message.readBy.includes(otherUserId)) {
    return message.createdAt ? '✓✓' : '✓'; // Livré ou envoyé
  }
  return <span className="text-blue-400">✓✓</span>; // Lu
};

// "Vu par X" en bas du dernier message group
{isLastMessage && message.readBy.length > 0 && (
  <div className="text-xs text-right text-muted-foreground mt-1">
    Vu {formatDistanceToNow(lastReadAt)}
  </div>
)}
```

**Types de Messages Supportés** :

1. **Texte** : `message.type === 'text'`
   ```tsx
   <MessageBubble variant="text">
     {/* Détection URLs → auto-link */}
     {/* Détection emojis → larger size si emoji-only */}
     {/* Markdown light : *bold*, _italic_ */}
     <p className="text-sm leading-relaxed break-words">
       {parseMessageContent(message.content)}
     </p>
   </MessageBubble>
   ```

2. **Image** : `message.type === 'image'`
   ```tsx
   <MessageBubble variant="image" className="p-1">
     <div className="relative rounded-lg overflow-hidden">
       {/* Progressive loading avec blur placeholder */}
       <Image
         src={message.attachments[0].url}
         width={280}
         height={280}
         className="object-cover cursor-pointer"
         onClick={() => openLightbox(message.attachments[0])}
       />
       {/* Caption en dessous si présent */}
       {message.content && (
         <p className="px-2 py-1 text-sm">{message.content}</p>
       )}
     </div>
   </MessageBubble>
   ```

3. **Fichier** : `message.type === 'file'`
   ```tsx
   <MessageBubble variant="file">
     <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
       {/* Icône selon extension */}
       <FileIcon type={attachment.mimeType} className="w-10 h-10" />
       <div className="flex-1 min-w-0">
         <p className="font-medium truncate">{attachment.name}</p>
         <p className="text-xs text-muted-foreground">
           {formatFileSize(attachment.size)}
         </p>
       </div>
       <Button size="icon" variant="ghost" onClick={downloadFile}>
         <Download className="w-4 h-4" />
       </Button>
     </div>
   </MessageBubble>
   ```

4. **Audio** : `message.type === 'audio'` (V2)
   ```tsx
   <MessageBubble variant="audio">
     <div className="flex items-center gap-2 min-w-[200px]">
       <Button size="icon" onClick={togglePlay}>
         {isPlaying ? <Pause /> : <Play />}
       </Button>
       {/* Waveform visualizer */}
       <Waveform progress={playProgress} />
       <span className="text-xs">{formatDuration(duration)}</span>
     </div>
   </MessageBubble>
   ```

5. **Système** : `message.type === 'system'`
   ```tsx
   <div className="flex justify-center my-3">
     <div className="bg-black/5 dark:bg-white/5 px-4 py-2 rounded-lg">
       <p className="text-xs text-center text-muted-foreground flex items-center gap-2">
         {getSystemIcon(message.systemMetadata.action)}
         <span>{message.content}</span>
       </p>
     </div>
   </div>
   
   // Icons selon action
   - 'offer_accepted' → 🤝 
   - 'payment_validated' → 💰
   - 'booking_created' → 📅
   - 'dispute_opened' → ⚠️
   ```

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

#### 2.3. Zone de Saisie (Input Premium WhatsApp-Style)

```tsx
// Composant : <MessageInput />
// Hook : useSendMessage()

┌──────────────────────────────────────────────────────────────┐
│ [😊] [📎] [Tapez un message...]              [🎤]  [Envoyer] │
│                                                              │
│ [PII Warning Banner si détecté] ⚠️                           │
└──────────────────────────────────────────────────────────────┘

**Layout Détaillé** :

1. **Zone Principale** :
   ```tsx
   <div className="sticky bottom-0 bg-background border-t p-3 shadow-lg">
     {/* PII Warning (si détecté) */}
     {showPIIWarning && <PIIWarningBanner />}
     
     <div className="flex items-end gap-2 max-w-4xl mx-auto">
       {/* Actions Gauche */}
       <div className="flex gap-1">
         <EmojiPickerButton />
         <AttachmentButton />
       </div>
       
       {/* Input principal */}
       <div className="flex-1 relative">
         <TextareaAutosize
           minRows={1}
           maxRows={5}
           placeholder="Tapez un message..."
           className="w-full resize-none rounded-full px-4 py-2 
                      bg-muted focus:bg-background
                      transition-all duration-200"
           onKeyDown={handleKeyDown} // Enter = send, Shift+Enter = newline
         />
         
         {/* Typing indicator (émis vers other user) */}
         {isTyping && <TypingIndicator />}
       </div>
       
       {/* Bouton Send/Voice */}
       {messageContent.trim() ? (
         <Button
           size="icon"
           className="rounded-full bg-primary hover:bg-primary/90 
                      w-11 h-11 shrink-0"
           onClick={handleSend}
         >
           <Send className="w-5 h-5" />
         </Button>
       ) : (
         <Button
           size="icon"
           variant="ghost"
           className="rounded-full w-11 h-11 shrink-0"
           onMouseDown={startVoiceRecording}
           onMouseUp={stopVoiceRecording}
         >
           <Mic className="w-5 h-5" />
         </Button>
       )}
     </div>
   </div>
   ```

2. **Emoji Picker** :
   ```tsx
   <Popover>
     <PopoverTrigger asChild>
       <Button size="icon" variant="ghost" className="rounded-full">
         😊
       </Button>
     </PopoverTrigger>
     <PopoverContent side="top" className="w-80 p-0">
       {/* EmojiPicker component ou @emoji-mart */}
       <EmojiPicker
         onEmojiSelect={(emoji) => insertEmoji(emoji)}
         theme="auto"
         previewPosition="none"
       />
     </PopoverContent>
   </Popover>
   ```

3. **Attachment Menu** :
   ```tsx
   <DropdownMenu>
     <DropdownMenuTrigger asChild>
       <Button size="icon" variant="ghost" className="rounded-full">
         <Paperclip className="w-5 h-5" />
       </Button>
     </DropdownMenuTrigger>
     <DropdownMenuContent side="top" align="start">
       {/* Photo/Vidéo */}
       <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
         <Camera className="w-4 h-4 mr-2" />
         Photo ou vidéo
         <input
           ref={fileInputRef}
           type="file"
           accept="image/*,video/*"
           className="hidden"
           onChange={handleFileUpload}
         />
       </DropdownMenuItem>
       
       {/* Document */}
       <DropdownMenuItem onClick={() => docInputRef.current?.click()}>
         <FileText className="w-4 h-4 mr-2" />
         Document
         <input
           ref={docInputRef}
           type="file"
           accept=".pdf,.doc,.docx,.xls,.xlsx"
           className="hidden"
           onChange={handleFileUpload}
         />
       </DropdownMenuItem>
       
       {/* Localisation (V2) */}
       <DropdownMenuItem disabled>
         <MapPin className="w-4 h-4 mr-2" />
         Partager position
       </DropdownMenuItem>
     </DropdownMenuContent>
   </DropdownMenu>
   ```

4. **Voice Recording (Hold to Record)** :
   ```tsx
   // État pendant l'enregistrement
   {isRecording && (
     <div className="absolute inset-0 bg-background/95 backdrop-blur-sm
                     flex items-center justify-center gap-4 z-50">
       {/* Waveform animation */}
       <div className="flex gap-1">
         {[...Array(5)].map((_, i) => (
           <div
             key={i}
             className="w-1 bg-red-500 rounded-full animate-pulse"
             style={{
               height: `${Math.random() * 20 + 10}px`,
               animationDelay: `${i * 100}ms`,
             }}
           />
         ))}
       </div>
       
       {/* Timer */}
       <span className="text-red-500 font-mono">
         {formatDuration(recordingDuration)}
       </span>
       
       {/* Actions */}
       <Button
         size="icon"
         variant="ghost"
         onClick={cancelRecording}
       >
         <X className="w-5 h-5" />
       </Button>
       
       <Button
         size="icon"
         className="bg-primary"
         onClick={sendVoiceMessage}
       >
         <Send className="w-5 h-5" />
       </Button>
     </div>
   )}
   ```

5. **PII Warning Banner** :
   ```tsx
   {showPIIWarning && (
     <Alert variant="warning" className="mb-2">
       <AlertTriangle className="h-4 w-4" />
       <AlertDescription className="flex items-center justify-between">
         <span>
           ⚠️ Information personnelle détectée (email, téléphone, adresse).
           <br />
           Privilégiez les échanges sur la plateforme pour votre sécurité.
         </span>
         <div className="flex gap-2">
           <Button
             variant="ghost"
             size="sm"
             onClick={() => setMessageContent('')}
           >
             Annuler
           </Button>
           <Button
             variant="default"
             size="sm"
             onClick={sendAnywayWithPII}
           >
             Envoyer quand même
           </Button>
         </div>
       </AlertDescription>
     </Alert>
   )}
   ```

**Fonctionnalités Avancées** :

- **Auto-resize textarea** : S'agrandit jusqu'à 5 lignes max
- **Shift + Enter** : Nouvelle ligne
- **Enter** : Envoyer message
- **Drag & Drop** : Zone de drop overlay pour fichiers
- **Paste Images** : Ctrl/Cmd + V colle images clipboard
- **Typing indicator** : Détecte frappe et émet event temps réel
- **Draft sauvegarde** : Auto-save toutes les 2s dans localStorage
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

### ✅ Phase 2 : Interface Liste Threads (COMPLÉTÉ - 27 oct 2025)

- [x] Page `/dashboard/messages`
- [x] Composant `<ThreadList />` avec real-time updates
- [x] Composant `<ThreadListItem />` avec avatars et badges
- [x] Filtres intégrés (Active/Archived tabs)
- [x] Recherche threads (useSearchThreads hook)
- [x] Empty states (no threads, no results, no archived)
- [x] Loading skeletons
- [x] Responsive design (mobile/desktop)
- [x] Actions thread (archive, unarchive, delete)
- [x] Traductions FR/EN complètes

**Fichiers créés** :
- `src/app/[locale]/dashboard/messages/page.tsx` (90 lignes)
- `src/components/messaging/thread-list.tsx` (230 lignes)
- `src/components/messaging/thread-list-item.tsx` (180 lignes)
- `src/hooks/use-messaging.ts` (ajout useDeleteThread, fix useSearchThreads)
- `src/lib/firestore-threads.ts` (ajout unarchiveThread)
- `src/messages/fr.json` (namespace 'messaging' étendu)
- `src/messages/en.json` (namespace 'messaging' étendu)

### ✅ Phase 3 : Interface Conversation Détaillée - COMPLÉTÉ (27 oct 2025)

- [x] Page `/dashboard/messages/[threadId]` (73 lignes)
- [x] Composant `<ConversationHeader />` (317 lignes)
  - Avatar avec status online/offline temps réel
  - Actions: Appel, Visio, Recherche, Menu dropdown
  - Status "En train d'écrire..." animé
  - Click avatar → Drawer infos contact complet
- [x] Composant `<MessageList />` (188 lignes)
  - Messages temps réel via `useThreadMessages()`
  - Auto-scroll sur nouveaux messages
  - Dates sticky ("Aujourd'hui", "Hier", formatage intelligent)
  - Loading skeleton + empty state
- [x] Composant `<MessageBubble />` (253 lignes)
  - Bulles WhatsApp-style avec queues SVG
  - Types: text, image, file, system
  - Read receipts: ✓ (envoyé), ✓✓ (livré), ✓✓ bleu (lu)
  - PII warning banner si contenu sensible
  - Timestamps formatés (HH:mm)
- [x] Composant `<MessageInput />` (400 lignes)
  - Textarea auto-resize (1-5 lignes)
  - Emoji picker 😊 avec popover
  - Attachments: Photo 📷, Documents 📄
  - PII detection avant envoi
  - Typing indicator émis temps réel
  - Préparé: Voice recording 🎤, Drag & drop
- [x] Traductions FR/EN (~60 nouvelles clés)
  - Actions, status, input, warnings, receipts

**Fichiers créés** :
- `src/app/[locale]/dashboard/messages/[threadId]/page.tsx` (73 lignes)
- `src/components/messaging/conversation-header.tsx` (317 lignes)
- `src/components/messaging/message-list.tsx` (188 lignes)
- `src/components/messaging/message-bubble.tsx` (253 lignes)
- `src/components/messaging/message-input.tsx` (400 lignes)

**Fichiers mis à jour** :
- `src/messages/fr.json` (+60 clés: actions, status, input, piiWarning, readReceipts)
- `src/messages/en.json` (+60 clés mirrored)

**Note** : `ThreadContextBar` reporté en Phase 4 (actions contextuelles tâche)

### ⏳ Phase 4 : Features Avancées

- [ ] Composant `<ThreadContextBar />` (actions contextuelles tâche)
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

**Frontend (Phases 2-3)** :
- ✅ 500 lignes (Phase 2 - Liste Threads)
- ✅ 1,158 lignes (Phase 3 - Conversation Détaillée)

**Total actuel** : 2,908+ lignes  
**Total estimé final** : ~3,500 lignes pour système complet (avec Phase 4-5)

---

## 🚀 Prochaines Étapes

### ✅ Complété - Phase 1 & 2 (27 oct 2025)
- ✅ Page `/dashboard/messages` avec liste threads
- ✅ Filtres Active/Archived
- ✅ Recherche threads
- ✅ Actions (archive, delete)
- ✅ Real-time updates
- ✅ Traductions FR/EN

### ✅ Complété - Phase 3 (27 oct 2025)
- ✅ Page conversation `/dashboard/messages/[threadId]`
- ✅ Header avec status online & actions
- ✅ Messages temps réel style WhatsApp
- ✅ Input premium (emoji, attachments, PII detection)
- ✅ Read receipts & typing indicators
- ✅ Design moderne responsive

### 🎯 Prochaine Task : Phase 4 - Features Avancées & Tests

**Task 1.4** : Tests E2E Messagerie (2h estimées)

**Tests Playwright à implémenter** :

1. **Tests Création & Navigation** (30 min)
   - Créer un nouveau thread entre deux users
   - Naviguer vers la conversation
   - Vérifier le header affiche les bonnes infos
   - Retour à la liste threads

2. **Tests Envoi Messages** (45 min)
   - Envoyer message texte simple
   - Vérifier réception temps réel
   - Envoyer message avec emoji
   - Upload image et vérifier preview
   - Upload document et vérifier téléchargement
   - Vérifier PII detection (email, téléphone)

3. **Tests Interactions** (30 min)
   - Mark as read automatique
   - Typing indicator affiché
   - Read receipts mis à jour
   - Recherche dans conversations
   - Filtrer par Active/Archived
   - Archiver conversation
   - Supprimer conversation

4. **Tests Responsive** (15 min)
   - Mobile: Liste fullscreen
   - Mobile: Conversation fullscreen
   - Desktop: Split view fonctionnel
   - Sender avatar + name

4. `<MessageInput />` (1h)
   - Textarea auto-resize
   - Détection PII avant envoi
   - Upload fichiers/images
   - Bouton envoyer (optimistic update)
   - Typing indicator emit

5. `<ThreadContextBar />` (15 min)
   - Statut tâche/booking
   - Actions rapides contextuelles

**Tests E2E** (2h) - Task 1.4 :
- Créer thread
- Envoyer message texte
- Envoyer image
- Marquer comme lu
- Recherche threads
- PII detection warning
- Archive conversation
- Real-time sync

**Durée totale Phase 4** : 2h  
**Date cible** : 28 octobre 2025

**Fonctionnalités additionnelles (V2 - Phase 5)** :
- [ ] ThreadContextBar avec actions tâche contextuelles
- [ ] Widget messagerie (FAB mobile)
- [ ] Notifications push (FCM)
- [ ] Audio messages + voice recording
- [ ] WebRTC calls (audio/vidéo)
- [ ] Infinite scroll avec pagination
- [ ] Reactions emoji sur messages
- [ ] Forward messages
- [ ] Search in conversation

---

## 📝 Notes d'Implémentation

### Composants Messagerie Créés

**Phase 1 - Backend** :
- `src/lib/types.ts` - Types Thread, Message, MessageType, ThreadStatus
- `src/lib/firestore-threads.ts` - 13 fonctions CRUD + real-time (500+ lignes)
- `src/lib/firestore-messages.ts` - 11 fonctions + PII detection (430+ lignes)
- `src/hooks/use-messaging.ts` - 13 hooks React Query (395 lignes)

**Phase 2 - Liste Threads** :
- `src/app/[locale]/dashboard/messages/page.tsx` - Page principale (130 lignes)
- `src/components/messaging/thread-list.tsx` - Liste avec filtres (280 lignes)
- `src/components/messaging/thread-list-item.tsx` - Item individuel (180 lignes)
- `src/components/messaging/filter-pills.tsx` - Pills de filtres WhatsApp (88 lignes)
- `src/components/messaging/new-conversation-button.tsx` - FAB vert WhatsApp (47 lignes)
- `src/components/messaging/new-conversation-modal.tsx` - Modal sélection utilisateur (234 lignes)

**Phase 3 - Conversation** :
- `src/app/[locale]/dashboard/messages/[threadId]/page.tsx` - Page conversation (73 lignes)
- `src/components/messaging/conversation-header.tsx` - Header moderne (317 lignes)
- `src/components/messaging/message-list.tsx` - Liste messages (188 lignes)
- `src/components/messaging/message-bubble.tsx` - Bulles WhatsApp (253 lignes)
- `src/components/messaging/message-input.tsx` - Input premium (400 lignes)

**Traductions** :
- `src/messages/fr.json` - Namespace 'messaging' complet (~104 clés)
- `src/messages/en.json` - Namespace 'messaging' complet (~104 clés)
- `tailwind.config.ts` - Utility scrollbar-hide ajoutée

**Total** : 9 composants, 3,327+ lignes, 0 erreurs TypeScript

**Option A - Ajustements WhatsApp (28-30 octobre 2025)** :

**Option A.1 - Bouton Nouvelle Conversation (+)** ✅ (28 oct) :
- Floating Action Button (FAB) vert WhatsApp (#25D366) en bas à droite
- Modal de sélection d'utilisateur avec recherche en temps réel
- Création automatique de thread ou réutilisation si existant
- Redirection automatique vers la conversation créée
- 281 lignes de code ajoutées
- Traductions FR/EN ajoutées (newConversation, searchUsers, noUsersFound, noUsersAvailable)

**Fonctionnalités implémentées** :
- `NewConversationButton` : FAB flottant avec animation hover/active, icône MessageSquarePlus
- `NewConversationModal` :
  - Chargement des utilisateurs depuis Firestore (limite 50 pour performance)
  - Recherche en temps réel (filtrage par nom/email)
  - Avatar + nom + email pour chaque utilisateur
  - Gestion des états : searching, creating, empty states
  - Intégration avec `useCreateThread` (détection threads existants)
  - Toast de confirmation et redirection automatique

**Option A.2 - Filtres Pills WhatsApp** ✅ (28 oct) :
- 4 pills arrondis style WhatsApp Web : Toutes, Non lues, Favoris, Groupes
- Couleur active : vert WhatsApp (#25D366)
- Compteurs dynamiques sur chaque pill (sauf "Toutes")
- Animation scale au hover pour pills inactifs
- Filtrage en temps réel des conversations
- 88 lignes de code (FilterPills.tsx)
- 50 lignes modifiées (ThreadList.tsx pour intégration)
- Traductions FR/EN ajoutées (filters.all, filters.unread, filters.favorites, filters.groups)
- Empty states personnalisés selon le filtre actif

**Fonctionnalités implémentées** :
- `FilterPills` : Composant de filtres avec 4 types (all, unread, favorites, groups)
- Système de compteurs : affiche le nombre de conversations par filtre
- Logique de filtrage dans ThreadList :
  - `all` : toutes les conversations actives
  - `unread` : conversations avec messages non lus
  - `favorites` : favoris (TODO: système à implémenter)
  - `groups` : conversations de groupe (>2 participants)
- Utility Tailwind `scrollbar-hide` pour scroll horizontal fluide
- Empty states spécifiques : noUnread, noFavorites, noGroups

**Option A.3 - Fond Beige & Typography Segoe UI** ✅ (30 oct) :
- Fond beige WhatsApp (#F0F2F5) avec pattern SVG subtil
- Font family Segoe UI pour tout le système de messagerie
- Header mobile vert WhatsApp (#00A884)
- Liste conversations : fond blanc sur beige
- Zone conversation : pattern beige pour empty state
- Palette de couleurs WhatsApp complète dans Tailwind
  - `whatsapp-green`: #00A884
  - `whatsapp-green-light`: #25D366
  - `whatsapp-bg`: #F0F2F5
  - `whatsapp-text`: #111b21, #667781, #8696a0
- Classe CSS `.whatsapp-bg-pattern` pour background animé
- 90+ lignes modifiées pour styling WhatsApp

**Option A.4 - Banner + Header Icons + Empty States Illustrés** ✅ (30 oct) :
- `NotificationBanner` : Banner dismissible en haut de page (3 types : info, success, warning)
- `HeaderActions` : Icônes d'actions (nouveau groupe, nouveau chat, menu)
- `IllustratedEmptyState` : Empty states avec illustrations SVG animées
  - 5 types : no-messages, no-unread, no-favorites, no-groups, search-empty
  - Illustrations avec cercles animés et icônes colorées
  - Textes descriptifs personnalisés
- Hover states améliorés sur ThreadListItem :
  - Transition duration-200
  - Couleurs WhatsApp (#f0f2f5, #e9edef)
  - Avatar agrandi (h-12 w-12) avec fallback vert
  - Badge vert (#25D366) pour unread count
- 419 lignes ajoutées (3 nouveaux composants)
- 10+ nouvelles clés de traduction (FR/EN)

**Résumé Option A (complet)** :
- ✅ 4 options complétées (A.1, A.2, A.3, A.4)
- 🎨 Design WhatsApp Web finalisé
- 📦 12 composants totaux (9 de base + 3 Option A.4)
- 📝 ~3,750+ lignes de code
- 🌍 Traductions FR/EN complètes
- ⚡ 0 erreurs TypeScript
- 🎯 Prêt pour tests E2E (Task 1.4)

### Outils de Debug et Test

**Page de Debug** (`/dashboard/messages/debug`):
- Diagnostique l'état du système de messagerie en temps réel
- Affiche les statistiques de la base de données
- Permet de créer des threads de test
- Accessible uniquement en mode développement
- Voir: `MESSAGERIE_DEBUG_GUIDE.md` pour le guide complet

**Utilitaires de Test** (`src/lib/test-data-messaging.ts`):
- `createTestThread()` - Crée un thread avec messages de test
- `createMultipleTestThreads()` - Crée 4 threads de démonstration
- `checkMessagingData()` - Vérifie l'état de la base de données

**Guide de Diagnostic**: `docs/MESSAGERIE_DEBUG_GUIDE.md`
- Procédure complète de diagnostic
- Solutions aux problèmes courants
- Instructions pour créer des données de test

---

*Document mis à jour le 30 octobre 2025 - Phase 3 + Options A.1-A.4 (WhatsApp design) complétées - Système prêt pour tests E2E*
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

---

## 🧪 Tests E2E

**Date d'implémentation** : 2 novembre 2025  
**Framework** : Playwright  
**Fichiers** : `e2e/messaging.spec.ts`, `e2e/fixtures/messaging-helpers.ts`

### Couverture des Tests

**22 tests E2E** couvrant l'ensemble du système de messagerie :

#### Tests de Base (1-10)
1. ✅ Affichage de la liste des threads avec design WhatsApp
2. ✅ Filtrage par "Non lus"
3. ✅ Filtrage par "Favoris"
4. ✅ Filtrage par "Groupes"
5. ✅ Recherche de threads par nom ou contenu
6. ✅ Empty state illustré pour recherche vide
7. ✅ Ouverture du modal nouvelle conversation (FAB)
8. ✅ Recherche d'utilisateur dans le modal
9. ✅ Sélection d'un thread
10. ✅ Envoi d'un message simple

#### Tests PII Detection (11-12)
11. ✅ Détection PII - Email
12. ✅ Détection PII - Numéro de téléphone

#### Tests UI/UX (13-20)
13. ✅ Empty state "Pas de conversations"
14. ✅ Banner de notification (affichage + fermeture)
15. ✅ Menu des actions du header
16. ✅ Badge de messages non lus (style WhatsApp green #25d366)
17. ✅ Avatar par défaut (fond vert WhatsApp)
18. ✅ Formatage du timestamp
19. ✅ Responsive - Vue mobile
20. ✅ Hover states sur les threads

#### Tests Avancés (21-22)
21. ✅ Changement de filtre met à jour la liste
22. ✅ Clear de la recherche restaure la liste complète

### Attributs de Test

Tous les composants ont été enrichis avec des `data-testid` pour faciliter les tests :

**Composants Priorité 1 (Critiques)** :
- `thread-list.tsx` : `thread-list`, `thread-list-loading`, `thread-search-input`, `thread-list-items`
- `thread-list-item.tsx` : `thread-item`, `thread-avatar`, `unread-badge`, `thread-timestamp`
- `new-conversation-button.tsx` : `new-conversation-fab`
- `filter-pills.tsx` : `filter-all`, `filter-unread`, `filter-favorites`, `filter-groups`

**Composants Priorité 2 (Importants)** :
- `new-conversation-modal.tsx` : `new-conversation-modal`, `modal-title`, `user-search-input`, `user-result`
- `notification-banner.tsx` : `notification-banner`, `banner-dismiss`
- `illustrated-empty-state.tsx` : `empty-state-no-messages`, `empty-state-no-unread`, etc.
- `header-actions.tsx` : `header-menu-button`, `header-menu-dropdown`
- `page.tsx` : `messages-page`, `mobile-header`, `mobile-view`

### Exécution des Tests

```bash
# Lancer tous les tests de messagerie
pnpm playwright test e2e/messaging.spec.ts

# Mode UI interactif
pnpm playwright test --ui e2e/messaging.spec.ts

# Mode debug
pnpm playwright test --debug e2e/messaging.spec.ts

# Générer un rapport HTML
pnpm playwright test e2e/messaging.spec.ts --reporter=html
```

### Helpers et Mocks

Le fichier `e2e/fixtures/messaging-helpers.ts` (~400 lignes) fournit :

**Données de test** :
- 3 threads mockés (conversation 1-1, conversation favorite, groupe)
- 3 messages mockés avec timestamps réalistes

**Fonctions utilitaires** :
- `injectMessagingMocks()` : Mock des données Firestore
- `navigateToMessages()`, `waitForThreadList()` : Navigation
- `openNewConversationModal()`, `selectThread()`, `sendMessage()` : Interactions
- `clickFilter()`, `searchThreads()` : Actions de filtrage
- `expectThreadVisible()`, `expectEmptyState()`, `expectPIIWarning()` : Assertions

### Documentation Complète

Consulter les fichiers suivants pour plus de détails :
- `docs/E2E_TESTING_GUIDE.md` : Guide d'implémentation des tests
- `docs/E2E_MESSAGING_STATUS.md` : État d'avancement et métriques

---

