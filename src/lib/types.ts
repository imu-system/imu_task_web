
// Types partagés pour le monorepo (générés d'après le schéma Prisma)
// GitHub Copilot

// Enums (valeurs telles qu'elles figurent dans le schéma Prisma)
export enum UserRole {
    client = 'client',
    provider = 'provider',
    admin = 'admin',
    moderator = 'moderator',
}

export enum UserStatus {
    active = 'active',
    suspended = 'suspended',
    closed = 'closed',
}

export enum KYCStatus {
    not_required = 'not_required',
    required = 'required',
    pending = 'pending',
    verified = 'verified',
    rejected = 'rejected',
}

export enum TaskVisibility {
    public = 'public',
    restricted = 'restricted',
}

export enum TaskStatus {
    draft = 'draft',
    published = 'published',
    matched = 'matched',
    in_progress = 'in_progress',
    completed = 'completed',
    canceled = 'canceled',
}

export enum OfferStatus {
    pending = 'pending',
    accepted = 'accepted',
    declined = 'declined',
    expired = 'expired',
    withdrawn = 'withdrawn',
}

export enum BookingStatus {
    scheduled = 'scheduled',
    in_progress = 'in_progress',
    completed = 'completed',
    no_show_client = 'no_show_client',
    no_show_provider = 'no_show_provider',
    canceled = 'canceled',
}

export enum PaymentStatus {
    requires_action = 'requires_action',
    authorized = 'authorized',
    captured = 'captured',
    canceled = 'canceled',
    failed = 'failed',
    refunded = 'refunded',
    partially_refunded = 'partially_refunded',
}

export enum TransferStatus {
    pending = 'pending',
    succeeded = 'succeeded',
    failed = 'failed',
    canceled = 'canceled',
}

export enum PayoutStatus {
    pending = 'pending',
    in_transit = 'in_transit',
    paid = 'paid',
    canceled = 'canceled',
    failed = 'failed',
}

export enum ReviewVisibility {
    public = 'public',
    hidden = 'hidden',
}

export enum DisputeType {
    no_show = 'no_show',
    quality = 'quality',
    delay = 'delay',
    other = 'other',
}

export enum DisputeStatus {
    open = 'open',
    under_review = 'under_review',
    resolved_refund_full = 'resolved_refund_full',
    resolved_refund_partial = 'resolved_refund_partial',
    resolved_no_refund = 'resolved_no_refund',
    canceled = 'canceled',
}

export enum NotificationType {
    task_offer_received = 'task_offer_received',
    offer_accepted = 'offer_accepted',
    booking_scheduled = 'booking_scheduled',
    booking_reminder = 'booking_reminder',
    payment_action_required = 'payment_action_required',
    dispute_update = 'dispute_update',
}

export enum NotificationChannel {
    in_app = 'in_app',
    push = 'push',
    email = 'email',
}

export enum DeliveryStatus {
    queued = 'queued',
    sent = 'sent',
    failed = 'failed',
}

export enum DevicePlatform {
    ios = 'ios',
    android = 'android',
    web = 'web',
}

export enum MessageType {
    text = 'text',
    system = 'system',
    image = 'image',
    file = 'file',
}

export enum ThreadStatus {
    open = 'open',
    locked = 'locked',
    archived = 'archived',
}

// Util type pour les DateTime retournés par Prisma (Date ou ISO string)
export type DateTime = string | Date;

// ----------------------------------------
// Models (interfaces)
// Les relations sont typées de façon basique (objet lié ou tableau d'objets).
// Selon l'usage, vous pouvez remplacer par des types contenant uniquement les IDs.
// ----------------------------------------

export interface User {
    id: string;
    email: string;
    emailVerifiedAt?: DateTime | null;
    phone?: string | null;
    phoneVerifiedAt?: DateTime | null;
    passwordHash?: string | null;
    roles: UserRole[]; // default [client]
    status: UserStatus; // default active
    KYCStatus: KYCStatus; // default not_required
    termsAcceptedAt?: DateTime | null;
    privacyAcceptedAt?: DateTime | null;

    createdAt: DateTime;
    updatedAt: DateTime;
    deletedAt?: DateTime | null;

    // Relations (optionnels pour éviter de forcer le peuplement)
    profile?: Profile | null;
    addresses?: Address[];
    devices?: Device[];
    auditLogs?: AuditLog[];
    tasksAsClient?: Task[];
    offersAsProvider?: Offer[];
    bookingsAsProvider?: Booking[];
    bookingsAsClient?: Booking[];
    reviewsGiven?: Review[];
    reviewsReceived?: Review[];
    disputesOpened?: Dispute[];
    disputesResolved?: Dispute[];
    payouts?: Payout[];
    availabilities?: Availability[];
    availabilityExceptions?: AvailabilityException[];
    notifications?: Notification[];
    messagesSent?: Message[];
    threads?: Thread[];
}

export interface Profile {
    userId: string;
    displayName: string;
    photoUrl?: string | null;
    bio?: string | null;
    languages: string[];
    city?: string | null;
    countryCode?: string | null;
    serviceRadiusKm?: number | null;
    averageRating: number;
    reviewsCount: number;
    skills: string[];
    verifiedBadges: string[];

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relation
    user?: User;
}

export interface Address {
    id: string;
    userId?: string | null;
    label?: string | null;
    formatted: string;
    street?: string | null;
    postalCode?: string | null;
    city: string;
    region?: string | null;
    countryCode: string;
    latitude: number;
    longitude: number;
    placeId?: string | null;
    isDefault: boolean;

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    user?: User | null;
    tasks?: Task[];
}

export interface ServiceCategory {
    id: string;
    slug: string;
    name: Record<string, string>;
    description?: Record<string, string>;
    icon?: string | null;
    isActive: boolean;
    displayOrder: number;
    recommendedPriceMin?: number | null;
    recommendedPriceMax?: number | null;
    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    tasks?: Task[];
}

export type ServiceCategoryCreation = Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>;


export interface ServiceCategoryI18n {
    id: string;
    categoryId: string;
    locale: string;
    name: string;
    description: string;

    // Relation
    category?: ServiceCategory;
}

export interface Task {
    id: string;
    clientId: string;
    categoryId: string;
    addressId: string;
    title: string;
    description: string;
    location: string;
    date: DateTime;
    price: number;
    latitude: number;
    longitude: number;
    timeWindowStart: DateTime;
    timeWindowEnd: DateTime;
    estimatedDurationMin?: number | null;
    priceOffered?: number | null;
    hourlyRate?: number | null;
    attachments: string[];
    visibility: TaskVisibility;
    status: TaskStatus;
    cancellationReason?: string | null;
    canceledBy?: string | null;

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    client?: User;
    category?: ServiceCategory;
    address?: Address;
    offers?: Offer[];
    booking?: Booking | null;
    threads?: Thread[];
}

export interface Offer {
    id: string;
    taskId: string;
    providerId: string;
    proposedPrice?: number | null;
    proposedHourlyRate?: number | null;
    message?: string | null;
    proposedSlotStart?: DateTime | null;
    proposedSlotEnd?: DateTime | null;
    status: OfferStatus;
    expiresAt: DateTime;

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    task?: Task;
    provider?: User;
}

export interface Booking {
    id: string;
    taskId: string;
    providerId: string;
    clientId: string;
    startAt: DateTime;
    endAt: DateTime;
    agreedAmount: number;
    currency: string;
    paymentIntentId: string;
    paymentStatus: PaymentStatus;
    status: BookingStatus;
    completionProof: string[];

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    task?: Task;
    provider?: User;
    client?: User;
    transaction?: Transaction | null;
    transfer?: Transfer | null;
    reviews?: Review[];
    dispute?: Dispute | null;
}

export interface Thread {
    id: string;
    taskId: string;
    lastMessageAt?: DateTime | null;
    status: ThreadStatus;

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    task?: Task;
    participants?: User[];
    messages?: Message[];
}

export interface Message {
    id: string;
    threadId: string;
    senderId: string;
    body: string;
    attachments: string[];
    type: MessageType;
    sentAt: DateTime;
    readAt?: DateTime | null;

    // Relations
    thread?: Thread;
    sender?: User;
}

export interface Transaction {
    id: string;
    bookingId: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    feesPlatform: number;
    feesStripe: number;
    status: PaymentStatus;
    capturedAt?: DateTime | null;
    refundedAt?: DateTime | null;

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    booking?: Booking;
}

export interface Transfer {
    id: string;
    bookingId: string;
    transferId: string;
    amount: number;
    currency: string;
    status: TransferStatus;
    executedAt?: DateTime | null;

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    booking?: Booking;
}

export interface Payout {
    id: string;
    providerId: string;
    payoutId: string;
    amount: number;
    currency: string;
    status: PayoutStatus;
    arrivalDate: DateTime;

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    provider?: User;
}

export interface Review {
    id: string;
    bookingId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment?: string | null;
    visibility: ReviewVisibility;

    createdAt: DateTime;

    // Relations
    booking?: Booking;
    reviewer?: User;
    reviewee?: User;
}

export interface Dispute {
    id: string;
    bookingId: string;
    openedById: string;
    type: DisputeType;
    description: string;
    attachments: string[];
    status: DisputeStatus;
    resolutionNote?: string | null;
    resolvedById?: string | null;
    resolvedAt?: DateTime | null;

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    booking?: Booking;
    openedBy?: User;
    resolvedBy?: User | null;
}

export interface Availability {
    id: string;
    providerId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    isActive: boolean;

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    provider?: User;
}

export interface AvailabilityException {
    id: string;
    providerId: string;
    date: DateTime; // YYYY-MM-DD
    isAvailable: boolean;
    note?: string | null;

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    provider?: User;
}

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    payload?: any | null; // Json
    deliveryStatus: DeliveryStatus;
    readAt?: DateTime | null;
    sentAt?: DateTime | null;

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    user?: User;
}

export interface Device {
    id: string;
    userId: string;
    platform: DevicePlatform;
    pushToken: string;
    lastActiveAt: DateTime;
    appVersion?: string | null;
    osVersion?: string | null;
    isRevoked: boolean;

    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    user?: User;
}

export interface AuditLog {
    id: string;
    actorUserId?: string | null;
    action: string;
    targetType: string;
    targetId: string;
    metadata?: any | null; // Json

    createdAt: DateTime;

    // Relations
    actor?: User | null;
}
