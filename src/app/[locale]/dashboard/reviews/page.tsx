
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, Star, Download, MessageSquare, AlertTriangle, Send, Bookmark } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { getReviews } from '@/lib/data';
import { Review, UserRole } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const mockReceivedReviews = getReviews().slice(0,2);
const mockGivenReviews = getReviews().slice(2);

const ratingData = [
    { name: '5 ★', count: 18, percentage: 72 },
    { name: '4 ★', count: 5, percentage: 20 },
    { name: '3 ★', count: 1, percentage: 4 },
    { name: '2 ★', count: 1, percentage: 4 },
    { name: '1 ★', count: 0, percentage: 0 },
];

const ReviewCard = ({ review, type }: { review: Review, type: 'received' | 'given' }) => {
    const t = useTranslations('ReviewsPage');
    const { user } = useAuth();
    const [isReplying, setIsReplying] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const person = type === 'received' ? review.reviewer : review.reviewee;
    const isProvider = user?.roles?.includes(UserRole.provider) ?? false;

    return (
        <div className="space-y-3">
            <div className="flex items-start gap-4">
                <Avatar>
                    <AvatarImage src={person.profile.photoUrl} />
                    <AvatarFallback>{person.profile.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold">{person.profile.displayName}</p>
                        <p className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("h-4 w-4", i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground")} />
                        ))}
                    </div>
                </div>
            </div>
            {review.comment && <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>}
            <div className="flex items-center gap-2">
                {type === 'received' && (
                    <Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)}>
                        <MessageSquare className="mr-2 h-4 w-4"/>
                        {t('actions.reply')}
                    </Button>
                )}
                 {type === 'received' && isProvider && (
                    <Button variant="ghost" size="sm">
                        <Bookmark className="mr-2 h-4 w-4"/>
                        {t('actions.pin')}
                    </Button>
                )}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <AlertTriangle className="mr-2 h-4 w-4"/>
                            {t('actions.report')}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('reportDialog.title')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('reportDialog.description')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4 py-2">
                             <RadioGroup onValueChange={setReportReason} defaultValue={reportReason}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="offensive" id="r1" />
                                    <Label htmlFor="r1">{t('reportDialog.reasons.offensive')}</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="fake" id="r2" />
                                    <Label htmlFor="r2">{t('reportDialog.reasons.fake')}</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="personal" id="r3" />
                                    <Label htmlFor="r3">{t('reportDialog.reasons.personalInfo')}</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="other" id="r4" />
                                    <Label htmlFor="r4">{t('reportDialog.reasons.other')}</Label>
                                </div>
                            </RadioGroup>
                            {reportReason === 'other' && (
                                <Textarea placeholder={t('reportDialog.otherPlaceholder')} />
                            )}
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('reportDialog.cancel')}</AlertDialogCancel>
                            <AlertDialogAction>{t('reportDialog.confirm')}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            {isReplying && (
                <div className="pl-14 space-y-2">
                    <Textarea placeholder={t('replyPlaceholder')} />
                    <Button size="sm">
                        <Send className="mr-2 h-4 w-4"/>
                        {t('publishReply')}
                    </Button>
                </div>
            )}
        </div>
    )
}

export default function ReviewsPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('ReviewsPage');
    
    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Star className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('distribution.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="flex flex-col items-center justify-center text-center">
                        <p className="text-6xl font-bold text-primary">4.8</p>
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("h-5 w-5", i < 4.8 ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground")} />
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{t('distribution.basedOn', {count: 25})}</p>
                    </div>
                     <div className="md:col-span-2 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={ratingData} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                        <div className="bg-background border p-2 rounded-lg shadow-sm">
                                            <p className="text-sm">{`${payload[0].payload.count} ${t('distribution.reviews')} (${payload[0].payload.percentage}%)`}</p>
                                        </div>
                                        );
                                    }
                                    return null;
                                }} />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={12}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="received">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="received">{t('tabs.received')}</TabsTrigger>
                    <TabsTrigger value="given">{t('tabs.given')}</TabsTrigger>
                </TabsList>
                <TabsContent value="received">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('tabs.received')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {mockReceivedReviews.map((review, index) => (
                                <div key={review.id}>
                                    <ReviewCard review={review} type="received" />
                                    {index < mockReceivedReviews.length - 1 && <Separator className="mt-6" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="given">
                     <Card>
                        <CardHeader>
                            <CardTitle>{t('tabs.given')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {mockGivenReviews.map((review, index) => (
                                <div key={review.id}>
                                    <ReviewCard review={review} type="given" />
                                    {index < mockGivenReviews.length - 1 && <Separator className="mt-6" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
