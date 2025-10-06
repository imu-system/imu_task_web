/**
 * Messages Page (Server Component)
 * 
 * Server component for messages route with metadata
 */

import { getTranslations } from 'next-intl/server';
import { MessagesClient } from '@/components/chat/messages-client';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'messages' });

  return {
    title: t('general.messages'),
    description: t('labels.messagesPageDesc'),
  };
}

export default function MessagesPage() {
  return <MessagesClient />;
}
