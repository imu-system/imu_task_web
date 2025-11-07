'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
import { cn } from '@/lib/utils';
import { approveReview, removeReview, dismissReport } from '@/lib/firestore-reviews';
import { useToast } from '@/hooks/use-toast';
import type { Review } from '@/types/reviews';
import PhotoGallery from './photo-gallery';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

// ============================================================================
// TYPES
// ============================================================================

interface ReviewModerationFormProps {
  review: Review;
  adminId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  locale?: string;
  className?: string;
}

// ============================================================================
// REVIEW MODERATION FORM COMPONENT
// ============================================================================

export default function ReviewModerationForm({
  review,
  adminId,
  onSuccess,
  onCancel,
  locale = 'en',
  className,
}: ReviewModerationFormProps) {
  const t = useTranslations('Admin.moderation.form');
  const { toast } = useToast();
  const [action, setAction] = useState<'approve' | 'remove' | 'dismiss' | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const dateLocale = locale === 'fr' ? fr : enUS;
  const createdAt = review.createdAt instanceof Date 
    ? review.createdAt 
    : new Date(review.createdAt);
  const timeAgo = formatDistanceToNow(createdAt, { 
    addSuffix: true,
    locale: dateLocale,
  });

  const reportCount = (review as any).moderation?.reportCount || 1;
  const moderationStatus = (review as any).moderation?.status || 'pending';

  // Handle approve
  const handleApprove = async () => {
    try {
      setLoading(true);
      await approveReview(review.id!, adminId, reason || undefined);
      
      toast({
        title: t('success.approve.title'),
        description: t('success.approve.description'),
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error approving review:', error);
      toast({
        title: t('error.title'),
        description: t('error.description'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  // Handle remove
  const handleRemove = async () => {
    if (!reason.trim()) {
      toast({
        title: t('error.reasonRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await removeReview(review.id!, adminId, reason);
      
      toast({
        title: t('success.remove.title'),
        description: t('success.remove.description'),
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error removing review:', error);
      toast({
        title: t('error.title'),
        description: t('error.description'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  // Handle dismiss
  const handleDismiss = async () => {
    try {
      setLoading(true);
      await dismissReport(review.id!, adminId, reason || undefined);
      
      toast({
        title: t('success.dismiss.title'),
        description: t('success.dismiss.description'),
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error dismissing report:', error);
      toast({
        title: t('error.title'),
        description: t('error.description'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {t('reportCount', { count: reportCount })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Review Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.reviewerAvatar} />
              <AvatarFallback>
                {review.reviewerName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{review.reviewerName}</p>
              <p className="text-sm text-muted-foreground">{timeAgo}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-4 w-4',
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-muted text-muted-foreground'
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{review.rating}/5</span>
          </div>
        </div>

        <Separator />

        {/* Review Content */}
        <div className="space-y-4">
          <div>
            <Label className="text-base">{t('reviewedUser')}</Label>
            <p className="text-sm text-muted-foreground mt-1">{review.reviewedUserName}</p>
          </div>

          <div>
            <Label className="text-base">{t('comment')}</Label>
            <p className="text-sm mt-1 whitespace-pre-wrap">
              {review.comment || t('noComment')}
            </p>
          </div>

          {/* Photos */}
          {review.photos && review.photos.length > 0 && (
            <div>
              <Label className="text-base">{t('photos')}</Label>
              <div className="mt-2">
                <PhotoGallery photos={review.photos} />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Admin Note/Reason */}
        <div className="space-y-2">
          <Label htmlFor="admin-note">{t('adminNote.label')}</Label>
          <Textarea
            id="admin-note"
            placeholder={t('adminNote.placeholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">{t('adminNote.description')}</p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {/* Cancel Button */}
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 ml-auto">
          {/* Dismiss Report */}
          <AlertDialog open={action === 'dismiss'} onOpenChange={(open) => !open && setAction(null)}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setAction('dismiss')}
                disabled={loading || moderationStatus === 'dismissed'}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t('dismiss')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('dismissDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>{t('dismissDialog.description')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('dismissDialog.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDismiss} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('dismissDialog.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Approve Review */}
          <AlertDialog open={action === 'approve'} onOpenChange={(open) => !open && setAction(null)}>
            <AlertDialogTrigger asChild>
              <Button
                variant="default"
                onClick={() => setAction('approve')}
                disabled={loading || moderationStatus === 'approved'}
                className="bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('approve')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('approveDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>{t('approveDialog.description')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('approveDialog.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleApprove} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('approveDialog.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Remove Review */}
          <AlertDialog open={action === 'remove'} onOpenChange={(open) => !open && setAction(null)}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                onClick={() => setAction('remove')}
                disabled={loading || moderationStatus === 'removed'}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t('remove')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('removeDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>{t('removeDialog.description')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('removeDialog.cancel')}</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleRemove} 
                  disabled={loading || !reason.trim()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('removeDialog.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
