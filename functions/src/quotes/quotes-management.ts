/**
 * Cloud Functions pour la gestion des devis ImuPro
 *
 * Fonctionnalités :
 * - Création de devis par les professionnels
 * - Envoi de devis aux clients
 * - Acceptation/refus de devis par les clients
 * - Génération de numéros de devis uniques
 * - Gestion du workflow de devis
 *
 * Collections Firestore :
 * - quotes : Tous les devis
 * - quote_requests : Demandes de devis des clients
 * - notifications : Notifications liées aux devis
 * - bookings : Réservations créées depuis devis acceptés
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  Quote,
  QuoteStatus,
  QuoteLineItem,
  PaymentTerms,
} from "../types/quote-invoice";

const db = admin.firestore();

/**
 * Génère un numéro de devis unique
 * Format : DEVIS-YYYY-XXXXX
 *
 * @param {number} year - Année du devis
 * @return {Promise<string>} Numéro de devis formaté
 */
async function generateQuoteNumber(year: number): Promise<string> {
  const prefix = `DEVIS-${year}-`;

  // Chercher le dernier devis de l'année
  const quotesRef = db.collection("quotes");
  const snapshot = await quotesRef
    .where("quoteNumber", ">=", prefix)
    .where("quoteNumber", "<", `DEVIS-${year + 1}-`)
    .orderBy("quoteNumber", "desc")
    .limit(1)
    .get();

  let nextNumber = 1;

  if (!snapshot.empty) {
    const lastQuote = snapshot.docs[0].data();
    const lastNumber = lastQuote.quoteNumber.split("-")[2];
    nextNumber = parseInt(lastNumber, 10) + 1;
  }

  // Formater avec zéros (ex: 00001)
  const formattedNumber = nextNumber.toString().padStart(5, "0");
  return `${prefix}${formattedNumber}`;
}

/**
 * Calcule les totaux d'un devis
 *
 * @param {QuoteLineItem[]} lineItems - Lignes du devis
 * @param {number} travelFee - Frais de déplacement (en centimes)
 * @param {number} discountAmount - Montant de remise (en centimes)
 * @param {number} taxRate - Taux de TVA (ex: 20 pour 20%)
 * @return {object} Objet avec subtotal, taxAmount, total
 */
function calculateQuoteTotals(
  lineItems: QuoteLineItem[],
  travelFee: number = 0,
  discountAmount: number = 0,
  taxRate: number = 0
): {
    subtotal: number;
    taxAmount: number;
    total: number;
} {
  // Calculer le sous-total (somme des lignes)
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  // Ajouter frais de déplacement et retirer remise
  const subtotalWithAdjustments = subtotal + travelFee - discountAmount;

  // Calculer la TVA
  const taxAmount = taxRate > 0 ?
    Math.round(subtotalWithAdjustments * (taxRate / 100)) :
    0;

  // Total TTC
  const total = subtotalWithAdjustments + taxAmount;

  return {subtotal, taxAmount, total};
}

/**
 * Valide les données d'un devis
 *
 * @param {Partial<Quote>} data - Données du devis à valider
 * @throws Error si les données sont invalides
 * @return {void}
 */
function validateQuoteData(data: Partial<Quote>): void {
  // Vérifier les champs obligatoires
  if (!data.providerId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Le providerId est requis"
    );
  }

  if (!data.clientId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Le clientId est requis"
    );
  }

  if (!data.title || data.title.trim().length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Le titre du devis est requis"
    );
  }

  if (!data.lineItems || data.lineItems.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Le devis doit contenir au moins une ligne"
    );
  }

  // Valider les lignes du devis
  data.lineItems.forEach((item, index) => {
    if (!item.description || item.description.trim().length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `La description de la ligne ${index + 1} est requise`
      );
    }

    if (item.quantity <= 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `La quantité de la ligne ${index + 1} doit être supérieure à 0`
      );
    }

    if (item.unitPrice < 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Le prix unitaire de la ligne ${index + 1} ne peut pas être négatif`
      );
    }

    // Vérifier que le total est cohérent
    const expectedTotal = item.quantity * item.unitPrice;
    if (Math.abs(item.total - expectedTotal) > 1) { // Tolérance 1 centime
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Le total de la ligne ${index + 1} est incorrect`
      );
    }
  });

  // Valider la date de validité
  if (data.validUntil) {
    const validUntilDate = data.validUntil instanceof admin.firestore.Timestamp ?
      data.validUntil.toDate() :
      new Date(data.validUntil);

    if (validUntilDate < new Date()) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "La date de validité ne peut pas être dans le passé"
      );
    }
  }
}

/**
 * Cloud Function : Créer un nouveau devis
 *
 * Crée un devis en brouillon avec numéro unique.
 * Le pro peut ensuite l'envoyer au client avec sendQuote.
 *
 * @param data - Données du devis
 * @param context - Contexte d'authentification
 * @returns ID du devis créé
 */
export const createQuote = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    // Vérifier l'authentification
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Vous devez être connecté pour créer un devis"
      );
    }

    const userId = context.auth.uid;

    try {
      // Vérifier que l'utilisateur est bien un professionnel
      const proProfileDoc = await db
        .collection("pro_profiles")
        .doc(userId)
        .get();

      if (!proProfileDoc.exists) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Vous devez être un professionnel vérifié pour créer un devis"
        );
      }

      const proProfile = proProfileDoc.data();
      if (proProfile?.verificationStatus !== "approved") {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Votre profil professionnel doit être vérifié"
        );
      }

      // Valider les données
      validateQuoteData({
        ...data,
        providerId: userId,
      });

      // Générer le numéro de devis
      const currentYear = new Date().getFullYear();
      const quoteNumber = await generateQuoteNumber(currentYear);

      // Calculer les totaux
      const {subtotal, taxAmount, total} = calculateQuoteTotals(
        data.lineItems,
        data.travelFee || 0,
        data.discountAmount || 0,
        data.taxRate || 0
      );

      // Créer le devis
      const quote = {
        quoteNumber,
        providerId: userId,
        clientId: data.clientId,
        quoteRequestId: data.quoteRequestId || undefined,
        taskId: data.taskId || undefined,
        status: QuoteStatus.DRAFT,
        title: data.title.trim(),
        description: data.description?.trim() || "",
        lineItems: data.lineItems,
        subtotal,
        travelFee: data.travelFee || 0,
        discountAmount: data.discountAmount || 0,
        taxRate: data.taxRate || 0,
        taxAmount,
        total,
        validUntil: data.validUntil || admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 jours
        ),
        terms: data.terms || "Devis valable 30 jours. Paiement selon les conditions convenues.",
        paymentTerms: data.paymentTerms || PaymentTerms.UPON_COMPLETION,
        estimatedDuration: data.estimatedDuration || "",
        startDate: data.startDate || undefined,
        attachments: data.attachments || [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Sauvegarder dans Firestore
      const quoteRef = await db.collection("quotes").add(quote);

      functions.logger.info(`Devis créé : ${quoteNumber} (${quoteRef.id})`);

      return {
        success: true,
        quoteId: quoteRef.id,
        quoteNumber,
      };
    } catch (error) {
      functions.logger.error("Erreur création devis:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        "Erreur lors de la création du devis"
      );
    }
  });

/**
 * Cloud Function : Envoyer un devis au client
 *
 * Change le statut du devis de DRAFT à SENT.
 * Envoie une notification au client.
 *
 * @param data - { quoteId: string }
 * @param context - Contexte d'authentification
 * @returns Succès de l'envoi
 */
export const sendQuote = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    // Vérifier l'authentification
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Vous devez être connecté"
      );
    }

    const userId = context.auth.uid;
    const {quoteId} = data;

    if (!quoteId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Le quoteId est requis"
      );
    }

    try {
      const quoteRef = db.collection("quotes").doc(quoteId);
      const quoteDoc = await quoteRef.get();

      if (!quoteDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Devis introuvable"
        );
      }

      const quote = quoteDoc.data() as Quote;

      // Vérifier que l'utilisateur est le propriétaire
      if (quote.providerId !== userId) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Vous n'êtes pas autorisé à envoyer ce devis"
        );
      }

      // Vérifier que le devis est en brouillon
      if (quote.status !== QuoteStatus.DRAFT) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Le devis ne peut pas être envoyé (statut actuel : ${quote.status})`
        );
      }

      // Mettre à jour le statut
      await quoteRef.update({
        status: QuoteStatus.SENT,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Créer une notification pour le client
      await db.collection("notifications").add({
        userId: quote.clientId,
        type: "quote_received",
        title: "Nouveau devis reçu",
        message: `Vous avez reçu un devis de ${quote.quoteNumber}`,
        data: {
          quoteId: quoteDoc.id,
          quoteNumber: quote.quoteNumber,
          providerId: quote.providerId,
          total: quote.total,
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // TODO: Envoyer un email au client (optionnel)
      // await sendQuoteEmail(quote.clientId, quoteDoc.id);

      functions.logger.info(`Devis envoyé : ${quote.quoteNumber}`);

      return {
        success: true,
        message: "Devis envoyé avec succès",
      };
    } catch (error) {
      functions.logger.error("Erreur envoi devis:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        "Erreur lors de l'envoi du devis"
      );
    }
  });

/**
 * Cloud Function : Accepter un devis (client)
 *
 * Change le statut du devis à ACCEPTED.
 * Crée une réservation (booking) liée au devis.
 * Envoie une notification au professionnel.
 *
 * @param data - { quoteId: string, clientNotes?: string }
 * @param context - Contexte d'authentification
 * @returns ID de la réservation créée
 */
export const acceptQuote = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    // Vérifier l'authentification
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Vous devez être connecté"
      );
    }

    const userId = context.auth.uid;
    const {quoteId, clientNotes} = data;

    if (!quoteId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Le quoteId est requis"
      );
    }

    try {
      const quoteRef = db.collection("quotes").doc(quoteId);
      const quoteDoc = await quoteRef.get();

      if (!quoteDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Devis introuvable"
        );
      }

      const quote = quoteDoc.data() as Quote;

      // Vérifier que l'utilisateur est le client
      if (quote.clientId !== userId) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Vous n'êtes pas autorisé à accepter ce devis"
        );
      }

      // Vérifier que le devis est envoyé ou vu
      if (quote.status !== QuoteStatus.SENT && quote.status !== QuoteStatus.VIEWED) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Le devis ne peut pas être accepté (statut actuel : ${quote.status})`
        );
      }

      // Vérifier que le devis n'est pas expiré
      const validUntil = quote.validUntil instanceof admin.firestore.Timestamp ?
        quote.validUntil.toDate() :
        new Date(quote.validUntil);

      if (validUntil < new Date()) {
        // Marquer le devis comme expiré
        await quoteRef.update({
          status: QuoteStatus.EXPIRED,
        });

        throw new functions.https.HttpsError(
          "failed-precondition",
          "Ce devis a expiré"
        );
      }

      // Créer une réservation (booking)
      const bookingRef = await db.collection("bookings").add({
        providerId: quote.providerId,
        clientId: quote.clientId,
        quoteId: quoteDoc.id,
        taskId: quote.taskId,
        title: quote.title,
        description: quote.description,
        status: "pending", // En attente de confirmation du pro
        totalAmount: quote.total,
        startDate: quote.startDate || null,
        estimatedDuration: quote.estimatedDuration,
        paymentTerms: quote.paymentTerms,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Mettre à jour le devis
      await quoteRef.update({
        status: QuoteStatus.ACCEPTED,
        acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
        clientNotes: clientNotes || "",
        bookingId: bookingRef.id,
      });

      // Créer une notification pour le professionnel
      await db.collection("notifications").add({
        userId: quote.providerId,
        type: "quote_accepted",
        title: "Devis accepté !",
        message: `Votre devis ${quote.quoteNumber} a été accepté`,
        data: {
          quoteId: quoteDoc.id,
          quoteNumber: quote.quoteNumber,
          bookingId: bookingRef.id,
          clientId: quote.clientId,
          total: quote.total,
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // TODO: Envoyer un email au professionnel
      // await sendQuoteAcceptedEmail(quote.providerId, quoteDoc.id, bookingRef.id);

      functions.logger.info(`Devis accepté : ${quote.quoteNumber} → Booking ${bookingRef.id}`);

      return {
        success: true,
        message: "Devis accepté avec succès",
        bookingId: bookingRef.id,
      };
    } catch (error) {
      functions.logger.error("Erreur acceptation devis:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        "Erreur lors de l'acceptation du devis"
      );
    }
  });

/**
 * Cloud Function : Refuser un devis (client)
 *
 * Change le statut du devis à DECLINED.
 * Envoie une notification au professionnel avec la raison.
 *
 * @param data - { quoteId: string, reason: string }
 * @param context - Contexte d'authentification
 * @returns Succès du refus
 */
export const declineQuote = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    // Vérifier l'authentification
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Vous devez être connecté"
      );
    }

    const userId = context.auth.uid;
    const {quoteId, reason} = data;

    if (!quoteId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Le quoteId est requis"
      );
    }

    if (!reason || reason.trim().length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "La raison du refus est requise"
      );
    }

    try {
      const quoteRef = db.collection("quotes").doc(quoteId);
      const quoteDoc = await quoteRef.get();

      if (!quoteDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Devis introuvable"
        );
      }

      const quote = quoteDoc.data() as Quote;

      // Vérifier que l'utilisateur est le client
      if (quote.clientId !== userId) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Vous n'êtes pas autorisé à refuser ce devis"
        );
      }

      // Vérifier que le devis est envoyé ou vu
      if (quote.status !== QuoteStatus.SENT && quote.status !== QuoteStatus.VIEWED) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Le devis ne peut pas être refusé (statut actuel : ${quote.status})`
        );
      }

      // Mettre à jour le devis
      await quoteRef.update({
        status: QuoteStatus.DECLINED,
        declinedAt: admin.firestore.FieldValue.serverTimestamp(),
        clientNotes: reason.trim(),
      });

      // Créer une notification pour le professionnel
      await db.collection("notifications").add({
        userId: quote.providerId,
        type: "quote_declined",
        title: "Devis refusé",
        message: `Votre devis ${quote.quoteNumber} a été refusé`,
        data: {
          quoteId: quoteDoc.id,
          quoteNumber: quote.quoteNumber,
          clientId: quote.clientId,
          reason: reason.trim(),
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`Devis refusé : ${quote.quoteNumber}`);

      return {
        success: true,
        message: "Devis refusé",
      };
    } catch (error) {
      functions.logger.error("Erreur refus devis:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        "Erreur lors du refus du devis"
      );
    }
  });

/**
 * Cloud Function : Annuler un devis (professionnel)
 *
 * Permet au professionnel d'annuler un devis avant qu'il soit accepté.
 *
 * @param data - { quoteId: string, reason: string }
 * @param context - Contexte d'authentification
 * @returns Succès de l'annulation
 */
export const cancelQuote = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    // Vérifier l'authentification
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Vous devez être connecté"
      );
    }

    const userId = context.auth.uid;
    const {quoteId, reason} = data;

    if (!quoteId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Le quoteId est requis"
      );
    }

    try {
      const quoteRef = db.collection("quotes").doc(quoteId);
      const quoteDoc = await quoteRef.get();

      if (!quoteDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Devis introuvable"
        );
      }

      const quote = quoteDoc.data() as Quote;

      // Vérifier que l'utilisateur est le propriétaire
      if (quote.providerId !== userId) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Vous n'êtes pas autorisé à annuler ce devis"
        );
      }

      // Vérifier que le devis n'est pas déjà accepté
      if (quote.status === QuoteStatus.ACCEPTED) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Un devis accepté ne peut pas être annulé"
        );
      }

      // Mettre à jour le devis
      await quoteRef.update({
        status: QuoteStatus.CANCELLED,
        clientNotes: reason ? `Annulé par le pro : ${reason.trim()}` : "Annulé par le professionnel",
      });

      // Si le devis avait été envoyé, notifier le client
      if (quote.status === QuoteStatus.SENT || quote.status === QuoteStatus.VIEWED) {
        await db.collection("notifications").add({
          userId: quote.clientId,
          type: "quote_cancelled",
          title: "Devis annulé",
          message: `Le devis ${quote.quoteNumber} a été annulé`,
          data: {
            quoteId: quoteDoc.id,
            quoteNumber: quote.quoteNumber,
            providerId: quote.providerId,
            reason: reason || "",
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      functions.logger.info(`Devis annulé : ${quote.quoteNumber}`);

      return {
        success: true,
        message: "Devis annulé",
      };
    } catch (error) {
      functions.logger.error("Erreur annulation devis:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        "Erreur lors de l'annulation du devis"
      );
    }
  });
