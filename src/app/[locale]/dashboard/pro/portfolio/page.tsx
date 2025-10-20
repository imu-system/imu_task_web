"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Loader2,
    Plus,
    Edit,
    Trash2,
    Upload,
    X,
    Image as ImageIcon,
    Award,
    AlertCircle,
    ArrowLeft,
    Star,
    GripVertical,
    Eye,
    EyeOff,
} from "lucide-react";
import Image from "next/image";

// Types
type ProServiceCategory =
    | "renovation"
    | "plumbing"
    | "electricity"
    | "painting"
    | "masonry"
    | "carpentry"
    | "gardening"
    | "cleaning"
    | "moving"
    | "other";

interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    images: string[];
    category: ProServiceCategory;
    completionDate: string;
    clientTestimonial?: string;
    tags?: string[];
    featured: boolean;
}

interface ProProfile {
    userId: string;
    businessInfo: {
        businessName: string;
    };
    verificationStatus: string;
    portfolio?: PortfolioItem[];
}

// Constantes
const SERVICE_CATEGORY_LABELS: Record<ProServiceCategory, string> = {
    renovation: "Rénovation",
    plumbing: "Plomberie",
    electricity: "Électricité",
    painting: "Peinture",
    masonry: "Maçonnerie",
    carpentry: "Menuiserie",
    gardening: "Jardinage",
    cleaning: "Nettoyage",
    moving: "Déménagement",
    other: "Autre",
};

const MAX_PORTFOLIO_ITEMS = 20;
const MAX_IMAGES_PER_ITEM = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ProPortfolioPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [proProfile, setProProfile] = useState<ProProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

    // Form state
    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formCategory, setFormCategory] = useState<ProServiceCategory>("renovation");
    const [formCompletionDate, setFormCompletionDate] = useState("");
    const [formTestimonial, setFormTestimonial] = useState("");
    const [formTags, setFormTags] = useState("");
    const [formFeatured, setFormFeatured] = useState(false);
    const [formImages, setFormImages] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (!user) {
            router.push("/auth/signin");
            return;
        }

        loadProProfile();
    }, [user, router]);

    const loadProProfile = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const proRef = doc(db, "pro_profiles", user.uid);
            const proSnap = await getDoc(proRef);

            if (!proSnap.exists()) {
                router.push("/dashboard/become-pro");
                return;
            }

            const data = proSnap.data() as ProProfile;
            setProProfile(data);
            setError(null);
        } catch (err) {
            console.error("Error loading pro profile:", err);
            setError("Erreur lors du chargement du profil");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (item?: PortfolioItem) => {
        if (item) {
            // Mode édition
            setEditingItem(item);
            setFormTitle(item.title);
            setFormDescription(item.description);
            setFormCategory(item.category);
            setFormCompletionDate(item.completionDate);
            setFormTestimonial(item.clientTestimonial || "");
            setFormTags(item.tags?.join(", ") || "");
            setFormFeatured(item.featured);
            setFormImages(item.images);
        } else {
            // Mode création
            setEditingItem(null);
            setFormTitle("");
            setFormDescription("");
            setFormCategory("renovation");
            setFormCompletionDate(new Date().toISOString().split("T")[0]);
            setFormTestimonial("");
            setFormTags("");
            setFormFeatured(false);
            setFormImages([]);
        }
        setUploadingImages([]);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingItem(null);
        setUploadingImages([]);
        setUploading(false);
        setUploadProgress(0);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Validation
        const validFiles = files.filter((file) => {
            if (!file.type.startsWith("image/")) {
                alert(`${file.name} n'est pas une image`);
                return false;
            }
            if (file.size > MAX_IMAGE_SIZE) {
                alert(`${file.name} dépasse 5MB`);
                return false;
            }
            return true;
        });

        const totalImages = formImages.length + uploadingImages.length + validFiles.length;
        if (totalImages > MAX_IMAGES_PER_ITEM) {
            alert(`Maximum ${MAX_IMAGES_PER_ITEM} images par réalisation`);
            return;
        }

        setUploadingImages([...uploadingImages, ...validFiles]);
    };

    const handleRemoveUploadingImage = (index: number) => {
        setUploadingImages(uploadingImages.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = async (imageUrl: string) => {
        try {
            // Suppression de Firebase Storage si nécessaire
            // Note: Ne supprimer que si l'image n'est utilisée nulle part ailleurs
            setFormImages(formImages.filter((url) => url !== imageUrl));
        } catch (err) {
            console.error("Error removing image:", err);
        }
    };

    const uploadImages = async (): Promise<string[]> => {
        if (uploadingImages.length === 0) return [];

        const uploadedUrls: string[] = [];

        for (let i = 0; i < uploadingImages.length; i++) {
            const file = uploadingImages[i];
            const timestamp = Date.now();
            const ext = file.name.split(".").pop();
            const filename = `portfolio/${user?.uid}/${timestamp}_${i}.${ext}`;

            const storageRef = ref(storage, filename);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            uploadedUrls.push(url);

            setUploadProgress(((i + 1) / uploadingImages.length) * 100);
        }

        return uploadedUrls;
    };

    const handleSave = async () => {
        if (!user || !proProfile) return;

        // Validation
        if (!formTitle.trim()) {
            alert("Le titre est requis");
            return;
        }
        if (!formDescription.trim()) {
            alert("La description est requise");
            return;
        }
        if (!formCompletionDate) {
            alert("La date de réalisation est requise");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // Upload nouvelles images
            const newImageUrls = await uploadImages();
            const allImages = [...formImages, ...newImageUrls];

            if (allImages.length === 0) {
                alert("Au moins une image est requise");
                setUploading(false);
                return;
            }

            // Créer ou mettre à jour l'item
            const portfolioItem: PortfolioItem = {
                id: editingItem?.id || `portfolio_${Date.now()}`,
                title: formTitle.trim(),
                description: formDescription.trim(),
                category: formCategory,
                completionDate: formCompletionDate,
                clientTestimonial: formTestimonial.trim() || undefined,
                tags: formTags
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t.length > 0),
                featured: formFeatured,
                images: allImages,
            };

            // Mettre à jour le portfolio dans Firestore
            const currentPortfolio = proProfile.portfolio || [];
            let updatedPortfolio: PortfolioItem[];

            if (editingItem) {
                // Mode édition
                updatedPortfolio = currentPortfolio.map((item) =>
                    item.id === editingItem.id ? portfolioItem : item
                );
            } else {
                // Mode création
                if (currentPortfolio.length >= MAX_PORTFOLIO_ITEMS) {
                    alert(`Maximum ${MAX_PORTFOLIO_ITEMS} réalisations`);
                    setUploading(false);
                    return;
                }
                updatedPortfolio = [...currentPortfolio, portfolioItem];
            }

            const proRef = doc(db, "pro_profiles", user.uid);
            await updateDoc(proRef, {
                portfolio: updatedPortfolio,
            });

            // Recharger le profil
            await loadProProfile();
            handleCloseDialog();
        } catch (err) {
            console.error("Error saving portfolio item:", err);
            setError("Erreur lors de l'enregistrement");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (itemId: string) => {
        if (!user || !proProfile) return;

        try {
            const updatedPortfolio = (proProfile.portfolio || []).filter(
                (item) => item.id !== itemId
            );

            const proRef = doc(db, "pro_profiles", user.uid);
            await updateDoc(proRef, {
                portfolio: updatedPortfolio,
            });

            await loadProProfile();
        } catch (err) {
            console.error("Error deleting portfolio item:", err);
            setError("Erreur lors de la suppression");
        }
    };

    const handleToggleFeatured = async (itemId: string) => {
        if (!user || !proProfile) return;

        try {
            const updatedPortfolio = (proProfile.portfolio || []).map((item) =>
                item.id === itemId ? { ...item, featured: !item.featured } : item
            );

            const proRef = doc(db, "pro_profiles", user.uid);
            await updateDoc(proRef, {
                portfolio: updatedPortfolio,
            });

            await loadProProfile();
        } catch (err) {
            console.error("Error toggling featured:", err);
            setError("Erreur lors de la mise à jour");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (!proProfile) {
        return (
            <div className="container max-w-6xl mx-auto py-8 px-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Profil professionnel introuvable. Veuillez vous inscrire en tant que professionnel.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const portfolio = proProfile.portfolio || [];
    const featuredCount = portfolio.filter((item) => item.featured).length;

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/dashboard/pro")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold">Gestion du Portfolio</h1>
                    <p className="text-muted-foreground">
                        Ajoutez et gérez vos réalisations professionnelles
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => handleOpenDialog()}
                            disabled={portfolio.length >= MAX_PORTFOLIO_ITEMS}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle réalisation
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem ? "Modifier la réalisation" : "Nouvelle réalisation"}
                            </DialogTitle>
                            <DialogDescription>
                                Ajoutez des photos et décrivez votre travail pour attirer plus de clients
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Titre *</Label>
                                <Input
                                    id="title"
                                    placeholder="Ex: Rénovation complète d'une cuisine"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Décrivez les travaux réalisés, les matériaux utilisés, les défis rencontrés..."
                                    rows={4}
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                />
                            </div>

                            {/* Category and Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Catégorie *</Label>
                                    <Select
                                        value={formCategory}
                                        onValueChange={(value) =>
                                            setFormCategory(value as ProServiceCategory)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(SERVICE_CATEGORY_LABELS).map(
                                                ([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="completionDate">Date de réalisation *</Label>
                                    <Input
                                        id="completionDate"
                                        type="date"
                                        value={formCompletionDate}
                                        onChange={(e) => setFormCompletionDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Images */}
                            <div className="space-y-2">
                                <Label>Photos * (max {MAX_IMAGES_PER_ITEM})</Label>

                                {/* Existing images */}
                                {formImages.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {formImages.map((url, index) => (
                                            <div
                                                key={url}
                                                className="relative aspect-square bg-muted rounded-lg overflow-hidden group"
                                            >
                                                <Image
                                                    src={url}
                                                    alt={`Image ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemoveExistingImage(url)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Uploading images preview */}
                                {uploadingImages.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {uploadingImages.map((file, index) => (
                                            <div
                                                key={index}
                                                className="relative aspect-square bg-muted rounded-lg overflow-hidden group"
                                            >
                                                <Image
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Upload ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemoveUploadingImage(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload button */}
                                {formImages.length + uploadingImages.length < MAX_IMAGES_PER_ITEM && (
                                    <div>
                                        <input
                                            type="file"
                                            id="portfolio-images"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        <label htmlFor="portfolio-images">
                                            <Button
                                                variant="outline"
                                                asChild
                                                className="w-full cursor-pointer"
                                            >
                                                <span>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Ajouter des photos
                                                </span>
                                            </Button>
                                        </label>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Max 5MB par image. Formats: JPG, PNG, WebP
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Testimonial */}
                            <div className="space-y-2">
                                <Label htmlFor="testimonial">Témoignage client (optionnel)</Label>
                                <Textarea
                                    id="testimonial"
                                    placeholder="Avis du client sur la prestation..."
                                    rows={2}
                                    value={formTestimonial}
                                    onChange={(e) => setFormTestimonial(e.target.value)}
                                />
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (optionnel)</Label>
                                <Input
                                    id="tags"
                                    placeholder="Ex: carrelage, moderne, salle de bain"
                                    value={formTags}
                                    onChange={(e) => setFormTags(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Séparez les tags par des virgules
                                </p>
                            </div>

                            {/* Featured */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="featured"
                                    checked={formFeatured}
                                    onCheckedChange={(checked) =>
                                        setFormFeatured(checked as boolean)
                                    }
                                />
                                <Label htmlFor="featured" className="cursor-pointer">
                                    Mettre en avant sur mon profil public
                                </Label>
                            </div>

                            {uploading && (
                                <div className="space-y-2">
                                    <div className="relative w-full bg-muted h-2 rounded-full overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 bg-primary h-full transition-all"
                                            style={{
                                                width: `${uploadProgress}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground">
                                        Upload en cours... {Math.round(uploadProgress)}%
                                    </p>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={handleCloseDialog} disabled={uploading}>
                                Annuler
                            </Button>
                            <Button onClick={handleSave} disabled={uploading}>
                                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingItem ? "Mettre à jour" : "Ajouter"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {portfolio.length} / {MAX_PORTFOLIO_ITEMS}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Réalisations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Mises en avant
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            {featuredCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Affichées en priorité
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Images
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {portfolio.reduce((sum, item) => sum + item.images.length, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Photos au total</p>
                    </CardContent>
                </Card>
            </div>

            {/* Portfolio Grid */}
            {portfolio.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center space-y-3">
                            <Award className="h-16 w-16 mx-auto text-muted-foreground" />
                            <div>
                                <h3 className="text-lg font-semibold">Aucune réalisation</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Ajoutez vos premières réalisations pour attirer plus de clients
                                </p>
                            </div>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter une réalisation
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolio.map((item) => (
                        <Card key={item.id} className="overflow-hidden group">
                            {/* Image */}
                            <div className="relative h-48 bg-muted">
                                {item.images.length > 0 && (
                                    <Image
                                        src={item.images[0]}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                                {item.featured && (
                                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                                        <Star className="h-3 w-3 mr-1 fill-white" />
                                        Mise en avant
                                    </Badge>
                                )}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        onClick={() => handleOpenDialog(item)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="icon" variant="destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Êtes-vous sûr de vouloir supprimer "{item.title}" ? Cette
                                                    action est irréversible.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    Supprimer
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                {item.images.length > 1 && (
                                    <Badge
                                        variant="secondary"
                                        className="absolute bottom-2 right-2"
                                    >
                                        <ImageIcon className="h-3 w-3 mr-1" />
                                        {item.images.length}
                                    </Badge>
                                )}
                            </div>

                            {/* Content */}
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg line-clamp-1">
                                        {item.title}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleToggleFeatured(item.id)}
                                        title={
                                            item.featured
                                                ? "Retirer la mise en avant"
                                                : "Mettre en avant"
                                        }
                                    >
                                        {item.featured ? (
                                            <Eye className="h-4 w-4 text-yellow-500" />
                                        ) : (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {item.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                        {SERVICE_CATEGORY_LABELS[item.category]}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(item.completionDate).toLocaleDateString("fr-FR", {
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>

                                {item.tags && item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {item.tags.slice(0, 3).map((tag, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                        {item.tags.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{item.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {item.clientTestimonial && (
                                    <div className="text-xs text-muted-foreground italic line-clamp-2 border-l-2 border-primary pl-2">
                                        "{item.clientTestimonial}"
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Helper Tips */}
            {portfolio.length > 0 && portfolio.length < 3 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        💡 <strong>Conseil :</strong> Ajoutez au moins 5 réalisations avec des photos de
                        qualité pour maximiser vos chances d'être contacté.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
