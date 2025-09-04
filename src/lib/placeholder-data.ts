import type { User, Task, Proposal, Message, Conversation } from './types';

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatarUrl: 'https://picsum.photos/100/100?random=1',
    isProvider: true,
    skills: ['Web Development', 'React', 'Node.js', 'Graphic Design'],
    profileDescription: 'Full-stack developer with 5 years of experience in creating beautiful and functional web applications. Also skilled in graphic design and UI/UX.',
    availability: true,
  },
  {
    id: 'user-2',
    name: 'Bob Williams',
    email: 'bob@example.com',
    avatarUrl: 'https://picsum.photos/100/100?random=2',
    isProvider: false,
  },
  {
    id: 'user-3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    avatarUrl: 'https://picsum.photos/100/100?random=3',
    isProvider: true,
    skills: ['Plumbing', 'Home Repair', 'Electrical'],
    profileDescription: 'Licensed plumber and handyman with over 10 years of experience in residential and commercial maintenance.',
    availability: false,
  },
  {
    id: 'user-4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    avatarUrl: 'https://picsum.photos/100/100?random=4',
    isProvider: true,
    skills: ['Content Writing', 'SEO', 'Marketing'],
    profileDescription: 'Experienced content strategist and writer, helping businesses grow their online presence.',
    availability: true,
  },
];

export const tasks: Task[] = [
  {
    id: 'task-1',
    title: 'Build a new landing page',
    description: 'We need a modern and responsive landing page for our new product launch. The design should be clean and professional.',
    category: 'Web Development',
    location: 'Remote',
    budget: 1200,
    status: 'Open',
    clientId: 'user-2',
    createdAt: new Date('2023-10-01'),
  },
  {
    id: 'task-2',
    title: 'Fix a leaky faucet',
    description: 'The faucet in my kitchen sink is dripping constantly. I need someone to diagnose and fix the issue.',
    category: 'Plumbing',
    location: 'New York, NY',
    budget: 150,
    status: 'In Progress',
    clientId: 'user-2',
    providerId: 'user-3',
    createdAt: new Date('2023-10-02'),
  },
  {
    id: 'task-3',
    title: 'Design a company logo',
    description: 'Looking for a creative graphic designer to create a logo for our new startup. We want something minimalist and memorable.',
    category: 'Graphic Design',
    location: 'Remote',
    budget: 500,
    status: 'Open',
    clientId: 'user-2',
    createdAt: new Date('2023-10-03'),
  },
  {
    id: 'task-4',
    title: 'Write 5 blog posts about AI',
    description: 'We need 5 well-researched blog posts (1000 words each) on the latest trends in Artificial Intelligence.',
    category: 'Content Writing',
    location: 'Remote',
    budget: 750,
    status: 'Completed',
    clientId: 'user-2',
    providerId: 'user-4',
    createdAt: new Date('2023-09-15'),
  },
  {
    id: 'task-5',
    title: 'Set up a new router',
    description: 'My new internet router arrived, but I am having trouble setting it up correctly.',
    category: 'IT Support',
    location: 'San Francisco, CA',
    budget: 80,
    status: 'Open',
    clientId: 'user-2',
    createdAt: new Date('2023-10-04'),
  },
];

export const proposals: Proposal[] = [
    {
        id: 'prop-1',
        taskId: 'task-1',
        providerId: 'user-1',
        amount: 1100,
        message: 'I can build this for you in a week.',
        status: 'Pending',
    },
    {
        id: 'prop-2',
        taskId: 'task-3',
        providerId: 'user-1',
        amount: 450,
        message: 'I have extensive experience in logo design.',
        status: 'Accepted',
    },
    {
        id: 'prop-3',
        taskId: 'task-4',
        providerId: 'user-4',
        amount: 750,
        message: 'I specialize in tech writing and can deliver high-quality content.',
        status: 'Pending',
    },
    {
        id: 'prop-4',
        taskId: 'task-2',
        providerId: 'user-3',
        amount: 140,
        message: 'I can come by tomorrow morning to fix it.',
        status: 'Pending',
    }
];

export const messages: Message[] = [
    {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        content: 'Hello! I saw your task for the landing page and I am very interested.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'user-2',
        receiverId: 'user-1',
        content: 'Great! Do you have a portfolio I can look at?',
        timestamp: new Date(Date.now() - 1000 * 60 * 4)
    },
    {
        id: 'msg-3',
        conversationId: 'conv-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        content: 'Yes, you can check it out at myprofile.com/portfolio. I can start immediately.',
        timestamp: new Date(Date.now() - 1000 * 60 * 3)
    },
    {
        id: 'msg-4',
        conversationId: 'conv-2',
        senderId: 'user-3',
        receiverId: 'user-2',
        content: 'Regarding the leaky faucet, I can be there at 10 AM tomorrow.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
    }
];

export const conversations: Conversation[] = [
    {
        id: 'conv-1',
        participant1Id: 'user-1',
        participant2Id: 'user-2',
        lastMessage: messages[2],
    },
    {
        id: 'conv-2',
        participant1Id: 'user-3',
        participant2Id: 'user-2',
        lastMessage: messages[3],
    }
];
