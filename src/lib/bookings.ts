

import { Booking, BookingStatus, PaymentStatus, TaskStatus, Task } from './types';
import { getTasks } from './data';
import { users } from './data';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const tasks = getTasks();
const providers = users.filter(u => u.id === 'user2' || u.id === 'user3');
const clients = users.filter(u => u.id === 'user1' || u.id === 'user4');

export const getBookings = (): Booking[] => [
    {
        id: 'booking1',
        taskId: 'task3',
        task: tasks.find(t => t.id === 'task3'),
        providerId: 'user2',
        provider: users.find(u => u.id === 'user2'),
        clientId: 'user1',
        client: users.find(u => u.id === 'user1'),
        proposalId: 'proposal1',
        amount: 2000,
        startAt: new Date('2024-08-18T11:00:00'),
        endAt: new Date('2024-08-18T12:00:00'),
        agreedAmount: 2000, // in cents
        currency: 'EUR',
        paymentIntentId: 'pi_3PjY3fLqgLzJ7fV01Z6A3f9a',
        paymentStatus: PaymentStatus.authorized,
        status: BookingStatus.scheduled,
        completionProof: [],
        createdAt: new Date('2024-08-17T10:00:00'),
        updatedAt: new Date('2024-08-17T10:00:00'),
    },
    {
        id: 'booking2',
        taskId: 'task4',
        task: tasks.find(t => t.id === 'task4'),
        providerId: 'user3',
        provider: users.find(u => u.id === 'user3'),
        clientId: 'user4',
        client: users.find(u => u.id === 'user4'),
        proposalId: 'proposal2',
        amount: 1500,
        startAt: new Date('2024-08-20T09:00:00'),
        endAt: new Date('2024-08-20T10:00:00'),
        agreedAmount: 1500, // in cents
        currency: 'EUR',
        paymentIntentId: 'pi_3PjY4oLqgLzJ7fV01A4B9c8d',
        paymentStatus: PaymentStatus.captured,
        status: BookingStatus.completed,
        completionProof: ['https://picsum.photos/seed/proof1/600/400'],
        createdAt: new Date('2024-08-19T14:00:00'),
        updatedAt: new Date('2024-08-20T10:05:00'),
    },
];

export async function getBookingById(bookingId: string): Promise<Booking | null> {
    // In a real app, this would fetch from Firestore.
    // For now, we use mock data.
    const booking = getBookings().find(b => b.id === bookingId);

    // Simulate async fetching of related data if it wasn't already populated
    if (booking) {
        if (!booking.task) {
            const taskRef = doc(db, 'tasks', booking.taskId);
            const taskSnap = await getDoc(taskRef);
            if (taskSnap.exists()) booking.task = taskSnap.data() as Task;
        }
        if (!booking.client) {
            const clientRef = doc(db, 'users', booking.clientId);
            const clientSnap = await getDoc(clientRef);
            if (clientSnap.exists()) booking.client = clientSnap.data() as any;
        }
        if (!booking.provider) {
            const providerRef = doc(db, 'users', booking.providerId);
            const providerSnap = await getDoc(providerRef);
            if (providerSnap.exists()) booking.provider = providerSnap.data() as any;
        }
    }

    return booking || null;
}

