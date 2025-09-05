
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { UserRole, Task } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { getTasks } from '@/lib/data';

export default function AdminTaskDetailPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const taskId = params.id;
    const t = useTranslations('AdminTaskDetailPage');
    
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        const fetchedTask = getTasks().find(t => t.id === taskId);
        if (fetchedTask) {
            setTask(fetchedTask);
        }
        setLoading(false);
    }, [taskId]);

    if (authLoading || loading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!task) {
        return (
            <div className="text-center">
                <h1 className="text-xl">{t('notFound')}</h1>
            </div>
        )
    }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/tasks">
                <ArrowLeft className="h-6 w-6"/>
            </Link>
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {task.title}
                </h1>
                <p className="text-muted-foreground font-mono text-xs">
                    {t('title')} - ID: {task.id}
                </p>
            </div>
        </div>

        {/* Detailed view to be built here */}
         <p>Task details for {task.title} will be displayed here.</p>

    </div>
  );
}
