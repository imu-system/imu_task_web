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
  disputed = 'disputed'
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
  displayName: string;
  photoUrl?: string;
  userId: string;
  languages: string[];
  averageRating: number;
  reviewsCount: number;
  skills: string[];
  verifiedBadges: string[];
  bio?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
};

// User type with Profile
export type User = {
  id: string;
  email: string;
  profile: Profile;
  roles: UserRole[];
  status: UserStatus;
  KYCStatus: KYCStatus;
  createdAt: string;
  updatedAt: string;
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
  categoryId: string;
  description: string;
  category: string;
  location: string;
  adresse: Address;
  budget: number;
  status: 'Open' | 'In Progress' | 'Completed';
  clientId: string;
  timeWindowStart: Date;
  timeWindowEnd: Date;
  providerId?: string;
  createdAt: Date;
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
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Note: Full Message and Conversation types are defined in:
// - src/lib/firestore-messages.ts
// - src/lib/firestore-conversations.ts
// These are simplified versions for compatibility

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
};

export type Conversation = {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: Date;
};

// Task-related enums
export enum TaskStatus {
  draft = 'draft',
  published = 'published',
  matched = 'matched',
  in_progress = 'in_progress',
  completed = 'completed',
  cancelled = 'cancelled'
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
  withdrawn = 'withdrawn'
}

// Transfer-related enums
export enum TransferStatus {
  pending = 'pending',
  processing = 'processing',
  succeeded = 'succeeded',
  failed = 'failed',
  cancelled = 'cancelled'
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
  closed = 'closed'
}

export enum DisputeType {
  quality = 'quality',
  payment = 'payment',
  communication = 'communication',
  safety = 'safety',
  other = 'other'
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
}

export enum MessageType {
  text = 'text',
  image = 'image',
  file = 'file',
  system = 'system'
}

export enum AttachmentKind {
  image = 'image',
  video = 'video',
  document = 'document',
  audio = 'audio'
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
  createdAt: string;
  updatedAt: string;
};

export type ServiceCategory = {
  id: string;
  name: string;
  icon: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type ServiceCategoryCreation = Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'>;

export type Transfer = {
  id: string;
  amount: number;
  currency: string;
  status: TransferStatus;
  fromUserId: string;
  toUserId: string;
  taskId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Payout = {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type Review = {
  id: string;
  taskId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment?: string;
  visibility: ReviewVisibility;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  deliveryStatus: DeliveryStatus;
  read: boolean;
  createdAt: string;
};

export type ContentPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: PageStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type Thread = {
  id: string;
  participants: string[];
  taskId?: string;
  status: ThreadStatus;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
};

export type Attachment = {
  id: string;
  messageId: string;
  kind: AttachmentKind;
  url: string;
  filename: string;
  size: number;
  createdAt: string;
};

export type Device = {
  id: string;
  userId: string;
  platform: DevicePlatform;
  token: string;
  createdAt: string;
  updatedAt: string;
};
