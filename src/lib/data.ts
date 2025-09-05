

import { Task, User, Offer, UserStatus, KYCStatus, TaskStatus, ServiceCategory, OfferStatus, TaskVisibility, ServiceCategoryCreation } from './types';
import { db } from './firebase';
import { collection, query, where, getDocs, onSnapshot, Unsubscribe, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';


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

// --- Service Categories ---
// This data is now read from Firestore. These are here for reference/backup.

// EN — English
export const taskCategoriesEn: ServiceCategory[] = [
  { id: 'groceries',            slug: 'Groceries & Deliveries',    name: 'Groceries & Deliveries',             isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'cleaning',             slug: 'Housekeeping & Light Cleaning', name: 'Housekeeping & Light Cleaning',      isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'laundry',              slug: 'Laundry & Ironing', name: 'Laundry & Ironing',                  isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'organizing',           slug: 'Organizing & Decluttering', name: 'Organizing & Decluttering',          isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'handyman',             slug: 'Handyman & Assembly', name: 'Handyman & Assembly',                isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'gardening',            slug: 'Gardening & Yard Work', name: 'Gardening & Yard Work',              isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'pet-care',             slug: 'Pet Care & Dog Walking', name: 'Pet Care & Dog Walking',             isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'house-sitting',        slug: 'House Sitting & Plant Care', name: 'House Sitting & Plant Care',         isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'companionship',        slug: 'Senior Companionship Visits', name: 'Senior Companionship Visits',        isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'mobility-assistance',  slug: 'Accompaniment & Mobility Support', name: 'Accompaniment & Mobility Support',   isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'admin-help',           slug: 'Administrative Assistance', name: 'Administrative Assistance',          isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'digital-assistance',   slug: 'Digital & IT Help', name: 'Digital & IT Help',                  isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'tutoring',             slug: 'Tutoring & Homework Help', name: 'Tutoring & Homework Help',           isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'language-lessons',     slug: 'Language Lessons', name: 'Language Lessons',                   isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'cooking',              slug: 'Cooking & Meal Prep', name: 'Cooking & Meal Prep',                isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'moving-help',          slug: 'Light Moving & Carrying', name: 'Light Moving & Carrying',            isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'event-help',           slug: 'Event Assistance', name: 'Event Assistance',                   isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'photo-video',          slug: 'Simple Photo/Video', name: 'Simple Photo/Video',                 isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'parcel-delivery',      slug: 'Small Parcel Pickup/Delivery', name: 'Small Parcel Pickup/Delivery',       isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'tech-setup',           slug: 'Tech Setup (Apps & Devices)', name: 'Tech Setup (Apps & Devices)',        isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 }
];

// FR — Français
export const taskCategoriesFr: ServiceCategory[] = [
  { id: 'groceries',            slug: 'Courses & livraisons', name: 'Courses & livraisons',               isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'cleaning',             slug: 'Ménage & nettoyage léger', name: 'Ménage & nettoyage léger',           isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'laundry',              slug: 'Linge & repassage', name: 'Linge & repassage',                  isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'organizing',           slug: 'Rangement & désencombrement', name: 'Rangement & désencombrement',        isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'handyman',             slug: 'Bricolage & montage', name: 'Bricolage & montage',                isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'gardening',            slug: 'Jardinage', name: 'Jardinage',                          isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'pet-care',             slug: 'Promenade & garde d’animaux', name: 'Promenade & garde d’animaux',        isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'house-sitting',        slug: 'Surveillance habitation & plantes', name: 'Surveillance habitation & plantes',  isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'companionship',        slug: 'Visites de convivialité (seniors)', name: 'Visites de convivialité (seniors)',  isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'mobility-assistance',  slug: 'Accompagnement & mobilité', name: 'Accompagnement & mobilité',          isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'admin-help',           slug: 'Aide administrative', name: 'Aide administrative',                 isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'digital-assistance',   slug: 'Assistance numérique / IT', name: 'Assistance numérique / IT',          isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'tutoring',             slug: 'Soutien scolaire & devoirs', name: 'Soutien scolaire & devoirs',         isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'language-lessons',     slug: 'Cours de langues', name: 'Cours de langues',                   isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'cooking',              slug: 'Cuisine & préparation repas', name: 'Cuisine & préparation repas',        isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'moving-help',          slug: 'Déménagement léger & portage', name: 'Déménagement léger & portage',       isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'event-help',           slug: 'Aide événementielle', name: 'Aide événementielle',                isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'photo-video',          slug: 'Photos / Vidéos simples', name: 'Photos / Vidéos simples',            isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'parcel-delivery',      slug: 'Petits colis & retraits', name: 'Petits colis & retraits',            isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'tech-setup',           slug: 'Installation (apps & appareils)', name: 'Installation (apps & appareils)',    isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 }
];

// JP — 日本語
export const taskCategoriesJa: ServiceCategory[] = [
  { id: 'groceries',            slug: '買い物・配達', name: '買い物・配達',                           isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'cleaning',             slug: '掃除・軽作業', name: '掃除・軽作業',                           isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'laundry',              slug: '洗濯・アイロン', name: '洗濯・アイロン',                         isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'organizing',           slug: '片付け・断捨離', name: '片付け・断捨離',                         isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'handyman',             slug: '家具組み立て・修理', name: '家具組み立て・修理',                     isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'gardening',            slug: '園芸・庭仕事', name: '園芸・庭仕事',                           isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'pet-care',             slug: 'ペットケア・犬の散歩', name: 'ペットケア・犬の散歩',                   isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'house-sitting',        slug: '留守番・植物の世話', name: '留守番・植物の世話',                     isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'companionship',        slug: '高齢者の交流訪問', name: '高齢者の交流訪問',                       isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'mobility-assistance',  slug: '付き添い・外出サポート', name: '付き添い・外出サポート',                 isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'admin-help',           slug: '行政手続きサポート', name: '行政手続きサポート',                     isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'digital-assistance',   slug: 'デジタル・ITサポート', name: 'デジタル・ITサポート',                    isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'tutoring',             slug: '学習サポート・宿題支援', name: '学習サポート・宿題支援',                 isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'language-lessons',     slug: '語学レッスン', name: '語学レッスン',                           isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'cooking',              slug: '料理・食事準備', name: '料理・食事準備',                         isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'moving-help',          slug: '軽作業引っ越し・運搬', name: '軽作業引っ越し・運搬',                   isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'event-help',           slug: 'イベント手伝い', name: 'イベント手伝い',                         isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'photo-video',          slug: '写真・ビデオ簡易撮影', name: '写真・ビデオ簡易撮影',                   isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'parcel-delivery',      slug: '小包回収・お届け', name: '小包回収・お届け',                       isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 },
  { id: 'tech-setup',           slug: '設定サポート（アプリ・機器）', name: '設定サポート（アプリ・機器）',           isActive: true, createdAt: '', updatedAt: '', displayOrder: 10 }
];

export const taskCategoriesByLocale = {
  en: taskCategoriesEn,
  fr: taskCategoriesFr,
  ja: taskCategoriesJa
};

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
