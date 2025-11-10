
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { User } from '@/lib/types';
import { Star, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { FavoriteButton } from './favorites/favorite-button';

interface ProviderCardProps {
    provider: User;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
    const t = useTranslations('ProviderCard');

    // Mock data for now
    const rating = 4.5;
    const reviewCount = 23;
    const skills = ['Jardinage', 'Bricolage'];

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={provider.profile?.photoUrl || undefined} />
                    <AvatarFallback>{provider.profile?.displayName?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{provider.profile?.displayName}</CardTitle>
                        <FavoriteButton
                            itemId={provider.id}
                            itemType="provider"
                            metadata={{
                                title: provider.profile?.displayName,
                                providerName: provider.profile?.displayName,
                            }}
                            size="icon"
                            variant="ghost"
                            data-testid="provider-favorite-button"
                        />
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold">{rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({reviewCount} {t('reviews')})</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {provider.profile?.bio || t('noBio')}
                </p>
                <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button className="flex-1" asChild>
                    <Link href={`/dashboard/provider/${provider.id}`}>{t('viewProfile')}</Link>
                </Button>
                <Button variant="outline">
                    <MessageSquare className="mr-2" />
                    {t('contact')}
                </Button>
            </CardFooter>
        </Card>
    );
}
