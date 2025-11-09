'use client';

import { ConversationPageAdvanced } from '@/components/messaging/conversation-page-advanced';

/**
 * Message Thread Page - Version Avancée
 * 
 * Fonctionnalités type WhatsApp:
 * - Messages texte, images, audio, fichiers
 * - Réactions emoji
 * - Répondre/Éditer/Supprimer messages
 * - Épingler des messages
 * - Recherche dans conversation
 * - Médias partagés
 * - Indicateur de saisie
 * - Statuts de lecture (✓/✓✓)
 * 
 * Updated: 9 Nov 2025
 */
export default function ConversationPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <ConversationPageAdvanced />
    </div>
  );
}

