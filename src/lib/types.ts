export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'client' | 'provider';
};

export type TaskCategory =
  | 'Courses'
  | 'Jardinage'
  | 'Ménage léger'
  | 'Aide numérique'
  | 'Aide administrative'
  | 'Petits bricolages'
  | 'Garde d’animaux';

export type Task = {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  date: Date;
  price: number;
  clientId: string;
  client: User;
  status: 'open' | 'assigned' | 'completed' | 'disputed' | 'cancelled';
};

export type Offer = {
  id: string;
  taskId: string;
  providerId: string;
  provider: User;
  message: string;
  price: number;
  status: 'pending' | 'accepted' | 'rejected';
};
