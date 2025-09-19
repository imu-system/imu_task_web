
'use client';

import { useTranslations } from 'next-intl';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface ServicePackCardProps {
    pack: {
        id: string;
        name: string;
        price: number;
        providerName: string;
        providerRating: number;
    }
}

export default function ServicePackCard({ pack }: ServicePackCardProps) {
    const t = useTranslations('ServicePackCard');
    
    return (
        <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{pack.name}</h3>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                           <AvatarFallback>{pack.providerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{pack.providerName}</span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
                            <span>{pack.providerRating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="text-xl font-bold text-primary">
                        {pack.price.toFixed(2)} €
                    </div>
                    <Button>{t('book')}</Button>
                </div>
            </CardContent>
        </Card>
    );
}
