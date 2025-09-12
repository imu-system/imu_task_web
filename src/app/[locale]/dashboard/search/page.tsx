
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import ProviderCard from '@/components/provider-card';
import { User, UserRole } from '@/lib/types';
import { users } from '@/lib/data';

const mockProviders = users.filter(u => u.roles.includes(UserRole.provider));

export default function SearchPage() {
    const t = useTranslations('SearchPage');
    const [date, setDate] = useState<Date | undefined>();

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
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Input placeholder={t('filters.keywordPlaceholder')} className="lg:col-span-2" />
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder={t('filters.categoryPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gardening">Jardinage</SelectItem>
                                <SelectItem value="shopping">Courses</SelectItem>
                                <SelectItem value="cleaning">Ménage</SelectItem>
                            </SelectContent>
                        </Select>
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
                     <div className="flex justify-end mt-4">
                        <Button>
                            <SlidersHorizontal className="mr-2"/>
                            {t('filters.refineSearch')}
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
