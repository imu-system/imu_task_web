'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { getTaskById, updateTask, Task } from '@/lib/firestore-tasks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const categories = [
  'Plomberie',
  'Électricité',
  'Ménage',
  'Jardinage',
  'Déménagement',
  'Réparation',
  'Peinture',
  'Assemblage',
  'Cours',
  'Autre',
];

export default function TaskEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('TaskEdit');
  const { toast } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const taskId = params.id as string;

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError('');

        const fetchedTask = await getTaskById(taskId);

        if (!fetchedTask) {
          setError(t('taskNotFound'));
          return;
        }

        // Check if user is the owner
        if (user && fetchedTask.clientId !== user.uid) {
          setError(t('notAuthorized'));
          return;
        }

        // Check if task can be edited (not completed or cancelled)
        if (fetchedTask.status === 'completed' || fetchedTask.status === 'cancelled') {
          setError(t('cannotEditCompleted'));
          return;
        }

        setTask(fetchedTask);

        // Populate form with task data
        setTitle(fetchedTask.title);
        setDescription(fetchedTask.description);
        setCategory(fetchedTask.category);
        setLocation(
          typeof fetchedTask.location === 'string'
            ? fetchedTask.location
            : fetchedTask.location.address || ''
        );
        setBudget(fetchedTask.budget.toString());
        if (fetchedTask.deadline) {
          // Format date for input type="date"
          const deadlineDate = new Date(fetchedTask.deadline);
          setDeadline(deadlineDate.toISOString().split('T')[0]);
        }
      } catch (err: any) {
        console.error('Error fetching task:', err);
        setError(err.message || t('taskNotFound'));
      } finally {
        setLoading(false);
      }
    };

    if (taskId && user) {
      fetchTask();
    }
  }, [taskId, user, t]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (title.trim().length < 5) {
      newErrors.title = t('titleRequired');
    }

    if (description.trim().length < 20) {
      newErrors.description = t('descriptionRequired');
    }

    if (!category) {
      newErrors.category = t('categoryRequired');
    }

    if (!location.trim()) {
      newErrors.location = t('locationRequired');
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum < 5) {
      newErrors.budget = t('budgetMin');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user || !task) return;

    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('updateError'),
      });
      return;
    }

    try {
      setSaving(true);
      setError('');

      const updateData: Partial<Task> = {
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        budget: parseFloat(budget),
      };

      // Add deadline if provided
      if (deadline) {
        updateData.deadline = new Date(deadline);
      }

      await updateTask(taskId, updateData);

      toast({
        title: t('updated'),
        description: t('updatedDescription'),
      });

      // Redirect to task detail page
      router.push(`/tasks/${taskId}`);
    } catch (err: any) {
      console.error('Error updating task:', err);
      setError(err.message || t('updateError'));
      toast({
        variant: 'destructive',
        title: t('error'),
        description: err.message || t('updateError'),
      });
    } finally {
      setSaving(false);
    }
  };

  // Not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            {t('notAuthenticated')}{' '}
            <Link href="/auth/login" className="font-medium underline">
              {t('loginLink')}
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Skeleton className="mb-6 h-10 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="mb-2 h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state (not found or not authorized)
  if (error || !task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || t('taskNotFound')}</AlertDescription>
        </Alert>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/tasks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToTask')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Back button */}
        <Button asChild className="mb-6" variant="outline" size="sm">
          <Link href={`/tasks/${taskId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToTask')}
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{t('title')}</CardTitle>
            <CardDescription>
              {task.category} • {task.status}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t('taskTitle')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('taskTitlePlaceholder')}
                  disabled={saving}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t('description')} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('descriptionPlaceholder')}
                  disabled={saving}
                  rows={6}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  {t('category')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={saving}
                >
                  <SelectTrigger
                    className={errors.category ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder={t('selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  {t('location')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('locationPlaceholder')}
                  disabled={saving}
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location}</p>
                )}
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <Label htmlFor="budget">
                  {t('budget')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="budget"
                  type="number"
                  min="5"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder={t('budgetPlaceholder')}
                  disabled={saving}
                  className={errors.budget ? 'border-red-500' : ''}
                />
                {errors.budget && (
                  <p className="text-sm text-red-500">{errors.budget}</p>
                )}
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">{t('deadline')}</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={saving}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Form actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/tasks/${taskId}`)}
                  disabled={saving}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('saveChanges')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
