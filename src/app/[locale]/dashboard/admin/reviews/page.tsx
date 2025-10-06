
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, Link } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Star, Eye, MoreHorizontal, User, MessageCircle, ArrowRight } from 'lucide-react';
import { UserRole, Review, ReviewVisibility } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getReviews } from '@/lib/data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockReviews: Review[] = getReviews();

export default function AdminReviewsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminReviewsPage');
    
    const [reviews, setReviews] = useState<Review[]>(mockReviews);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);


    if (authLoading || loading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const getVisibilityVariant = (visibility: ReviewVisibility) => {
        return visibility === ReviewVisibility.public ? 'default' : 'secondary';
    }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Star className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                {t('subtitle')}
                </p>
            </div>
        </div>

       <Card>
            <CardHeader>
                <CardTitle>{t('table.title')}</CardTitle>
                <CardDescription>{t('table.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.header.reviewer')}</TableHead>
                            <TableHead></TableHead>
                            <TableHead>{t('table.header.reviewee')}</TableHead>
                            <TableHead>{t('table.header.rating')}</TableHead>
                            <TableHead>{t('table.header.comment')}</TableHead>
                            <TableHead>{t('table.header.visibility')}</TableHead>
                            <TableHead><span className="sr-only">{t('table.header.actions')}</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviews.map((review) => (
                            <TableRow key={review.id}>
                                <TableCell>
                                    <Link href={`/dashboard/admin/users/${review.reviewerId}`} className="flex items-center gap-2 hover:underline">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={review.reviewer.profile.photoUrl} />
                                            <AvatarFallback>{review.reviewer.profile.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{review.reviewer.profile.displayName}</span>
                                    </Link>
                                </TableCell>
                                <TableCell><ArrowRight className="h-4 w-4 text-muted-foreground"/></TableCell>
                                <TableCell>
                                     <Link href={`/dashboard/admin/users/${review.revieweeId}`} className="flex items-center gap-2 hover:underline">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={review.reviewee.profile.photoUrl} />
                                            <AvatarFallback>{review.reviewee.profile.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{review.reviewee.profile.displayName}</span>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 font-medium">
                                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400"/>
                                        {review.rating.toFixed(1)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="max-w-xs truncate text-muted-foreground">{review.comment}</p>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getVisibilityVariant(review.visibility)}>{t(`table.visibility.${review.visibility}`)}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/dashboard/admin/reviews/${review.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            {t('table.actions.details')}
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
       </Card>
    </div>
  );
}
