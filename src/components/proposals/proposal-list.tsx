'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  getTaskProposals,
  acceptProposal,
  updateProposalStatus,
  deleteProposal,
  Proposal,
} from '@/lib/firestore-proposals';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  MessageSquare,
  User,
  Loader2,
  Trash2,
} from 'lucide-react';

interface ProposalListProps {
  taskId: string;
  isTaskOwner: boolean;
  currentUserId: string;
  onProposalAccepted?: () => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export function ProposalList({
  taskId,
  isTaskOwner,
  currentUserId,
  onProposalAccepted,
}: ProposalListProps) {
  const t = useTranslations('Proposals');
  const { toast } = useToast();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedProposals = await getTaskProposals(taskId);
      setProposals(fetchedProposals);
    } catch (err: any) {
      console.error('Error fetching proposals:', err);
      setError(err.message || t('errorLoadingProposals'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [taskId]);

  const handleAccept = async (proposalId: string) => {
    try {
      setActionLoading(proposalId);
      await acceptProposal(proposalId, taskId);

      toast({
        title: t('acceptSuccessTitle'),
        description: t('acceptSuccessDescription'),
      });

      // Refresh proposals
      await fetchProposals();

      // Call callback
      if (onProposalAccepted) {
        onProposalAccepted();
      }
    } catch (err: any) {
      console.error('Error accepting proposal:', err);
      toast({
        title: t('errorTitle'),
        description: err.message || t('errorGeneric'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (proposalId: string) => {
    try {
      setActionLoading(proposalId);
      await updateProposalStatus(proposalId, 'rejected');

      toast({
        title: t('rejectSuccessTitle'),
        description: t('rejectSuccessDescription'),
      });

      // Refresh proposals
      await fetchProposals();
    } catch (err: any) {
      console.error('Error rejecting proposal:', err);
      toast({
        title: t('errorTitle'),
        description: err.message || t('errorGeneric'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (proposalId: string) => {
    try {
      setActionLoading(proposalId);
      await deleteProposal(proposalId);

      toast({
        title: t('deleteSuccessTitle'),
        description: t('deleteSuccessDescription'),
      });

      // Refresh proposals
      await fetchProposals();
    } catch (err: any) {
      console.error('Error deleting proposal:', err);
      toast({
        title: t('errorTitle'),
        description: err.message || t('errorGeneric'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('listTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (proposals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('listTitle')}</CardTitle>
          <CardDescription>
            {isTaskOwner ? t('noProposalsOwner') : t('noProposalsProvider')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <MessageSquare className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isTaskOwner ? t('emptyStateOwner') : t('emptyStateProvider')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('listTitle')}</CardTitle>
        <CardDescription>
          {t('proposalCount', { count: proposals.length })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {proposals.map((proposal, index) => {
          const isOwnProposal = proposal.providerId === currentUserId;
          const canDelete = isOwnProposal && proposal.status === 'pending';
          const canAcceptReject = isTaskOwner && proposal.status === 'pending';

          return (
            <div key={proposal.id}>
              {index > 0 && <Separator className="my-4" />}

              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {isOwnProposal
                        ? t('you')
                        : `${t('provider')} #${proposal.providerId.slice(0, 8)}`}
                    </span>
                    <Badge className={statusColors[proposal.status]}>
                      {proposal.status === 'accepted'
                        ? t('statusAccepted')
                        : proposal.status === 'rejected'
                          ? t('statusRejected')
                          : t('statusPending')}
                    </Badge>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {formatDate(proposal.createdAt)}
                  </span>
                </div>

                {/* Amount and duration */}
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {proposal.amount}€
                    </span>
                  </div>

                  {proposal.estimatedDuration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {proposal.estimatedDuration}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {t('message')}
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{proposal.message}</p>
                </div>

                {/* Actions */}
                {(canAcceptReject || canDelete) && (
                  <div className="flex gap-2">
                    {/* Task owner actions */}
                    {canAcceptReject && (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="default"
                              disabled={actionLoading === proposal.id}
                            >
                              {actionLoading === proposal.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                              )}
                              {t('accept')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t('acceptConfirmTitle')}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('acceptConfirmDescription', {
                                  amount: proposal.amount,
                                })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleAccept(proposal.id!)}
                              >
                                {t('acceptConfirm')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(proposal.id!)}
                          disabled={actionLoading === proposal.id}
                        >
                          {actionLoading === proposal.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="mr-2 h-4 w-4" />
                          )}
                          {t('reject')}
                        </Button>
                      </>
                    )}

                    {/* Provider delete action */}
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actionLoading === proposal.id}
                          >
                            {actionLoading === proposal.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            {t('delete')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('deleteConfirmTitle')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('deleteConfirmDescription')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(proposal.id!)}
                              className="bg-red-600"
                            >
                              {t('deleteConfirm')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
