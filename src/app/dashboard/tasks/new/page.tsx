import { CreateTaskForm } from '@/components/create-task-form';

export default function NewTaskPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Créer une nouvelle mission
        </h1>
        <p className="text-muted-foreground">
          Remplissez les détails ci-dessous pour trouver de l'aide rapidement.
        </p>
      </div>
      <CreateTaskForm />
    </div>
  );
}
