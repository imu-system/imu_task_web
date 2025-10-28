/**
 * New Conversation Button (FAB - Floating Action Button)
 * 
 * Bouton flottant vert WhatsApp pour démarrer une nouvelle conversation
 * Position: bottom-right, style WhatsApp avec ombre et animation
 */

'use client';

import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NewConversationButtonProps {
  onClick: () => void;
  className?: string;
}

export function NewConversationButton({ 
  onClick, 
  className 
}: NewConversationButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        // Position fixe en bas à droite
        'fixed bottom-6 right-6 z-50',
        // Taille WhatsApp
        'h-14 w-14 rounded-full',
        // Couleur verte WhatsApp
        'bg-[#25D366] hover:bg-[#20BA5A]',
        'text-white shadow-lg',
        // Animation au hover
        'transition-all duration-200',
        'hover:scale-110 hover:shadow-xl',
        // Active state
        'active:scale-95',
        className
      )}
      aria-label="Nouvelle conversation"
    >
      <MessageSquarePlus className="h-6 w-6" />
    </Button>
  );
}
