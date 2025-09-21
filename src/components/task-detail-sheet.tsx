
'use client';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { useEffect, useState } from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Offer, Task } from '@/lib/types';
import { notFound } from 'next/navigation';
import { getOffersForTask } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import TaskDetailContent from './task-detail-content';

interface TaskDetailSheetProps {
    taskId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

async function getTask(id: string): Promise<Task | null> {
    const taskRef = doc(db, 'tasks', id);
    const taskSnap = await getDoc(taskRef);

    if (taskSnap.exists()) {
        const taskData = { id: taskSnap.id, ...taskSnap.data() } as Task;
        // Convert Timestamps to JS Dates for serialization
        if (taskData.timeWindowStart instanceof Timestamp) {
            taskData.timeWindowStart = taskData.timeWindowStart.toDate();
        }
        if (taskData.timeWindowEnd instanceof Timestamp) {
            taskData.timeWindowEnd = taskData.timeWindowEnd.toDate();
        }
        // Fetch related data
        if (taskData.categoryId) {
            const categoryRef = doc(db, 'serviceCategories', taskData.categoryId);
            const categorySnap = await getDoc(categoryRef);
            if (categorySnap.exists()) {
                taskData.category = categorySnap.data() as any;
            }
        }
        if (taskData.clientId) {
            const clientRef = doc(db, 'users', taskData.clientId);
            const profileRef = doc(db, 'profiles', taskData.clientId);
            const clientSnap = await getDoc(clientRef);
            const profileSnap = await getDoc(profileRef);
            if (clientSnap.exists()) {
                taskData.client = {
                    id: clientSnap.id,
                    ...clientSnap.data(),
                    profile: profileSnap.exists() ? profileSnap.data() : undefined
                } as any;
            }
        }
        return taskData;
    }
    return null;
}

export function TaskDetailSheet({ taskId, open, onOpenChange }: TaskDetailSheetProps) {
    const [task, setTask] = useState<Task | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(false);
    const t = useTranslations('TaskDetailPage');

    useEffect(() => {
        if (taskId) {
            const fetchData = async () => {
                setLoading(true);
                const fetchedTask = await getTask(taskId);
                if(fetchedTask) {
                    const fetchedOffers = getOffersForTask(taskId);
                    setTask(fetchedTask);
                    setOffers(fetchedOffers);
                } else {
                    // Handle not found case, maybe show an error in the sheet
                    setTask(null);
                    setOffers([]);
                }
                setLoading(false);
            };
            fetchData();
        }
    }, [taskId]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    </div>
                ) : task ? (
                    <>
                        <SheetHeader>
                            <SheetTitle className="sr-only">{task.title}</SheetTitle>
                            <SheetDescription className="sr-only">Détails pour la tâche {task.title}</SheetDescription>
                        </SheetHeader>
                        <TaskDetailContent task={task} offers={offers} />
                    </>
                ) : (
                    <SheetHeader>
                        <SheetTitle>{t('notFound')}</SheetTitle>
                        <SheetDescription>{t('notFoundDescription')}</SheetDescription>
                    </SheetHeader>
                )}
            </SheetContent>
        </Sheet>
    );
}
