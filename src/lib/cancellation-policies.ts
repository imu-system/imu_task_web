/**
 * Cancellation Policies
 * 
 * Définit les politiques d'annulation et calcule les frais/remboursements
 * selon le timing et le rôle de l'utilisateur qui annule.
 * 
 * Business Rules:
 * - Annulation client >24h avant: 100% remboursement
 * - Annulation client 12-24h avant: 50% remboursement  
 * - Annulation client <12h avant: 0% remboursement
 * - Annulation provider >24h avant: 0% frais, 100% remboursement client
 * - Annulation provider <24h avant: pénalité provider, 100% remboursement client
 */

import { Timestamp } from 'firebase/firestore';

export type CancellationPolicyType = 'flexible' | 'moderate' | 'strict';

export interface CancellationPolicy {
  type: CancellationPolicyType;
  description: string;
  refundRules: {
    hoursBeforeStart: number;
    clientRefundPercent: number;
    providerPenaltyPercent: number;
  }[];
}

export interface CancellationCalculation {
  canCancel: boolean;
  refundAmount: number; // Montant remboursé au client (en cents)
  refundPercent: number; // Pourcentage de remboursement
  providerPenalty: number; // Pénalité pour le provider (en cents)
  platformFee: number; // Frais gardés par la plateforme (en cents)
  reason: string; // Raison de la politique appliquée
  hoursBeforeStart: number; // Heures avant le début
}

// Politique d'annulation par défaut (modérée)
export const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = {
  type: 'moderate',
  description: 'Politique modérée avec remboursement partiel selon le timing',
  refundRules: [
    {
      hoursBeforeStart: 48, // >48h avant
      clientRefundPercent: 100,
      providerPenaltyPercent: 0,
    },
    {
      hoursBeforeStart: 24, // 24-48h avant
      clientRefundPercent: 75,
      providerPenaltyPercent: 10,
    },
    {
      hoursBeforeStart: 12, // 12-24h avant
      clientRefundPercent: 50,
      providerPenaltyPercent: 15,
    },
    {
      hoursBeforeStart: 0, // <12h avant
      clientRefundPercent: 0,
      providerPenaltyPercent: 20,
    },
  ],
};

// Politique flexible (favorise les annulations faciles)
export const FLEXIBLE_POLICY: CancellationPolicy = {
  type: 'flexible',
  description: 'Politique flexible avec remboursement généreux',
  refundRules: [
    {
      hoursBeforeStart: 24,
      clientRefundPercent: 100,
      providerPenaltyPercent: 0,
    },
    {
      hoursBeforeStart: 12,
      clientRefundPercent: 75,
      providerPenaltyPercent: 5,
    },
    {
      hoursBeforeStart: 0,
      clientRefundPercent: 50,
      providerPenaltyPercent: 10,
    },
  ],
};

// Politique stricte (pénalités importantes)
export const STRICT_POLICY: CancellationPolicy = {
  type: 'strict',
  description: 'Politique stricte avec pénalités importantes',
  refundRules: [
    {
      hoursBeforeStart: 72, // >72h avant
      clientRefundPercent: 100,
      providerPenaltyPercent: 0,
    },
    {
      hoursBeforeStart: 48, // 48-72h avant
      clientRefundPercent: 50,
      providerPenaltyPercent: 15,
    },
    {
      hoursBeforeStart: 24, // 24-48h avant
      clientRefundPercent: 25,
      providerPenaltyPercent: 20,
    },
    {
      hoursBeforeStart: 0, // <24h avant
      clientRefundPercent: 0,
      providerPenaltyPercent: 30,
    },
  ],
};

/**
 * Calcule les frais et remboursements pour une annulation
 */
export function calculateCancellationFees(
  bookingAmount: number, // Montant total en cents
  scheduledDate: Date | Timestamp | string,
  cancelledBy: 'client' | 'provider',
  policy: CancellationPolicy = DEFAULT_CANCELLATION_POLICY,
  platformCommissionRate: number = 0.15 // 15% commission par défaut
): CancellationCalculation {
  // Convertir la date schedulée
  const scheduledDateTime =
    scheduledDate instanceof Timestamp
      ? scheduledDate.toDate()
      : new Date(scheduledDate);

  // Calculer les heures avant le début
  const now = new Date();
  const msBeforeStart = scheduledDateTime.getTime() - now.getTime();
  const hoursBeforeStart = msBeforeStart / (1000 * 60 * 60);

  // Si la date est déjà passée, interdire l'annulation
  if (hoursBeforeStart < 0) {
    return {
      canCancel: false,
      refundAmount: 0,
      refundPercent: 0,
      providerPenalty: 0,
      platformFee: bookingAmount,
      reason: 'Le service a déjà commencé ou est terminé',
      hoursBeforeStart,
    };
  }

  // Trouver la règle applicable (la première où hoursBeforeStart >= threshold)
  const applicableRule = policy.refundRules.find(
    (rule) => hoursBeforeStart >= rule.hoursBeforeStart
  );

  // Si aucune règle trouvée, prendre la dernière (plus stricte)
  const rule = applicableRule || policy.refundRules[policy.refundRules.length - 1];

  let refundPercent: number;
  let providerPenaltyPercent: number;

  if (cancelledBy === 'client') {
    // Client annule: appliquer les règles normales
    refundPercent = rule.clientRefundPercent;
    providerPenaltyPercent = 0; // Provider ne paie pas de pénalité si client annule
  } else {
    // Provider annule: 100% remboursement client + pénalité provider
    refundPercent = 100;
    providerPenaltyPercent = rule.providerPenaltyPercent;
  }

  // Calculer les montants
  const refundAmount = Math.round((bookingAmount * refundPercent) / 100);
  const providerPenalty = Math.round((bookingAmount * providerPenaltyPercent) / 100);
  
  // Montant gardé par la plateforme
  const platformFee = bookingAmount - refundAmount;

  // Construire la raison
  const reasonParts = [];
  if (hoursBeforeStart >= 48) {
    reasonParts.push('Annulation plus de 48h avant');
  } else if (hoursBeforeStart >= 24) {
    reasonParts.push('Annulation 24-48h avant');
  } else if (hoursBeforeStart >= 12) {
    reasonParts.push('Annulation 12-24h avant');
  } else {
    reasonParts.push('Annulation moins de 12h avant');
  }

  if (cancelledBy === 'provider') {
    reasonParts.push('- Annulation par le prestataire (remboursement complet client)');
  }

  return {
    canCancel: true,
    refundAmount,
    refundPercent,
    providerPenalty,
    platformFee,
    reason: reasonParts.join(' '),
    hoursBeforeStart,
  };
}

/**
 * Formatte les détails de politique pour affichage UI
 */
export function formatCancellationPolicy(
  policy: CancellationPolicy,
  locale: string = 'fr'
): string[] {
  return policy.refundRules.map((rule) => {
    const hours = rule.hoursBeforeStart;
    const refund = rule.clientRefundPercent;

    if (locale === 'fr') {
      if (hours === 0) {
        return `Moins de ${policy.refundRules[policy.refundRules.length - 2]?.hoursBeforeStart || 12}h avant: ${refund}% remboursement`;
      }
      return `Plus de ${hours}h avant: ${refund}% remboursement`;
    } else {
      if (hours === 0) {
        return `Less than ${policy.refundRules[policy.refundRules.length - 2]?.hoursBeforeStart || 12}h before: ${refund}% refund`;
      }
      return `More than ${hours}h before: ${refund}% refund`;
    }
  });
}

/**
 * Obtient la politique d'annulation recommandée selon la catégorie de tâche
 */
export function getRecommendedPolicy(taskCategory?: string): CancellationPolicy {
  // Catégories urgentes ou sensibles au timing → politique stricte
  const strictCategories = ['plumbing', 'urgent', 'healthcare', 'eldercare'];
  
  // Catégories flexibles → politique souple
  const flexibleCategories = ['tutoring', 'digital_help', 'shopping'];

  if (taskCategory && strictCategories.includes(taskCategory.toLowerCase())) {
    return STRICT_POLICY;
  }

  if (taskCategory && flexibleCategories.includes(taskCategory.toLowerCase())) {
    return FLEXIBLE_POLICY;
  }

  return DEFAULT_CANCELLATION_POLICY;
}
