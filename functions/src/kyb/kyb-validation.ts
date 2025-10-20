/**
 * Cloud Functions pour la validation KYB (Know Your Business)
 * Gestion des soumissions professionnelles ImuPro
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getFirestore} from "firebase-admin/firestore";
import {UserRole} from "../types/user";
import {KYCStatus} from "../types/kyc";
import {
  KYBSubmission,
  ProVerificationStatus,
  ProServiceCategory,
  KYBDocumentType,
} from "../types/imupro";

const db = getFirestore();

/**
 * Soumettre une demande KYB pour devenir professionnel vérifié
 * Accessible à tous les utilisateurs authentifiés qui ont le rôle 'provider'
 */
export const submitKYB = onCall(async (request) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const userId = request.auth.uid;
  const {
    documents,
    businessInfo,
    insurance,
    certifications,
    requestedCategories,
  } = request.data;

  // Validation des paramètres obligatoires
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "At least one document is required"
    );
  }

  if (!businessInfo || !businessInfo.siret) {
    throw new HttpsError(
      "invalid-argument",
      "Business information with SIRET is required"
    );
  }

  if (!insurance || !insurance.expiryDate) {
    throw new HttpsError(
      "invalid-argument",
      "Professional insurance (RC Pro) information is required"
    );
  }

  try {
    // Vérifier si une soumission existe déjà
    const existingSubmission = await db
      .collection("kyb_submissions")
      .where("userId", "==", userId)
      .where("status", "in", ["pending", "verified"])
      .get();

    if (!existingSubmission.empty) {
      throw new HttpsError(
        "already-exists",
        "You already have a pending or approved KYB submission"
      );
    }

    // Vérifier automatiquement le SIRET
    const siretVerification = await verifySiret(businessInfo.siret);

    // Créer la soumission KYB
    const kybSubmission: Partial<KYBSubmission> = {
      userId,
      status: KYCStatus.pending,
      documents: documents.map((doc: { type: KYBDocumentType; url: string }) => ({
        type: doc.type,
        url: doc.url,
        uploadedAt: new Date(),
        verified: false,
        rejectionReason: undefined,
      })),
      businessInfo: {
        ...businessInfo,
        creationDate: new Date(businessInfo.creationDate),
      },
      insurance: {
        ...insurance,
        startDate: new Date(insurance.startDate),
        expiryDate: new Date(insurance.expiryDate),
        verified: false,
      },
      certifications: certifications || [],
      authorizedCategories: requestedCategories || [
        ProServiceCategory.HANDYMAN,
      ],
      submittedAt: new Date(),
      autoVerification: {
        siretValid: siretVerification.valid,
        siretVerifiedAt: new Date(),
      },
    };

    const submissionRef = await db
      .collection("kyb_submissions")
      .add(kybSubmission);

    // Mettre à jour le profil utilisateur
    await db.collection("users").doc(userId).update({
      proStatus: ProVerificationStatus.PENDING,
      updatedAt: new Date(),
    });

    // Créer une notification pour les admins
    await db.collection("notifications").add({
      type: "kyb_submission_new",
      targetRole: UserRole.admin,
      title: "Nouvelle soumission KYB",
      message: `${businessInfo.companyName} a soumis une demande de vérification professionnelle`,
      data: {
        submissionId: submissionRef.id,
        userId,
        companyName: businessInfo.companyName,
      },
      createdAt: new Date(),
      read: false,
    });

    return {
      success: true,
      submissionId: submissionRef.id,
      siretValid: siretVerification.valid,
      message: "KYB submission created successfully",
    };
  } catch (error) {
    console.error("❌ Error submitting KYB:", error);
    throw new HttpsError("internal", "Failed to submit KYB");
  }
});

/**
 * Vérifier un numéro SIRET via l'API INSEE
 * @param {string} siret Numéro SIRET à vérifier (14 chiffres)
 * @return {Promise} Résultat de la vérification
 */
async function verifySiret(siret: string): Promise<{
    valid: boolean;
    companyName?: string;
    legalForm?: string;
    active?: boolean;
}> {
  // TODO: Implémenter l'intégration avec l'API INSEE
  // https://api.insee.fr/entreprises/sirene/V3/siret/{siret}
  //
  // Pour le MVP, validation basique du format
  if (!/^\d{14}$/.test(siret)) {
    return {valid: false};
  }

  // Vérifier le cache Firestore
  const cacheRef = await db
    .collection("siret_cache")
    .doc(siret)
    .get();

  if (cacheRef.exists) {
    const cacheData = cacheRef.data();
    // Cache valide pendant 24h
    if (cacheData &&
            cacheData.verifiedAt &&
            new Date().getTime() - cacheData.verifiedAt.toDate().getTime() <
            24 * 60 * 60 * 1000
    ) {
      return {
        valid: cacheData.valid,
        companyName: cacheData.companyName,
        legalForm: cacheData.legalForm,
        active: cacheData.active,
      };
    }
  }

  // TODO: Appel API INSEE ici
  // Pour le MVP, retourner valid: true si format correct
  const result = {
    valid: true,
    companyName: "Entreprise (À vérifier manuellement)",
    active: true,
  };

  // Sauvegarder dans le cache
  await db.collection("siret_cache").doc(siret).set({
    ...result,
    verifiedAt: new Date(),
  });

  return result;
}

/**
 * Approuver une soumission KYB (Admin uniquement)
 * Créé automatiquement le profil professionnel
 */
export const approveKYB = onCall(async (request) => {
  // Vérifier l'authentification et le rôle admin
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  // Vérifier le rôle admin
  const adminDoc = await db.collection("users").doc(request.auth.uid).get();
  const adminData = adminDoc.data();

  if (!adminData || !adminData.roles.includes(UserRole.admin)) {
    throw new HttpsError(
      "permission-denied",
      "Only admins can approve KYB submissions"
    );
  }

  const {submissionId, notes, authorizedCategories} = request.data;

  if (!submissionId) {
    throw new HttpsError("invalid-argument", "Submission ID is required");
  }

  try {
    const submissionRef = db.collection("kyb_submissions").doc(submissionId);
    const submissionSnap = await submissionRef.get();

    if (!submissionSnap.exists) {
      throw new HttpsError("not-found", "KYB submission not found");
    }

    const submission = submissionSnap.data() as KYBSubmission;

    // Mettre à jour la soumission
    await submissionRef.update({
      status: ProVerificationStatus.VERIFIED,
      reviewedAt: new Date(),
      reviewedBy: request.auth.uid,
      notes: notes || "",
      authorizedCategories: authorizedCategories ||
                submission.authorizedCategories,
    });

    // Créer le profil professionnel
    await db.collection("pro_profiles").doc(submission.userId).set({
      userId: submission.userId,
      isPro: true,
      proVerified: true,
      verificationStatus: ProVerificationStatus.VERIFIED,
      businessInfo: submission.businessInfo,
      insurance: {
        ...submission.insurance,
        verified: true,
        verifiedAt: new Date(),
      },
      certifications: submission.certifications,
      categories: authorizedCategories || submission.authorizedCategories,
      specialties: [],
      portfolio: [],
      maxPortfolioItems: 10, // Gratuit par défaut
      badges: {
        proVerified: true,
        insuranceVerified: true,
        topRated: false,
        fastResponder: false,
        reliablePro: false,
        certifiedExpert: submission.certifications.length > 0,
        backgroundChecked: false,
      },
      pricingModel: {
        type: "hourly", // Par défaut
        includesTax: false,
      },
      workingHours: {
        monday: {isWorking: false, slots: []},
        tuesday: {isWorking: false, slots: []},
        wednesday: {isWorking: false, slots: []},
        thursday: {isWorking: false, slots: []},
        friday: {isWorking: false, slots: []},
        saturday: {isWorking: false, slots: []},
        sunday: {isWorking: false, slots: []},
      },
      serviceArea: {
        latitude: 0,
        longitude: 0,
        radius: 10, // 10km par défaut
      },
      stats: {
        totalJobs: 0,
        completedJobs: 0,
        canceledJobs: 0,
        averageResponseTime: 0,
        acceptanceRate: 0,
        onTimeRate: 0,
        totalRevenue: 0,
        averageJobValue: 0,
      },
      subscriptionTier: "free",
      autoAcceptQuotes: false,
      notificationPreferences: {
        email: true,
        sms: false,
        push: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActiveAt: new Date(),
    });

    // Mettre à jour le statut utilisateur
    await db.collection("users").doc(submission.userId).update({
      proStatus: ProVerificationStatus.VERIFIED,
      isPro: true,
      updatedAt: new Date(),
    });

    // Notifier l'utilisateur
    await db.collection("notifications").add({
      type: "kyb_approved",
      userId: submission.userId,
      title: "Votre profil professionnel est validé ! 🎉",
      message: "Félicitations ! Vous pouvez maintenant recevoir des " +
        "demandes de devis et commencer à travailler sur ImuPro.",
      createdAt: new Date(),
      read: false,
    });

    return {
      success: true,
      message: "KYB submission approved successfully",
    };
  } catch (error) {
    console.error("❌ Error approving KYB:", error);
    throw new HttpsError("internal", "Failed to approve KYB submission");
  }
});

/**
 * Rejeter une soumission KYB (Admin uniquement)
 */
export const rejectKYB = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  // Vérifier le rôle admin
  const adminDoc = await db.collection("users").doc(request.auth.uid).get();
  const adminData = adminDoc.data();

  if (!adminData || !adminData.roles.includes(UserRole.admin)) {
    throw new HttpsError(
      "permission-denied",
      "Only admins can reject KYB submissions"
    );
  }

  const {submissionId, rejectionReason} = request.data;

  if (!submissionId || !rejectionReason) {
    throw new HttpsError(
      "invalid-argument",
      "Submission ID and rejection reason are required"
    );
  }

  try {
    const submissionRef = db.collection("kyb_submissions").doc(submissionId);
    const submissionSnap = await submissionRef.get();

    if (!submissionSnap.exists) {
      throw new HttpsError("not-found", "KYB submission not found");
    }

    const submission = submissionSnap.data() as KYBSubmission;

    // Mettre à jour la soumission
    await submissionRef.update({
      status: ProVerificationStatus.REJECTED,
      reviewedAt: new Date(),
      reviewedBy: request.auth.uid,
      rejectionReason,
    });

    // Mettre à jour le statut utilisateur
    await db.collection("users").doc(submission.userId).update({
      proStatus: ProVerificationStatus.REJECTED,
      updatedAt: new Date(),
    });

    // Notifier l'utilisateur
    await db.collection("notifications").add({
      type: "kyb_rejected",
      userId: submission.userId,
      title: "Demande professionnelle refusée",
      message: `Votre demande de vérification professionnelle a été refusée. Raison : ${rejectionReason}`,
      createdAt: new Date(),
      read: false,
    });

    return {
      success: true,
      message: "KYB submission rejected",
    };
  } catch (error) {
    console.error("❌ Error rejecting KYB:", error);
    throw new HttpsError("internal", "Failed to reject KYB submission");
  }
});

/**
 * Lister toutes les soumissions KYB (Admin uniquement)
 */
export const listKYBSubmissions = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  // Vérifier le rôle admin
  const adminDoc = await db.collection("users").doc(request.auth.uid).get();
  const adminData = adminDoc.data();

  if (!adminData || !adminData.roles.includes(UserRole.admin)) {
    throw new HttpsError(
      "permission-denied",
      "Only admins can list KYB submissions"
    );
  }

  try {
    const {status, limit = 50} = request.data;

    let query = db.collection("kyb_submissions")
      .orderBy("submittedAt", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }

    const submissions = await query.limit(limit).get();

    const submissionsData = await Promise.all(
      submissions.docs.map(async (doc) => {
        const data = doc.data();

        // Récupérer les infos utilisateur
        const userDoc = await db.collection("users").doc(data.userId).get();
        const userData = userDoc.data();

        return {
          id: doc.id,
          ...data,
          userEmail: userData?.email || "Unknown",
          userDisplayName: userData?.profile?.displayName || "Unknown",
        };
      })
    );

    return {
      success: true,
      submissions: submissionsData,
    };
  } catch (error) {
    console.error("❌ Error listing KYB submissions:", error);
    throw new HttpsError("internal", "Failed to list KYB submissions");
  }
});
