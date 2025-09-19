
'use client';

import { CreateTaskForm } from '@/components/create-task-form';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

function CreateTaskFormWithSuspense() {
  return (
    <Suspense>
      <CreateTaskForm />
    </Suspense>
  )
}

export default function NewTaskPage() {
  const t = useTranslations('NewTaskPage');
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>
      <CreateTaskFormWithSuspense />
    </div>
  );
}
