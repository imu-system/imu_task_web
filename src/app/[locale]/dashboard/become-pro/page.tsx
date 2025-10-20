/**
 * Page d'inscription ImuPro - Devenir professionnel vérifié
 * Formulaire KYB (Know Your Business) multi-étapes avec validation SIRET
 */
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertCircle,
    CheckCircle2,
    Upload,
    FileText,
    Loader2,
    ShieldCheck,
    Building2,
    Award,
    MapPin,
    Euro,
    ChevronLeft,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import { useRouter } from '@/navigation';

// Types locaux (alignés avec functions/src/types/imupro.ts)
type KYBDocumentType = 
    | 'kbis'
    | 'siret'
    | 'insurance_rc_pro'
    | 'insurance_decennale'
    | 'tax_certificate'
    | 'professional_card'
    | 'diploma'
    | 'certification'
    | 'bank_details'
    | 'identity';

type BusinessType = 
    | 'auto_entrepreneur'
    | 'eurl'
    | 'sarl'
    | 'sas'
    | 'sasu'
    | 'association';

type ProServiceCategory = 
    | 'renovation'
    | 'plumbing'
    | 'electricity'
    | 'painting'
    | 'masonry'
    | 'carpentry'
    | 'gardening'
    | 'cleaning'
    | 'moving'
    | 'other';

interface DocumentUpload {
    type: KYBDocumentType;
    label: string;
    description: string;
    file: File | null;
    url: string | null;
    uploading: boolean;
    required: boolean;
}

interface Certification {
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    certificateNumber?: string;
    documentUrl?: string;
}

interface BusinessInfo {
    businessName: string;
    siret: string;
    businessType: BusinessType;
    registrationNumber?: string;
    registrationDate?: string;
    vatNumber?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    description: string;
}

interface InsuranceInfo {
    provider: string;
    policyNumber: string;
    coverageAmount: number;
    expiryDate: string;
    documentUrl: string;
}

// Étapes du formulaire
const STEPS = [
    { id: 1, title: 'Informations entreprise', description: 'SIRET, raison sociale, statut juridique' },
    { id: 2, title: 'Adresse et contact', description: 'Coordonnées professionnelles' },
    { id: 3, title: 'Catégories de services', description: 'Domaines d\'expertise' },
    { id: 4, title: 'Assurance RC Pro', description: 'Responsabilité civile professionnelle' },
    { id: 5, title: 'Certifications', description: 'Diplômes et qualifications (optionnel)' },
    { id: 6, title: 'Documents obligatoires', description: 'KBIS, pièce d\'identité' },
    { id: 7, title: 'Description et tarifs', description: 'Présentation de vos services' },
    { id: 8, title: 'Récapitulatif', description: 'Vérification avant envoi' },
];

const SERVICE_CATEGORIES: { value: ProServiceCategory; label: string }[] = [
    { value: 'renovation', label: 'Rénovation générale' },
    { value: 'plumbing', label: 'Plomberie' },
    { value: 'electricity', label: 'Électricité' },
    { value: 'painting', label: 'Peinture' },
    { value: 'masonry', label: 'Maçonnerie' },
    { value: 'carpentry', label: 'Menuiserie' },
    { value: 'gardening', label: 'Jardinage' },
    { value: 'cleaning', label: 'Nettoyage' },
    { value: 'moving', label: 'Déménagement' },
    { value: 'other', label: 'Autre' },
];

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
    { value: 'auto_entrepreneur', label: 'Auto-entrepreneur / Micro-entreprise' },
    { value: 'eurl', label: 'EURL' },
    { value: 'sarl', label: 'SARL' },
    { value: 'sas', label: 'SAS' },
    { value: 'sasu', label: 'SASU' },
    { value: 'association', label: 'Association' },
];

export default function BecomeProPage() {
    const { user } = useAuth();
    const router = useRouter();

    // État du wizard
    const [currentStep, setCurrentStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [siretVerifying, setSiretVerifying] = useState(false);
    const [siretVerified, setSiretVerified] = useState(false);

    // Données du formulaire
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
        businessName: '',
        siret: '',
        businessType: 'auto_entrepreneur',
        address: '',
        city: '',
        postalCode: '',
        country: 'France',
        phone: '',
        email: user?.email || '',
        description: '',
    });

    const [selectedCategories, setSelectedCategories] = useState<ProServiceCategory[]>([]);

    const [insurance, setInsurance] = useState<InsuranceInfo>({
        provider: '',
        policyNumber: '',
        coverageAmount: 0,
        expiryDate: '',
        documentUrl: '',
    });

    const [certifications, setCertifications] = useState<Certification[]>([]);

    const [documents, setDocuments] = useState<DocumentUpload[]>([
        {
            type: 'kbis',
            label: 'Extrait KBIS (ou équivalent)',
            description: 'Document de moins de 3 mois',
            file: null,
            url: null,
            uploading: false,
            required: true,
        },
        {
            type: 'insurance_rc_pro',
            label: 'Attestation RC Pro',
            description: 'Assurance responsabilité civile professionnelle en cours de validité',
            file: null,
            url: null,
            uploading: false,
            required: true,
        },
        {
            type: 'identity',
            label: 'Pièce d\'identité',
            description: 'Carte d\'identité, passeport ou permis de conduire',
            file: null,
            url: null,
            uploading: false,
            required: true,
        },
    ]);

    const [agreeTerms, setAgreeTerms] = useState(false);

    // Vérification SIRET
    const handleVerifySiret = async () => {
        if (businessInfo.siret.length !== 14) {
            setError('Le SIRET doit contenir 14 chiffres');
            return;
        }

        setSiretVerifying(true);
        setError(null);

        try {
            // Appel à la Cloud Function de vérification SIRET
            // Pour l'instant, validation locale basique
            const isValid = /^\d{14}$/.test(businessInfo.siret);

            if (isValid) {
                setSiretVerified(true);
                setError(null);
            } else {
                setError('Format de SIRET invalide');
                setSiretVerified(false);
            }
        } catch (err: any) {
            console.error('Erreur vérification SIRET:', err);
            setError(err.message || 'Erreur lors de la vérification du SIRET');
            setSiretVerified(false);
        } finally {
            setSiretVerifying(false);
        }
    };

    // Upload de document
    const uploadDocument = async (doc: DocumentUpload): Promise<string> => {
        if (!doc.file || !user) {
            throw new Error('Fichier ou utilisateur manquant');
        }

        const storage = getStorage();
        const fileExtension = doc.file.name.split('.').pop();
        const fileName = `${user.uid}/${doc.type}_${Date.now()}.${fileExtension}`;
        const storageRef = ref(storage, `kyb/${fileName}`);

        await uploadBytes(storageRef, doc.file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    };

    const handleFileChange = (index: number, file: File | null) => {
        const newDocuments = [...documents];
        newDocuments[index].file = file;
        setDocuments(newDocuments);
        setError(null);
    };

    // Navigation
    const handleNext = () => {
        // Validation de l'étape courante
        if (currentStep === 1) {
            if (!businessInfo.businessName || !businessInfo.siret || !businessInfo.businessType) {
                setError('Veuillez remplir tous les champs obligatoires');
                return;
            }
            if (!siretVerified) {
                setError('Veuillez vérifier votre SIRET');
                return;
            }
        } else if (currentStep === 2) {
            if (!businessInfo.address || !businessInfo.city || !businessInfo.postalCode || !businessInfo.phone) {
                setError('Veuillez remplir tous les champs obligatoires');
                return;
            }
        } else if (currentStep === 3) {
            if (selectedCategories.length === 0) {
                setError('Sélectionnez au moins une catégorie de service');
                return;
            }
        } else if (currentStep === 4) {
            if (!insurance.provider || !insurance.policyNumber || !insurance.expiryDate) {
                setError('Veuillez remplir toutes les informations d\'assurance');
                return;
            }
        } else if (currentStep === 6) {
            const missingDocs = documents.filter((doc) => doc.required && !doc.file);
            if (missingDocs.length > 0) {
                setError(`Documents manquants : ${missingDocs.map((d) => d.label).join(', ')}`);
                return;
            }
        } else if (currentStep === 8) {
            if (!agreeTerms) {
                setError('Veuillez accepter les conditions générales ImuPro');
                return;
            }
        }

        setError(null);
        setCurrentStep((prev) => Math.min(prev + 1, 8));
    };

    const handlePrevious = () => {
        setError(null);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    // Soumission finale
    const handleSubmit = async () => {
        if (!user || !agreeTerms) {
            setError('Veuillez accepter les conditions générales');
            return;
        }

        setUploading(true);
        setError(null);
        setSubmitProgress(0);

        try {
            // 1. Upload des documents
            const uploadedDocs = [];
            const totalDocs = documents.filter((d) => d.file).length;

            for (let i = 0; i < documents.length; i++) {
                const doc = documents[i];
                if (doc.file) {
                    setSubmitProgress(((i + 1) / (totalDocs + 1)) * 100);
                    const url = await uploadDocument(doc);
                    uploadedDocs.push({
                        type: doc.type,
                        url,
                        uploadedAt: new Date().toISOString(),
                        verified: false,
                    });
                }
            }

            // 2. Soumettre la demande KYB
            const submitKYB = httpsCallable(functions, 'submitKYB');
            const result = await submitKYB({
                documents: uploadedDocs,
                businessInfo,
                insurance: {
                    ...insurance,
                    documentUrl: uploadedDocs.find((d) => d.type === 'insurance_rc_pro')?.url || '',
                },
                certifications: certifications.length > 0 ? certifications : undefined,
                requestedCategories: selectedCategories,
            });

            const data = result.data as any;

            if (data.success) {
                setSubmitProgress(100);
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 3000);
            }
        } catch (err: any) {
            console.error('Erreur soumission KYB:', err);
            setError(err.message || 'Erreur lors de la soumission');
        } finally {
            setUploading(false);
        }
    };

    // État de vérification déjà en cours
    if (user?.kycStatus === 'pending' || user?.kycStatus === 'approved') {
        return (
            <div className="container max-w-4xl py-8">
                <Alert className={user.kycStatus === 'approved' ? 'border-green-500' : ''}>
                    <CheckCircle2 className={`h-4 w-4 ${user.kycStatus === 'approved' ? 'text-green-500' : ''}`} />
                    <AlertDescription>
                        {user.kycStatus === 'approved'
                            ? 'Votre compte professionnel est déjà vérifié !'
                            : 'Votre demande est en cours de traitement. Nous vous notifierons dès validation.'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Succès
    if (success) {
        return (
            <div className="container max-w-4xl py-8">
                <Alert className="border-green-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                        Votre demande ImuPro a été soumise avec succès ! Notre équipe l&apos;examinera dans les
                        plus brefs délais (24-48h). Vous recevrez une notification dès validation.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl py-8 space-y-6">
            {/* En-tête */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <h1 className="text-4xl font-bold tracking-tight">Devenir ImuPro</h1>
                </div>
                <p className="text-lg text-muted-foreground">
                    Rejoignez notre réseau de professionnels vérifiés et développez votre activité
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-4">
                    <div className="flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        Vérification 24-48h
                    </div>
                    <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-blue-500" />
                        Badge Vérifié
                    </div>
                    <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-purple-500" />
                        Profil Pro détaillé
                    </div>
                </div>
            </div>

            {/* Barre de progression */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm font-medium">
                            <span>Étape {currentStep} sur 8</span>
                            <span>{Math.round((currentStep / 8) * 100)}%</span>
                        </div>
                        <Progress value={(currentStep / 8) * 100} />
                        <div className="flex flex-wrap gap-2">
                            {STEPS.map((step) => (
                                <Badge
                                    key={step.id}
                                    variant={
                                        step.id === currentStep
                                            ? 'default'
                                            : step.id < currentStep
                                            ? 'secondary'
                                            : 'outline'
                                    }
                                    className="text-xs"
                                >
                                    {step.id < currentStep && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                    {step.title}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Erreur globale */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Étape 1 : Informations entreprise */}
            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Informations entreprise
                        </CardTitle>
                        <CardDescription>
                            Renseignez les informations légales de votre entreprise
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessName">
                                Raison sociale <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="businessName"
                                placeholder="Ex: SARL Martin Rénovation"
                                value={businessInfo.businessName}
                                onChange={(e) =>
                                    setBusinessInfo({ ...businessInfo, businessName: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="siret">
                                Numéro SIRET <span className="text-destructive">*</span>
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="siret"
                                    placeholder="14 chiffres"
                                    maxLength={14}
                                    value={businessInfo.siret}
                                    onChange={(e) => {
                                        setBusinessInfo({ ...businessInfo, siret: e.target.value });
                                        setSiretVerified(false);
                                    }}
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleVerifySiret}
                                    disabled={siretVerifying || businessInfo.siret.length !== 14}
                                >
                                    {siretVerifying ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : siretVerified ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                        'Vérifier'
                                    )}
                                </Button>
                            </div>
                            {siretVerified && (
                                <p className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    SIRET vérifié
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="businessType">
                                Statut juridique <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={businessInfo.businessType}
                                onValueChange={(value) =>
                                    setBusinessInfo({ ...businessInfo, businessType: value as BusinessType })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {BUSINESS_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Étape 2 : Adresse et contact */}
            {currentStep === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Adresse et contact
                        </CardTitle>
                        <CardDescription>
                            Coordonnées professionnelles pour vos clients
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">
                                Adresse <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="address"
                                placeholder="12 rue de la République"
                                value={businessInfo.address}
                                onChange={(e) =>
                                    setBusinessInfo({ ...businessInfo, address: e.target.value })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="postalCode">
                                    Code postal <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="postalCode"
                                    placeholder="75001"
                                    maxLength={5}
                                    value={businessInfo.postalCode}
                                    onChange={(e) =>
                                        setBusinessInfo({ ...businessInfo, postalCode: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">
                                    Ville <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="city"
                                    placeholder="Paris"
                                    value={businessInfo.city}
                                    onChange={(e) =>
                                        setBusinessInfo({ ...businessInfo, city: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">
                                Téléphone professionnel <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="06 12 34 56 78"
                                value={businessInfo.phone}
                                onChange={(e) =>
                                    setBusinessInfo({ ...businessInfo, phone: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email professionnel</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="contact@entreprise.fr"
                                value={businessInfo.email}
                                onChange={(e) =>
                                    setBusinessInfo({ ...businessInfo, email: e.target.value })
                                }
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Étape 3 : Catégories de services */}
            {currentStep === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Catégories de services
                        </CardTitle>
                        <CardDescription>
                            Sélectionnez vos domaines d&apos;expertise (au moins 1)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {SERVICE_CATEGORIES.map((category) => (
                                <div
                                    key={category.value}
                                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                        selectedCategories.includes(category.value)
                                            ? 'bg-primary/10 border-primary'
                                            : 'hover:bg-muted'
                                    }`}
                                    onClick={() => {
                                        if (selectedCategories.includes(category.value)) {
                                            setSelectedCategories(
                                                selectedCategories.filter((c) => c !== category.value)
                                            );
                                        } else {
                                            setSelectedCategories([...selectedCategories, category.value]);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedCategories.includes(category.value)}
                                            onCheckedChange={() => {}}
                                        />
                                        <span className="font-medium">{category.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Étape 4 : Assurance RC Pro */}
            {currentStep === 4 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" />
                            Assurance Responsabilité Civile Professionnelle
                        </CardTitle>
                        <CardDescription>
                            Obligatoire pour exercer sur la plateforme ImuPro
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Votre attestation RC Pro doit être valide et couvrir votre activité
                                professionnelle. Vous devrez uploader le document à l&apos;étape 6.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label htmlFor="insuranceProvider">
                                Compagnie d&apos;assurance <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="insuranceProvider"
                                placeholder="Ex: AXA, Allianz, MMA..."
                                value={insurance.provider}
                                onChange={(e) =>
                                    setInsurance({ ...insurance, provider: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="policyNumber">
                                Numéro de police <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="policyNumber"
                                placeholder="Ex: RC-2024-123456"
                                value={insurance.policyNumber}
                                onChange={(e) =>
                                    setInsurance({ ...insurance, policyNumber: e.target.value })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="coverageAmount">
                                    Montant de couverture (€) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="coverageAmount"
                                    type="number"
                                    placeholder="Ex: 500000"
                                    value={insurance.coverageAmount || ''}
                                    onChange={(e) =>
                                        setInsurance({
                                            ...insurance,
                                            coverageAmount: parseInt(e.target.value) || 0,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="insuranceExpiry">
                                    Date d&apos;expiration <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="insuranceExpiry"
                                    type="date"
                                    value={insurance.expiryDate}
                                    onChange={(e) =>
                                        setInsurance({ ...insurance, expiryDate: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Étape 5 : Certifications (optionnel) */}
            {currentStep === 5 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Certifications et diplômes
                        </CardTitle>
                        <CardDescription>
                            Ajoutez vos qualifications pour valoriser votre profil (optionnel)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {certifications.length === 0 ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Cette étape est optionnelle. Vous pourrez ajouter vos certifications plus
                                    tard depuis votre profil pro.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-2">
                                {certifications.map((cert, index) => (
                                    <div key={index} className="border rounded-lg p-3">
                                        <p className="font-medium">{cert.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {cert.issuingOrganization} - {cert.issueDate}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button
                            variant="outline"
                            onClick={() =>
                                setCertifications([
                                    ...certifications,
                                    {
                                        name: '',
                                        issuingOrganization: '',
                                        issueDate: '',
                                    },
                                ])
                            }
                        >
                            Ajouter une certification
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Étape 6 : Documents obligatoires */}
            {currentStep === 6 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Documents obligatoires
                        </CardTitle>
                        <CardDescription>
                            Uploadez les justificatifs nécessaires (PDF ou images)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {documents.map((doc, index) => (
                            <div key={doc.type} className="space-y-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium flex items-center gap-1">
                                            {doc.label}
                                            {doc.required && (
                                                <span className="text-destructive text-xs">*</span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                                    </div>
                                    {doc.file && (
                                        <Badge variant="outline" className="bg-green-100">
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                            Ajouté
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
            )}

            {/* Étape 7 : Description et tarifs */}
            {currentStep === 7 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Euro className="h-5 w-5" />
                            Présentation de vos services
                        </CardTitle>
                        <CardDescription>
                            Décrivez votre activité pour attirer vos futurs clients
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Description de votre activité</Label>
                            <Textarea
                                id="description"
                                placeholder="Ex: Spécialisé dans la rénovation de salle de bain, je propose des services de qualité avec 15 ans d'expérience..."
                                rows={6}
                                value={businessInfo.description}
                                onChange={(e) =>
                                    setBusinessInfo({ ...businessInfo, description: e.target.value })
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Cette description apparaîtra sur votre profil public ImuPro
                            </p>
                        </div>

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Vous pourrez configurer vos tarifs détaillés après validation de votre compte
                                professionnel.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}

            {/* Étape 8 : Récapitulatif */}
            {currentStep === 8 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            Récapitulatif
                        </CardTitle>
                        <CardDescription>
                            Vérifiez vos informations avant de soumettre votre candidature
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Résumé entreprise */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">Entreprise</h3>
                            <div className="text-sm space-y-1 text-muted-foreground">
                                <p>
                                    <strong>Raison sociale :</strong> {businessInfo.businessName}
                                </p>
                                <p>
                                    <strong>SIRET :</strong> {businessInfo.siret}
                                </p>
                                <p>
                                    <strong>Statut :</strong>{' '}
                                    {
                                        BUSINESS_TYPES.find((t) => t.value === businessInfo.businessType)
                                            ?.label
                                    }
                                </p>
                                <p>
                                    <strong>Adresse :</strong> {businessInfo.address}, {businessInfo.postalCode}{' '}
                                    {businessInfo.city}
                                </p>
                            </div>
                        </div>

                        {/* Catégories */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">Catégories de services</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedCategories.map((cat) => (
                                    <Badge key={cat} variant="secondary">
                                        {SERVICE_CATEGORIES.find((c) => c.value === cat)?.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Assurance */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">Assurance RC Pro</h3>
                            <div className="text-sm space-y-1 text-muted-foreground">
                                <p>
                                    <strong>Compagnie :</strong> {insurance.provider}
                                </p>
                                <p>
                                    <strong>Police :</strong> {insurance.policyNumber}
                                </p>
                                <p>
                                    <strong>Couverture :</strong> {insurance.coverageAmount.toLocaleString()} €
                                </p>
                                <p>
                                    <strong>Expiration :</strong>{' '}
                                    {new Date(insurance.expiryDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">Documents uploadés</h3>
                            <div className="flex flex-wrap gap-2">
                                {documents
                                    .filter((d) => d.file)
                                    .map((doc) => (
                                        <Badge key={doc.type} variant="outline" className="bg-green-50">
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                            {doc.label}
                                        </Badge>
                                    ))}
                            </div>
                        </div>

                        {/* CGU */}
                        <div className="flex items-start space-x-2 pt-4 border-t">
                            <Checkbox
                                id="terms"
                                checked={agreeTerms}
                                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                            />
                            <label
                                htmlFor="terms"
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                J&apos;accepte les{' '}
                                <a href="/cgu-imupro" className="text-primary underline">
                                    Conditions Générales ImuPro
                                </a>{' '}
                                et je certifie que toutes les informations fournies sont exactes.
                            </label>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Upload en cours */}
            {uploading && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Upload et soumission en cours...</span>
                                <span>{Math.round(submitProgress)}%</span>
                            </div>
                            <Progress value={submitProgress} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between gap-2">
                {currentStep > 1 && (
                    <Button variant="outline" onClick={handlePrevious} disabled={uploading}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Précédent
                    </Button>
                )}
                <div className="flex-1" />
                {currentStep < 8 ? (
                    <Button onClick={handleNext} disabled={uploading}>
                        Suivant
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={uploading || !agreeTerms}>
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Envoi en cours...
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Soumettre ma candidature
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
