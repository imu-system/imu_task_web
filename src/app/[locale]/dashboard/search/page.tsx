
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Search as SearchIcon, SlidersHorizontal, MapPin, Wallet } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import ProviderCard from '@/components/provider-card';
import { User, UserRole } from '@/lib/types';
import { users } from '@/lib/data';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { loadGoogleMapsScript } from '@/lib/google-maps-config';

const mockProviders = users.filter(u => u.roles?.includes(UserRole.provider) ?? false);

export default function SearchPage() {
    const t = useTranslations('SearchPage');
    const [date, setDate] = useState<Date | undefined>();
    const [distance, setDistance] = useState([20]);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isMapsScriptLoaded, setMapsScriptLoaded] = useState(false);
    const autocompleteInputRef = useRef<HTMLInputElement>(null);
    const autocompleteInstance = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        loadGoogleMapsScript(() => {
        setMapsScriptLoaded(true);
        });
    }, []);

    useEffect(() => {
        if (isMapsScriptLoaded && autocompleteInputRef.current && !autocompleteInstance.current) {
        autocompleteInstance.current = new google.maps.places.Autocomplete(autocompleteInputRef.current, {
            types: ['geocode'],
            componentRestrictions: { country: 'fr' },
        });
        }
    }, [isMapsScriptLoaded]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <SearchIcon className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-2">
                             <Label htmlFor="keyword">{t('filters.keywordLabel')}</Label>
                            <Input id="keyword" placeholder={t('filters.keywordPlaceholder')} />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="address">{t('filters.addressLabel')}</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="address" ref={autocompleteInputRef} placeholder={t('filters.addressPlaceholder')} className="pl-10" />
                            </div>
                        </div>
                    </div>

                    {showAdvancedFilters && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="distance">{t('filters.distanceLabel')} : {distance[0]} km</Label>
                                <Slider id="distance" defaultValue={distance} max={100} step={1} onValueChange={setDistance} />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('filters.availabilityLabel')}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>{t('filters.availabilityPlaceholder')}</span>}
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="category">{t('filters.categoryLabel')}</Label>
                                <Select>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder={t('filters.categoryPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gardening">Jardinage</SelectItem>
                                        <SelectItem value="shopping">Courses</SelectItem>
                                        <SelectItem value="cleaning">Ménage</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        
                            <div className="lg:col-span-2 space-y-2">
                                <Label>{t('filters.priceLabel')}</Label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="min-price" type="number" placeholder={t('filters.minPricePlaceholder')} className="pl-10"/>
                                    </div>
                                    <span className="text-muted-foreground">-</span>
                                    <div className="relative flex-1">
                                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="max-price" type="number" placeholder={t('filters.maxPricePlaceholder')} className="pl-10"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                     <div className="flex justify-between items-center mt-6">
                        <Button variant="ghost" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                            <SlidersHorizontal className="mr-2"/>
                            {showAdvancedFilters ? t('filters.hideFilters') : t('filters.moreFilters')}
                        </Button>
                        <Button size="lg">
                            <SearchIcon className="mr-2"/>
                            {t('filters.searchButton')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProviders.map(provider => (
                    <ProviderCard key={provider.id} provider={provider as User} />
                ))}
            </div>

        </div>
    );
}
