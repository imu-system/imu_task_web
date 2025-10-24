'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Task } from '@/lib/firestore-tasks';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  CheckCircle2, 
  XCircle, 
  PlayCircle, 
  Clock, 
  Loader2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskStatusActionsProps {
  task: Task;
  userId: string;
  isOwner: boolean;
  isProvider: boolean;
  onStatusChange: (newStatus: Task['status']) => Promise<void>;
}

export function TaskStatusActions({
  task,
  userId,
  isOwner,
  isProvider,
  onStatusChange,
}: TaskStatusActionsProps) {
  const t = useTranslations('TaskStatusActions');
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Task['status'] | null>(null);

  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      setUpdating(true);
      setPendingStatus(newStatus);
      await onStatusChange(newStatus);
      toast({
        title: t('statusUpdatedTitle'),
        description: t('statusUpdatedDescription', { status: getStatusLabel(newStatus) }),
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: t('statusErrorTitle'),
        description: error.message || t('statusErrorDescription'),
      });
    } finally {
      setUpdating(false);
      setPendingStatus(null);
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    const labels: Record<Task['status'], string> = {
      'open': t('statusOpen'),
      'assigned': t('statusAssigned'),
      'in-progress': t('statusInProgress'),
      'completed': t('statusCompleted'),
      'cancelled': t('statusCancelled'),
    };
    return labels[status];
  };

  // Determine available actions based on current status and user role
  const getAvailableActions = () => {
    const actions: Array<{
      status: Task['status'];
      label: string;
      icon: any;
      variant: 'default' | 'destructive' | 'outline' | 'secondary';
      description: string;
      requiresConfirmation: boolean;
    }> = [];

    switch (task.status) {
      case 'open':
        // Owner can cancel
        if (isOwner) {
          actions.push({
            status: 'cancelled',
            label: t('cancelTask'),
            icon: XCircle,
            variant: 'destructive',
            description: t('cancelTaskConfirm'),
            requiresConfirmation: true,
          });
        }
        break;

      case 'assigned':
        // Provider can start work
        if (isProvider) {
          actions.push({
            status: 'in-progress',
            label: t('startTask'),
            icon: PlayCircle,
            variant: 'default',
            description: t('startTaskConfirm'),
            requiresConfirmation: false,
          });
        }
        // Owner can cancel
        if (isOwner) {
          actions.push({
            status: 'cancelled',
            label: t('cancelTask'),
            icon: XCircle,
            variant: 'destructive',
            description: t('cancelTaskConfirm'),
            requiresConfirmation: true,
          });
        }
        break;

      case 'in-progress':
        // Provider can complete
        if (isProvider) {
          actions.push({
            status: 'completed',
            label: t('completeTask'),
            icon: CheckCircle2,
            variant: 'default',
            description: t('completeTaskConfirm'),
            requiresConfirmation: true,
          });
        }
        // Owner can cancel (with confirmation)
        if (isOwner) {
          actions.push({
            status: 'cancelled',
            label: t('cancelTask'),
            icon: XCircle,
            variant: 'destructive',
            description: t('cancelTaskInProgressConfirm'),
            requiresConfirmation: true,
          });
        }
        break;

      case 'completed':
      case 'cancelled':
        // No actions available for completed or cancelled tasks
        break;
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {availableActions.map((action) => {
        const Icon = action.icon;
        const isLoading = updating && pendingStatus === action.status;

        if (action.requiresConfirmation) {
          return (
            <AlertDialog key={action.status}>
              <AlertDialogTrigger asChild>
                <Button
                  variant={action.variant}
                  disabled={updating}
                  className="flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="mr-2 h-4 w-4" />
                  )}
                  {action.label}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('confirmTitle')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {action.description}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={updating}>
                    {t('cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleStatusChange(action.status)}
                    disabled={updating}
                    className={action.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        } else {
          return (
            <Button
              key={action.status}
              variant={action.variant}
              disabled={updating}
              onClick={() => handleStatusChange(action.status)}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icon className="mr-2 h-4 w-4" />
              )}
              {action.label}
            </Button>
          );
        }
      })}
    </div>
  );
}
