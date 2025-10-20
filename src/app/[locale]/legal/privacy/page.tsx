/**
 * Politique de confidentialité (RGPD)
 */

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
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
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
          <p className="text-sm text-muted-foreground">
            Version 1.0 - Date de mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              IMU Task (ci-après « nous » ou « la Plateforme ») s'engage à protéger la vie privée de ses utilisateurs.
              Cette Politique de confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos
              données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
              Informatique et Libertés.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Responsable du traitement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le responsable du traitement de vos données personnelles est :
            </p>
            <div className="mt-2 text-muted-foreground">
              <p><strong>IMU Task</strong></p>
              <p>Email : contact@imutask.com</p>
              <p>Email DPO : dpo@imutask.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Données collectées</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">3.1 Données d'identification</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone (optionnel)</li>
              <li>Date de création du compte</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.2 Données des professionnels</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>Numéro SIRET</li>
              <li>Raison sociale</li>
              <li>Adresse professionnelle</li>
              <li>Secteur d'activité</li>
              <li>Services proposés</li>
              <li>Zones d'intervention</li>
              <li>Portfolio (photos, descriptions)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.3 Données de navigation</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>Adresse IP</li>
              <li>Type de navigateur</li>
              <li>Pages visitées</li>
              <li>Date et heure de connexion</li>
              <li>Cookies (voir section dédiée)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.4 Données de transaction</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>Devis créés et acceptés</li>
              <li>Factures uploadées</li>
              <li>Réservations effectuées</li>
              <li>Messages échangés</li>
              <li>Avis et notes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Finalités du traitement</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              Nous collectons et traitons vos données personnelles pour les finalités suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Gestion de votre compte :</strong> Création, authentification et gestion de votre profil
                utilisateur
              </li>
              <li>
                <strong>Fourniture des services :</strong> Mise en relation avec des professionnels, échange de
                messages, gestion des devis et réservations
              </li>
              <li>
                <strong>Vérification KYB :</strong> Validation de l'identité des professionnels via leur numéro SIRET
              </li>
              <li>
                <strong>Amélioration de la Plateforme :</strong> Analyse de l'utilisation pour améliorer nos services
              </li>
              <li>
                <strong>Communication :</strong> Envoi de notifications relatives à votre compte et vos réservations
              </li>
              <li>
                <strong>Sécurité :</strong> Prévention de la fraude et respect de nos obligations légales
              </li>
              <li>
                <strong>Marketing :</strong> Envoi d'offres commerciales (avec votre consentement préalable)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Base légale du traitement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le traitement de vos données repose sur les bases légales suivantes :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
              <li>
                <strong>Exécution du contrat :</strong> Fourniture des services de la Plateforme
              </li>
              <li>
                <strong>Consentement :</strong> Communications marketing, cookies non essentiels
              </li>
              <li>
                <strong>Intérêt légitime :</strong> Amélioration des services, sécurité de la Plateforme
              </li>
              <li>
                <strong>Obligation légale :</strong> Conservation des données de facturation, vérification KYB
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Destinataires des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données personnelles peuvent être transmises aux destinataires suivants :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
              <li>
                <strong>Personnel autorisé :</strong> Équipes techniques et support client de la Plateforme
              </li>
              <li>
                <strong>Professionnels :</strong> Dans le cadre d'une demande de devis ou d'une réservation
              </li>
              <li>
                <strong>Prestataires techniques :</strong> Hébergement (Firebase/Google Cloud), services de paiement,
                outils d'analyse
              </li>
              <li>
                <strong>Autorités compétentes :</strong> Sur demande légale ou judiciaire
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Durée de conservation</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              Nous conservons vos données personnelles pendant les durées suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Compte actif :</strong> Pendant toute la durée d'utilisation de votre compte
              </li>
              <li>
                <strong>Après suppression du compte :</strong> 30 jours pour permettre une récupération (puis
                suppression définitive)
              </li>
              <li>
                <strong>Données de facturation :</strong> 10 ans (obligation légale)
              </li>
              <li>
                <strong>Données de navigation :</strong> 13 mois maximum
              </li>
              <li>
                <strong>Données marketing :</strong> 3 ans à compter du dernier contact
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Vos droits</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles
              </li>
              <li>
                <strong>Droit de rectification :</strong> Corriger vos données inexactes ou incomplètes
              </li>
              <li>
                <strong>Droit à l'effacement :</strong> Supprimer vos données (« droit à l'oubli »)
              </li>
              <li>
                <strong>Droit à la limitation :</strong> Restreindre le traitement de vos données
              </li>
              <li>
                <strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données (notamment marketing)
              </li>
              <li>
                <strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré
              </li>
              <li>
                <strong>Droit de retirer votre consentement :</strong> À tout moment
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pour exercer vos droits, contactez-nous à : <strong>dpo@imutask.com</strong>
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de
              l'Informatique et des Libertés).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Sécurité des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données
              personnelles contre tout accès non autorisé, perte, destruction ou divulgation :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>Chiffrement des données sensibles (SSL/TLS)</li>
              <li>Authentification sécurisée (Firebase Authentication)</li>
              <li>Contrôle d'accès strict aux données</li>
              <li>Sauvegardes régulières</li>
              <li>Audits de sécurité périodiques</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              La Plateforme utilise des cookies pour améliorer votre expérience utilisateur. Les cookies sont de petits
              fichiers texte stockés sur votre appareil.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">Types de cookies utilisés :</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Cookies essentiels :</strong> Nécessaires au fonctionnement de la Plateforme (session,
                authentification)
              </li>
              <li>
                <strong>Cookies de performance :</strong> Analyse de l'utilisation (Google Analytics)
              </li>
              <li>
                <strong>Cookies fonctionnels :</strong> Mémorisation de vos préférences
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter le
              fonctionnement de la Plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Transferts internationaux</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données sont hébergées sur les serveurs de Google Cloud (Firebase), qui peuvent être situés en dehors
              de l'Union européenne. Ces transferts sont encadrés par les clauses contractuelles types de la Commission
              européenne et bénéficient de garanties appropriées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Modifications de la politique</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous nous réservons le droit de modifier cette Politique de confidentialité à tout moment. Toute
              modification sera communiquée via une notification sur la Plateforme ou par email. La date de dernière
              mise à jour est indiquée en haut de ce document.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question relative à cette Politique de confidentialité ou à vos données personnelles,
              contactez-nous :
            </p>
            <div className="mt-2 text-muted-foreground">
              <p><strong>Email DPO :</strong> dpo@imutask.com</p>
              <p><strong>Email général :</strong> contact@imutask.com</p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
