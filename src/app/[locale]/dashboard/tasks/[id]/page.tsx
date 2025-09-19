

import { getOffersForTask } from '@/lib/data';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Task } from '@/lib/types';
import { notFound } from 'next/navigation';
import TaskDetailClientPage from './client-page';

async function getTask(id: string): Promise<Task | null> {
    const taskRef = doc(db, 'tasks', id);
    const taskSnap = await getDoc(taskRef);

    if (taskSnap.exists()) {
        const taskData = { id: taskSnap.id, ...taskSnap.data() } as Task;
        // Convert Firestore Timestamps to JS Dates for serialization
        if (taskData.timeWindowStart instanceof Timestamp) {
            taskData.timeWindowStart = taskData.timeWindowStart.toDate();
        }
        if (taskData.timeWindowEnd instanceof Timestamp) {
            taskData.timeWindowEnd = taskData.timeWindowEnd.toDate();
        }
        return taskData;
    }
    return null;
}

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const task = await getTask(id);
  const offers = getOffersForTask(id);

  if (!task) {
    notFound();
  }

  return <TaskDetailClientPage task={task} offers={offers} />;
}
