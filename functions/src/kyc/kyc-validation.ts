/**
 * Cloud Functions pour la validation KYC et attribution du rôle provider
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getFirestore} from "firebase-admin/firestore";
import {UserRole} from "../types/user";
import {KYCStatus} from "../types/kyc";

const db = getFirestore();

/**
 * Soumettre une demande KYC
 * Accessible à tous les utilisateurs authentifiés
 */
export const submitKYC = onCall(async (request) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const userId = request.auth.uid;
  const {documents} = request.data;

  // Validation des paramètres
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "At least one document is required"
    );
  }

  try {
    // Vérifier si une soumission existe déjà
    const existingSubmission = await db
      .collection("kyc_submissions")
      .where("userId", "==", userId)
      .where("status", "in", [KYCStatus.pending, KYCStatus.approved])
      .get();

    if (!existingSubmission.empty) {
      throw new HttpsError(
        "already-exists",
        "You already have a pending or approved KYC submission"
      );
    }

    // Créer la soumission KYC
    const kycSubmission = {
      userId,
      status: KYCStatus.pending,
      documents: documents.map((doc: {type: string; url: string}) => ({
        type: doc.type,
        url: doc.url,
        uploadedAt: new Date(),
        verified: false,
      })),
      submittedAt: new Date(),
    };

    const submissionRef = await db
      .collection("kyc_submissions")
      .add(kycSubmission);

    // Mettre à jour le statut utilisateur
    await db.collection("users").doc(userId).update({
      kycStatus: KYCStatus.pending,
      updatedAt: new Date(),
    });

    return {
      success: true,
      submissionId: submissionRef.id,
      message: "KYC submission received. It will be reviewed shortly.",
    };
  } catch (error: unknown) {
    console.error("Error submitting KYC:", error);
    throw new HttpsError("internal", error instanceof Error ? error.message : "Unknown error");
  }
});

/**
 * Approuver une demande KYC et attribuer le rôle provider
 * Accessible uniquement aux admins
 */
export const approveKYC = onCall(async (request) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const callerId = request.auth.uid;
  const {submissionId, notes} = request.data;

  // Validation des paramètres
  if (!submissionId) {
    throw new HttpsError("invalid-argument", "Submission ID is required");
  }

  try {
    // Vérifier que l'appelant est admin
    const callerDoc = await db.collection("users").doc(callerId).get();
    const callerData = callerDoc.data();

    if (!callerData) {
      throw new HttpsError("not-found", "Caller user not found");
    }

    const callerRoles = callerData.roles || [];
    if (!callerRoles.includes(UserRole.admin)) {
      throw new HttpsError(
        "permission-denied",
        "Only administrators can approve KYC submissions"
      );
    }

    // Récupérer la soumission KYC
    const submissionDoc = await db
      .collection("kyc_submissions")
      .doc(submissionId)
      .get();

    if (!submissionDoc.exists) {
      throw new HttpsError("not-found", "KYC submission not found");
    }

    const submission = submissionDoc.data();
    const targetUserId = submission?.userId;

    if (!targetUserId) {
      throw new HttpsError("internal", "Invalid submission data");
    }

    // Vérifier que la soumission est en attente
    if (submission.status !== KYCStatus.pending) {
      throw new HttpsError(
        "failed-precondition",
        `KYC submission is already ${submission.status}`
      );
    }

    // Mettre à jour la soumission KYC
    await db.collection("kyc_submissions").doc(submissionId).update({
      status: KYCStatus.approved,
      reviewedAt: new Date(),
      reviewedBy: callerId,
      notes: notes || "",
    });

    // Attribuer le rôle provider à l'utilisateur
    const userDoc = await db.collection("users").doc(targetUserId).get();
    const userData = userDoc.data();

    if (!userData) {
      throw new HttpsError("not-found", "Target user not found");
    }

    const currentRoles = userData.roles || [];
    const updatedRoles = currentRoles.includes(UserRole.provider) ?
      currentRoles :
      [...currentRoles, UserRole.provider];

    await db.collection("users").doc(targetUserId).update({
      roles: updatedRoles,
      kycStatus: KYCStatus.approved,
      updatedAt: new Date(),
    });

    // Logger l'action dans admin_logs
    await db.collection("admin_logs").add({
      action: "approve_kyc",
      performedBy: callerId,
      targetUser: targetUserId,
      submissionId,
      timestamp: new Date(),
      notes: notes || "",
    });

    return {
      success: true,
      message: "KYC approved and provider role assigned successfully",
      userId: targetUserId,
    };
  } catch (error: unknown) {
    console.error("Error approving KYC:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", error instanceof Error ? error.message : "Unknown error");
  }
});

/**
 * Rejeter une demande KYC
 * Accessible uniquement aux admins
 */
export const rejectKYC = onCall(async (request) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const callerId = request.auth.uid;
  const {submissionId, reason} = request.data;

  // Validation des paramètres
  if (!submissionId || !reason) {
    throw new HttpsError(
      "invalid-argument",
      "Submission ID and rejection reason are required"
    );
  }

  try {
    // Vérifier que l'appelant est admin
    const callerDoc = await db.collection("users").doc(callerId).get();
    const callerData = callerDoc.data();

    if (!callerData) {
      throw new HttpsError("not-found", "Caller user not found");
    }

    const callerRoles = callerData.roles || [];
    if (!callerRoles.includes(UserRole.admin)) {
      throw new HttpsError(
        "permission-denied",
        "Only administrators can reject KYC submissions"
      );
    }

    // Récupérer la soumission KYC
    const submissionDoc = await db
      .collection("kyc_submissions")
      .doc(submissionId)
      .get();

    if (!submissionDoc.exists) {
      throw new HttpsError("not-found", "KYC submission not found");
    }

    const submission = submissionDoc.data();
    const targetUserId = submission?.userId;

    if (!targetUserId) {
      throw new HttpsError("internal", "Invalid submission data");
    }

    // Mettre à jour la soumission KYC
    await db.collection("kyc_submissions").doc(submissionId).update({
      status: KYCStatus.rejected,
      reviewedAt: new Date(),
      reviewedBy: callerId,
      rejectionReason: reason,
    });

    // Mettre à jour le statut utilisateur
    await db.collection("users").doc(targetUserId).update({
      kycStatus: KYCStatus.rejected,
      updatedAt: new Date(),
    });

    // Logger l'action dans admin_logs
    await db.collection("admin_logs").add({
      action: "reject_kyc",
      performedBy: callerId,
      targetUser: targetUserId,
      submissionId,
      reason,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: "KYC submission rejected",
      userId: targetUserId,
    };
  } catch (error: unknown) {
    console.error("Error rejecting KYC:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", error instanceof Error ? error.message : "Unknown error");
  }
});

/**
 * Lister toutes les soumissions KYC (avec filtres)
 * Accessible uniquement aux admins
 */
export const listKYCSubmissions = onCall(async (request) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const callerId = request.auth.uid;
  const {status, limit = 50} = request.data;

  try {
    // Vérifier que l'appelant est admin
    const callerDoc = await db.collection("users").doc(callerId).get();
    const callerData = callerDoc.data();

    if (!callerData) {
      throw new HttpsError("not-found", "Caller user not found");
    }

    const callerRoles = callerData.roles || [];
    if (!callerRoles.includes(UserRole.admin)) {
      throw new HttpsError(
        "permission-denied",
        "Only administrators can list KYC submissions"
      );
    }

    // Construire la requête
    let query: FirebaseFirestore.Query = db
      .collection("kyc_submissions")
      .orderBy("submittedAt", "desc")
      .limit(limit);

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();

    // Récupérer les infos utilisateurs
    const submissions = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userDoc = await db
          .collection("users")
          .doc(data.userId)
          .get();
        const userData = userDoc.data();

        return {
          id: doc.id,
          ...data,
          userEmail: userData?.email || "Unknown",
          userDisplayName:
                        userData?.profile?.displayName || "Unknown",
        };
      })
    );

    return {
      success: true,
      submissions,
    };
  } catch (error: unknown) {
    console.error("Error listing KYC submissions:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", error instanceof Error ? error.message : "Unknown error");
  }
});
