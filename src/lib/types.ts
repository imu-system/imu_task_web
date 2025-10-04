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
