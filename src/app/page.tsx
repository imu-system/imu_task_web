import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ShoppingBasket,
  Spade,
  HeartHandshake,
  ShieldCheck,
  MessagesSquare,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    icon: <HeartHandshake className="h-10 w-10 text-primary" />,
    title: 'Entraide Intergénérationnelle',
    description:
      'Créez des liens uniques en aidant ou en recevant de l\'aide de personnes de votre communauté.',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: 'Confiance & Sécurité',
    description:
      'Profils vérifiés (KYC), paiements sécurisés et avis pour garantir des missions en toute sérénité.',
  },
  {
    icon: <MessagesSquare className="h-10 w-10 text-primary" />,
    title: 'Communication Simple',
    description:
      'Discutez facilement avec les membres via notre messagerie intégrée pour organiser les détails de la mission.',
  },
];

const categories = [
  {
    icon: <ShoppingBasket className="h-8 w-8" />,
    name: 'Courses',
  },
  {
    icon: <Spade className="h-8 w-8" />,
    name: 'Jardinage',
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    name: 'Ménage',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M17 14h.01"/><path d="M12.5 4.5h-5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5l-4-4Z"/><path d="M15 4.5V8h3.5"/></svg>,
    name: 'Aide administrative',
  },
  
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative w-full py-20 md:py-32 lg:py-40 bg-card">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
              ImuTask
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
              Vos besoins, leur mission.
            </p>
            <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
              Connecter les générations pour des services du quotidien, en toute
              simplicité, fiabilité et sécurité.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/dashboard">Trouver de l'aide</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/dashboard">Proposer mes services</Link>
              </Button>
            </div>
          </div>
        </div>
        <Image
          src="https://picsum.photos/1920/1080"
          alt="Helping hands"
          data-ai-hint="helping hands"
          fill
          className="absolute inset-0 -z-10 object-cover opacity-10"
        />
      </section>

      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl font-headline">
            Pourquoi choisir ImuTask ?
          </h2>
          <div className="mx-auto mt-12 grid gap-8 sm:grid-cols-1 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-accent/30 p-4 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                Comment ça marche ?
              </h2>
              <p className="text-muted-foreground">
                En quelques étapes simples, trouvez de l'aide ou proposez vos
                compétences.
              </p>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mr-4">
                    1
                  </span>
                  <div>
                    <h3 className="font-semibold">Publiez une mission</h3>
                    <p className="text-muted-foreground">
                      Décrivez votre besoin, le lieu, le créneau et votre
                      budget.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mr-4">
                    2
                  </span>
                  <div>
                    <h3 className="font-semibold">Recevez des offres</h3>
                    <p className="text-muted-foreground">
                      Des jeunes motivés de votre quartier vous proposent leur
                      aide.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mr-4">
                    3
                  </span>
                  <div>
                    <h3 className="font-semibold">Choisissez & Validez</h3>
                    <p className="text-muted-foreground">
                      Acceptez une offre et payez en toute sécurité. Les fonds
                      sont conservés jusqu'à la fin de la mission.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <Image
                src="https://picsum.photos/600/500"
                alt="How it works"
                data-ai-hint="community connection"
                width={600}
                height={500}
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl font-headline">
            Des services pour tous vos besoins
          </h2>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card key={category.name} className="flex flex-col items-center justify-center p-6">
                <div className="text-primary">{category.icon}</div>
                <p className="mt-2 font-semibold">{category.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
            Prêt à commencer ?
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
            Rejoignez une communauté bienveillante et solidaire.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/sign-up">Inscrivez-vous gratuitement</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
