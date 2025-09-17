
'use client';

import { useParams, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getCourseById, Course, CourseModule } from '@/lib/academy';
import { Loader2, ArrowLeft, CheckCircle, PlayCircle, Lock, Download, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const statusIcons = {
    completed: <CheckCircle className="h-5 w-5 text-green-500" />,
    in_progress: <PlayCircle className="h-5 w-5 text-blue-500" />,
    locked: <Lock className="h-5 w-5 text-muted-foreground" />,
};


export default function CourseDetailPage() {
    const params = useParams<{ id: string }>();
    const courseId = params.id;
    const t = useTranslations('AcademyDetailPage');
    const [course, setCourse] = useState<Course | null>(null);
    const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = getCourseById(courseId);
        if (data) {
            setCourse(data);
            setActiveModule(data.modules.find(m => m.status === 'in_progress') || data.modules[0] || null);
        }
        setLoading(false);
    }, [courseId]);

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (!course) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-semibold">{t('notFound')}</h2>
                <Button asChild variant="link">
                    <Link href="/dashboard/academy">{t('backToAcademy')}</Link>
                </Button>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/academy">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-headline">
                        {course.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Progress value={course.progress} className="w-40 h-2" />
                        <span className="text-sm text-muted-foreground">{course.progress}%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{t('sections.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ul className="divide-y">
                            {course.modules.map((module, index) => (
                                <li key={module.id}>
                                    <button 
                                        className={cn(
                                            "w-full text-left p-4 flex items-center gap-3",
                                            module.status === 'locked' ? 'text-muted-foreground cursor-not-allowed' : 'hover:bg-muted/50',
                                            activeModule?.id === module.id && 'bg-muted'
                                        )}
                                        onClick={() => module.status !== 'locked' && setActiveModule(module)}
                                        disabled={module.status === 'locked'}
                                    >
                                        {statusIcons[module.status]}
                                        <span>{index + 1}. {module.title}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <div className="lg:col-span-3 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>{activeModule?.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activeModule?.contentType === 'video' ? (
                                <div className="aspect-video">
                                     <iframe
                                        className="w-full h-full rounded-lg"
                                        src={activeModule.content}
                                        title={activeModule.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : activeModule?.contentType === 'quiz' ? (
                                <div className="prose max-w-none">
                                    <p>{activeModule?.content}</p>
                                </div>
                            ) : (
                                <div className="prose max-w-none">
                                    <p>{activeModule?.content}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                     <div className="flex justify-between">
                        <Button variant="outline">
                            <Download className="mr-2"/>
                            {t('downloadResources')}
                        </Button>
                        <Button asChild>
                            <Link href={activeModule?.contentType === 'quiz' ? `/dashboard/academy/course/${course.id}/quiz` : '#'}>
                                {activeModule?.contentType === 'quiz' ? <FileQuestion className="mr-2" /> : <PlayCircle className="mr-2"/>}
                                {activeModule?.contentType === 'quiz' ? t('startQuiz') : t('continueModule')}
                            </Link>
                        </Button>
                     </div>
                </div>
            </div>
        </div>
    );
}
