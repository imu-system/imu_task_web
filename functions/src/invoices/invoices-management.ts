/**
 * Cloud Functions pour la gestion des factures - ImuPro
 *
 * Fonctionnalités :
 * - uploadInvoice : Upload d'une facture PDF/JPG vers Firebase Storage
 * - validateInvoice : Validation/rejet par l'admin
 * - generateInvoiceFromQuote : Génération automatique depuis un devis accepté
 * - getInvoice : Récupération d'une facture
 * - listInvoices : Liste des factures (avec filtres)
 *
 * Workflow :
 * DRAFT → SUBMITTED → VALIDATED/REJECTED → PAID
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();
const storage = admin.storage();

/**
 * Génère un numéro de facture séquentiel par année
 * Format : FACT-2025-00001
 *
 * @param {number} year - L'année pour la facture
 * @return {Promise<string>} Le numéro de facture généré
 */
async function generateInvoiceNumber(year: number): Promise<string> {
  const counterRef = db.doc("meta/invoice_counter");

  return db.runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    const currentYear = new Date().getFullYear();

    let counter = 1;

    if (counterDoc.exists) {
      const data = counterDoc.data();
      if (data && data.year === year) {
        counter = (data.count || 0) + 1;
      }
    }

    transaction.set(counterRef, { year: currentYear, count: counter }, { merge: true });

    const paddedNumber = counter.toString().padStart(5, "0");
    return `FACT-${year}-${paddedNumber}`;
  });
}

/**
 * Cloud Function : Upload d'une facture
 *
 * Permet au professionnel d'uploader une facture (PDF ou image)
 * Stocke le fichier dans Firebase Storage et crée le document Firestore
 *
 * @param {object} data - Les données de la facture
 * @param {object} context - Le contexte d'authentification
 * @return {Promise<object>} Résultat avec invoiceId et uploadUrl
 */
export const uploadInvoice = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Vous devez être authentifié pour uploader une facture"
    );
  }

  const userId = context.auth.uid;

  // Vérifier que l'utilisateur est un pro vérifié
  const proProfileDoc = await db.doc(`pro_profiles/${userId}`).get();
  if (!proProfileDoc.exists || proProfileDoc.data()?.verification_status !== "verified") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Vous devez être un professionnel vérifié pour uploader une facture"
    );
  }

  try {
    const {
      clientId,
      quoteId,
      amount,
      description,
      dueDate,
      fileName,
      fileType,
      fileData,
    } = data;

    // Valider les données de base
    if (!clientId || !amount) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "clientId et amount sont requis"
      );
    }

    if (!fileName || !fileType || !fileData) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Le fichier est requis (fileName, fileType, fileData)"
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(fileType)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Type de fichier non supporté. Formats acceptés : PDF, JPG, PNG"
      );
    }

    // Générer le numéro de facture
    const year = new Date().getFullYear();
    const invoiceNumber = await generateInvoiceNumber(year);

    // Uploader le fichier vers Storage
    const bucket = storage.bucket();
    const fileExtension = fileName.split(".").pop();
    const storagePath = `invoices/${userId}/${invoiceNumber}.${fileExtension}`;
    const file = bucket.file(storagePath);

    // Convertir base64 en buffer
    const buffer = Buffer.from(fileData, "base64");

    await file.save(buffer, {
      metadata: {
        contentType: fileType,
        metadata: {
          invoiceNumber,
          uploadedBy: userId,
          originalName: fileName,
        },
      },
    });

    // Générer l'URL de téléchargement (valide 7 jours)
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    // Créer le document facture dans Firestore
    const invoiceData: Record<string, unknown> = {
      invoiceNumber,
      providerId: userId,
      clientId,
      quoteId: quoteId || null,
      status: "submitted",
      amount,
      description: description || "",
      dueDate: dueDate ? admin.firestore.Timestamp.fromDate(new Date(dueDate)) : null,
      fileUrl: url,
      filePath: storagePath,
      fileName,
      fileType,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      validatedAt: null,
      rejectedAt: null,
      paidAt: null,
      rejectionReason: null,
      validatedBy: null,
    };

    const invoiceRef = await db.collection("invoices").add(invoiceData);

    // Envoyer une notification à l'admin
    await db.collection("notifications").add({
      type: "invoice_submitted",
      recipientId: "admin", // Notification pour les admins
      senderId: userId,
      invoiceId: invoiceRef.id,
      invoiceNumber,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    return {
      success: true,
      invoiceId: invoiceRef.id,
      invoiceNumber,
      fileUrl: url,
    };
  } catch (error: unknown) {
    console.error("Erreur upload facture:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    throw new functions.https.HttpsError("internal", errorMessage);
  }
});

/**
 * Cloud Function : Validation d'une facture par l'admin
 *
 * Permet à un admin de valider ou rejeter une facture soumise
 *
 * @param {object} data - invoiceId, action (approve/reject), rejectionReason
 * @param {object} context - Le contexte d'authentification
 * @return {Promise<object>} Résultat de la validation
 */
export const validateInvoice = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Vous devez être authentifié"
    );
  }

  const userId = context.auth.uid;

  // Vérifier que l'utilisateur est admin
  const userDoc = await db.doc(`users/${userId}`).get();
  const isAdmin = userDoc.exists && userDoc.data()?.role === "admin";

  if (!isAdmin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Seuls les administrateurs peuvent valider les factures"
    );
  }

  try {
    const { invoiceId, action, rejectionReason } = data;

    if (!invoiceId || !action) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "invoiceId et action sont requis"
      );
    }

    if (!["approve", "reject"].includes(action)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "action doit être \"approve\" ou \"reject\""
      );
    }

    if (action === "reject" && !rejectionReason) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "rejectionReason est requis pour un rejet"
      );
    }

    const invoiceRef = db.doc(`invoices/${invoiceId}`);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Facture introuvable");
    }

    const invoiceData = invoiceDoc.data();

    if (invoiceData?.status !== "submitted") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Seules les factures soumises peuvent être validées"
      );
    }

    const updateData: Record<string, unknown> = {
      validatedBy: userId,
    };

    if (action === "approve") {
      updateData.status = "validated";
      updateData.validatedAt = admin.firestore.FieldValue.serverTimestamp();
    } else {
      updateData.status = "rejected";
      updateData.rejectedAt = admin.firestore.FieldValue.serverTimestamp();
      updateData.rejectionReason = rejectionReason;
    }

    await invoiceRef.update(updateData);

    // Envoyer une notification au professionnel
    await db.collection("notifications").add({
      type: action === "approve" ? "invoice_validated" : "invoice_rejected",
      recipientId: invoiceData?.providerId,
      senderId: userId,
      invoiceId,
      invoiceNumber: invoiceData?.invoiceNumber,
      rejectionReason: action === "reject" ? rejectionReason : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    return {
      success: true,
      message: action === "approve" ? "Facture validée" : "Facture rejetée",
    };
  } catch (error: unknown) {
    console.error("Erreur validation facture:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    throw new functions.https.HttpsError("internal", errorMessage);
  }
});

/**
 * Cloud Function : Génération automatique d'une facture depuis un devis accepté
 *
 * Crée une facture pré-remplie à partir d'un devis accepté
 *
 * @param {object} data - quoteId
 * @param {object} context - Le contexte d'authentification
 * @return {Promise<object>} Résultat avec invoiceId
 */
export const generateInvoiceFromQuote = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Vous devez être authentifié"
    );
  }

  const userId = context.auth.uid;

  // Vérifier que l'utilisateur est un pro vérifié
  const proProfileDoc = await db.doc(`pro_profiles/${userId}`).get();
  if (!proProfileDoc.exists || proProfileDoc.data()?.verification_status !== "verified") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Vous devez être un professionnel vérifié"
    );
  }

  try {
    const { quoteId } = data;

    if (!quoteId) {
      throw new functions.https.HttpsError("invalid-argument", "quoteId est requis");
    }

    const quoteDoc = await db.doc(`quotes/${quoteId}`).get();

    if (!quoteDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Devis introuvable");
    }

    const quoteData = quoteDoc.data();

    // Vérifier que l'utilisateur est le fournisseur du devis
    if (quoteData?.providerId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Vous n'êtes pas autorisé à créer une facture pour ce devis"
      );
    }

    // Vérifier que le devis est accepté
    if (quoteData?.status !== "accepted") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Le devis doit être accepté pour générer une facture"
      );
    }

    // Vérifier qu'une facture n'existe pas déjà pour ce devis
    const existingInvoice = await db
      .collection("invoices")
      .where("quoteId", "==", quoteId)
      .limit(1)
      .get();

    if (!existingInvoice.empty) {
      throw new functions.https.HttpsError(
        "already-exists",
        "Une facture existe déjà pour ce devis"
      );
    }

    // Générer le numéro de facture
    const year = new Date().getFullYear();
    const invoiceNumber = await generateInvoiceNumber(year);

    // Calculer la date d'échéance (par défaut : 30 jours)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Créer la facture
    const invoiceData: Record<string, unknown> = {
      invoiceNumber,
      providerId: userId,
      clientId: quoteData.clientId,
      quoteId,
      status: "draft",
      amount: quoteData.total,
      description: `Facture pour le devis ${quoteData.quoteNumber} - ${quoteData.title}`,
      dueDate: admin.firestore.Timestamp.fromDate(dueDate),
      lineItems: quoteData.lineItems || [],
      subtotal: quoteData.subtotal || 0,
      travelFee: quoteData.travelFee || 0,
      discountAmount: quoteData.discountAmount || 0,
      taxRate: quoteData.taxRate || 20,
      taxAmount: quoteData.taxAmount || 0,
      total: quoteData.total || 0,
      fileUrl: null,
      filePath: null,
      fileName: null,
      fileType: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      submittedAt: null,
      validatedAt: null,
      rejectedAt: null,
      paidAt: null,
      rejectionReason: null,
      validatedBy: null,
    };

    const invoiceRef = await db.collection("invoices").add(invoiceData);

    return {
      success: true,
      invoiceId: invoiceRef.id,
      invoiceNumber,
      message: "Facture générée avec succès. Vous pouvez maintenant uploader le PDF.",
    };
  } catch (error: unknown) {
    console.error("Erreur génération facture:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    throw new functions.https.HttpsError("internal", errorMessage);
  }
});

/**
 * Cloud Function : Marquer une facture comme payée
 *
 * @param {object} data - invoiceId
 * @param {object} context - Le contexte d'authentification
 * @return {Promise<object>} Résultat
 */
export const markInvoiceAsPaid = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentification requise");
  }

  const userId = context.auth.uid;

  // Vérifier que l'utilisateur est admin
  const userDoc = await db.doc(`users/${userId}`).get();
  const isAdmin = userDoc.exists && userDoc.data()?.role === "admin";

  if (!isAdmin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Seuls les administrateurs peuvent marquer les factures comme payées"
    );
  }

  try {
    const { invoiceId } = data;

    if (!invoiceId) {
      throw new functions.https.HttpsError("invalid-argument", "invoiceId est requis");
    }

    const invoiceRef = db.doc(`invoices/${invoiceId}`);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Facture introuvable");
    }

    const invoiceData = invoiceDoc.data();

    if (invoiceData?.status !== "validated") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Seules les factures validées peuvent être marquées comme payées"
      );
    }

    await invoiceRef.update({
      status: "paid",
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Envoyer une notification au professionnel
    await db.collection("notifications").add({
      type: "invoice_paid",
      recipientId: invoiceData?.providerId,
      senderId: userId,
      invoiceId,
      invoiceNumber: invoiceData?.invoiceNumber,
      amount: invoiceData?.amount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    return {
      success: true,
      message: "Facture marquée comme payée",
    };
  } catch (error: unknown) {
    console.error("Erreur marquage facture payée:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    throw new functions.https.HttpsError("internal", errorMessage);
  }
});
