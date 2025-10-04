'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { getTaskById, updateTask, deleteTask, Task } from '@/lib/firestore-tasks';
import { ProposalForm } from '@/components/proposals/proposal-form';
import { ProposalList } from '@/components/proposals/proposal-list';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  MapPin,
  DollarSign,
  Calendar,
  User,
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

const statusColors: Record<Task['status'], string> = {
  open: 'bg-green-100 text-green-800',
  assigned: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('TaskDetail');

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const taskId = params.id as string;

  // Status labels using translations
  const statusLabels: Record<Task['status'], string> = {
    open: t('statusOpen'),
    assigned: t('statusAssigned'),
    'in-progress': t('statusInProgress'),
    completed: t('statusCompleted'),
    cancelled: t('statusCancelled'),
  };

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError('');

        const fetchedTask = await getTaskById(taskId);

        if (!fetchedTask) {
          setError(t('taskNotFound'));
          return;
        }

        setTask(fetchedTask);
      } catch (err: any) {
        console.error('Error fetching task:', err);
        setError(err.message || t('taskNotFound'));
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId, t]);

  const handleDelete = async () => {
    if (!task || !user) return;

    try {
      setDeleting(true);
      await deleteTask(taskId);
      router.push('/tasks');
    } catch (err: any) {
      console.error('Error deleting task:', err);
      setError(err.message || t('error'));
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (!task || !user) return;

    try {
      setUpdating(true);
      await updateTask(taskId, { status: newStatus });
      setTask({ ...task, status: newStatus });
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || t('error'));
    } finally {
      setUpdating(false);
    }
  };

  // Not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            {t('notAuthenticated')}{' '}
            <Link href="/auth/login" className="font-medium underline">
              {t('loginLink')}
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-8 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="mb-2 h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/tasks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToTasks')}
          </Link>
        </Button>
      </div>
    );
  }

  if (!task) return null;

  const isOwner = user.uid === task.clientId;
  const canEdit = isOwner && (task.status === 'open' || task.status === 'assigned');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button asChild className="mb-6" variant="outline" size="sm">
        <Link href="/tasks">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToTasks')}
        </Link>
      </Button>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main task card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <CardTitle className="text-3xl">{task.title}</CardTitle>
                <Badge className={statusColors[task.status]}>
                  {statusLabels[task.status]}
                </Badge>
              </div>
              <CardDescription className="text-lg">{task.category}</CardDescription>
            </div>

            {/* Action buttons (owner only) */}
            {isOwner && (
              <div className="flex gap-2">
                {canEdit && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/tasks/${taskId}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t('edit')}
                    </Link>
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" disabled={deleting}>
                      {deleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      {deleting ? t('deleting') : t('delete')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteConfirmDescription')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('deleteConfirmCancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                        {t('deleteConfirmDelete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="mb-2 text-lg font-semibold">{t('description')}</h3>

            <p className="whitespace-pre-wrap text-muted-foreground">{task.description}</p>
          </div>

          {/* Task details */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t('location')}</p>
                <p className="text-sm text-muted-foreground">
                  {typeof task.location === 'string'
                    ? task.location
                    : task.location.address || t('noProvider')}
                </p>
              </div>
            </div>

            {/* Budget */}
            <div className="flex items-start gap-3">
              <DollarSign className="mt-0.5 h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">{t('budget')}</p>
                <p className="text-lg font-semibold text-green-600">{task.budget} €</p>
              </div>
            </div>

            {/* Client */}
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t('client')}</p>
                <p className="text-sm text-muted-foreground">
                  {isOwner ? t('you') : `Client ID: ${task.clientId.slice(0, 8)}...`}
                </p>
              </div>
            </div>

            {/* Created date */}
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t('createdAt')}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(task.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Deadline if exists */}
            {task.deadline && (
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">{t('deadline')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(task.deadline).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Provider if assigned */}
            {task.providerId && (
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{t('provider')}</p>
                  <p className="text-sm text-muted-foreground">
                    Provider ID: {task.providerId.slice(0, 8)}...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Images if any */}
          {task.images && task.images.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">{t('images')}</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {task.images.map((imageUrl, index) => (
                  <div key={index} className="overflow-hidden rounded-lg border">
                    <img
                      src={imageUrl}
                      alt={`Task image ${index + 1}`}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {/* Status actions (owner only) */}
        {isOwner && task.status !== 'completed' && task.status !== 'cancelled' && (
          <CardFooter className="flex gap-2 border-t pt-6">
            <p className="mr-4 text-sm font-medium">Changer le statut :</p>

            {task.status === 'open' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('cancelled')}
                disabled={updating}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t('cancelTask')}
              </Button>
            )}

            {task.status === 'assigned' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('in-progress')}
                  disabled={updating}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {t('markInProgress')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={updating}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {t('cancelTask')}
                </Button>
              </>
            )}

            {task.status === 'in-progress' && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('completed')}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {t('markCompleted')}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Provider proposals section */}
      {task.status === 'open' && user && (
        <div className="mt-6 space-y-6">
          {/* Proposal form for providers (not task owner) */}
          {!isOwner && (
            <ProposalForm
              taskId={taskId}
              taskTitle={task.title}
              taskBudget={task.budget}
              clientId={task.clientId}
              providerId={user.uid}
            />
          )}

          {/* Proposal list for task owner or providers who submitted */}
          <ProposalList
            taskId={taskId}
            isTaskOwner={isOwner}
            currentUserId={user.uid}
            onProposalAccepted={() => {
              // Refresh task to show updated status
              window.location.reload();
            }}
          />
        </div>
      )}
    </div>
  );
}
