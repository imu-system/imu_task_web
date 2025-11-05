'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { getTaskById, updateTask, deleteTask, updateTaskStatus, Task } from '@/lib/firestore-tasks';
import { getOffersForTaskWithDetails, acceptOffer, rejectOffer } from '@/lib/firebase/offers';
import { ProposalForm } from '@/components/proposals/proposal-form';
import { ProposalList } from '@/components/proposals/proposal-list';
import { OffersList } from '@/components/offers/OffersList';
import { ProviderSuggestions } from '@/components/task-detail/provider-suggestions';
import { TaskMapDisplay } from '@/components/task-detail/task-map-display';
import { TaskImageGallery } from '@/components/task-detail/task-image-gallery';
import { TaskStatusActions } from '@/components/task-detail/task-status-actions';
import { TaskStatusBadge } from '@/components/task-detail/task-status-badge';
import type { OfferWithDetails } from '@/types/offer';
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
import { useToast } from '@/hooks/use-toast';
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
  Tag,
} from 'lucide-react';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const locale = useLocale();
  const t = useTranslations('TaskDetail');
  const { toast } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [offers, setOffers] = useState<OfferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const taskId = params.id as string;

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

  // Charger les offres (pour task owner uniquement)
  useEffect(() => {
    const fetchOffers = async () => {
      if (!task || !user || task.clientId !== user.uid) return;

      try {
        const taskOffers = await getOffersForTaskWithDetails(taskId);
        setOffers(taskOffers);
      } catch (err: any) {
        console.error('Error fetching offers:', err);
      }
    };

    fetchOffers();
  }, [task, user, taskId]);

  const handleAcceptOffer = async (offerId: string) => {
    if (!user || !task) return;

    try {
      await acceptOffer(offerId, user.uid);
      
      toast({
        title: t('offerAcceptedTitle'),
        description: t('offerAcceptedDescription'),
      });

      // Rafraîchir les offres
      const updatedOffers = await getOffersForTaskWithDetails(taskId);
      setOffers(updatedOffers);

      // Rafraîchir la task
      const updatedTask = await getTaskById(taskId);
      if (updatedTask) {
        setTask(updatedTask);
      }
    } catch (err: any) {
      console.error('Error accepting offer:', err);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: err.message || t('offerAcceptError'),
      });
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    if (!user) return;

    try {
      await rejectOffer(offerId, user.uid);
      
      toast({
        title: t('offerRejectedTitle'),
        description: t('offerRejectedDescription'),
      });

      // Rafraîchir les offres
      const updatedOffers = await getOffersForTaskWithDetails(taskId);
      setOffers(updatedOffers);
    } catch (err: any) {
      console.error('Error rejecting offer:', err);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: err.message || t('offerRejectError'),
      });
    }
  };

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
      await updateTaskStatus(taskId, newStatus, user.uid);
      
      // Refresh task data
      const updatedTask = await getTaskById(taskId);
      if (updatedTask) {
        setTask(updatedTask);
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      throw err; // Re-throw to let TaskStatusActions handle the error
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
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Task details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main task card */}
          <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl md:text-3xl mb-2">{task.title}</CardTitle>
              
              <div className="flex flex-wrap items-center gap-2">
                <TaskStatusBadge status={task.status} size="md" />
                <Badge variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {task.category}
                </Badge>
              </div>
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
            <h3 className="mb-3 text-lg font-semibold">{t('description')}</h3>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Status Actions */}
          {user && (
            <TaskStatusActions
              task={task}
              userId={user.uid}
              isOwner={isOwner}
              isProvider={task.providerId === user.uid}
              onStatusChange={handleStatusChange}
            />
          )}

          {/* Task details */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Budget */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <DollarSign className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('budget')}</p>
                    <p className="text-2xl font-bold text-primary">{task.budget} €</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Created date */}
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('createdAt')}</p>
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
                  <p className="text-sm font-medium">{t('deadline')}</p>
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

            {/* Client */}
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('client')}</p>
                <p className="text-sm text-muted-foreground">
                  {isOwner ? t('you') : `Client ID: ${task.clientId.slice(0, 8)}...`}
                </p>
              </div>
            </div>

            {/* Provider if assigned */}
            {task.providerId && (
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{t('provider')}</p>
                  <p className="text-sm text-muted-foreground">
                    Provider ID: {task.providerId.slice(0, 8)}...
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

          {/* Image gallery */}
          {task.images && task.images.length > 0 && (
            <TaskImageGallery images={task.images} title={task.title} />
          )}

          {/* Provider offer section */}
          {task.status === 'open' && user && !isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>{t('interestedInTask')}</CardTitle>
                <CardDescription>{t('submitOfferDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/tasks/${taskId}/offer`}>
                    {t('submitOffer')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Provider proposals section (legacy - keep for now) */}
          {task.status === 'open' && user && !isOwner && (
            <ProposalForm
              taskId={taskId}
              taskTitle={task.title}
              taskBudget={task.budget}
              clientId={task.clientId}
              providerId={user.uid}
            />
          )}

          {/* Proposal list for task owner or providers who submitted */}
          {task.status === 'open' && user && (
            <ProposalList
              taskId={taskId}
              isTaskOwner={isOwner}
              currentUserId={user.uid}
              onProposalAccepted={() => {
                // Refresh task to show updated status
                window.location.reload();
              }}
            />
          )}

          {/* Offers list for task owner (NEW - Feature 2: Offer Comparison) */}
          {task.status === 'open' && user && isOwner && (
            <OffersList
              offers={offers}
              taskId={taskId}
              isTaskOwner={isOwner}
              currentUserId={user.uid}
              currentLocale={locale}
              onAcceptOffer={handleAcceptOffer}
              onRejectOffer={handleRejectOffer}
            />
          )}
        </div>

        {/* Right column: Map and provider suggestions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Location map */}
          <TaskMapDisplay location={task.location} />

          {/* Provider suggestions (only for task owners) */}
          {isOwner && task.status === 'open' && (
            <ProviderSuggestions
              taskCategory={task.category}
              taskLocation={task.location}
              currentUserId={user?.uid}
            />
          )}
        </div>
      </div>
    </div>
  );
}
