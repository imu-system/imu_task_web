/**
 * Mentions légales
 */

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

export default function MentionsPage() {
  const router = useRouter();

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <div className="flex items-center gap-3 mb-8">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Mentions légales</h1>
          <p className="text-sm text-muted-foreground">
            Date de mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Éditeur de la Plateforme</h2>
            <div className="text-muted-foreground space-y-2">
              <p><strong>Raison sociale :</strong> IMU Task</p>
              <p><strong>Forme juridique :</strong> Société par Actions Simplifiée (SAS)</p>
              <p><strong>Capital social :</strong> 10 000 €</p>
              <p><strong>Numéro SIRET :</strong> 123 456 789 00010</p>
              <p><strong>Numéro RCS :</strong> Paris B 123 456 789</p>
              <p>
                <strong>Siège social :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France
              </p>
              <p><strong>Numéro de TVA intracommunautaire :</strong> FR 12 123456789</p>
              <p><strong>Email :</strong> contact@imutask.com</p>
              <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
            </div>
            <div className="mt-4 text-muted-foreground">
              <p>
                <strong>Directeur de la publication :</strong> John Doe, Président de la SAS IMU Task
              </p>
              <p><strong>Email :</strong> direction@imutask.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Hébergeur</h2>
            <div className="text-muted-foreground space-y-2">
              <p><strong>Nom :</strong> Google Cloud Platform (Firebase)</p>
              <p><strong>Société :</strong> Google LLC</p>
              <p>
                <strong>Adresse :</strong> 1600 Amphitheatre Parkway, Mountain View, CA 94043, États-Unis
              </p>
              <p><strong>Site web :</strong> <a href="https://cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://cloud.google.com</a></p>
            </div>
            <p className="text-muted-foreground mt-4">
              Les serveurs sont situés dans des centres de données certifiés ISO 27001, conformes aux normes de
              sécurité et de protection des données européennes. Les données sont hébergées principalement dans la
              région Europe (europe-west1 - Belgique).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'ensemble des éléments composant la Plateforme IMU Task (textes, graphismes, logiciels, photographies,
              images, vidéos, sons, plans, noms, logos, marques, créations et œuvres protégeables diverses, bases de
              données, etc.) ainsi que la Plateforme elle-même sont la propriété exclusive de IMU Task ou font l'objet
              d'une autorisation d'utilisation.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou
              partielle de la Plateforme ou de son contenu, par quelque procédé que ce soit, et sur quelque support
              que ce soit, est interdite sans l'autorisation préalable et écrite de IMU Task.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Toute exploitation non autorisée de la Plateforme, de son contenu ou de tout élément qui y est incorporé
              sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des
              articles L.335-2 et suivants du Code de la Propriété Intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              La Plateforme utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. En
              continuant à naviguer sur la Plateforme, vous acceptez l'utilisation de ces cookies.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Vous pouvez configurer votre navigateur pour refuser les cookies ou être averti lorsqu'un cookie est
              déposé. Toutefois, le refus de certains cookies peut affecter le bon fonctionnement de la Plateforme.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pour plus d'informations sur les cookies et leur gestion, consultez notre{' '}
              <button
                onClick={() => router.push('/legal/privacy')}
                className="text-primary hover:underline"
              >
                Politique de confidentialité
              </button>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Données personnelles</h2>
            <p className="text-muted-foreground leading-relaxed">
              IMU Task collecte et traite des données personnelles dans le respect du Règlement Général sur la
              Protection des Données (RGPD) et de la loi Informatique et Libertés.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Le responsable du traitement est IMU Task, représentée par son Président, John Doe.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pour toute question relative au traitement de vos données personnelles, vous pouvez contacter notre
              Délégué à la Protection des Données (DPO) :
            </p>
            <div className="mt-2 text-muted-foreground">
              <p><strong>Email DPO :</strong> dpo@imutask.com</p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pour en savoir plus sur vos droits et le traitement de vos données, consultez notre{' '}
              <button
                onClick={() => router.push('/legal/privacy')}
                className="text-primary hover:underline"
              >
                Politique de confidentialité
              </button>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Crédits</h2>
            <div className="text-muted-foreground space-y-2">
              <p>
                <strong>Conception et développement :</strong> IMU Task
              </p>
              <p>
                <strong>Design UI/UX :</strong> shadcn/ui (
                <a
                  href="https://ui.shadcn.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://ui.shadcn.com
                </a>
                )
              </p>
              <p>
                <strong>Framework :</strong> Next.js (
                <a
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://nextjs.org
                </a>
                )
              </p>
              <p>
                <strong>Backend et hébergement :</strong> Firebase / Google Cloud Platform
              </p>
              <p>
                <strong>Icônes :</strong> Lucide React (
                <a
                  href="https://lucide.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://lucide.dev
                </a>
                )
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation de responsabilité</h2>
            <p className="text-muted-foreground leading-relaxed">
              IMU Task met tout en œuvre pour assurer la disponibilité et la sécurité de la Plateforme, mais ne peut
              garantir un accès ininterrompu ou exempt d'erreurs. La Plateforme peut être temporairement indisponible
              en raison de maintenance, de mises à jour ou de causes indépendantes de notre volonté.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              IMU Task ne saurait être tenue responsable :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
              <li>
                Des dommages directs ou indirects résultant de l'utilisation de la Plateforme ou de l'impossibilité
                d'y accéder
              </li>
              <li>Des virus ou programmes malveillants qui pourraient infecter votre équipement informatique</li>
              <li>De l'utilisation frauduleuse ou abusive de la Plateforme par des tiers</li>
              <li>Des litiges entre utilisateurs et professionnels</li>
              <li>
                De la qualité des services fournis par les professionnels référencés sur la Plateforme
              </li>
              <li>Des contenus publiés par les utilisateurs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Liens hypertextes</h2>
            <p className="text-muted-foreground leading-relaxed">
              La Plateforme peut contenir des liens vers d'autres sites web. IMU Task n'exerce aucun contrôle sur ces
              sites et décline toute responsabilité quant à leur contenu, leur disponibilité ou leur politique de
              confidentialité.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              La création de liens hypertextes vers la Plateforme nécessite l'autorisation préalable écrite de IMU
              Task. Pour toute demande, contactez-nous à : contact@imutask.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Droit applicable et juridiction compétente</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes mentions légales sont soumises au droit français. En cas de litige, et à défaut d'accord
              amiable, les tribunaux français seront seuls compétents pour en connaître.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Conformément aux dispositions du Code de la consommation concernant le règlement amiable des litiges,
              IMU Task adhère au Service du Médiateur de la consommation dont elle dépend. En cas de litige, vous
              pouvez déposer votre réclamation sur le site :
            </p>
            <p className="mt-2">
              <a
                href="https://www.economie.gouv.fr/mediation-conso"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://www.economie.gouv.fr/mediation-conso
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Modification des mentions légales</h2>
            <p className="text-muted-foreground leading-relaxed">
              IMU Task se réserve le droit de modifier les présentes mentions légales à tout moment. Les modifications
              prendront effet dès leur publication sur la Plateforme. La date de dernière mise à jour est indiquée en
              haut de ce document.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter :
            </p>
            <div className="mt-4 text-muted-foreground space-y-2">
              <p><strong>Email :</strong> contact@imutask.com</p>
              <p><strong>Email juridique :</strong> legal@imutask.com</p>
              <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
              <p>
                <strong>Courrier :</strong> IMU Task - Service Juridique<br />
                123 Avenue des Champs-Élysées<br />
                75008 Paris<br />
                France
              </p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
