# 🏗️ Architecture Technique — ImuTask

**Version:** 1.0.0  
**Date:** 3 octobre 2025  
**Statut:** Document de référence technique

---

## Vue d'ensemble

ImuTask utilise une architecture moderne **full-stack TypeScript** avec :

- **Frontend Web:** Next.js 15 (App Router, React Server Components)
- **Frontend Mobile:** Expo (React Native)
- **Backend API:** Node.js + tRPC (type-safety end-to-end)
- **Database:** Postgres (principal) + Redis (cache/sessions)
- **Payments:** Stripe Connect
- **Storage:** AWS S3 / Cloudflare R2
- **Hosting:** Vercel (web) + AWS/GCP (backend)

---

## Stack Technique Détaillée

### Frontend Web (Next.js 15)

**Framework & Libraries:**

```json
{
  "next": "15.3.3",
  "react": "19.0.0",
  "typescript": "^5",
  "tailwindcss": "^4",
  "@tanstack/react-query": "^5",
  "next-intl": "^3",
  "zod": "^3",
  "react-hook-form": "^7",
  "@genkit-ai/googleai": "^1.14.1"
}
```

**Features:**

✅ **App Router** — RSC, Server Actions, Streaming
✅ **Internationalization** — 7 langues (en, fr, de, es, ja, it, pt)
✅ **UI Components** — shadcn/ui + Radix UI
✅ **Forms** — React Hook Form + Zod validation
✅ **State** — React Query (server state) + Zustand (client state)
✅ **Styling** — Tailwind CSS + CSS Modules
✅ **Charts** — Recharts
✅ **Maps** — Mapbox GL JS / Google Maps
✅ **AI** — Genkit pour task categorization

**Structure:**

```
src/
├── app/
│   ├── [locale]/          # i18n routes
│   │   ├── (marketing)/   # Public pages
│   │   ├── (app)/         # Authenticated app
│   │   ├── auth/          # Login, signup
│   │   ├── dashboard/     # User dashboard
│   │   ├── tasks/         # Tasks CRUD
│   │   ├── offers/        # Offers management
│   │   ├── bookings/      # Bookings
│   │   ├── messages/      # Messaging
│   │   ├── wallet/        # Payments & wallet
│   │   └── profile/       # User profile
│   └── api/
│       ├── trpc/          # tRPC endpoints
│       └── webhooks/      # Stripe webhooks
├── components/
│   ├── ui/                # shadcn components
│   ├── forms/             # Form components
│   ├── dashboards/        # Dashboard widgets
│   └── layout/            # Layout components
├── features/              # Feature-based organization
│   ├── auth/
│   ├── tasks/
│   ├── offers/
│   ├── bookings/
│   ├── payments/
│   ├── chat/
│   └── profiles/
├── lib/
│   ├── api/               # tRPC client
│   ├── utils.ts           # Utilities
│   └── types.ts           # Shared types
└── middleware.ts          # Auth + i18n middleware
```

---

### Frontend Mobile (Expo React Native)

**Framework:**

```json
{
  "expo": "~52.0.0",
  "react-native": "0.76.x",
  "typescript": "^5",
  "@react-navigation/native": "^6",
  "@tanstack/react-query": "^5",
  "expo-camera": "~16.0.0",
  "expo-location": "~18.0.0",
  "expo-notifications": "~0.30.0"
}
```

**Features:**

✅ **Navigation** — React Navigation (Stack + Tabs)
✅ **Camera** — KYC docs, proof of work photos
✅ **Location** — Geolocation for tasks
✅ **Notifications** — FCM push notifications
✅ **Offline** — AsyncStorage + offline queue
✅ **Maps** — React Native Maps
✅ **Payments** — Stripe React Native SDK
✅ **Biometrics** — Face ID / Touch ID (optionnel)

**Structure:**

```
mobile/
├── app/                   # Expo Router
│   ├── (tabs)/            # Bottom tabs navigation
│   │   ├── index.tsx      # Home/Browse tasks
│   │   ├── my-tasks.tsx   # My tasks (provider)
│   │   ├── bookings.tsx   # My bookings
│   │   ├── messages.tsx   # Messaging
│   │   └── profile.tsx    # Profile
│   ├── auth/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── tasks/
│   │   ├── [id].tsx       # Task details
│   │   └── new.tsx        # Create task
│   └── _layout.tsx        # Root layout
├── components/
├── features/              # Shared avec web (symlink ou package)
└── lib/
```

---

### Backend API (Node.js + tRPC)

**Framework:**

```json
{
  "node": ">=20",
  "typescript": "^5",
  "@trpc/server": "^11",
  "@trpc/client": "^11",
  "zod": "^3",
  "prisma": "^6",
  "@prisma/client": "^6",
  "stripe": "^18",
  "bullmq": "^5",
  "ioredis": "^5"
}
```

**Architecture:**

```
backend/
├── src/
│   ├── server.ts          # Express + tRPC server
│   ├── trpc/
│   │   ├── router.ts      # Root router
│   │   ├── context.ts     # Request context
│   │   └── routers/
│   │       ├── auth.ts
│   │       ├── tasks.ts
│   │       ├── offers.ts
│   │       ├── bookings.ts
│   │       ├── payments.ts
│   │       ├── messages.ts
│   │       └── admin.ts
│   ├── services/          # Business logic
│   │   ├── auth.service.ts
│   │   ├── tasks.service.ts
│   │   ├── payments.service.ts
│   │   ├── matching.service.ts
│   │   └── notifications.service.ts
│   ├── workers/           # BullMQ workers
│   │   ├── uploads.worker.ts
│   │   ├── payouts.worker.ts
│   │   ├── notifications.worker.ts
│   │   └── webhooks.worker.ts
│   ├── lib/
│   │   ├── prisma.ts      # Prisma client
│   │   ├── redis.ts       # Redis client
│   │   ├── stripe.ts      # Stripe client
│   │   ├── s3.ts          # S3 client
│   │   └── websocket.ts   # Socket.IO
│   └── middleware/
│       ├── auth.ts        # JWT validation
│       ├── ratelimit.ts   # Rate limiting
│       └── logger.ts      # Request logging
├── prisma/
│   ├── schema.prisma      # DB schema
│   └── migrations/
└── tests/
```

**Key Endpoints (tRPC):**

```typescript
// Auth
auth.signup
auth.login
auth.logout
auth.refreshToken
auth.verifyEmail

// Tasks
tasks.create
tasks.update
tasks.delete
tasks.list
tasks.get
tasks.search (geo + filters)

// Offers
offers.create
offers.accept
offers.reject
offers.list

// Bookings
bookings.get
bookings.list
bookings.complete
bookings.cancel
bookings.dispute

// Payments
payments.createIntent
payments.captureIntent
payments.refund
payments.payout
payments.webhook (REST)

// Messages
messages.send
messages.list
messages.subscribe (WebSocket)

// Admin
admin.kyc.list
admin.kyc.approve
admin.disputes.list
admin.disputes.resolve
admin.users.list
admin.users.suspend
```

---

### Database Schema (Prisma + Postgres)

**Core Models:**

```prisma
// prisma/schema.prisma

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String?
  name          String?
  avatar        String?
  role          Role     @default(CLIENT)
  kycStatus     KycStatus @default(PENDING)
  stripeAccountId String? @unique
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  tasksCreated  Task[]   @relation("TaskClient")
  offers        Offer[]
  bookings      Booking[]
  messages      Message[]
  reviews       Review[]
  profile       Profile?
}

enum Role {
  CLIENT
  PROVIDER
  ADMIN
}

enum KycStatus {
  PENDING
  APPROVED
  REJECTED
}

model Profile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  bio         String?
  phone       String?
  address     Json?    // {street, city, zip, country, lat, lng}
  skills      String[] // Categories
  availability Json?   // Calendrier
  rating      Float    @default(0)
  reviewCount Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Task {
  id          String   @id @default(cuid())
  clientId    String
  client      User     @relation("TaskClient", fields: [clientId], references: [id])
  
  title       String
  description String
  category    String
  budget      Float
  location    Json     // {address, lat, lng}
  date        DateTime?
  duration    Int?     // minutes
  status      TaskStatus @default(DRAFT)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  offers      Offer[]
  booking     Booking?
  
  @@index([status, category, createdAt])
  @@index([location]) // GiST index pour PostGIS
}

enum TaskStatus {
  DRAFT
  PUBLISHED
  OFFERS_RECEIVED
  BOOKED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  EXPIRED
}

model Offer {
  id          String   @id @default(cuid())
  taskId      String
  task        Task     @relation(fields: [taskId], references: [id])
  providerId  String
  provider    User     @relation(fields: [providerId], references: [id])
  
  price       Float
  message     String?
  proposedDate DateTime?
  status      OfferStatus @default(PENDING)
  expiresAt   DateTime
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([taskId, status])
  @@index([providerId])
}

enum OfferStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}

model Booking {
  id              String   @id @default(cuid())
  taskId          String   @unique
  task            Task     @relation(fields: [taskId], references: [id])
  providerId      String
  provider        User     @relation(fields: [providerId], references: [id])
  
  price           Float
  platformFee     Float
  scheduledAt     DateTime
  status          BookingStatus @default(CONFIRMED)
  
  paymentIntentId String?  @unique
  paymentStatus   PaymentStatus @default(PENDING)
  
  checkInAt       DateTime?
  checkOutAt      DateTime?
  completedAt     DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  messages        Message[]
  dispute         Dispute?
  review          Review?
  
  @@index([providerId, status])
  @@index([status, scheduledAt])
}

enum BookingStatus {
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  DISPUTED
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  CAPTURED
  REFUNDED
  FAILED
}

model Message {
  id          String   @id @default(cuid())
  bookingId   String
  booking     Booking  @relation(fields: [bookingId], references: [id])
  senderId    String
  sender      User     @relation(fields: [senderId], references: [id])
  
  content     String
  attachments Json?    // [{url, type, name}]
  readAt      DateTime?
  
  createdAt   DateTime @default(now())
  
  @@index([bookingId, createdAt])
}

model Review {
  id          String   @id @default(cuid())
  bookingId   String   @unique
  booking     Booking  @relation(fields: [bookingId], references: [id])
  reviewerId  String
  reviewer    User     @relation(fields: [reviewerId], references: [id])
  
  rating      Int      // 1-5
  comment     String?
  
  createdAt   DateTime @default(now())
  
  @@index([rating])
}

model Dispute {
  id          String   @id @default(cuid())
  bookingId   String   @unique
  booking     Booking  @relation(fields: [bookingId], references: [id])
  
  reason      String
  description String
  evidence    Json?    // [{url, type, description}]
  status      DisputeStatus @default(OPEN)
  resolution  String?
  
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?
  
  @@index([status])
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED_CLIENT
  RESOLVED_PROVIDER
  CLOSED
}
```

**Extensions Postgres:**

```sql
-- PostGIS pour recherche géolocalisée
CREATE EXTENSION IF NOT EXISTS postgis;

-- Index GiST pour colonnes JSON location
CREATE INDEX idx_task_location 
ON "Task" USING GIST ((location::jsonb));

-- Fonction recherche par distance
CREATE OR REPLACE FUNCTION nearby_tasks(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_km INT
) RETURNS TABLE(id TEXT, distance_km FLOAT) AS $$
  SELECT 
    id,
    ST_Distance(
      ST_MakePoint((location->>'lng')::FLOAT, (location->>'lat')::FLOAT)::geography,
      ST_MakePoint(user_lng, user_lat)::geography
    ) / 1000 AS distance_km
  FROM "Task"
  WHERE status = 'PUBLISHED'
    AND ST_DWithin(
      ST_MakePoint((location->>'lng')::FLOAT, (location->>'lat')::FLOAT)::geography,
      ST_MakePoint(user_lng, user_lat)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km ASC;
$$ LANGUAGE SQL;
```

---

### Cache & Sessions (Redis)

**Use cases:**

1. **Sessions utilisateur** — JWT refresh tokens
2. **Rate limiting** — Par IP/user
3. **Cache API responses** — Tasks search, user profiles
4. **Real-time presence** — Online/offline status
5. **Pub/Sub** — Notifications cross-instances

**Structure:**

```redis
# Sessions
session:{userId} -> {refreshToken, expiresAt}
TTL: 30 days

# Rate limiting
ratelimit:{endpoint}:{userId} -> count
TTL: 1 minute

# Cache
cache:task:{taskId} -> JSON
TTL: 5 minutes

cache:tasks:search:{hash} -> JSON
TTL: 2 minutes

# Presence
presence:{userId} -> {status, lastSeen}
TTL: 5 minutes (refresh via heartbeat)

# Pub/Sub channels
notifications:{userId}
messages:{bookingId}
```

---

### Storage (S3 / Cloudflare R2)

**Buckets:**

```
imu-task-uploads/
├── avatars/
│   └── {userId}/{filename}
├── kyc/
│   └── {userId}/{docType}/{filename}
├── tasks/
│   └── {taskId}/{filename}
├── bookings/
│   └── {bookingId}/{filename}
└── messages/
    └── {messageId}/{filename}
```

**Presigned URLs:**

```typescript
// Upload flow
1. Client requests presigned URL
   POST /api/uploads/presigned
   Body: {fileType, category, entityId}

2. Server generates presigned URL
   S3.getSignedUrl('putObject', {
     Bucket: 'imu-task-uploads',
     Key: `${category}/${entityId}/${uuid}.${ext}`,
     Expires: 300,
     ContentType: fileType
   })

3. Client uploads directly to S3
   PUT https://s3.amazonaws.com/... (presigned URL)

4. Client confirms upload
   POST /api/uploads/confirm
   Body: {key, entityId}

5. Server validates & updates DB
```

---

### Payments (Stripe Connect)

**Architecture:**

```
ImuTask (Platform)
    ├── Stripe Platform Account
    │   └── Take-rate fee (12-20%)
    └── Connected Accounts (Providers)
        └── Standard Connect Accounts
```

**Flows:**

**1. Provider Onboarding:**

```typescript
// Create Connect account
const account = await stripe.accounts.create({
  type: 'standard',
  country: 'FR',
  email: provider.email,
  capabilities: {
    transfers: {requested: true},
  },
  metadata: {userId: provider.id}
});

// Generate onboarding link
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: `${baseUrl}/dashboard/stripe/refresh`,
  return_url: `${baseUrl}/dashboard/stripe/complete`,
  type: 'account_onboarding',
});

// Redirect provider to Stripe
redirect(accountLink.url);
```

**2. Payment Authorization (Booking creation):**

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: booking.price * 100, // cents
  currency: 'eur',
  customer: client.stripeCustomerId,
  payment_method: paymentMethodId,
  capture_method: 'manual', // Escrow
  application_fee_amount: platformFee * 100,
  transfer_data: {
    destination: provider.stripeAccountId,
  },
  metadata: {
    bookingId: booking.id,
    taskId: booking.taskId,
  }
});

await paymentIntent.confirm();
// Status: requires_capture
```

**3. Payment Capture (Completion):**

```typescript
// After provider marks completed + client validates
const captured = await stripe.paymentIntents.capture(
  booking.paymentIntentId,
  {
    amount_to_capture: booking.price * 100,
  }
);

// Transfer automatique vers provider (minus platform fee)
```

**4. Refund (Dispute resolved):**

```typescript
const refund = await stripe.refunds.create({
  payment_intent: booking.paymentIntentId,
  amount: refundAmount * 100,
  reason: 'requested_by_customer',
  metadata: {
    disputeId: dispute.id,
  }
});

// Reverse transfer si déjà capturé
if (captured) {
  await stripe.transfers.createReversal(transfer.id, {
    amount: refundAmount * 100,
  });
}
```

**Webhooks:**

```typescript
// /api/webhooks/stripe
app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    webhookSecret
  );

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    
    case 'account.updated':
      await handleAccountUpdated(event.data.object);
      break;
    
    case 'charge.dispute.created':
      await handleDisputeCreated(event.data.object);
      break;
  }

  res.json({received: true});
});
```

---

### Real-time (WebSocket)

**Socket.IO Setup:**

```typescript
// server.ts
import {Server} from 'socket.io';

const io = new Server(httpServer, {
  cors: {origin: process.env.FRONTEND_URL},
});

// Auth middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const user = await verifyToken(token);
  if (user) {
    socket.data.userId = user.id;
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

// Connection
io.on('connection', (socket) => {
  const userId = socket.data.userId;
  
  // Join user room
  socket.join(`user:${userId}`);
  
  // Join booking rooms
  socket.on('join:booking', (bookingId) => {
    socket.join(`booking:${bookingId}`);
  });
  
  // Send message
  socket.on('message:send', async (data) => {
    const message = await createMessage(data);
    io.to(`booking:${data.bookingId}`).emit('message:new', message);
  });
  
  // Typing indicator
  socket.on('typing:start', (bookingId) => {
    socket.to(`booking:${bookingId}`).emit('typing', {userId});
  });
  
  // Presence
  socket.on('disconnect', () => {
    io.emit('user:offline', {userId});
  });
});
```

**Client (React):**

```typescript
import {io} from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_WS_URL, {
  auth: {token: getAccessToken()}
});

socket.on('connect', () => {
  socket.emit('join:booking', bookingId);
});

socket.on('message:new', (message) => {
  queryClient.setQueryData(['messages', bookingId], (old) => 
    [...old, message]
  );
});

const sendMessage = (content: string) => {
  socket.emit('message:send', {
    bookingId,
    content,
  });
};
```

---

### Workers (BullMQ)

**Queue Definitions:**

```typescript
// lib/queues.ts
import {Queue} from 'bullmq';

export const uploadQueue = new Queue('uploads', {
  connection: redisConnection,
});

export const notificationQueue = new Queue('notifications', {
  connection: redisConnection,
});

export const payoutQueue = new Queue('payouts', {
  connection: redisConnection,
});
```

**Workers:**

```typescript
// workers/uploads.worker.ts
import {Worker} from 'bullmq';
import {scanFile} from '../services/antivirus';

const uploadsWorker = new Worker('uploads', async (job) => {
  const {key, userId} = job.data;
  
  // Download from S3
  const file = await s3.getObject({Bucket, Key: key});
  
  // Scan for viruses
  const isClean = await scanFile(file.Body);
  
  if (!isClean) {
    await s3.deleteObject({Bucket, Key: key});
    await notifyUser(userId, 'File rejected: malware detected');
    throw new Error('Malware detected');
  }
  
  // Mark as verified
  await prisma.upload.update({
    where: {key},
    data: {verified: true}
  });
}, {connection: redisConnection});

// workers/payouts.worker.ts
const payoutsWorker = new Worker('payouts', async (job) => {
  const {providerId} = job.data;
  
  // Get pending earnings
  const bookings = await prisma.booking.findMany({
    where: {
      providerId,
      paymentStatus: 'CAPTURED',
      payoutStatus: 'PENDING',
    }
  });
  
  const totalAmount = bookings.reduce((sum, b) => 
    sum + (b.price - b.platformFee), 0
  );
  
  // Create Stripe payout
  const payout = await stripe.payouts.create({
    amount: totalAmount * 100,
    currency: 'eur',
  }, {
    stripeAccount: provider.stripeAccountId,
  });
  
  // Update bookings
  await prisma.booking.updateMany({
    where: {id: {in: bookings.map(b => b.id)}},
    data: {payoutStatus: 'COMPLETED', payoutId: payout.id}
  });
}, {connection: redisConnection});
```

**Scheduling:**

```typescript
// Cron jobs (using node-cron or BullMQ repeatable jobs)
import {Queue} from 'bullmq';

// Daily payouts at 2am
payoutQueue.add('daily-payouts', {}, {
  repeat: {
    pattern: '0 2 * * *',
  }
});

// Expire old offers every hour
offersQueue.add('expire-offers', {}, {
  repeat: {
    pattern: '0 * * * *',
  }
});
```

---

### AI & Intelligence (Genkit + LLMs)

**Configuration actuelle:**

```typescript
// src/ai/genkit.ts
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});
```

**Flows prévus (V2):**

**1. NL → Task Extraction:**

```typescript
import {ai} from './genkit';
import {z} from 'zod';

const TaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  location: z.string().optional(),
  budget: z.number().optional(),
  date: z.string().optional(),
});

export const extractTaskFlow = ai.defineFlow(
  {
    name: 'extractTask',
    inputSchema: z.string(),
    outputSchema: TaskSchema,
  },
  async (userInput) => {
    const prompt = `
      Extract task details from this user input:
      "${userInput}"
      
      Return JSON with:
      - title (concise)
      - description
      - category (one of: Ménage, Courses, Bricolage, Jardinage, Aide numérique, Autre)
      - location (if mentioned)
      - budget (number in euros, if mentioned)
      - date (ISO string, if mentioned)
    `;
    
    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      output: {schema: TaskSchema},
    });
    
    return result.output;
  }
);
```

**2. Pricing Intelligence:**

```typescript
export const suggestPricingFlow = ai.defineFlow(
  {
    name: 'suggestPricing',
    inputSchema: z.object({
      category: z.string(),
      city: z.string(),
      duration: z.number().optional(),
    }),
    outputSchema: z.object({
      p50: z.number(),
      p75: z.number(),
      max: z.number(),
      explanation: z.string(),
    }),
  },
  async ({category, city, duration}) => {
    // Fetch historical data
    const historicalPrices = await prisma.booking.findMany({
      where: {
        task: {category, location: {path: '$.city', equals: city}},
        paymentStatus: 'CAPTURED',
      },
      select: {price: true},
    });
    
    const prices = historicalPrices.map(b => b.price).sort((a,b) => a-b);
    const p50 = percentile(prices, 50);
    const p75 = percentile(prices, 75);
    const max = Math.max(...prices);
    
    const prompt = `
      Based on ${prices.length} historical bookings for ${category} in ${city}:
      - Median price: ${p50}€
      - 75th percentile: ${p75}€
      - Maximum: ${max}€
      ${duration ? `- Task duration: ${duration} minutes` : ''}
      
      Provide a brief explanation (2 sentences) for these price suggestions.
    `;
    
    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
    });
    
    return {
      p50,
      p75,
      max,
      explanation: result.text,
    };
  }
);
```

**3. Moderation (PII Detection):**

```typescript
export const detectPIIFlow = ai.defineFlow(
  {
    name: 'detectPII',
    inputSchema: z.string(),
    outputSchema: z.object({
      hasPII: z.boolean(),
      entities: z.array(z.object({
        type: z.enum(['EMAIL', 'PHONE', 'ADDRESS', 'URL']),
        value: z.string(),
        start: z.number(),
        end: z.number(),
      })),
    }),
  },
  async (text) => {
    // Regex-based first pass
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /\b(?:\+33|0)[1-9](?:\d{8}|\s\d{2}\s\d{2}\s\d{2}\s\d{2})\b/g;
    const urlRegex = /https?:\/\/[^\s]+/g;
    
    const entities = [];
    
    // Extract emails
    let match;
    while ((match = emailRegex.exec(text)) !== null) {
      entities.push({
        type: 'EMAIL',
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    
    // Extract phones
    while ((match = phoneRegex.exec(text)) !== null) {
      entities.push({
        type: 'PHONE',
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    
    // Extract URLs
    while ((match = urlRegex.exec(text)) !== null) {
      entities.push({
        type: 'URL',
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    
    // LLM for additional detection (addresses, etc.)
    if (entities.length === 0) {
      const llmResult = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: `
          Detect personal information (addresses, social media handles) in:
          "${text}"
          
          Return JSON array of entities found (or empty array).
        `,
        output: {
          schema: z.array(z.object({
            type: z.string(),
            value: z.string(),
          })),
        },
      });
      
      // Merge results
      entities.push(...llmResult.output.map(e => ({
        ...e,
        start: text.indexOf(e.value),
        end: text.indexOf(e.value) + e.value.length,
      })));
    }
    
    return {
      hasPII: entities.length > 0,
      entities,
    };
  }
);
```

---

### Monitoring & Observability

**Sentry (Errors):**

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({tracing: true}),
    new Sentry.Integrations.Prisma({client: prisma}),
  ],
});

// Usage
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {feature: 'payments'},
    user: {id: userId},
  });
  throw error;
}
```

**Prometheus (Metrics):**

```typescript
import {register, Counter, Histogram} from 'prom-client';

// Metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });
    httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path,
    }, duration);
  });
  
  next();
});

// Expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

**Loki (Logs):**

```typescript
import winston from 'winston';
import LokiTransport from 'winston-loki';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new LokiTransport({
      host: process.env.LOKI_URL,
      labels: {app: 'imu-task-api'},
      json: true,
    }),
  ],
});

// Usage
logger.info('Payment captured', {
  bookingId,
  amount,
  userId,
});

logger.error('Payment failed', {
  error: error.message,
  paymentIntentId,
});
```

---

### Infrastructure & Deployment

**Vercel (Frontend Web):**

```yaml
# vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["cdg1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_WS_URL": "@ws-url",
    "DATABASE_URL": "@database-url"
  }
}
```

**Kubernetes (Backend API):**

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: imu-task-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: imu-task-api
  template:
    metadata:
      labels:
        app: imu-task-api
    spec:
      containers:
      - name: api
        image: ghcr.io/imu-system/imu-task-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: imu-task-api
spec:
  selector:
    app: imu-task-api
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

**GitHub Actions (CI/CD):**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/imu-system/imu-task-api:${{ github.sha }}
      
      - run: kubectl set image deployment/imu-task-api api=ghcr.io/imu-system/imu-task-api:${{ github.sha }}
```

**Terraform (Infrastructure as Code):**

```hcl
# terraform/main.tf

# VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  
  tags = {
    Name = "imu-task-vpc"
  }
}

# RDS Postgres
resource "aws_db_instance" "postgres" {
  identifier = "imu-task-db"
  engine = "postgres"
  engine_version = "16.1"
  instance_class = "db.t4g.micro"
  allocated_storage = 20
  storage_type = "gp3"
  
  db_name = "imutask"
  username = var.db_username
  password = var.db_password
  
  backup_retention_period = 7
  backup_window = "03:00-04:00"
  maintenance_window = "mon:04:00-mon:05:00"
  
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name = aws_db_subnet_group.main.name
  
  tags = {
    Name = "imu-task-postgres"
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id = "imu-task-redis"
  engine = "redis"
  node_type = "cache.t4g.micro"
  num_cache_nodes = 1
  parameter_group_name = "default.redis7"
  engine_version = "7.1"
  port = 6379
  
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  tags = {
    Name = "imu-task-redis"
  }
}

# S3 Bucket
resource "aws_s3_bucket" "uploads" {
  bucket = "imu-task-uploads"
  
  tags = {
    Name = "imu-task-uploads"
  }
}

resource "aws_s3_bucket_cors_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET"]
    allowed_origins = ["https://imutask.com", "https://app.imutask.com"]
    max_age_seconds = 3000
  }
}
```

---

## Sécurité

### Authentication (JWT)

```typescript
import jwt from 'jsonwebtoken';

// Generate tokens
export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    {userId, type: 'access'},
    process.env.JWT_SECRET!,
    {expiresIn: '15m'}
  );
  
  const refreshToken = jwt.sign(
    {userId, type: 'refresh'},
    process.env.JWT_REFRESH_SECRET!,
    {expiresIn: '30d'}
  );
  
  return {accessToken, refreshToken};
};

// Verify access token
export const verifyAccessToken = (token: string) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {userId: string};
    return payload.userId;
  } catch {
    return null;
  }
};

// Middleware
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({error: 'Unauthorized'});
  
  const userId = verifyAccessToken(token);
  if (!userId) return res.status(401).json({error: 'Invalid token'});
  
  req.userId = userId;
  next();
};
```

### Rate Limiting

```typescript
import {RateLimiterRedis} from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'ratelimit',
  points: 100, // requests
  duration: 60, // per 60 seconds
});

export const rateLimitMiddleware = async (req, res, next) => {
  const key = req.userId || req.ip;
  
  try {
    await rateLimiter.consume(key);
    next();
  } catch {
    res.status(429).json({error: 'Too many requests'});
  }
};
```

### CORS

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://imutask.com',
    'https://app.imutask.com',
    process.env.NODE_ENV === 'development' && 'http://localhost:3000',
  ].filter(Boolean),
  credentials: true,
}));
```

---

## Performance Optimizations

### Database Indexing

```sql
-- Frequently queried columns
CREATE INDEX idx_task_status_category ON "Task"(status, category);
CREATE INDEX idx_task_created_at ON "Task"(created_at DESC);
CREATE INDEX idx_booking_provider_status ON "Booking"(provider_id, status);

-- Full-text search
CREATE INDEX idx_task_search ON "Task" USING GIN(to_tsvector('french', title || ' ' || description));
```

### Caching Strategy

```typescript
// React Query (client-side)
const {data: tasks} = useQuery({
  queryKey: ['tasks', filters],
  queryFn: () => api.tasks.list.query(filters),
  staleTime: 2 * 60 * 1000, // 2 min
  cacheTime: 10 * 60 * 1000, // 10 min
});

// Redis (server-side)
const getCachedTasks = async (filters) => {
  const cacheKey = `tasks:${JSON.stringify(filters)}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) return JSON.parse(cached);
  
  const tasks = await prisma.task.findMany({where: filters});
  await redis.setex(cacheKey, 120, JSON.stringify(tasks)); // 2 min
  
  return tasks;
};
```

### Image Optimization

```typescript
// Next.js Image component
<Image
  src={task.image}
  alt={task.title}
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL={task.blurHash}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// S3 Lambda@Edge resize
exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const uri = request.uri;
  
  // Extract width from query string
  const params = new URLSearchParams(request.querystring);
  const width = params.get('w');
  
  if (width) {
    const resizedKey = `${uri.split('.')[0]}_w${width}.${uri.split('.')[1]}`;
    const resized = await sharp(originalImage)
      .resize(parseInt(width))
      .toBuffer();
    
    await s3.putObject({Bucket, Key: resizedKey, Body: resized});
    request.uri = resizedKey;
  }
  
  return request;
};
```

---

**Document maintenu par:** Tech Team ImuTask  
**Dernière révision:** 3 octobre 2025  
**Contact:** tech@imutask.com
