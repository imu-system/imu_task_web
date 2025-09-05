

import { Task, User, Offer, UserStatus, KYCStatus, TaskStatus, ServiceCategory, OfferStatus, TaskVisibility, ServiceCategoryCreation } from './types';
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
    roles: [],
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
    roles: [],
    status: UserStatus.active,
    KYCStatus: KYCStatus.not_required,
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
    roles: [],
    status: UserStatus.active,
    KYCStatus: KYCStatus.not_required,
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
    roles: [],
    status: UserStatus.active,
    KYCStatus: KYCStatus.not_required,
    createdAt: '',
    updatedAt: ''
  },
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

export const getOffersForTask = (taskId: string): Offer[] => {
    if (taskId === 'task1') {
        return [
            {
              id: 'offer1',
              taskId: 'task1',
              providerId: 'user2',
              provider: users.find(u => u.id === 'user2')!,
              message: 'Bonjour, je suis disponible et véhiculé. Je peux faire vos courses cet après-midi si vous le souhaitez.',
              proposedPrice: 25,
              status: OfferStatus.pending,
              expiresAt: new Date(),
              createdAt: '',
              updatedAt: ''
            },
            {
              id: 'offer2',
              taskId: 'task1',
              providerId: 'user3',
              provider: users.find(u => u.id === 'user3')!,
              message: "Bonjour, j'habite juste à côté et je serais ravie de vous aider pour vos courses. Je suis disponible demain matin.",
              proposedPrice: 23,
              status: OfferStatus.pending,
              expiresAt: new Date(),
              createdAt: '',
              updatedAt: ''
            },
        ]
    }
    return [];
};
