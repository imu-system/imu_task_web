/**
 * Create Task Page with Service Catalog
 * Permet de créer une tâche en utilisant le catalogue de services
 */

'use client';

import { useRouter } from '@/navigation';
import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { 
  ServiceCategory, 
  TaskTemplate,
  SERVICE_CATEGORIES,
  ServiceTags
} from '@/types/services';
import { ServiceCategorySelector } from '@/components/services/category-selector';
import { TaskTemplates } from '@/components/services/task-templates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Euro,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MapPicker, type TaskLocation } from '@/components/maps';

type Step = 'category' | 'template' | 'details';

export default function CreateTaskPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // État du wizard
  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

  // État du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<TaskLocation | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [budget, setBudget] = useState<number>(0);
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gestion de la sélection de catégorie
  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
    // Pré-remplir les tags disponibles pour cette catégorie
    setTags([]);
  };

  // Gestion de la sélection de template
  const handleTemplateSelect = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.title);
    setDescription(template.description);
    setDuration(template.suggestedDuration);
    setBudget(template.suggestedPrice);
    setTags(template.tags);
    setStep('details');
  };

  // Sauter l'étape template
  const skipTemplate = () => {
    if (!selectedCategory) return;
    
    const categoryMeta = SERVICE_CATEGORIES[selectedCategory];
    setDuration(categoryMeta.durationRange.min);
    setBudget(categoryMeta.priceRange.min);
    setStep('details');
  };

  // Ajouter/retirer un tag
  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Soumettre la tâche
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedCategory) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour créer une tâche',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim() || !description.trim() || !location) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        clientId: user.uid,
        category: selectedCategory,
        title: title.trim(),
        description: description.trim(),
        location: location, // TaskLocation object with address and coordinates
        date: date || null,
        time: time || null,
        duration,
        budget,
        tags,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'tasks'), taskData);

      toast({
        title: 'Tâche créée !',
        description: 'Votre tâche a été publiée avec succès',
      });

      router.push(`/dashboard/tasks/${docRef.id}`);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la tâche. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryMeta = selectedCategory ? SERVICE_CATEGORIES[selectedCategory] : null;
  const availableTags = selectedCategory ? ServiceTags[selectedCategory] : [];

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Créer une nouvelle tâche</h1>
          <p className="text-muted-foreground mt-1">
            Utilisez notre catalogue pour publier votre demande
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {(['category', 'template', 'details'] as Step[]).map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  step === s ? 'text-primary font-semibold' :
                  idx < (['category', 'template', 'details'] as Step[]).indexOf(step) ? 'text-green-600' :
                  'text-muted-foreground'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step === s ? 'border-primary bg-primary text-primary-foreground' :
                    idx < (['category', 'template', 'details'] as Step[]).indexOf(step) ? 'border-green-600 bg-green-600 text-white' :
                    'border-muted-foreground'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="hidden md:inline">
                    {s === 'category' ? 'Catégorie' :
                     s === 'template' ? 'Template' : 'Détails'}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`w-12 md:w-24 h-0.5 mx-2 ${
                    idx < (['category', 'template', 'details'] as Step[]).indexOf(step) ? 'bg-green-600' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Category Selection */}
      {step === 'category' && (
        <Card>
          <CardHeader>
            <CardTitle>Choisissez une catégorie</CardTitle>
            <CardDescription>
              Sélectionnez le type de service dont vous avez besoin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceCategorySelector
              value={selectedCategory || undefined}
              onChange={handleCategorySelect}
            />
            {selectedCategory && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep('template')} className="gap-2">
                  Continuer
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Template Selection */}
      {step === 'template' && selectedCategory && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Choisissez un template (optionnel)</CardTitle>
                <CardDescription>
                  Gagnez du temps avec nos templates pré-remplis
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setStep('category')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <TaskTemplates
              category={selectedCategory}
              onSelectTemplate={handleTemplateSelect}
            />
            <Separator />
            <div className="flex justify-between">
              <Button variant="ghost" onClick={skipTemplate}>
                Sauter cette étape
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Task Details */}
      {step === 'details' && selectedCategory && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Détails de la tâche</CardTitle>
                  <CardDescription>
                    Complétez les informations de votre demande
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('template')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Catégorie sélectionnée */}
              {categoryMeta && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Badge variant="secondary">{categoryMeta.name}</Badge>
                  {selectedTemplate && (
                    <>
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Template: {selectedTemplate.title}
                      </span>
                    </>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedTemplate(null);
                      setStep('category');
                    }}
                    className="ml-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Titre */}
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la tâche *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Ménage complet appartement 2 pièces"
                  required
                  data-testid="task-title-input"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez en détail ce dont vous avez besoin..."
                  rows={5}
                  required
                  data-testid="task-description-input"
                />
              </div>

              {/* Localisation avec MapPicker */}
              <MapPicker
                value={location || undefined}
                onChange={(loc) => setLocation(loc)}
                label="Localisation *"
                description="Recherchez une adresse ou cliquez sur la carte pour sélectionner un emplacement"
                mapHeight={350}
                showMap={true}
              />

              {/* Date et heure */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date souhaitée</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-10"
                      data-testid="task-date-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Heure</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="pl-10"
                      data-testid="task-time-input"
                    />
                  </div>
                </div>
              </div>

              {/* Durée et budget */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée estimée (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    required
                    data-testid="task-duration-input"
                  />
                  {categoryMeta && (
                    <p className="text-xs text-muted-foreground">
                      Durée typique: {categoryMeta.durationRange.min}-{categoryMeta.durationRange.max} min
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (€)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      step="5"
                      value={budget}
                      onChange={(e) => setBudget(parseFloat(e.target.value))}
                      className="pl-10"
                      required
                      data-testid="task-budget-input"
                    />
                  </div>
                  {categoryMeta && (
                    <p className="text-xs text-muted-foreground">
                      Fourchette: {categoryMeta.priceRange.min}-{categoryMeta.priceRange.max}€
                    </p>
                  )}
                </div>
              </div>

              {/* Tags */}
              {availableTags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags (optionnel)</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={tags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Submit */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2"
                  data-testid="task-submit-button"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Publication...' : 'Publier la tâche'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
