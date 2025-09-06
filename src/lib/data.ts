


import { Task, User, Offer, UserStatus, KYCStatus, TaskStatus, ServiceCategory, OfferStatus, TaskVisibility, ServiceCategoryCreation, Transfer, TransferStatus, Payout, PayoutStatus, Review, ReviewVisibility, Booking, Dispute, DisputeStatus, DisputeType, UserRole } from './types';
import { db } from './firebase';
import { collection, query, where, getDocs, onSnapshot, Unsubscribe, doc, getDoc, addDoc, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';


export const users: User[] = [
  {
    id: 'user1',
    email: 'anne-marie.dupont@email.com',
    profile: {
      displayName: 'Anne-Marie Dupont',
      photoUrl: 'https://picsum.photos/id/1027/100/100',
      userId: '',
      languages: [],
      averageRating: 0,
      reviewsCount: 0,
      skills: [],
      verifiedBadges: [],
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
      userId: '',
      languages: [],
      averageRating: 0,
      reviewsCount: 0,
      skills: [],
      verifiedBadges: [],
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
      userId: '',
      languages: [],
      averageRating: 0,
      reviewsCount: 0,
      skills: [],
      verifiedBadges: [],
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
      userId: '',
      languages: [],
      averageRating: 0,
      reviewsCount: 0,
      skills: [],
      verifiedBadges: [],
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
      displayName: 'Emma Moreau',
      photoUrl: 'https://picsum.photos/id/1015/100/100',
      userId: '',
      languages: [],
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
    date: new Date('2024-08-15T10:00:00'),
    price: 25,
    clientId: 'user1',
    client: users.find(u => u.id === 'user1')!,
    status: TaskStatus.published,
    addressId: '',
    latitude: 0,
    longitude: 0,
    timeWindowStart: new Date(),
    timeWindowEnd: new Date(),
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
    date: new Date('2024-08-16T14:00:00'),
    price: 40,
    clientId: 'user4',
    client: users.find(u => u.id === 'user4')!,
    status: TaskStatus.published,
    addressId: '',
    latitude: 0,
    longitude: 0,
    timeWindowStart: new Date(),
    timeWindowEnd: new Date(),
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
    date: new Date('2024-08-18T11:00:00'),
    price: 20,
    clientId: 'user1',
    client: users.find(u => u.id === 'user1')!,
    status: TaskStatus.matched,
    addressId: '',
    latitude: 0,
    longitude: 0,
    timeWindowStart: new Date(),
    timeWindowEnd: new Date(),
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
      date: new Date('2024-08-20T09:00:00'),
      price: 15,
      clientId: 'user4',
      client: users.find(u => u.id === 'user4')!,
      status: TaskStatus.completed,
      addressId: '',
      latitude: 0,
      longitude: 0,
      timeWindowStart: new Date(),
      timeWindowEnd: new Date(),
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
    date: new Date('2024-08-22T16:00:00'),
    price: 30,
    clientId: 'user1',
    client: users.find(u => u.id === 'user1')!,
    status: TaskStatus.published,
    addressId: '',
    latitude: 0,
    longitude: 0,
    timeWindowStart: new Date(),
    timeWindowEnd: new Date(),
    attachments: [],
    visibility: TaskVisibility.public,
    createdAt: '',
    updatedAt: ''
  },
];

export async function createTask(taskData: Omit<Task, 'id' | 'client' | 'status' | 'createdAt' | 'updatedAt' | 'addressId' | 'latitude' | 'longitude' | 'timeWindowStart' | 'timeWindowEnd' | 'attachments' | 'visibility' | 'category'>) {
    const docRef = await addDoc(collection(db, "tasks"), {
        ...taskData,
        timeWindowStart: taskData.date,
        timeWindowEnd: taskData.date,
        status: 'published',
        visibility: 'public',
        attachments: [],
        latitude: 0, // Placeholder
        longitude: 0, // Placeholder
        addressId: '', // Placeholder
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
        reviewerId: 'user4',
        reviewer: users.find(u => u.id === 'user4')!,
        revieweeId: 'user3',
        reviewee: users.find(u => u.id === 'user3')!,
        rating: 5,
        comment: 'Chloé a été fantastique avec mon chien Oscar. Très professionnelle et ponctuelle. Je recommande vivement !',
        visibility: ReviewVisibility.public,
        createdAt: new Date('2024-08-21T10:00:00Z'),
    },
    {
        id: 'rev2',
        bookingId: 'booking2',
        reviewerId: 'user3',
        reviewer: users.find(u => u.id === 'user3')!,
        revieweeId: 'user4',
        reviewee: users.find(u => u.id === 'user4')!,
        rating: 5,
        comment: 'Marc a été un client très agréable, et Oscar est adorable. Mission parfaite.',
        visibility: ReviewVisibility.public,
        createdAt: new Date('2024-08-21T11:00:00Z'),
    },
    {
        id: 'rev3',
        bookingId: 'booking1',
        reviewerId: 'user1',
        reviewer: users.find(u => u.id === 'user1')!,
        revieweeId: 'user2',
        reviewee: users.find(u => u.id === 'user2')!,
        rating: 4,
        comment: "Lucas a bien installé l'étagère, mais il est arrivé un peu en retard.",
        visibility: ReviewVisibility.public,
        createdAt: new Date('2024-08-19T14:00:00Z'),
    }
];

export const getReviewById = (id: string): Review | undefined => {
    return getReviews().find(r => r.id === id);
}

export const getDisputes = (): Dispute[] => [
    {
        id: 'dispute1',
        bookingId: 'booking1',
        openedById: 'user1',
        openedBy: users.find(u => u.id === 'user1'),
        type: DisputeType.quality,
        description: "L'étagère n'est pas droite et semble peu solide. Je ne suis pas satisfait du travail.",
        attachments: ['https://picsum.photos/seed/shelf_dispute/600/400'],
        status: DisputeStatus.open,
        assignedToId: null,
        assignedTo: null,
        createdAt: new Date('2024-08-19T18:00:00Z'),
        updatedAt: new Date('2024-08-19T18:00:00Z'),
    },
    {
        id: 'dispute2',
        bookingId: 'booking2',
        openedById: 'user4',
        openedBy: users.find(u => u.id === 'user4'),
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
        bookingId: 'booking3',
        openedById: 'user2',
        openedBy: users.find(u => u.id === 'user2'),
        type: DisputeType.other,
        description: "Le client a changé la nature de la mission à mon arrivée, demandant beaucoup plus de travail que prévu pour le même prix. Nous n'avons pas trouvé d'accord.",
        attachments: [],
        status: DisputeStatus.resolved_refund_full,
        assignedToId: 'user5',
        assignedTo: users.find(u => u.id === 'user5'),
        resolvedById: 'user5',
        resolvedAt: new Date('2024-08-23T15:00:00Z'),
        createdAt: new Date('2024-08-22T09:00:00Z'),
        updatedAt: new Date('2024-08-23T15:00:00Z'),
    }
];

export const getDisputeById = (id: string): Dispute | undefined => {
    return getDisputes().find(d => d.id === id);
}
