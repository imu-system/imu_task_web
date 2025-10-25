

import { Task, User, Offer, UserStatus, KYCStatus, TaskStatus, ServiceCategory, OfferStatus, TaskVisibility, ServiceCategoryCreation, Transfer, TransferStatus, Payout, PayoutStatus, Review, ReviewVisibility, Booking, Dispute, DisputeStatus, DisputeType, UserRole, Notification, NotificationType, NotificationChannel, DeliveryStatus, ContentPage, PageStatus, Thread, ThreadStatus, Message, MessageType, Attachment, AttachmentKind, Device, DevicePlatform } from './types';
import { db } from './firebase';
import { collection, query, where, getDocs, onSnapshot, Unsubscribe, doc, getDoc, addDoc, serverTimestamp, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';


export const users: User[] = [
    {
        id: 'user1',
        email: 'anne-marie.dupont@email.com',
        profile: {
            displayName: 'Anne-Marie Dupont',
            photoUrl: 'https://picsum.photos/id/1027/100/100',
            userId: 'user1',
            languages: ['Français'],
            averageRating: 4.5,
            reviewsCount: 12,
            skills: ['Organisation'],
            verifiedBadges: ['ID Verified'],
            createdAt: '',
            updatedAt: ''
        },
        roles: [UserRole.client],
        status: UserStatus.active,
        KYCStatus: KYCStatus.not_required,
        createdAt: '',
        updatedAt: ''
    },
    {
        id: 'user2',
        email: 'lucas.bernard@email.com',
        profile: {
            displayName: 'Lucas Bernard',
            photoUrl: 'https://picsum.photos/id/1005/100/100',
            userId: 'user2',
            languages: ['Français', 'Anglais'],
            averageRating: 4.8,
            reviewsCount: 25,
            skills: ['Jardinage', 'Bricolage'],
            verifiedBadges: ['ID Verified', 'Payment Verified'],
            createdAt: '',
            updatedAt: ''
        },
        roles: [UserRole.provider],
        status: UserStatus.active,
        KYCStatus: KYCStatus.verified,
        createdAt: '',
        updatedAt: ''
    },
    {
        id: 'user3',
        email: 'chloe.petit@email.com',
        profile: {
            displayName: 'Chloé Petit',
            photoUrl: 'https://picsum.photos/id/1011/100/100',
            userId: 'user3',
            languages: ['Français'],
            averageRating: 4.9,
            reviewsCount: 38,
            skills: ['Courses', 'Ménage'],
            verifiedBadges: ['ID Verified', 'Payment Verified'],
            createdAt: '',
            updatedAt: ''
        },
        roles: [UserRole.provider],
        status: UserStatus.active,
        KYCStatus: KYCStatus.verified,
        createdAt: '',
        updatedAt: ''
    },
    {
        id: 'user4',
        email: 'marc.dubois@email.com',
        profile: {
            displayName: 'Marc Dubois',
            photoUrl: 'https://picsum.photos/id/1012/100/100',
            userId: 'user4',
            languages: ['Français'],
            averageRating: 4.2,
            reviewsCount: 5,
            skills: [],
            verifiedBadges: ['ID Verified'],
            createdAt: '',
            updatedAt: ''
        },
        roles: [UserRole.client],
        status: UserStatus.active,
        KYCStatus: KYCStatus.not_required,
        createdAt: '',
        updatedAt: ''
    },
    {
        id: 'user5',
        email: 'moderator.emma@email.com',
        profile: {
            displayName: 'Emma Moreau (Support)',
            photoUrl: 'https://picsum.photos/id/1015/100/100',
            userId: 'user5',
            languages: ['Français', 'Anglais'],
            averageRating: 0,
            reviewsCount: 0,
            skills: [],
            verifiedBadges: [],
            createdAt: '',
            updatedAt: ''
        },
        roles: [UserRole.moderator],
        status: UserStatus.active,
        KYCStatus: KYCStatus.not_required,
        createdAt: '',
        updatedAt: ''
    }
];


export const getTasks = (): Task[] => [
    {
        id: 'task1',
        title: 'Aide pour les courses hebdomadaires',
        description: "J'ai besoin de quelqu'un pour aller chercher mes courses au supermarché et me les livrer à domicile. La liste sera fournie. Idéalement une personne véhiculée.",
        categoryId: 'groceries',
        location: 'Metz, France',
        timeWindowStart: new Date('2024-08-15T10:00:00'),
        timeWindowEnd: new Date('2024-08-15T12:00:00'),
        priceOffered: 25,
        clientId: 'user1',
        client: users.find(u => u.id === 'user1')!,
        status: TaskStatus.published,
        addressId: '',
        latitude: 0,
        longitude: 0,
        attachments: [],
        visibility: TaskVisibility.public,
        createdAt: '',
        updatedAt: ''
    },
    {
        id: 'task2',
        title: 'Tondre la pelouse et désherber',
        description: "Mon jardin a besoin d'un bon rafraîchissement. Il faut tondre la pelouse (environ 50m²) et enlever les mauvaises herbes des parterres de fleurs.",
        categoryId: 'gardening',
        location: 'Montigny-lès-Metz, France',
        timeWindowStart: new Date('2024-08-16T14:00:00'),
        timeWindowEnd: new Date('2024-08-16T17:00:00'),
        priceOffered: 40,
        clientId: 'user4',
        client: users.find(u => u.id === 'user4')!,
        status: TaskStatus.published,
        addressId: '',
        latitude: 0,
        longitude: 0,
        attachments: [],
        visibility: TaskVisibility.public,
        createdAt: '',
        updatedAt: ''
    },
    {
        id: 'task3',
        title: "Installer une nouvelle étagère murale",
        description: "Je ne suis pas très bricoleur et j'ai besoin d'aide pour fixer solidement une étagère dans mon salon. J'ai déjà l'étagère et les vis.",
        categoryId: 'handyman',
        location: 'Metz, France',
        timeWindowStart: new Date('2024-08-18T11:00:00'),
        timeWindowEnd: new Date('2024-08-18T12:00:00'),
        priceOffered: 20,
        clientId: 'user1',
        client: users.find(u => u.id === 'user1')!,
        status: TaskStatus.matched,
        addressId: '',
        latitude: 0,
        longitude: 0,
        attachments: [],
        visibility: TaskVisibility.public,
        createdAt: '',
        updatedAt: ''
    },
    {
        id: 'task4',
        title: 'Promener mon chien pendant mes vacances',
        description: 'Je cherche une personne de confiance pour promener mon golden retriever, Oscar, deux fois par jour pendant une semaine.',
        categoryId: 'pet-care',
        location: 'Thionville, France',
        timeWindowStart: new Date('2024-08-20T09:00:00'),
        timeWindowEnd: new Date('2024-08-20T10:00:00'),
        priceOffered: 15,
        clientId: 'user4',
        client: users.find(u => u.id === 'user4')!,
        status: TaskStatus.completed,
        addressId: '',
        latitude: 0,
        longitude: 0,
        attachments: [],
        visibility: TaskVisibility.public,
        createdAt: '',
        updatedAt: ''
    },
    {
        id: 'task5',
        title: 'Configurer une nouvelle imprimante',
        description: "Je viens d'acheter une nouvelle imprimante Wi-Fi et je n'arrive pas à la connecter à mon ordinateur. J'aurais besoin d'un coup de main.",
        categoryId: 'digital-assistance',
        location: 'Metz, France',
        timeWindowStart: new Date('2024-08-22T16:00:00'),
        timeWindowEnd: new Date('2024-08-22T18:00:00'),
        priceOffered: 30,
        clientId: 'user1',
        client: users.find(u => u.id === 'user1')!,
        status: TaskStatus.published,
        addressId: '',
        latitude: 0,
        longitude: 0,
        attachments: [],
        visibility: TaskVisibility.public,
        createdAt: '',
        updatedAt: ''
    },
];

export async function createTask(taskData: Omit<Task, 'id' | 'client' | 'status' | 'createdAt' | 'updatedAt' | 'latitude' | 'longitude' | 'attachments' | 'visibility' | 'category' | 'bookings'>) {
    const docRef = await addDoc(collection(db, "tasks"), {
        ...taskData,
        status: 'published',
        visibility: 'public',
        attachments: [],
        latitude: 0, // Placeholder
        longitude: 0, // Placeholder
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return docRef.id;
}

export async function createServiceCategory(categoryData: ServiceCategoryCreation) {
    const docRef = await addDoc(collection(db, "serviceCategories"), {
        ...categoryData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateServiceCategory(id: string, categoryData: Partial<ServiceCategory>) {
    const docRef = doc(db, 'serviceCategories', id);
    await updateDoc(docRef, {
        ...categoryData,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteServiceCategory(id: string) {
    await deleteDoc(doc(db, "serviceCategories", id));
}

export async function duplicateServiceCategory(id: string) {
    const docRef = doc(db, "serviceCategories", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data() as ServiceCategory;
        const newSlug = `${data.slug}-copy`;

        // We only need the creation data, not the full object with id, etc.
        const { id: categoryId, createdAt, updatedAt, ...creationData } = data;

        await createServiceCategory({
            ...creationData,
            slug: newSlug,
            name: Object.fromEntries(
                Object.entries(data.name).map(([lang, value]) => [lang, `${value} (Copie)`])
            ),
        });

    } else {
        throw new Error("Category not found");
    }
}

export const getOffers = (): Offer[] => [
    {
        id: 'offer1',
        taskId: 'task1',
        task: getTasks().find(t => t.id === 'task1'),
        providerId: 'user2',
        provider: users.find(u => u.id === 'user2')!,
        message: 'Bonjour, je suis disponible et véhiculé. Je peux faire vos courses cet après-midi si vous le souhaitez.',
        amount: 25,
        proposedPrice: 25,
        status: OfferStatus.pending,
        expiresAt: new Date('2024-08-30T23:59:59'),
        createdAt: '',
        updatedAt: ''
    },
    {
        id: 'offer2',
        taskId: 'task1',
        task: getTasks().find(t => t.id === 'task1'),
        providerId: 'user3',
        provider: users.find(u => u.id === 'user3')!,
        message: "Bonjour, j'habite juste à côté et je serais ravie de vous aider pour vos courses. Je suis disponible demain matin.",
        amount: 23,
        proposedPrice: 23,
        status: OfferStatus.pending,
        expiresAt: new Date('2024-08-30T23:59:59'),
        createdAt: '',
        updatedAt: ''
    },
    {
        id: 'offer3',
        taskId: 'task3',
        task: getTasks().find(t => t.id === 'task3'),
        providerId: 'user2',
        provider: users.find(u => u.id === 'user2')!,
        message: "Bonjour, j'ai tout le matériel nécessaire pour fixer votre étagère solidement. Je peux passer dans l'après-midi.",
        amount: 20,
        proposedPrice: 20,
        status: OfferStatus.accepted,
        expiresAt: new Date('2024-08-25T23:59:59'),
        createdAt: '',
        updatedAt: ''
    },
    {
        id: 'offer4',
        taskId: 'task2',
        task: getTasks().find(t => t.id === 'task2'),
        providerId: 'user3',
        provider: users.find(u => u.id === 'user3')!,
        message: "Le jardinage c'est ma passion ! Je serais heureux de m'occuper de votre jardin.",
        amount: 45,
        proposedPrice: 45,
        status: OfferStatus.declined,
        expiresAt: new Date('2024-08-20T23:59:59'),
        createdAt: '',
        updatedAt: ''
    },
];

export const getOffersForTask = (taskId: string): Offer[] => {
    return getOffers().filter(o => o.taskId === taskId);
};

export const getTransfers = (): Transfer[] => [
    {
        id: 'tr_1',
        bookingId: 'booking2',
        provider: users.find(u => u.id === 'user3')!,
        transferId: 'tr_3PjY4oLqgLzJ7fV01ABCDEFG',
        amount: 1380, // 1500 - 150 - 70
        currency: 'eur',
        status: TransferStatus.succeeded,
        createdAt: '2024-08-20T10:10:00Z',
        updatedAt: '2024-08-20T10:10:00Z',
    },
    {
        id: 'tr_2',
        bookingId: 'booking3',
        provider: users.find(u => u.id === 'user2')!,
        transferId: 'tr_3PkZ5tLqgLzJ7fV01HIJKLMN',
        amount: 3030, // 3500 - 350 - 120
        currency: 'eur',
        status: TransferStatus.pending,
        createdAt: '2024-08-21T11:05:00Z',
        updatedAt: '2024-08-21T11:05:00Z',
    },
];

export const getPayouts = (): Payout[] => [
    {
        id: 'po_1',
        userId: 'user3',
        providerId: 'user3',
        provider: users.find(u => u.id === 'user3')!,
        payoutId: 'po_1PkWaTLqgLzJ7fV0123ABCD',
        amount: 1380,
        currency: 'eur',
        status: PayoutStatus.paid,
        arrivalDate: new Date('2024-08-22T00:00:00Z'),
        createdAt: '2024-08-21T12:00:00Z',
        updatedAt: '2024-08-21T12:00:00Z',
    },
    {
        id: 'po_2',
        userId: 'user2',
        providerId: 'user2',
        provider: users.find(u => u.id === 'user2')!,
        payoutId: 'po_1PlXbULqgLzJ7fV0456EFGH',
        amount: 3030,
        currency: 'eur',
        status: PayoutStatus.in_transit,
        arrivalDate: new Date('2024-08-24T00:00:00Z'),
        createdAt: '2024-08-22T14:00:00Z',
        updatedAt: '2024-08-22T14:00:00Z',
    },
    {
        id: 'po_3',
        userId: 'user2',
        providerId: 'user2',
        provider: users.find(u => u.id === 'user2')!,
        payoutId: 'po_1PmYcVLqgLzJ7fV0789IJKL',
        amount: 5500,
        currency: 'eur',
        status: PayoutStatus.pending,
        arrivalDate: new Date('2024-08-26T00:00:00Z'),
        createdAt: '2024-08-23T10:00:00Z',
        updatedAt: '2024-08-23T10:00:00Z',
    },
];

export const getReviews = (): Review[] => [
    {
        id: 'rev1',
        bookingId: 'booking2',
        taskId: 'task4',
        reviewerId: 'user4',
        reviewer: users.find(u => u.id === 'user4')!,
        reviewedUserId: 'user3',
        revieweeId: 'user3',
        reviewee: users.find(u => u.id === 'user3')!,
        rating: 5,
        comment: 'Chloé a été fantastique avec mon chien Oscar. Très professionnelle et ponctuelle. Je recommande vivement !',
        visibility: ReviewVisibility.public,
        createdAt: new Date('2024-08-21T10:00:00Z'),
        updatedAt: new Date('2024-08-21T10:00:00Z'),
    },
    {
        id: 'rev2',
        bookingId: 'booking2',
        taskId: 'task4',
        reviewerId: 'user3',
        reviewer: users.find(u => u.id === 'user3')!,
        reviewedUserId: 'user4',
        revieweeId: 'user4',
        reviewee: users.find(u => u.id === 'user4')!,
        rating: 5,
        comment: 'Marc a été un client très agréable, et Oscar est adorable. Mission parfaite.',
        visibility: ReviewVisibility.public,
        createdAt: new Date('2024-08-21T11:00:00Z'),
        updatedAt: new Date('2024-08-21T11:00:00Z'),
    },
    {
        id: 'rev3',
        bookingId: 'booking1',
        taskId: 'task3',
        reviewerId: 'user1',
        reviewer: users.find(u => u.id === 'user1')!,
        reviewedUserId: 'user2',
        revieweeId: 'user2',
        reviewee: users.find(u => u.id === 'user2')!,
        rating: 4,
        comment: "Lucas a bien installé l'étagère, mais il est arrivé un peu en retard.",
        visibility: ReviewVisibility.public,
        createdAt: new Date('2024-08-19T14:00:00Z'),
        updatedAt: new Date('2024-08-19T14:00:00Z'),
    }
];

export const getReviewById = (id: string): Review | undefined => {
    return getReviews().find(r => r.id === id);
}

export const getDisputes = (): Dispute[] => [
    {
        id: 'dispute1',
        taskId: 'task3',
        bookingId: 'booking1',
        raisedById: 'user1',
        againstUserId: 'user2',
        openedById: 'user1',
        openedBy: users.find(u => u.id === 'user1')!,
        type: DisputeType.quality,
        description: "L'étagère n'est pas droite et semble peu solide. Je ne suis pas satisfait du travail.",
        attachments: ['https://picsum.photos/seed/shelf_dispute/600/400'],
        status: DisputeStatus.open,
        assignedToId: undefined,
        assignedTo: undefined,
        createdAt: new Date('2024-08-19T18:00:00Z'),
        updatedAt: new Date('2024-08-19T18:00:00Z'),
    },
    {
        id: 'dispute2',
        taskId: 'task4',
        bookingId: 'booking2',
        raisedById: 'user4',
        againstUserId: 'user3',
        openedById: 'user4',
        openedBy: users.find(u => u.id === 'user4')!,
        type: DisputeType.no_show,
        description: "Le prestataire ne s'est jamais présenté pour la promenade du chien du matin. J'ai dû trouver une solution d'urgence.",
        attachments: [],
        status: DisputeStatus.under_review,
        assignedToId: 'user5',
        assignedTo: users.find(u => u.id === 'user5'),
        createdAt: new Date('2024-08-20T10:00:00Z'),
        updatedAt: new Date('2024-08-20T11:30:00Z'),
    },
    {
        id: 'dispute3',
        taskId: 'task5',
        bookingId: 'booking3',
        raisedById: 'user2',
        againstUserId: 'user1',
        openedById: 'user2',
        openedBy: users.find(u => u.id === 'user2')!,
        type: DisputeType.other,
        description: "Le client a changé la nature de la mission à mon arrivée, demandant beaucoup plus de travail que prévu pour le même prix. Nous n'avons pas trouvé d'accord.",
        attachments: [],
        status: DisputeStatus.resolved_refund_full,
        assignedToId: 'user5',
        assignedTo: users.find(u => u.id === 'user5'),
        resolvedAt: new Date('2024-08-23T15:00:00Z'),
        createdAt: new Date('2024-08-22T09:00:00Z'),
        updatedAt: new Date('2024-08-23T15:00:00Z'),
    }
];

export const getDisputeById = (id: string): Dispute | undefined => {
    return getDisputes().find(d => d.id === id);
}

export const getNotifications = (): Notification[] => [
    {
        id: 'notif1',
        userId: 'user1',
        user: users.find(u => u.id === 'user1'),
        type: NotificationType.task_offer_received,
        title: 'Nouvelle proposition reçue',
        message: 'Chloé Petit a fait une proposition pour votre tâche',
        channels: [NotificationChannel.in_app],
        channel: NotificationChannel.in_app,
        deliveryStatus: DeliveryStatus.sent,
        read: true,
        sentAt: new Date('2024-08-25T10:00:00Z'),
        readAt: new Date('2024-08-25T10:05:00Z'),
        createdAt: new Date('2024-08-25T10:00:00Z'),
        updatedAt: new Date('2024-08-25T10:00:00Z'),
        payload: {
            taskId: 'task1',
            offerId: 'offer2',
            providerName: 'Chloé Petit',
        }
    },
    {
        id: 'notif2',
        userId: 'user2',
        user: users.find(u => u.id === 'user2'),
        type: NotificationType.offer_accepted,
        title: 'Proposition acceptée',
        message: 'Votre proposition a été acceptée par Anne-Marie Dupont',
        channels: [NotificationChannel.email],
        channel: NotificationChannel.email,
        deliveryStatus: DeliveryStatus.sent,
        read: false,
        sentAt: new Date('2024-08-25T11:00:00Z'),
        createdAt: new Date('2024-08-25T11:00:00Z'),
        updatedAt: new Date('2024-08-25T11:00:00Z'),
        payload: {
            taskId: 'task3',
            taskTitle: "Installer une nouvelle étagère murale",
            clientName: 'Anne-Marie Dupont',
        }
    },
    {
        id: 'notif3',
        userId: 'user4',
        user: users.find(u => u.id === 'user4'),
        type: NotificationType.booking_reminder,
        title: 'Rappel de réservation',
        message: 'N\'oubliez pas votre réservation demain à 9h',
        channels: [NotificationChannel.push],
        channel: NotificationChannel.push,
        deliveryStatus: DeliveryStatus.queued,
        read: false,
        sentAt: new Date('2024-08-26T09:00:00Z'),
        createdAt: new Date('2024-08-26T09:00:00Z'),
        updatedAt: new Date('2024-08-26T09:00:00Z'),
        payload: {
            bookingId: 'booking2',
            taskTitle: 'Promener mon chien pendant mes vacances',
            startTime: '2024-08-27T09:00:00Z'
        }
    },
    {
        id: 'notif4',
        userId: 'user1',
        user: users.find(u => u.id === 'user1'),
        type: NotificationType.dispute_update,
        title: 'Mise à jour du litige',
        message: 'Le statut de votre litige a été mis à jour',
        channels: [NotificationChannel.in_app],
        channel: NotificationChannel.in_app,
        deliveryStatus: DeliveryStatus.failed,
        read: false,
        sentAt: new Date('2024-08-24T14:00:00Z'),
        createdAt: new Date('2024-08-24T14:00:00Z'),
        updatedAt: new Date('2024-08-24T14:00:00Z'),
        payload: {
            disputeId: 'dispute1',
            newStatus: 'under_review'
        }
    },
];

export const getNotificationById = (id: string): Notification | undefined => {
    return getNotifications().find(n => n.id === id);
}

export const getPages = (): ContentPage[] => [
    {
        id: 'page1',
        slug: 'a-propos',
        title: { fr: 'À Propos de Nous', en: 'About Us' },
        content: { fr: 'Contenu de la page à propos...', en: 'Content of the about page...' },
        status: PageStatus.published,
        seoTitle: { fr: 'À Propos de ImuTask', en: 'About ImuTask' },
        seoDescription: { fr: 'Découvrez notre mission.', en: 'Discover our mission.' },
        isIndexed: true,
        publishedAt: new Date('2023-01-01T12:00:00Z'),
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-10T14:00:00Z')
    },
    {
        id: 'page2',
        slug: 'comment-ca-marche',
        title: { fr: 'Comment ça marche ?', en: 'How it works?' },
        content: { fr: 'Contenu de la page...', en: 'Content of the page...' },
        status: PageStatus.published,
        seoTitle: { fr: 'Comment fonctionne ImuTask', en: 'How ImuTask works' },
        seoDescription: { fr: 'Guide étape par étape.', en: 'Step-by-step guide.' },
        isIndexed: true,
        publishedAt: new Date('2023-01-02T12:00:00Z'),
        createdAt: new Date('2023-01-02T10:00:00Z'),
        updatedAt: new Date('2023-01-02T10:00:00Z')
    },
    {
        id: 'page3',
        slug: 'presse',
        title: { fr: 'Espace Presse', en: 'Press Area' },
        content: { fr: 'Contenu de la page presse...', en: 'Content of the press page...' },
        status: PageStatus.draft,
        seoTitle: { fr: 'Espace Presse', en: 'Press Area' },
        seoDescription: { fr: 'Contactez notre équipe de presse.', en: 'Contact our press team.' },
        isIndexed: false,
        createdAt: new Date('2023-02-15T09:00:00Z'),
        updatedAt: new Date('2023-02-20T11:30:00Z')
    }
];

const mockMessages: Message[] = [
    { id: 'msg1', threadId: 'thread1', senderId: 'user2', body: 'Bonjour, je suis intéressé par votre mission de jardinage. Je suis disponible demain.', type: MessageType.text, sentAt: new Date('2024-08-27T10:00:00Z') },
    { id: 'msg2', threadId: 'thread1', senderId: 'user4', body: 'Bonjour Lucas, merci pour votre message. Demain 14h vous conviendrait ?', type: MessageType.text, sentAt: new Date('2024-08-27T10:05:00Z') },
    { id: 'msg3', threadId: 'thread1', senderId: 'user2', body: 'Parfait pour moi !', type: MessageType.text, sentAt: new Date('2024-08-27T10:06:00Z') },
    {
        id: 'msg4',
        threadId: 'thread2',
        senderId: 'user3',
        type: MessageType.image,
        body: 'Voici une photo du jardin actuel.',
        attachments: [{
            id: 'att1',
            url: 'https://picsum.photos/seed/garden1/400/300',
            kind: AttachmentKind.image,
            filename: 'jardin_actuel.jpg',
            size: 123456,
            mimeType: 'image/jpeg',
            uploadedBy: 'user3',
            uploadedAt: new Date('2024-08-27T10:07:00Z')
        }],
        sentAt: new Date('2024-08-27T10:07:00Z')
    },
    {
        id: 'msg5',
        threadId: 'thread2',
        senderId: 'user1',
        body: 'Merci pour la photo. Voici le devis.',
        type: MessageType.file,
        attachments: [{
            id: 'att2',
            url: '#',
            kind: AttachmentKind.file,
            filename: 'devis_jardinage.pdf',
            size: 78912,
            mimeType: 'application/pdf',
            uploadedBy: 'user1',
            uploadedAt: new Date('2024-08-27T10:08:00Z')
        }],
        sentAt: new Date('2024-08-27T10:08:00Z')
    },
    { id: 'msg6', threadId: 'thread3', senderId: 'user2', body: "Bonjour Marc, je suis disponible pour promener Oscar. J'adore les chiens !", type: MessageType.text, sentAt: new Date('2024-08-19T15:00:00Z') },
    { id: 'msg7', threadId: 'thread3', senderId: 'user4', body: "Super ! On peut s'appeler pour en discuter ?", type: MessageType.text, sentAt: new Date('2024-08-19T15:05:00Z') },
    { id: 'msg8', threadId: 'thread4', senderId: 'user1', body: "Bonjour, je n'arrive pas à ajouter une nouvelle adresse sur mon profil.", type: MessageType.text, sentAt: new Date('2024-08-28T09:00:00Z') },
    { id: 'msg9', threadId: 'thread4', senderId: 'user5', body: "Bonjour Anne-Marie, je suis Emma du support. Pouvez-vous me décrire l'erreur que vous rencontrez ?", type: MessageType.text, sentAt: new Date('2024-08-28T09:02:00Z') },
    {
        id: 'msg10',
        threadId: 'thread2',
        senderId: 'user3',
        body: 'Audio pour confirmer.',
        type: MessageType.audio,
        attachments: [{
            id: 'att3',
            url: '#',
            kind: AttachmentKind.audio,
            filename: 'confirmation.mp3',
            size: 54321,
            mimeType: 'audio/mpeg',
            uploadedBy: 'user3',
            uploadedAt: new Date('2024-08-27T10:09:00Z')
        }],
        sentAt: new Date('2024-08-27T10:09:00Z')
    },

];

export var mockThreads: Thread[] = [
    {
        id: 'thread1',
        taskId: 'task2',
        participants: ['user4', 'user2'],
        participantsData: [users.find(u => u.id === 'user4')!, users.find(u => u.id === 'user2')!],
        lastMessage: mockMessages.find(m => m.id === 'msg3')!,
        lastMessageAt: new Date('2024-08-27T10:06:00Z'),
        status: ThreadStatus.open,
        createdAt: new Date(),
        updatedAt: new Date(),
        task: getTasks().find(t => t.id === 'task2')!
    },
    {
        id: 'thread2',
        taskId: 'task1',
        participants: ['user1', 'user3'],
        participantsData: [users.find(u => u.id === 'user1')!, users.find(u => u.id === 'user3')!],
        lastMessage: mockMessages.find(m => m.id === 'msg10')!,
        lastMessageAt: new Date('2024-08-27T10:09:00Z'),
        status: ThreadStatus.open,
        createdAt: new Date(),
        updatedAt: new Date(),
        task: getTasks().find(t => t.id === 'task1')!
    },
    {
        id: 'thread3',
        taskId: 'task4',
        participants: ['user4', 'user1'],
        participantsData: [users.find(u => u.id === 'user4')!, users.find(u => u.id === 'user1')!],
        lastMessage: mockMessages.find(m => m.id === 'msg7')!,
        lastMessageAt: new Date('2024-08-19T15:05:00Z'),
        status: ThreadStatus.archived,
        createdAt: new Date(),
        updatedAt: new Date(),
        task: getTasks().find(t => t.id === 'task4')!
    },
    {
        id: 'thread4',
        participants: ['user1', 'user5'],
        participantsData: [users.find(u => u.id === 'user1')!, users.find(u => u.id === 'user5')!],
        lastMessage: mockMessages.find(m => m.id === 'msg9')!,
        lastMessageAt: new Date('2024-08-28T09:02:00Z'),
        status: ThreadStatus.open,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];


export const getThreadsForUser = (userId: string, callback: (threads: Thread[]) => void): Unsubscribe => {
    const q = query(collection(db, 'threads'), where('participants', 'array-contains', userId));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const threadsData: Thread[] = await Promise.all(snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const lastMessage = data.lastMessage || {};

            // Populate participantsData
            const participantsData = await Promise.all(
                data.participants.map(async (id: string) => {
                    const userRef = doc(db, 'users', id);
                    const userSnap = await getDoc(userRef);
                    return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
                })
            );

            // Populate task data
            let taskData = null;
            if (data.taskId) {
                const taskRef = doc(db, 'tasks', data.taskId);
                const taskSnap = await getDoc(taskRef);
                if (taskSnap.exists()) {
                    taskData = taskSnap.data();
                }
            }

            return {
                id: docSnap.id,
                ...data,
                participantsData: participantsData.filter(Boolean),
                task: taskData,
                lastMessageAt: (data.lastMessageAt as Timestamp)?.toDate ? (data.lastMessageAt as Timestamp).toDate() : new Date(),
                lastMessage: {
                    ...lastMessage,
                    sentAt: (lastMessage.sentAt as Timestamp)?.toDate ? (lastMessage.sentAt as Timestamp).toDate() : new Date(),
                }
            } as Thread;
        }));

        // Sort by most recent message
        threadsData.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        callback(threadsData);
    });

    return unsubscribe;
}

export const getThreadById = (threadId: string): Thread | undefined => {
    const thread = mockThreads.find(t => t.id === threadId);
    if (thread) {
        // Populate participantsData if not already
        thread.participantsData = thread.participants.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
    }
    return thread;
}

export const getMessagesForThread = (threadId: string): Message[] => {
    return mockMessages.filter(m => m.threadId === threadId).sort((a, b) => {
        const dateA = a.sentAt ? new Date(a.sentAt).getTime() : 0;
        const dateB = b.sentAt ? new Date(b.sentAt).getTime() : 0;
        return dateA - dateB;
    });
}

export const getTaskTemplateById = (templateId: string) => {
    const mockTemplates = [
        { id: 'tpl1', name: 'Courses hebdomadaires', category: 'Courses', address: '123 Rue Principale, 75001 Paris, France', description: 'Faire les courses pour la semaine selon la liste fournie.', price: 20 },
        { id: 'tpl2', name: 'Nettoyage Airbnb', category: 'Nettoyage', address: '24 Rue de la Paix, Lyon', description: 'Nettoyage complet de l\'appartement entre deux locations.', price: 50 },
        { id: 'tpl3', name: 'Visite hebdomadaire à Mamie', category: 'Visites', address: '7 Avenue Foch, Metz', description: 'Passer du temps, discuter et vérifier que tout va bien.', price: 15 },
    ];
    return mockTemplates.find(t => t.id === templateId);
};
