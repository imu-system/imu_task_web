/**
 * Page de soumission KYC
 * Permet aux utilisateurs de soumettre leurs documents pour devenir prestataire
 */
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle,
    CheckCircle2,
    Upload,
    FileText,
    Loader2,
    ShieldCheck,
} from 'lucide-react';
import { useRouter } from '@/navigation';

interface DocumentUpload {
    type: string;
    label: string;
    description: string;
    file: File | null;
    url: string | null;
    uploading: boolean;
}

const REQUIRED_DOCUMENTS: Omit<DocumentUpload, 'file' | 'url' | 'uploading'>[] = [
    {
        type: 'identity',
        label: 'Pièce d\'identité',
        description: 'Carte d\'identité, passeport ou permis de conduire valide',
    },
    {
        type: 'address',
        label: 'Justificatif de domicile',
        description: 'Facture de moins de 3 mois (électricité, gaz, internet...)',
    },
    {
        type: 'professional',
        label: 'Document professionnel',
        description: 'KBIS, certificat d\'auto-entrepreneur ou autre justificatif',
    },
    {
        type: 'tax',
        label: 'Justificatif fiscal',
        description: 'Numéro SIRET, TVA intracommunautaire ou avis d\'imposition',
    },
];

export default function KYCSubmitPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [documents, setDocuments] = useState<DocumentUpload[]>(
        REQUIRED_DOCUMENTS.map((doc) => ({
            ...doc,
            file: null,
            url: null,
            uploading: false,
        }))
    );
    const [uploading, setUploading] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (index: number, file: File | null) => {
        const newDocuments = [...documents];
        newDocuments[index].file = file;
        setDocuments(newDocuments);
        setError(null);
    };

    const uploadDocument = async (doc: DocumentUpload): Promise<string> => {
        if (!doc.file || !user) {
            throw new Error('Fichier ou utilisateur manquant');
        }

        const storage = getStorage();
        const fileExtension = doc.file.name.split('.').pop();
        const fileName = `${user.uid}/${doc.type}_${Date.now()}.${fileExtension}`;
        const storageRef = ref(storage, `kyc/${fileName}`);

        await uploadBytes(storageRef, doc.file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    };

    const handleSubmit = async () => {
        if (!user) {
            setError('Vous devez être connecté');
            return;
        }

        // Vérifier que tous les documents sont sélectionnés
        const missingDocs = documents.filter((doc) => !doc.file);
        if (missingDocs.length > 0) {
            setError(
                `Veuillez sélectionner tous les documents requis: ${missingDocs
                    .map((d) => d.label)
                    .join(', ')}`
            );
            return;
        }

        setUploading(true);
        setError(null);
        setSubmitProgress(0);

        try {
            // Upload tous les documents
            const uploadedDocs = [];
            const totalDocs = documents.length;

            for (let i = 0; i < documents.length; i++) {
                const doc = documents[i];
                setSubmitProgress(((i + 1) / (totalDocs + 1)) * 100);

                const url = await uploadDocument(doc);
                uploadedDocs.push({
                    type: doc.type,
                    url,
                    uploadedAt: new Date().toISOString(),
                    verified: false,
                });
            }

            // Soumettre la demande KYC
            const submitKYC = httpsCallable(functions, 'submitKYC');
            const result = await submitKYC({ documents: uploadedDocs });
            const data = result.data as any;

            if (data.success) {
                setSubmitProgress(100);
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 3000);
            }
        } catch (err: any) {
            console.error('Error submitting KYC:', err);
            setError(err.message || 'Erreur lors de la soumission');
        } finally {
            setUploading(false);
        }
    };

    if (user?.kycStatus === 'approved') {
        return (
            <div className="container max-w-4xl py-8">
                <Alert className="border-green-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                        Votre compte est déjà vérifié et vous avez le statut de prestataire.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (user?.kycStatus === 'pending') {
        return (
            <div className="container max-w-4xl py-8">
                <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                        Votre demande KYC est en cours de traitement. Nous vous notifierons dès
                        qu'elle sera examinée.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (success) {
        return (
            <div className="container max-w-4xl py-8">
                <Alert className="border-green-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                        Votre demande KYC a été soumise avec succès ! Notre équipe l'examinera
                        dans les plus brefs délais.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Vérification KYC</h1>
                <p className="text-muted-foreground">
                    Soumettez vos documents pour devenir prestataire vérifié
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {user?.kycStatus === 'rejected' && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Votre précédente demande a été rejetée. Veuillez soumettre de nouveaux
                        documents conformes.
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" />
                        Documents requis
                    </CardTitle>
                    <CardDescription>
                        Tous les documents sont obligatoires et doivent être valides
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {documents.map((doc, index) => (
                        <div key={doc.type} className="space-y-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-medium">{doc.label}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {doc.description}
                                    </p>
                                </div>
                                {doc.file && (
                                    <Badge variant="outline" className="bg-green-100">
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Sélectionné
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    id={`file-${doc.type}`}
                                    accept="image/*,application/pdf"
                                    onChange={(e) =>
                                        handleFileChange(index, e.target.files?.[0] || null)
                                    }
                                    className="hidden"
                                    disabled={uploading}
                                />
                                <label htmlFor={`file-${doc.type}`}>
                                    <Button
                                        variant="outline"
                                        asChild
                                        disabled={uploading}
                                        className="cursor-pointer"
                                    >
                                        <span>
                                            <Upload className="mr-2 h-4 w-4" />
                                            {doc.file ? 'Changer' : 'Sélectionner'}
                                        </span>
                                    </Button>
                                </label>
                                {doc.file && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <FileText className="mr-2 h-4 w-4" />
                                        {doc.file.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {uploading && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Upload en cours...</span>
                                <span>{Math.round(submitProgress)}%</span>
                            </div>
                            <Progress value={submitProgress} />
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => router.back()} disabled={uploading}>
                    Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={uploading}>
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Envoi en cours...
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Soumettre la demande
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
