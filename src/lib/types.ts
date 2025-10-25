// User-related enums
export enum UserRole {
  client = 'client',
  provider = 'provider',
  admin = 'admin',
  moderator = 'moderator'
}

export type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  timeWindowStart?: Date;
  timeWindowEnd?: Date;
};

export enum UserStatus {
  active = 'active',
  inactive = 'inactive',
  suspended = 'suspended',
  deleted = 'deleted'
}

export enum KYCStatus {
  not_required = 'not_required',
  pending = 'pending',
  verified = 'verified',
  rejected = 'rejected'
}

// Booking-related enums
export enum BookingStatus {
  pending = 'pending',
  confirmed = 'confirmed',
  in_progress = 'in_progress',
  completed = 'completed',
  cancelled = 'cancelled',
  // alias used in some legacy code
  canceled = 'canceled',
  disputed = 'disputed',
  // legacy
  scheduled = 'scheduled',
  no_show_client = 'no_show_client',
  no_show_provider = 'no_show_provider'
}

export enum PaymentStatus {
  authorized = 'authorized',
  captured = 'captured',
  refunded = 'refunded',
  failed = 'failed',
  canceled = 'canceled'
}

// Profile type
export type Profile = {
  displayName?: string;
  photoUrl?: string;
  userId?: string;
  languages?: string[];
  averageRating?: number;
  reviewsCount?: number;
  skills?: string[];
  verifiedBadges?: string[];
  bio?: string;
  phone?: string;
  city?: string;
  serviceRadiusKm?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

// User: Full model with all fields
export type User = {
  id: string;
  email: string;
  profile: Profile;
  roles?: UserRole[];
  status?: UserStatus;
  KYCStatus?: KYCStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
};

// AppUser type (alias for compatibility with auth context)
export type AppUser = User & {
  phone?: string;
  kycStatus?: KYCStatus;
  status?: UserStatus;
  roles?: UserRole[];
};

// Legacy User type for compatibility
export type LegacyUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  isProvider: boolean;
  skills?: string[];
  profileDescription?: string;
  availability?: boolean;
};

export type Task = {
  id: string;
  title: string;
  categoryId?: string;
  description: string;
  category?: string;
  location: string;
  adresse?: Address;
  budget?: number;
  // Accept either the legacy literal status or the TaskStatus enum
  status: 'Open' | 'In Progress' | 'Completed' | TaskStatus | string;
  clientId: string;
  timeWindowStart?: Date | string;
  timeWindowEnd?: Date | string;
  providerId?: string;
  createdAt: string | Date;
  // Allow extra legacy/mock properties (priceOffered, client, attachments, etc.)
  [k: string]: any;
};

export type Proposal = {
  id: string;
  taskId: string;
  providerId: string;
  amount: number;
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
};

export type Booking = {
  id: string;
  taskId: string;
  clientId: string;
  providerId: string;
  proposalId: string;
  amount: number;
  status: BookingStatus | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed' | string;
  scheduledDate?: Date | string;
  startAt?: Date | string; // alias used in some components
  startedAt?: Date | string;
  endAt?: Date | string; // alias
  completedAt?: Date | string;
  cancelledAt?: Date | string;
  cancellationReason?: string;
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Payment fields
  paymentIntentId?: string;
  paymentStatus?: PaymentStatus;
  // legacy helper objects present in fixtures
  task?: any;
  client?: any;
  provider?: any;
  // legacy/alias fields observed in the codebase
  agreedAmount?: number;
  currency?: string;
  completionProof?: string[];
};

// Note: Full Message and Conversation types are defined in:
// - src/lib/firestore-messages.ts
// - src/lib/firestore-conversations.ts
// These are simplified versions for compatibility

export type Message = {
  id: string;
  // Support both conversationId (new) and threadId (legacy), and both content/body
  conversationId?: string;
  threadId?: string;
  senderId: string;
  content?: string;
  body?: string;
  // message kind (text, image, audio, file, system)
  type?: MessageType;
  // timestamp in mocks may be Date or string, and some code uses sentAt
  timestamp?: string | Date;
  sentAt?: string | Date;
  // allow attachments in mock messages
  attachments?: Attachment[] | any[];
};

export type Conversation = {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: string | Date;
};

// Task-related enums
export enum TaskStatus {
  draft = 'draft',
  published = 'published',
  matched = 'matched',
  in_progress = 'in_progress',
  completed = 'completed',
  cancelled = 'cancelled',
  // legacy / alternate statuses used in mock data
  partially_matched = 'partially_matched',
  canceled = 'canceled'
}

export enum TaskVisibility {
  public = 'public',
  private = 'private'
}

// Offer/Proposal-related enums
export enum OfferStatus {
  pending = 'pending',
  accepted = 'accepted',
  declined = 'declined',
  withdrawn = 'withdrawn',
  expired = 'expired'
}

// Transfer-related enums
export enum TransferStatus {
  pending = 'pending',
  processing = 'processing',
  succeeded = 'succeeded',
  failed = 'failed',
  cancelled = 'cancelled',
  canceled = 'canceled'
}

// Payout-related enums
export enum PayoutStatus {
  pending = 'pending',
  in_transit = 'in_transit',
  paid = 'paid',
  failed = 'failed',
  cancelled = 'cancelled'
}

// Review-related enums
export enum ReviewVisibility {
  public = 'public',
  private = 'private',
  hidden = 'hidden'
}

// Dispute-related enums
export enum DisputeStatus {
  open = 'open',
  in_review = 'in_review',
  resolved = 'resolved',
  closed = 'closed',
  // legacy / detailed statuses
  under_review = 'under_review',
  resolved_refund_full = 'resolved_refund_full',
  resolved_no_refund = 'resolved_no_refund',
  resolved_refund_partial = 'resolved_refund_partial',
  canceled = 'canceled'
}

export enum DisputeType {
  quality = 'quality',
  payment = 'payment',
  communication = 'communication',
  safety = 'safety',
  other = 'other'
  ,
  // legacy
  no_show = 'no_show'
}

// Notification-related enums
export enum NotificationType {
  task_created = 'task_created',
  offer_received = 'offer_received',
  offer_accepted = 'offer_accepted',
  message_received = 'message_received',
  booking_confirmed = 'booking_confirmed',
  payment_received = 'payment_received',
  review_received = 'review_received',
  system = 'system'
  ,
  // legacy / additional
  task_offer_received = 'task_offer_received',
  booking_reminder = 'booking_reminder',
  dispute_update = 'dispute_update'
}

export enum NotificationChannel {
  in_app = 'in_app',
  email = 'email',
  push = 'push',
  sms = 'sms'
}

export enum DeliveryStatus {
  pending = 'pending',
  sent = 'sent',
  delivered = 'delivered',
  failed = 'failed',
  read = 'read'
  ,
  queued = 'queued'
}

// Content/CMS-related enums
export enum PageStatus {
  draft = 'draft',
  published = 'published',
  archived = 'archived'
}

// Thread/Message-related enums
export enum ThreadStatus {
  active = 'active',
  archived = 'archived',
  closed = 'closed'
  ,
  // legacy
  open = 'open'
}

export enum MessageType {
  text = 'text',
  image = 'image',
  file = 'file',
  audio = 'audio',
  system = 'system'
}

export enum AttachmentKind {
  image = 'image',
  video = 'video',
  document = 'document',
  audio = 'audio',
  file = 'file'
}

// Device-related enums
export enum DevicePlatform {
  web = 'web',
  ios = 'ios',
  android = 'android'
}

// Additional types referenced in data.ts
export type Offer = {
  id: string;
  taskId: string;
  providerId: string;
  amount: number;
  message: string;
  status: OfferStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  // allow linked task for mock objects
  task?: any;
  // legacy mock object reference
  provider?: any;
  // legacy proposed price field used in fixtures
  proposedPrice?: number;
  // expiration field used in admin pages
  expiresAt?: string | Date;
};

export type ServiceCategory = {
  id: string;
  name: string | Record<string, string>;
  icon: string;
  description?: string | Record<string, string>;
  slug?: string;
  isActive?: boolean;
  displayOrder?: number;
  recommendedPriceMin?: number;
  recommendedPriceMax?: number;
  targetCities?: string[];
  internalNotes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type ServiceCategoryCreation = Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'>;


export type Transfer = {
  id: string;
  amount: number;
  currency: string;
  status: TransferStatus;
  fromUserId?: string;
  toUserId?: string;
  taskId?: string;
  // optional legacy fields in mocks
  bookingId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  // legacy mock object reference
  provider?: any;
  // legacy transfer identifier in fixtures
  transferId?: string;
};

export type Payout = {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  userId: string;
  // legacy field in mocks
  providerId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  // legacy mock object reference
  provider?: any;
  // legacy payout identifier in fixtures
  payoutId?: string;
  // optional legacy arrival date used in fixtures
  arrivalDate?: string | Date;
};

export type Review = {
  id: string;
  taskId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment?: string;
  visibility: ReviewVisibility;
  createdAt: string | Date;
  updatedAt: string | Date;
  // optional legacy fields
  bookingId?: string;
  // legacy mock object reference
  reviewer?: any;
  // alternate fixture key
  revieweeId?: string;
  // legacy reviewee object reference
  reviewee?: any;
};

export type Dispute = {
  id: string;
  taskId: string;
  bookingId?: string;
  raisedById: string;
  againstUserId: string;
  type: DisputeType;
  status: DisputeStatus;
  description: string;
  resolution?: string;
  // legacy field used in fixtures
  openedById?: string;
  // legacy object reference used in fixtures
  openedBy?: any;
  // legacy resolved time
  resolvedAt?: string | Date;
  // legacy assigned admin
  assignedTo?: any;
  assignedToId?: string;
  // legacy attachments array
  attachments?: any[];
  // legacy booking object reference
  booking?: any;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  // legacy payload field
  payload?: Record<string, any>;
  channels: NotificationChannel[];
  // legacy singular channel in fixtures
  channel?: NotificationChannel;
  deliveryStatus: DeliveryStatus;
  read: boolean;
  readAt?: string | Date;
  createdAt: string | Date;
  updatedAt?: string | Date;
  // legacy helper reference used in mock fixtures
  user?: any;
  // legacy sentAt timestamp in fixtures
  sentAt?: string | Date;
};

export type ContentPage = {
  id: string;
  slug: string;
  // localized content (prefer object with locales)
  title: Record<string, string>;
  content: Record<string, string>;
  // legacy seo fields in fixtures
  seoTitle?: string | Record<string, string>;
  seoDescription?: string | Record<string, string>;
  status: PageStatus;
  authorId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  publishedAt?: string | Date;
  // arbitrary indexing flag used in fixtures
  isIndexed?: boolean;
};

export type Thread = {
  id: string;
  participants: string[];
  // helper used in mocks to attach resolved participant data
  participantsData?: any[];
  taskId?: string;
  status: ThreadStatus;
  lastMessageAt: string | Date;
  // legacy helper used in fixtures
  lastMessage?: any;
  // legacy attached task used in fixtures
  task?: any;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string | Date;
  mimeType?: string;
  progress?: number;
  error?: string;
  filename?: string; // legacy alias for name
  kind?: AttachmentKind; // type of attachment
}

export type Device = {
  id: string;
  userId: string;
  platform: DevicePlatform;
  token: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

// WebRTC Types
export type CallSignal = {
  sdp: string;
  type: RTCSdpType;
};

export type IceCandidateSignal = {
  candidate: string;
  sdpMLineIndex: number | null;
  sdpMid: string | null;
};
