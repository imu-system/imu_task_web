
'use client';

import { useAuth } from "@/contexts/AuthContext";
import { KYCStatus } from "@/lib/types";
import { useTranslations } from "next-intl";
import { Loader2, ShieldCheck, CheckCircle, Clock, AlertCircle, ArrowLeft, Camera, Upload, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/navigation";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const mockHistory = [
    { event: 'Selfie validé', date: '12/09/2024', status: 'success' },
    { event: 'Document ID rejeté (flou)', date: '13/09/2024', status: 'failed' },
    { event: 'Nouveaux documents soumis', date: '14/09/2024', status: 'pending' },
];

export default function KycPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('KycPage');
    const { toast } = useToast();
    
    const [idFile, setIdFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
        if (e.target.files && e.target.files.length > 0) {
            setter(e.target.files[0]);
        }
    };
    
    const FileUploadRow = ({ label, file, setFile, icon }: { label: string, file: File | null, setFile: React.Dispatch<React.SetStateAction<File | null>>, icon: React.ReactNode }) => (
        <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1 space-y-1">
                <span className="font-medium">{label}</span>
                {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
            </div>
            {file ? (
                 <Button variant="ghost" size="icon" onClick={() => setFile(null)} aria-label="Remove file">
                    <X className="h-4 w-4 text-destructive" />
                </Button>
            ) : (
                <Button variant="outline" size="sm" asChild>
                    <label>
                        {icon}
                        {label === t('documents.idCard') || label === t('documents.proofOfAddress') ? t('documents.upload') : t('documents.takePicture')}
                        <input type="file" className="sr-only" onChange={(e) => handleFileChange(e, setFile)} />
                    </label>
                </Button>
            )}
        </div>
    );

    const StatusDisplay = () => {
        const kycStatus = KYCStatus.pending; // Forcing pending for demo
        switch (kycStatus) {
            case KYCStatus.verified as any:
                return (
                    <div className="text-center p-6 bg-green-100/50 rounded-lg border border-green-200 text-green-800">
                        <CheckCircle className="h-12 w-12 mx-auto" />
                        <h3 className="text-xl font-bold mt-4">{t('status.verified.title')}</h3>
                        <p className="mt-2">{t('status.verified.description')}</p>
                    </div>
                )
            case KYCStatus.pending:
                 return (
                    <div className="text-center p-4 bg-yellow-100/50 rounded-lg border border-yellow-200 text-yellow-800 flex items-center justify-center gap-2">
                        <Clock className="h-6 w-6" />
                        <div>
                            <h3 className="text-lg font-bold">{t('status.pending.title')}</h3>
                            <p className="text-sm">{t('status.pending.description')}</p>
                        </div>
                    </div>
                )
            case KYCStatus.rejected as any:
                return (
                    <div className="text-center p-6 bg-red-100/50 rounded-lg border border-red-200 text-red-800">
                        <AlertCircle className="h-12 w-12 mx-auto" />
                        <h3 className="text-xl font-bold mt-4">{t('status.rejected.title')}</h3>
                        <p className="mt-2">{t('status.rejected.description')}</p>
                    </div>
                )
            default:
                return null;
        }
    }


    return (
        <div className="mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/profile">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <StatusDisplay />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('documents.title')}</CardTitle>
                            <CardDescription>{t('documents.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <FileUploadRow label={t('documents.idCard')} file={idFile} setFile={setIdFile} icon={<Upload className="mr-2"/>}/>
                           <FileUploadRow label={t('documents.selfie')} file={selfieFile} setFile={setSelfieFile} icon={<Camera className="mr-2"/>}/>
                           <FileUploadRow label={t('documents.proofOfAddress')} file={proofFile} setFile={setProofFile} icon={<Upload className="mr-2"/>}/>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('stripe.title')}</CardTitle>
                            <CardDescription>{t('stripe.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button className="w-full" disabled>{t('stripe.button')}</Button>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('history.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {mockHistory.map((item, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${item.status === 'success' ? 'bg-green-100' : item.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'}`}>
                                            {item.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600"/>}
                                            {item.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-600"/>}
                                            {item.status === 'pending' && <Clock className="h-5 w-5 text-gray-600"/>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{item.event}</p>
                                            <p className="text-xs text-muted-foreground">{item.date}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    <Button size="lg" className="w-full">{t('submitButton')}</Button>
                </div>
            </div>
        </div>
    )
}
