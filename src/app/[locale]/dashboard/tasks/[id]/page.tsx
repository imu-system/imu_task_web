
import { redirect } from '@/navigation';

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  // Redirect to the list view with the task ID as a query param
  // The list view will handle opening the sheet.
  redirect(`/dashboard/tasks?taskId=${params.id}`);
}
