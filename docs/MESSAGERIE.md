La messagerie est un module critique pour une plateforme comme ImuTask, car elle est le cœur de la coordination et de la confiance entre utilisateurs. Une conception claire et fonctionnelle est primordiale pour éviter les frustrations et assurer le bon déroulement des missions.
Voici une structuration détaillée de la page de Messagerie, en tenant compte des sous-pages, des sections, et des interactions multi-écrans :

Structuration Détaillée de la Page de Messagerie ImuTask
L'objectif est de rendre la communication fluide, traçable et sécurisée, tout en offrant une expérience utilisateur intuitive sur mobile et web.

1. Vue Générale : Liste des Conversations ( /dashboard/messages )
C'est la page d'accueil du module messagerie, présentant toutes les conversations actives ou passées.
* 1.1. En-tête de la Page :
    * Titre : "Messages" ou "Mes Conversations"
    * Bouton "Nouvelle Conversation" (optionnel/contextuel) : Si un utilisateur veut initier une conversation sans passer par une tâche (ex: question générale à un prestataire post-mission, après avoir accédé à son profil).
* 1.2. Barres de Recherche et Filtres :
    * Champ de recherche : Permet de rechercher dans les noms de correspondants, les titres de tâches ou le contenu des messages.
    * Filtres (Type de rôle) : "Toutes", "En tant que Client", "En tant que Prestataire".
    * Filtres (Statut de la tâche) : "Actives" (tâches en cours, en attente d'offre/acceptation), "Archivées" (tâches terminées ou annulées), "Non lues".
* 1.3. Liste des Conversations (Threads) :
    * Chaque élément de la liste représente un "thread" de conversation (généralement lié à une tâche spécifique ou un interlocuteur).
    * Informations affichées par thread :
        * Photo de profil du correspondant
        * Nom du correspondant (Client ou Prestataire)
        * Titre de la Mission associée (ex: "Courses pour le 15/03", "Aide montage meuble") - Très important !
        * Statut de la Mission (ex: "En attente d'offre", "Offre acceptée", "En cours", "Terminée", "Litige") - Couleur ou icône.
        * Extrait du dernier message
        * Heure/date du dernier message
        * Indicateur "Non lu" (pastille numérique ou visuel)
    * Options contextuelles au swipe (mobile) ou survol (web) : Archiver, Signaler.

2. Vue Détaillée : Fenêtre de Conversation ( /dashboard/messages/:threadId )
Une fois un thread sélectionné, l'utilisateur accède à la conversation spécifique.
* 2.1. En-tête de la Conversation :
    * Bouton "Retour" vers la liste des conversations.
    * Photo de profil et Nom du correspondant.
    * Titre de la Tâche associée (cliquable, menant à la page de détail de la tâche : /dashboard/tasks/:taskId).
    * Bouton "Actions" (menu kebab ou trois points) :
        * "Ouvrir un litige" (si la tâche est en cours ou terminée)
        * "Signaler cet utilisateur"
        * "Bloquer cet utilisateur"
        * "Archiver la conversation"
        * "Appeler l'utilisateur" (WebRTC, si V2 et consentements)
* 2.2. Zone de Messages (Historique) :
    * Affichage chronologique des messages (bulle de conversation).
    * Marquage temporel : Date et heure de chaque message ou groupe de messages.
    * Indicateurs de lecture : (ex: double coche grise / bleue, "vu par X").
    * Types de messages supportés :
        * Texte : Message standard.
        * Pièces jointes : Images (aperçu), PDF, documents (icône + nom de fichier, téléchargeable).
        * Messages système/automatiques : Ex: "L'offre a été acceptée", "Le paiement a été validé", "Un litige a été ouvert".
    * Message d'alerte (si détection PII) : "Attention, nous avons détecté une information personnelle sensible..."
* 2.3. Pied de Conversation (Zone de Saisie) :
    * Champ de texte : Pour écrire un nouveau message.
    * Bouton "Envoyer".
    * Bouton "Joindre Fichier / Photo" : Accès à la galerie/appareil photo ou sélecteur de fichiers.
    * Bouton "Enregistrer Audio" (si V2) : Pour envoyer un message vocal.
* 2.4. Barre d'Informations Contextuelles (optionnelle, position fixe ou déroulante) :
    * Statut actuel de la tâche : "Offre en attente du client", "Mission planifiée le JJ/MM à HH:MM", "Paiement en attente de validation".
    * Boutons d'action rapide liés à la tâche :
        * "Accepter l'offre" (si client et offre en attente)
        * "Proposer une contre-offre" (si client)
        * "Marquer comme commencée" (si prestataire et tâche planifiée)
        * "Marquer comme terminée" (si prestataire et tâche en cours)
        * "Proposer de replanifier"
        * "Annuler la tâche"

3. Version Miniature / Widget au Pied de Page (Mode "Mini-Messagerie" sur d'autres pages)
Quand l'utilisateur navigue sur d'autres pages de l'application (tableau de bord, détails de tâche, profil), un widget discret permet un accès rapide à la messagerie.
* 3.1. Sur Mobile : Pastille Flottante (Floating Action Button - FAB)
    * Une icône "Bulle de discussion" (💬) en bas à droite de l'écran.
    * Une pastille rouge avec le nombre de messages non lus si > 0.
    * Taper dessus ouvre la page /dashboard/messages.
* 3.2. Sur Web : Barre/Widget de Messagerie Discrète
    * Icône "Bulle de discussion" ou "Messages" dans le menu de navigation principal (avec pastille de non-lus).
    * Optionnel (V2) : Un petit widget qui s'ouvre en bas à droite de l'écran (type "chat bot") :
        * Affiche le dernier message non lu ou un aperçu des 2-3 dernières conversations.
        * Permet de répondre rapidement sans quitter la page actuelle (pour un seul thread).
        * Un bouton "Voir tous les messages" ramène à la page complète.

4. Interactions & Comportements Clés
* Synchronisation en Temps Réel : Les messages doivent s'afficher instantanément.
* Notifications : Push notifications (mobile), notifications in-app (pastille), notifications email (si l'utilisateur est hors ligne ou n'a pas ouvert l'app depuis un temps).
* Indicateurs de Saisie : "X est en train d'écrire..." pour une interaction plus naturelle.
* Scrolling : Chargement infini des messages plus anciens.
* Sécurité :
    * Détection PII (Personally Identifiable Information) : Alerte l'utilisateur s'il essaie d'envoyer un numéro de téléphone, email, adresse.
    * Interdiction d'envoi de contacts directs pour encourager les échanges sur la plateforme.
    * Audit Log des messages pour la résolution des litiges.

Cette structuration permet de couvrir tous les cas d'usage principaux, de la gestion des conversations à la communication en temps réel, tout en intégrant des fonctionnalités de sécurité et de professionnalisation essentielles pour ImuTask.
