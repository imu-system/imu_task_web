
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, Trash2, GripVertical } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const mockFaqData = [
    {
        id: 'cat1',
        name: 'Général',
        questions: [
            { id: 'q1', question: "Qu'est-ce que ImuTask ?", answer: "ImuTask est une plateforme qui connecte des personnes ayant besoin d'aide pour des tâches quotidiennes avec des jeunes motivés de leur communauté." },
            { id: 'q2', question: "Comment puis-je m'inscrire ?", answer: "Vous pouvez vous inscrire en tant que client (pour demander de l'aide) ou en tant que prestataire (pour offrir vos services) en cliquant sur le bouton 'S'inscrire' en haut de la page." },
        ]
    },
    {
        id: 'cat2',
        name: 'Paiements & Sécurité',
        questions: [
            { id: 'q3', question: "Les paiements sont-ils sécurisés ?", answer: "Oui, tous les paiements sont traités de manière sécurisée via notre partenaire Stripe. Les fonds sont conservés sous séquestre jusqu'à ce que la mission soit confirmée comme terminée par le client." },
            { id: 'q4', question: "Comment les prestataires sont-ils vérifiés ?", answer: "Nous demandons à tous les prestataires de compléter un processus de vérification d'identité (KYC) pour garantir la sécurité et la confiance sur la plateforme." },
        ]
    }
];

export default function AdminFaqPage() {
    const t = useTranslations('AdminCmsPage.faq');

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('description')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <PlusCircle className="mr-2"/>
                        {t('addQuestion')}
                    </Button>
                     <Button>
                        <PlusCircle className="mr-2"/>
                        {t('addCategory')}
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {mockFaqData.map(category => (
                    <Card key={category.id}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <CardTitle className="text-xl">{category.name}</CardTitle>
                            </div>
                            <div>
                                <Button variant="ghost" size="sm"><Edit className="mr-2"/>{t('actions.edit')}</Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="mr-2"/>{t('actions.delete')}</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{t('dialog.title')}</AlertDialogTitle>
                                            <AlertDialogDescription>{t('dialog.categoryDescription')}</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
                                            <AlertDialogAction>{t('dialog.confirm')}</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <Accordion type="multiple" className="w-full">
                                {category.questions.map(item => (
                                    <AccordionItem key={item.id} value={item.id}>
                                        <div className="flex items-center w-full">
                                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                            <AccordionTrigger className="flex-1 text-left">{item.question}</AccordionTrigger>
                                             <div className="ml-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>{t('actions.edit')}</DropdownMenuItem>
                                                         <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">{t('actions.delete')}</DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>{t('dialog.title')}</AlertDialogTitle>
                                                                    <AlertDialogDescription>{t('dialog.questionDescription')}</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
                                                                    <AlertDialogAction>{t('dialog.confirm')}</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <AccordionContent className="pl-10">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
