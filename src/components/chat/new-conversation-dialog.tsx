/**
 * NewConversationDialog Component
 * 
 * Dialog for creating a new conversation
 * Simplified version - can be enhanced with user search later
 */

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateConversation: (userId: string, initialMessage: string) => Promise<void>;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  onCreateConversation,
}: NewConversationDialogProps) {
  const t = useTranslations('messages');
  const [userId, setUserId] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!userId.trim() || !initialMessage.trim()) return;

    setCreating(true);
    try {
      await onCreateConversation(userId.trim(), initialMessage.trim());
      setUserId('');
      setInitialMessage('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('actions.newConversation')}</DialogTitle>
          <DialogDescription>{t('labels.startNewConversationDesc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="userId">{t('labels.recipientUserId')}</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={t('placeholders.enterUserId')}
              disabled={creating}
            />
            <p className="text-xs text-muted-foreground">
              {t('labels.userIdHelp')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{t('labels.initialMessage')}</Label>
            <Input
              id="message"
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder={t('placeholders.typeMessage')}
              disabled={creating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={creating}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!userId.trim() || !initialMessage.trim() || creating}
          >
            {creating ? t('status.creating') : t('actions.create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
