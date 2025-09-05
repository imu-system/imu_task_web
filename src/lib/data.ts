import type { Task, User, Offer } from './types';

export const users: User[] = [
  {
    id: 'user1',
    name: 'Anne-Marie Dupont',
    avatarUrl: 'https://picsum.photos/id/1027/100/100',
    role: 'client',
  },
  {
    id: 'user2',
    name: 'Lucas Bernard',
    avatarUrl: 'https://picsum.photos/id/1005/100/100',
    role: 'provider',
  },
  {
    id: 'user3',
    name: 'Chloé Petit',
    avatarUrl: 'https://picsum.photos/id/1011/100/100',
    role: 'provider',
  },
  {
    id: 'user4',
    name: 'Marc Dubois',
    avatarUrl: 'https://picsum.photos/id/1012/100/100',
    role: 'client',
  },
];

export const getTasks = (): Task[] => [
  {
    id: 'task1',
    title: 'Aide pour les courses hebdomadaires',
    description:
      "J'ai besoin de quelqu'un pour aller chercher mes courses au supermarché et me les livrer à domicile. La liste sera fournie. Idéalement une personne véhiculée.",
    category: 'Courses',
    location: 'Metz, France',
    date: new Date('2024-08-15T10:00:00'),
    price: 25,
    clientId: 'user1',
    client: users.find(u => u.id === 'user1')!,
    status: 'open',
  },
  {
    id: 'task2',
    title: 'Tondre la pelouse et désherber',
    description:
      "Mon jardin a besoin d'un bon rafraîchissement. Il faut tondre la pelouse (environ 50m²) et enlever les mauvaises herbes des parterres de fleurs.",
    category: 'Jardinage',
    location: 'Montigny-lès-Metz, France',
    date: new Date('2024-08-16T14:00:00'),
    price: 40,
    clientId: 'user4',
    client: users.find(u => u.id === 'user4')!,
    status: 'open',
  },
  {
    id: 'task3',
    title: "Installer une nouvelle étagère murale",
    description:
      "Je ne suis pas très bricoleur et j'ai besoin d'aide pour fixer solidement une étagère dans mon salon. J'ai déjà l'étagère et les vis.",
    category: 'Petits bricolages',
    location: 'Metz, France',
    date: new Date('2024-08-18T11:00:00'),
    price: 20,
    clientId: 'user1',
    client: users.find(u => u.id === 'user1')!,
    status: 'assigned',
  },
    {
    id: 'task4',
    title: 'Promener mon chien pendant mes vacances',
    description:
      'Je cherche une personne de confiance pour promener mon golden retriever, Oscar, deux fois par jour pendant une semaine.',
    category: 'Garde d’animaux',
    location: 'Thionville, France',
    date: new Date('2024-08-20T09:00:00'),
    price: 15,
    clientId: 'user4',
    client: users.find(u => u.id === 'user4')!,
    status: 'completed',
  },
  {
    id: 'task5',
    title: 'Configurer une nouvelle imprimante',
    description:
      "Je viens d'acheter une nouvelle imprimante Wi-Fi et je n'arrive pas à la connecter à mon ordinateur. J'aurais besoin d'un coup de main.",
    category: 'Aide numérique',
    location: 'Metz, France',
    date: new Date('2024-08-22T16:00:00'),
    price: 30,
    clientId: 'user1',
    client: users.find(u => u.id === 'user1')!,
    status: 'open',
  },
];

export const getOffersForTask = (taskId: string): Offer[] => {
    if (taskId === 'task1') {
        return [
            {
                id: 'offer1',
                taskId: 'task1',
                providerId: 'user2',
                provider: users.find(u => u.id === 'user2')!,
                message: 'Bonjour, je suis disponible et véhiculé. Je peux faire vos courses cet après-midi si vous le souhaitez.',
                price: 25,
                status: 'pending'
            },
            {
                id: 'offer2',
                taskId: 'task1',
                providerId: 'user3',
                provider: users.find(u => u.id === 'user3')!,
                message: "Bonjour, j'habite juste à côté et je serais ravie de vous aider pour vos courses. Je suis disponible demain matin.",
                price: 23,
                status: 'pending'
            },
        ]
    }
    return [];
};
