
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, Star, MessageSquare, User, Calendar, Eye, EyeOff, ShieldAlert, Trash2, Edit } from 'lucide-react';
import { UserRole, Review, ReviewVisibility } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { getReviewById } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-5 w-5 ${
                        i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                />
            ))}
        </div>
    );
};

export default function AdminReviewDetailPage() {
    const { user: adminUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const reviewId = params.id;
    const t = useTranslations('AdminReviewDetailPage');
    const locale = useLocale();
    const { toast } = useToast();
    
    const [review, setReview] = useState<Review | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!adminUser || !adminUser.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [adminUser, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        const fetchedReview = getReviewById(reviewId);
        if (fetchedReview) {
            setReview(fetchedReview);
        }
        setLoading(false);
    }, [reviewId]);

    const handleToggleVisibility = () => {
        if (!review) return;
        // Simulate API call
        const newVisibility = review.visibility === ReviewVisibility.public ? ReviewVisibility.hidden : ReviewVisibility.public;
        setReview({ ...review, visibility: newVisibility });
        toast({
            title: t('toast.visibility.title'),
            description: t('toast.visibility.description', { status: t(`visibility.${newVisibility}`) }),
        });
    };
    
    const handleDelete = () => {
        if (!review) return;
        // Simulate API call
        toast({
            variant: "destructive",
            title: t('toast.delete.title'),
            description: t('toast.delete.description'),
        });
        router.push('/dashboard/admin/reviews');
    }
    
    const handleEditReview = () => {
        if (!review) return;
        // Simulate API call to save the edited review
        toast({
            title: t('toast.edit.title'),
            description: t('toast.edit.description'),
        });
    }


    if (authLoading || loading || !adminUser || !adminUser.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!review) {
        return (
            <div className="text-center">
                <h1 className="text-xl">{t('notFound')}</h1>
                 <Button asChild variant="link"><Link href="/dashboard/admin/reviews">{t('backToList')}</Link></Button>
            </div>
        )
    }
    
    const getVisibilityVariant = (visibility: ReviewVisibility) => {
        return visibility === ReviewVisibility.public ? 'default' : 'secondary';
    }


  return (
    <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/admin/reviews">
                    <ArrowLeft className="h-4 w-4"/>
                    <span className="sr-only">{t('backToList')}</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {t('title')}
                </h1>
                <p className="text-muted-foreground font-mono text-xs">
                    ID: {review.id}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{t('cards.review.title')}</CardTitle>
                                <CardDescription>
                                    {t('cards.review.description', {
                                        reviewerName: review.reviewer.profile.displayName,
                                        revieweeName: review.reviewee.profile.displayName
                                    })}
                                </CardDescription>
                            </div>
                            <Badge variant={getVisibilityVariant(review.visibility)}>
                                {t(`visibility.${review.visibility}`)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-4">
                            <StarRating rating={review.rating} />
                            <span className="font-bold text-lg">{review.rating.toFixed(1)} / 5.0</span>
                        </div>
                        {review.comment && (
                             <blockquote className="border-l-2 pl-6 italic text-muted-foreground">
                                {review.comment}
                            </blockquote>
                        )}
                        <Separator className="my-4"/>
                        <div className="text-sm text-muted-foreground">
                           <p><strong>{t('cards.review.bookingId')}:</strong> <Link href={`/dashboard/admin/bookings/${review.bookingId}`} className="text-primary hover:underline">{review.bookingId}</Link></p>
                           <p><strong>{t('cards.review.createdAt')}:</strong> {new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(new Date(review.createdAt))}</p>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.context.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                             <h3 className="font-semibold">{t('cards.context.reviewer')}</h3>
                             <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={review.reviewer.profile.photoUrl} />
                                    <AvatarFallback>{review.reviewer.profile.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{review.reviewer.profile.displayName}</p>
                                    <Button asChild variant="link" className="p-0 h-auto">
                                        <Link href={`/dashboard/admin/users/${review.reviewer.id}`}>{t('viewProfile')}</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                             <h3 className="font-semibold">{t('cards.context.reviewee')}</h3>
                             <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={review.reviewee.profile.photoUrl} />
                                    <AvatarFallback>{review.reviewee.profile.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{review.reviewee.profile.displayName}</p>
                                    <Button asChild variant="link" className="p-0 h-auto">
                                        <Link href={`/dashboard/admin/users/${review.reviewee.id}`}>{t('viewProfile')}</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.moderation.title')}</CardTitle>
                        <CardDescription>{t('cards.moderation.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-2">
                        <Button variant="outline" onClick={handleToggleVisibility}>
                            {review.visibility === ReviewVisibility.public ? (
                                <><EyeOff className="mr-2"/>{t('cards.moderation.hide')}</>
                            ) : (
                                <><Eye className="mr-2"/>{t('cards.moderation.show')}</>
                            )}
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline"><Edit className="mr-2"/>{t('cards.moderation.edit')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.moderation.editDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.moderation.editDialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="review-comment">{t('cards.moderation.editDialog.commentLabel')}</Label>
                                        <Textarea id="review-comment" defaultValue={review.comment || ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-reason">{t('cards.moderation.editDialog.reasonLabel')}</Label>
                                        <Textarea id="edit-reason" placeholder={t('cards.moderation.editDialog.reasonPlaceholder')} />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cards.moderation.editDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleEditReview}>{t('cards.moderation.editDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="mr-2"/>{t('cards.moderation.delete')}</Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>{t('cards.moderation.deleteDialog.title')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('cards.moderation.deleteDialog.description')}
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>{t('cards.moderation.deleteDialog.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>{t('cards.moderation.deleteDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
