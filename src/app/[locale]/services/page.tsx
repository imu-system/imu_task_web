/**
 * Services Catalog Page
 * Page publique présentant les 8 catégories de services ImuTask
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ServiceCategory, 
  SERVICE_CATEGORIES,
  ServiceCategoryMetadata 
} from '@/types/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  ShoppingCart, 
  Smartphone, 
  Package, 
  Users, 
  TreePine, 
  Dog,
  PartyPopper,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Euro,
  ArrowRight
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ICON_MAP = {
  Home,
  ShoppingCart,
  Smartphone,
  Package,
  Users,
  TreePine,
  Dog,
  PartyPopper,
};

export default function ServicesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const categories = Object.values(SERVICE_CATEGORIES);

  const handleCreateTask = (category: ServiceCategory) => {
    router.push(`/dashboard/tasks/create?category=${category}`);
  };

  return (
    <div className="container max-w-7xl py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
          Catalogue des Services
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Des micro-services de proximité pour simplifier votre quotidien. 
          Choisissez parmi 8 catégories de services et trouvez le prestataire idéal.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Catégories de services</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12-30€</p>
                <p className="text-sm text-muted-foreground">Fourchette tarifaire</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">30min - 8h</p>
                <p className="text-sm text-muted-foreground">Durée des missions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Nos Catégories de Services</h2>
          <p className="text-muted-foreground">
            Cliquez sur une catégorie pour en savoir plus ou publier une demande
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = ICON_MAP[category.icon as keyof typeof ICON_MAP];
            const isSelected = selectedCategory === category.id;

            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-lg group ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
              >
                <CardHeader>
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg bg-${category.color}-100 dark:bg-${category.color}-900/20 w-fit group-hover:scale-110 transition-transform`}>
                      {IconComponent && (
                        <IconComponent className={`h-8 w-8 text-${category.color}-600 dark:text-${category.color}-400`} />
                      )}
                    </div>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-sm line-clamp-3">
                    {category.description}
                  </CardDescription>
                  <div className="flex items-center justify-between text-sm pt-2">
                    <Badge variant="secondary" className="text-xs">
                      {category.priceRange.min}-{category.priceRange.max}€/
                      {category.priceRange.unit === 'hour' ? 'h' :
                       category.priceRange.unit === 'visit' ? 'visite' : 'tâche'}
                    </Badge>
                    <ChevronRight className={`h-4 w-4 transition-transform ${
                      isSelected ? 'rotate-90' : 'group-hover:translate-x-1'
                    }`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Selected Category Details */}
      {selectedCategory && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {(() => {
                    const cat = SERVICE_CATEGORIES[selectedCategory];
                    const IconComponent = ICON_MAP[cat.icon as keyof typeof ICON_MAP];
                    return (
                      <>
                        <div className={`p-2 rounded-lg bg-${cat.color}-100 dark:bg-${cat.color}-900/20`}>
                          {IconComponent && (
                            <IconComponent className={`h-6 w-6 text-${cat.color}-600 dark:text-${cat.color}-400`} />
                          )}
                        </div>
                        <CardTitle className="text-2xl">{cat.name}</CardTitle>
                      </>
                    );
                  })()}
                </div>
                <CardDescription className="text-base">
                  {SERVICE_CATEGORIES[selectedCategory].description}
                </CardDescription>
              </div>
              <Button onClick={() => handleCreateTask(selectedCategory)} className="gap-2">
                Publier une demande
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Examples */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Exemples de tâches
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SERVICE_CATEGORIES[selectedCategory].examples.map((example, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Pricing & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Euro className="h-5 w-5 text-green-600" />
                  Tarif indicatif
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {SERVICE_CATEGORIES[selectedCategory].priceRange.min}-
                  {SERVICE_CATEGORIES[selectedCategory].priceRange.max}€
                  <span className="text-sm font-normal text-muted-foreground">
                    /{SERVICE_CATEGORIES[selectedCategory].priceRange.unit === 'hour' ? 'heure' :
                      SERVICE_CATEGORIES[selectedCategory].priceRange.unit === 'visit' ? 'visite' : 'tâche'}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Durée typique
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.floor(SERVICE_CATEGORIES[selectedCategory].durationRange.min / 60)}-
                  {Math.floor(SERVICE_CATEGORIES[selectedCategory].durationRange.max / 60)}h
                  <span className="text-sm font-normal text-muted-foreground">
                    {' '}({SERVICE_CATEGORIES[selectedCategory].durationRange.min}-
                    {SERVICE_CATEGORIES[selectedCategory].durationRange.max} min)
                  </span>
                </p>
              </div>
            </div>

            <Separator />

            {/* Required Skills */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Compétences requises
              </h3>
              <div className="flex flex-wrap gap-2">
                {SERVICE_CATEGORIES[selectedCategory].requiredSkills.map((skill, idx) => (
                  <Badge key={idx} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exclusions Section */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Services non proposés</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            Pour votre sécurité et conformité réglementaire, ImuTask ne propose pas :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Services réglementés</strong> : Plomberie, électricité, garde d'enfants certifiée</li>
            <li><strong>Conseil professionnel</strong> : Juridique, financier, médical</li>
            <li><strong>Tâches à haut risque</strong> : Travaux en hauteur, manipulation de produits dangereux</li>
          </ul>
          <p className="text-sm mt-2">
            Ces services seront disponibles dans <strong>ImuPro</strong> (version professionnelle à venir).
          </p>
        </AlertDescription>
      </Alert>

      {/* CTA Section */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="py-12">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Prêt à publier votre demande ?</h2>
              <p className="text-xl opacity-90">
                Choisissez une catégorie et créez votre tâche en quelques minutes
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => router.push('/dashboard/tasks/create')}
                className="gap-2"
              >
                Publier une demande
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => router.push('/tasks/search')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Parcourir les demandes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
