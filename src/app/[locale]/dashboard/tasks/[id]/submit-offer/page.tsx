'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { getTask, type Task } from '@/lib/firestore-tasks';
import { ProposalForm } from '@/components/proposals/proposal-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Calendar, DollarSign, User, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SubmitOfferPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('SubmitOffer');
  const tCommon = useTranslations('Common');

  const taskId = params?.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (!taskId) {
      setError('Task ID is missing');
      setLoading(false);
      return;
    }

    fetchTask();
  }, [taskId, user]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError('');

      const fetchedTask = await getTask(taskId);

      if (!fetchedTask) {
        setError('Task not found');
        return;
      }

      // Check if task is open
      if (fetchedTask.status !== 'open') {
        setError('This task is no longer available for offers');
        return;
      }

      // Check if user is the task owner
      if (fetchedTask.clientId === user?.uid) {
        setError('You cannot submit an offer to your own task');
        return;
      }

      setTask(fetchedTask);
    } catch (err: any) {
      console.error('Error fetching task:', err);
      setError(err.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    // Redirect to provider's proposals list
    router.push('/dashboard/proposals');
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">{t('errorTitle', { defaultValue: 'Error' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tCommon('back', { defaultValue: 'Go Back' })}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  // Format location
  const getLocationString = () => {
    if (typeof task.location === 'string') {
      return task.location;
    }
    return task.location?.address || 'Location not specified';
  };

  // Format deadline
  const getDeadlineString = () => {
    if (!task.deadline) return null;
    const deadline = task.deadline instanceof Date ? task.deadline : new Date(task.deadline);
    return deadline.toLocaleDateString();
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleCancel}
          className="mb-4"
          data-testid="back-button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {tCommon('back', { defaultValue: 'Back' })}
        </Button>

        <h1 className="text-3xl font-bold mb-2" data-testid="page-title">
          {t('title', { defaultValue: 'Submit Your Offer' })}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle', { defaultValue: 'Make a proposal to complete this task' })}
        </p>
      </div>

      {/* Task Summary Card */}
      <Card className="mb-6" data-testid="task-summary-card">
        <CardHeader>
          <CardTitle className="text-lg">{t('taskSummary', { defaultValue: 'Task Summary' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Task Title & Status */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">{task.title}</h2>
            <Badge variant="secondary" className="mb-3">
              {task.category || 'General'}
            </Badge>
            <p className="text-muted-foreground">{task.description}</p>
          </div>

          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {/* Budget */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('budget', { defaultValue: 'Budget' })}
                </p>
                <p className="font-semibold text-lg">
                  {task.budget ? `${task.budget}€` : tCommon('negotiable', { defaultValue: 'Negotiable' })}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('location', { defaultValue: 'Location' })}
                </p>
                <p className="font-semibold">{getLocationString()}</p>
              </div>
            </div>

            {/* Deadline */}
            {getDeadlineString() && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('deadline', { defaultValue: 'Deadline' })}
                  </p>
                  <p className="font-semibold">{getDeadlineString()}</p>
                </div>
              </div>
            )}

            {/* Posted by */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('postedBy', { defaultValue: 'Posted by' })}
                </p>
                <p className="font-semibold">{t('client', { defaultValue: 'Client' })}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposal Form */}
      <ProposalForm
        taskId={taskId}
        taskTitle={task.title}
        taskBudget={task.budget || 0}
        clientId={task.clientId}
        providerId={user?.uid || ''}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
