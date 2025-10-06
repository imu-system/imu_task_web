
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { Award, Book, Play, Medal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Course } from "@/lib/academy";

interface CourseCardProps {
    course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
    const t = useTranslations('AcademyPage.courseCard');
    const isStarted = course.progress > 0;
    
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Medal className="h-3 w-3" />
                        {course.badgeReward}
                    </Badge>
                </div>
                <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                 <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                 <div>
                    <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
                        <span>{t('progress')}</span>
                        <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                 </div>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href={`/dashboard/academy/course/${course.id}`}>
                        {isStarted ? <Play className="mr-2"/> : <Book className="mr-2"/>}
                        {isStarted ? t('continue') : t('start')}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
