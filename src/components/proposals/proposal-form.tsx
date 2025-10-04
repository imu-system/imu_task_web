'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createProposal } from '@/lib/firestore-proposals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, DollarSign, Clock, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProposalFormProps {
  taskId: string;
  taskTitle: string;
  taskBudget: number;
  clientId: string;
  providerId: string;
  onSuccess?: () => void;
}

export function ProposalForm({
  taskId,
  taskTitle,
  taskBudget,
  clientId,
  providerId,
  onSuccess,
}: ProposalFormProps) {
  const t = useTranslations('Proposals');
  const { toast } = useToast();
  const router = useRouter();

  const [amount, setAmount] = useState<string>(taskBudget.toString());
  const [message, setMessage] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(t('errorInvalidAmount'));
      return;
    }

    if (message.trim().length < 20) {
      setError(t('errorMessageTooShort'));
      return;
    }

    try {
      setSubmitting(true);

      const proposalId = await createProposal({
        taskId,
        providerId,
        clientId,
        amount: amountNum,
        message: message.trim(),
        estimatedDuration: estimatedDuration.trim() || undefined,
      });

      console.log('✅ Proposal created:', proposalId);

      // Show success toast
      toast({
        title: t('successTitle'),
        description: t('successDescription'),
      });

      // Reset form
      setAmount(taskBudget.toString());
      setMessage('');
      setEstimatedDuration('');

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Optionally redirect to provider dashboard
      // router.push('/dashboard');
    } catch (err: any) {
      console.error('❌ Error creating proposal:', err);
      setError(err.message || t('errorGeneric'));
      toast({
        title: t('errorTitle'),
        description: err.message || t('errorGeneric'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          {t('formTitle')}
        </CardTitle>
        <CardDescription>
          {t('formDescription', { taskTitle })}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Error alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Amount field */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('labelAmount')}
              <span className="text-xs text-muted-foreground">
                ({t('budgetReference')}: {taskBudget}€)
              </span>
            </Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('placeholderAmount')}
              required
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">{t('hintAmount')}</p>
          </div>

          {/* Estimated duration field */}
          <div className="space-y-2">
            <Label htmlFor="estimatedDuration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('labelDuration')}
              <span className="text-xs text-muted-foreground">({t('optional')})</span>
            </Label>
            <Input
              id="estimatedDuration"
              type="text"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              placeholder={t('placeholderDuration')}
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">{t('hintDuration')}</p>
          </div>

          {/* Message field */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t('labelMessage')}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('placeholderMessage')}
              rows={6}
              required
              disabled={submitting}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 {t('characters')} - {t('hintMessage')}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground">
            {t('formFooterNote')}
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {t('submit')}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
