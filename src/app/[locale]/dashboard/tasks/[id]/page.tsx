'use client';

import { useEffect } from 'react';
import { useRouter } from '@/navigation';

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the list view with the task ID as a query param
    // The list view will handle opening the sheet.
    router.push(`/dashboard/tasks?taskId=${params.id}`);
  }, [params.id, router]);
  
  return null;
}
