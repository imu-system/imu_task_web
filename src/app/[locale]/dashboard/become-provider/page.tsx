/**
 * Page "Devenir Prestataire"
 * Permet aux clients de s'inscrire comme prestataires
 */
'use client';

import { useRouter } from '@/navigation';
import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { addUserRole, updateUserDocument } from '@/lib/firestore-users';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Briefcase, DollarSign, MapPin } from 'lucide-react';

const AVAILABLE_SKILLS = [
    'plomberie',
    'électricité',
    'jardinage',
    'ménage',
    'peinture',
    'déménagement',
    'bricolage',
    'informatique',
    'cours_particuliers',
    'garde_enfants',
    'aide_administrative',
    'photographie',
    'traduction',
    'développement_web',
    'design_graphique',
];

export default function BecomeProviderPage() {
    const t = useTranslations('becomeProvider');
    const { user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        bio: '',
        skills: [] as string[],
        hourlyRate: '',
        location: '',
        availability: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Vérifier si l'utilisateur est déjà provider
    const isAlreadyProvider = user?.roles?.includes(UserRole.provider) ?? false;

    const handleSkillToggle = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            setError('Vous devez être connecté pour devenir prestataire');
            return;
        }

        // Validation
        if (formData.skills.length === 0) {
            setError('Veuillez sélectionner au moins une compétence');
            return;
        }

        if (!formData.bio.trim()) {
            setError('Veuillez fournir une description');
            return;
        }

        if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
            setError('Veuillez fournir un tarif horaire valide');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Ajouter le rôle provider
            await addUserRole(user.uid, UserRole.provider);

            // 2. Mettre à jour le profil avec les informations provider
            await updateUserDocument(user.uid, {
                skills: formData.skills,
                availability: formData.availability,
                profile: {
                    ...user.profile,
                    bio: formData.bio,
                    location: formData.location,
                },
            } as any);

            setSuccess(true);

            // Rediriger vers le dashboard provider après 2 secondes
            setTimeout(() => {
                router.push('/dashboard/provider');
            }, 2000);
        } catch (err: any) {
            console.error('Error becoming provider:', err);
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    if (isAlreadyProvider) {
        return (
            <div className="container max-w-2xl py-12">
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                        Vous êtes déjà inscrit comme prestataire ! 
                        <Button 
                            variant="link" 
                            onClick={() => router.push('/dashboard/provider')}
                            className="ml-2"
                        >
                            Accéder au tableau de bord prestataire
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (success) {
        return (
            <div className="container max-w-2xl py-12">
                <Alert className="border-green-500">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                        Félicitations ! Vous êtes maintenant un prestataire ImuTask.
                        Redirection vers votre dashboard...
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Devenir Prestataire</h1>
                <p className="text-muted-foreground">
                    Rejoignez notre communauté de prestataires et commencez à proposer vos services
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Biographie */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Présentez-vous
                        </CardTitle>
                        <CardDescription>
                            Décrivez votre expérience et ce qui vous rend unique
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Ex: Je suis un plombier qualifié avec 5 ans d'expérience..."
                            className="min-h-32"
                            required
                        />
                    </CardContent>
                </Card>

                {/* Compétences */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vos compétences</CardTitle>
                        <CardDescription>
                            Sélectionnez les services que vous pouvez offrir (minimum 1)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {AVAILABLE_SKILLS.map((skill) => (
                                <div key={skill} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={skill}
                                        checked={formData.skills.includes(skill)}
                                        onCheckedChange={() => handleSkillToggle(skill)}
                                    />
                                    <label
                                        htmlFor={skill}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {skill.replace(/_/g, ' ')}
                                    </label>
                                </div>
                            ))}
                        </div>

                        {formData.skills.length > 0 && (
                            <div className="mt-4">
                                <Label className="text-sm text-muted-foreground mb-2">
                                    Compétences sélectionnées:
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills.map((skill) => (
                                        <Badge key={skill} variant="secondary">
                                            {skill.replace(/_/g, ' ')}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tarif et localisation */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Tarification et localisation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="hourlyRate">Tarif horaire (€)</Label>
                            <Input
                                id="hourlyRate"
                                type="number"
                                step="0.5"
                                min="1"
                                value={formData.hourlyRate}
                                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                placeholder="Ex: 25"
                                required
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                Vous pourrez ajuster vos tarifs selon les missions
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="location" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Localisation
                            </Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Ex: Paris, Île-de-France"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="availability"
                                checked={formData.availability}
                                onCheckedChange={(checked) => 
                                    setFormData({ ...formData, availability: checked as boolean })
                                }
                            />
                            <label
                                htmlFor="availability"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Je suis disponible pour accepter des missions
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Boutons d'action */}
                <div className="flex gap-4 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Inscription en cours...
                            </>
                        ) : (
                            'Devenir Prestataire'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
