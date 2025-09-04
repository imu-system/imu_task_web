export type User = {
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
  description: string;
  category: string;
  location: string;
  budget: number;
  status: 'Open' | 'In Progress' | 'Completed';
  clientId: string;
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

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
};

export type Conversation = {
    id: string;
    participant1Id: string;
    participant2Id: string;
    lastMessage: Message;
};
