
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Search } from 'lucide-react';
import { mockCourses } from '@/lib/academy';
import CourseCard from '@/components/academy/course-card';

export default function AcademyPage() {
    const t = useTranslations('AcademyPage');

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <BookOpen className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                         <div className="relative flex-1 md:grow-0">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={t('searchPlaceholder')}
                                className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[336px]"
                            />
                        </div>
                        <Select>
                            <SelectTrigger className="w-full md:w-[240px]">
                                <SelectValue placeholder={t('filterPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.all')}</SelectItem>
                                <SelectItem value="provider">{t('filters.provider')}</SelectItem>
                                <SelectItem value="client">{t('filters.client')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
