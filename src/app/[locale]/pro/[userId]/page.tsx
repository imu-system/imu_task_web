/**
 * Profil public ImuPro - Affichage professionnel avec badge, portfolio, avis
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
    Loader2,
    AlertCircle,
    ShieldCheck,
    Star,
    MapPin,
    Phone,
    Mail,
    Building2,
    Award,
    CheckCircle2,
    Euro,
    Clock,
    MessageSquare,
    Calendar,
    ExternalLink,
    Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ProProfile {
    userId: string;
    businessInfo: {
        businessName: string;
        siret: string;
        businessType: string;
        address: string;
        city: string;
        postalCode: string;
        phone: string;
        email: string;
        description: string;
    };
    verificationStatus: string;
    categories: string[];
    certifications?: Array<{
        name: string;
        issuingOrganization: string;
        issueDate: string;
    }>;
    badges: {
        verified: boolean;
        topRated?: boolean;
        responsive?: boolean;
        reliable?: boolean;
    };
    portfolio?: Array<{
        id: string;
        title: string;
        description: string;
        images: string[];
        category: string;
        completionDate: string;
        featured?: boolean;
    }>;
    pricing?: {
        type: 'fixed' | 'hourly' | 'quote';
        hourlyRate?: number;
        minimumCharge?: number;
    };
    workingHours?: {
        monday?: { start: string; end: string };
        tuesday?: { start: string; end: string };
        wednesday?: { start: string; end: string };
        thursday?: { start: string; end: string };
        friday?: { start: string; end: string };
        saturday?: { start: string; end: string };
        sunday?: { start: string; end: string };
    };
    serviceArea?: {
        radius: number;
        cities: string[];
    };
    stats: {
        totalJobs: number;
        completedJobs: number;
        averageRating: number;
        totalReviews: number;
        responseTime: number;
        acceptanceRate: number;
    };
}

interface Review {
    id: string;
    clientName: string;
    clientAvatar?: string;
    rating: number;
    comment: string;
    createdAt: Date;
    jobTitle?: string;
}

const SERVICE_CATEGORY_LABELS: Record<string, string> = {
    renovation: 'Rénovation',
    plumbing: 'Plomberie',
    electricity: 'Électricité',
    painting: 'Peinture',
    masonry: 'Maçonnerie',
    carpentry: 'Menuiserie',
    gardening: 'Jardinage',
    cleaning: 'Nettoyage',
    moving: 'Déménagement',
    other: 'Autre',
};

export default function PublicProProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;

    const [loading, setLoading] = useState(true);
    const [proProfile, setProProfile] = useState<ProProfile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        const loadProProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                // Charger le profil pro
                const proProfileRef = doc(db, 'pro_profiles', userId);
                const proProfileSnap = await getDoc(proProfileRef);

                if (!proProfileSnap.exists()) {
                    setError('Profil professionnel introuvable');
                    return;
                }

                const profileData = proProfileSnap.data() as ProProfile;

                // Vérifier que le profil est vérifié
                if (profileData.verificationStatus !== 'verified') {
                    setError('Ce profil n\'est pas encore vérifié');
                    return;
                }

                // Charger les avis
                const reviewsRef = collection(db, 'reviews');
                const reviewsQuery = query(
                    reviewsRef,
                    where('proId', '==', userId),
                    orderBy('createdAt', 'desc'),
                    limit(10)
                );
                const reviewsSnap = await getDocs(reviewsQuery);
                const reviewsData = reviewsSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                })) as Review[];

                setProProfile(profileData);
                setReviews(reviewsData);
            } catch (err: any) {
                console.error('Erreur chargement profil pro:', err);
                setError(err.message || 'Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };

        loadProProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !proProfile) {
        return (
            <div className="container max-w-4xl py-16">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error || 'Profil introuvable'}</AlertDescription>
                </Alert>
            </div>
        );
    }

    const stats = proProfile.stats;
    const businessInfo = proProfile.businessInfo;

    return (
        <div className="min-h-screen bg-muted/30">
            {/* En-tête avec bannière */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                <div className="container max-w-6xl py-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar / Logo */}
                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${businessInfo.businessName}`} />
                            <AvatarFallback className="text-3xl">
                                {businessInfo.businessName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        {/* Informations principales */}
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-4xl font-bold">{businessInfo.businessName}</h1>
                                    {proProfile.badges.verified && (
                                        <Badge variant="default" className="bg-green-500 text-lg py-1 px-3">
                                            <ShieldCheck className="mr-1 h-4 w-4" />
                                            ImuPro Vérifié
                                        </Badge>
                                    )}
                                    {proProfile.badges.topRated && (
                                        <Badge variant="secondary" className="text-sm">
                                            <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            Top Rated
                                        </Badge>
                                    )}
                                    {proProfile.badges.responsive && (
                                        <Badge variant="outline" className="text-sm">
                                            <Clock className="mr-1 h-3 w-3" />
                                            Très réactif
                                        </Badge>
                                    )}
                                    {proProfile.badges.reliable && (
                                        <Badge variant="outline" className="text-sm">
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                            Fiable
                                        </Badge>
                                    )}
                                </div>

                                {/* Catégories */}
                                <div className="flex flex-wrap gap-2">
                                    {proProfile.categories.map((cat) => (
                                        <Badge key={cat} variant="secondary">
                                            {SERVICE_CATEGORY_LABELS[cat] || cat}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Note et stats */}
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        <span className="font-bold text-lg">
                                            {stats.averageRating.toFixed(1)}
                                        </span>
                                        <span className="text-muted-foreground">
                                            ({stats.totalReviews} avis)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4" />
                                        {stats.completedJobs} missions réalisées
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        Répond en {stats.responseTime}h
                                    </div>
                                </div>

                                {/* Localisation */}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                        {businessInfo.city}, {businessInfo.postalCode}
                                    </span>
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex gap-3">
                                <Button size="lg" asChild>
                                    <Link href={`/dashboard/messages?proId=${userId}`}>
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Demander un devis
                                    </Link>
                                </Button>
                                <Button variant="outline" size="lg" asChild>
                                    <Link href={`tel:${businessInfo.phone}`}>
                                        <Phone className="mr-2 h-4 w-4" />
                                        Appeler
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="container max-w-6xl py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* À propos */}
                        <Card>
                            <CardHeader>
                                <CardTitle>À propos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {businessInfo.description || 'Aucune description disponible'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Portfolio */}
                        {proProfile.portfolio && proProfile.portfolio.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        Portfolio
                                    </CardTitle>
                                    <CardDescription>
                                        Découvrez nos réalisations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {proProfile.portfolio.slice(0, 4).map((item) => (
                                            <div
                                                key={item.id}
                                                className="space-y-3 border rounded-lg p-4"
                                            >
                                                {item.images.length > 0 && (
                                                    <div className="relative h-48 bg-muted rounded-lg overflow-hidden">
                                                        <Image
                                                            src={item.images[0]}
                                                            alt={item.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-semibold">{item.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {item.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {SERVICE_CATEGORY_LABELS[item.category] || item.category}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(item.completionDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {proProfile.portfolio.length > 4 && (
                                        <div className="mt-4 text-center">
                                            <p className="text-sm text-muted-foreground">
                                                + {proProfile.portfolio.length - 4} autres réalisations
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Avis clients */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    Avis clients
                                </CardTitle>
                                <CardDescription>
                                    {stats.totalReviews} avis · Note moyenne : {stats.averageRating.toFixed(1)}/5
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {reviews.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Aucun avis pour le moment
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={review.clientAvatar} />
                                                            <AvatarFallback>
                                                                {review.clientName.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold">{review.clientName}</p>
                                                            <div className="flex items-center gap-1">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`h-4 w-4 ${
                                                                            i < review.rating
                                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                                : 'text-gray-300'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {review.createdAt.toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {review.jobTitle && (
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        Mission : {review.jobTitle}
                                                    </p>
                                                )}
                                                <p className="text-sm">{review.comment}</p>
                                                <Separator />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Tarification */}
                        {proProfile.pricing && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Euro className="h-5 w-5" />
                                        Tarification
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {proProfile.pricing.type === 'hourly' && proProfile.pricing.hourlyRate && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Taux horaire</p>
                                            <p className="text-2xl font-bold">
                                                {proProfile.pricing.hourlyRate} € / heure
                                            </p>
                                        </div>
                                    )}
                                    {proProfile.pricing.minimumCharge && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Facturation minimale</p>
                                            <p className="text-lg font-semibold">
                                                {proProfile.pricing.minimumCharge} €
                                            </p>
                                        </div>
                                    )}
                                    {proProfile.pricing.type === 'quote' && (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Tarif sur devis uniquement. Contactez-nous pour obtenir un devis
                                                personnalisé.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Zone d'intervention */}
                        {proProfile.serviceArea && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Zone d&apos;intervention
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Rayon d&apos;action</p>
                                        <p className="font-semibold">{proProfile.serviceArea.radius} km</p>
                                    </div>
                                    {proProfile.serviceArea.cities.length > 0 && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Villes principales
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {proProfile.serviceArea.cities.map((city) => (
                                                    <Badge key={city} variant="outline">
                                                        {city}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Horaires */}
                        {proProfile.workingHours && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Horaires
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        {Object.entries(proProfile.workingHours).map(([day, hours]) => (
                                            <div key={day} className="flex justify-between">
                                                <span className="capitalize text-muted-foreground">{day}</span>
                                                {hours ? (
                                                    <span className="font-medium">
                                                        {hours.start} - {hours.end}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">Fermé</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Certifications */}
                        {proProfile.certifications && proProfile.certifications.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        Certifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {proProfile.certifications.map((cert, index) => (
                                            <div key={index} className="space-y-1">
                                                <p className="font-medium text-sm">{cert.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {cert.issuingOrganization}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Obtenue le {new Date(cert.issueDate).toLocaleDateString()}
                                                </p>
                                                {index < proProfile.certifications!.length - 1 && <Separator />}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Contact */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href={`tel:${businessInfo.phone}`}>
                                        <Phone className="mr-2 h-4 w-4" />
                                        {businessInfo.phone}
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href={`mailto:${businessInfo.email}`}>
                                        <Mail className="mr-2 h-4 w-4" />
                                        {businessInfo.email}
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Informations légales */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Informations légales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-3 w-3" />
                                    <span>SIRET : {businessInfo.siret}</span>
                                </div>
                                <div>
                                    <p>{businessInfo.address}</p>
                                    <p>
                                        {businessInfo.postalCode} {businessInfo.city}
                                    </p>
                                </div>
                                <div className="pt-2 border-t">
                                    <Badge variant="outline" className="text-xs">
                                        <ShieldCheck className="mr-1 h-3 w-3" />
                                        Assuré RC Pro
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
