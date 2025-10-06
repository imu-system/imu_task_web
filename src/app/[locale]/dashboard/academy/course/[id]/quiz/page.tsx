
'use client';

import { useRouter, Link } from '@/navigation';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getCourseById, Course, CourseModule } from '@/lib/academy';
import { Loader2, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

export default function CourseQuizPage() {
    const params = useParams<{ id: string }>();
    const courseId = params.id;
    const router = useRouter();
    const t = useTranslations('QuizPage');
    const { toast } = useToast();
    
    const [course, setCourse] = useState<Course | null>(null);
    const [quizModule, setQuizModule] = useState<CourseModule | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const data = getCourseById(courseId as string);
        if (data) {
            setCourse(data);
            const quiz = data.modules.find(m => m.contentType === 'quiz');
            setQuizModule(quiz || null);
        }
    }, [courseId]);

    const handleNext = () => {
        if (quizModule && currentQuestionIndex < quizModule.quiz!.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };
    
    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        // In a real app, you would grade the quiz here.
        console.log("Submitting answers:", answers);
        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: t('toast.title'),
                description: t('toast.description'),
            });
            router.push(`/dashboard/academy/course/${courseId}`);
        }, 1500);
    }
    
    if (!course || !quizModule) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    const currentQuestion = quizModule.quiz![currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / quizModule.quiz!.length) * 100;

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/dashboard/academy/course/${courseId}`}>
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-headline">
                        {t('title')}: {quizModule.title}
                    </h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{t('question', { current: currentQuestionIndex + 1, total: quizModule.quiz!.length })}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4"/>
                            <span>{t('timer')}</span>
                        </div>
                    </div>
                     <Progress value={progressPercentage} className="mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="font-semibold text-lg">{currentQuestion.question}</p>
                    
                    <RadioGroup 
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                        className="space-y-2"
                    >
                        {currentQuestion.options.map(option => (
                             <Label key={option.id} className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                <RadioGroupItem value={option.id} />
                                <span>{option.text}</span>
                            </Label>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                    {t('previous')}
                </Button>
                
                {currentQuestionIndex === quizModule.quiz!.length - 1 ? (
                     <Button size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 animate-spin"/> : <CheckCircle className="mr-2"/>}
                        {t('submit')}
                    </Button>
                ) : (
                    <Button onClick={handleNext}>
                        {t('next')}
                    </Button>
                )}
            </div>
        </div>
    )
}
