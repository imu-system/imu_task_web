'use client';

import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useRouter, Link } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { getTaskById, updateTask, deleteTask, updateTaskStatus, Task } from '@/lib/firestore-tasks';
import { getOffersForTaskWithDetails, acceptOffer, rejectOffer } from '@/lib/firebase/offers';
import { ProposalList } from '@/components/proposals/proposal-list';
import { OffersList } from '@/components/offers/OffersList';
import { TaskMapDisplay } from '@/components/task-detail/task-map-display';
import { TaskImageGallery } from '@/components/task-detail/task-image-gallery';
import { TaskStatusActions } from '@/components/task-detail/task-status-actions';
import { TaskStatusBadge } from '@/components/task-detail/task-status-badge';
import { getCategoryByFirestoreValue } from '@/lib/constants/categories';
import { useToggleFavorite } from '@/hooks/use-favorites';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// OPTIMIZATION: Lazy load heavy components
const ProposalForm = lazy(() => import('@/components/proposals/proposal-form').then(mod => ({ default: mod.ProposalForm })));
const ProviderSuggestions = lazy(() => import('@/components/task-detail/provider-suggestions').then(mod => ({ default: mod.ProviderSuggestions })));
import type { OfferWithDetails } from '@/types/offer';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DollarSign,
  Calendar,
  User,
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Tag,
  Heart,
  MapPin,
  Share2,
  Copy,
  Mail,
  Home,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const locale = useLocale();
  const t = useTranslations('TaskDetail');
  const { toast } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [offers, setOffers] = useState<OfferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [clientName, setClientName] = useState<string>('');
  const [providerName, setProviderName] = useState<string>('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({});
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const taskId = params.id as string;

  // Use toggle favorite hook
  const { isFavorited, toggle: toggleFavorite, loading: favoriteLoading } = useToggleFavorite(
    taskId,
    'task',
    task ? {
      title: task.title,
      category: task.category,
      location: typeof task.location === 'string' 
        ? task.location 
        : (task.location as any)?.city || (task.location as any)?.address,
    } : undefined
  );

  // OPTIMIZATION: Memoize expensive category data computation (must be before any early returns)
  const categoryData = useMemo(() => {
    if (!task) return null;
    
    const data = getCategoryByFirestoreValue(task.category);
    const displayName = task.category
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Category images (same as task cards)
    const CATEGORY_IMAGES: Record<string, string> = {
      'aide_domicile': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80',
      'courses_livraisons': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80',
      'aide_numerique': 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&q=80',
      'demenagement': 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1200&q=80',
      'accompagnement': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=80',
      'jardinage': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80',
      'animaux': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&q=80',
      'evenements': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
    };
    
    const categoryImage = CATEGORY_IMAGES[task.category] || CATEGORY_IMAGES['aide_domicile'];
    
    return {
      icon: data?.icon,
      color: data?.color || '#3B82F6',
      displayName,
      categoryImage,
    };
  }, [task?.category]);

  // Calculate task images (must be after categoryData)
  const taskImages = useMemo(() => {
    if (!task) return [];
    return task.images && task.images.length > 0 
      ? task.images 
      : [categoryData?.categoryImage || ''];
  }, [task?.images, categoryData?.categoryImage]);

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

        setTask(fetchedTask);
      } catch (err: any) {
        console.error('Error fetching task:', err);
        setError(err.message || t('taskNotFound'));
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId, t]);

  // Charger les offres (pour task owner uniquement)
  useEffect(() => {
    const fetchOffers = async () => {
      if (!task || !user || task.clientId !== user.uid) return;

      try {
        const taskOffers = await getOffersForTaskWithDetails(taskId);
        setOffers(taskOffers);
      } catch (err: any) {
        console.error('Error fetching offers:', err);
      }
    };

    fetchOffers();
  }, [task, user, taskId]);

  // Charger les noms des utilisateurs (client et provider) - OPTIMIZED with Promise.all
  useEffect(() => {
    const fetchUserNames = async () => {
      if (!task) return;

      try {
        // Batch fetch both users in parallel
        const userPromises: Promise<any>[] = [];
        const userIds: string[] = [];

        if (task.clientId) {
          userIds.push(task.clientId);
          userPromises.push(getDoc(doc(db, 'users', task.clientId)));
        }

        if (task.providerId && task.providerId !== task.clientId) {
          userIds.push(task.providerId);
          userPromises.push(getDoc(doc(db, 'users', task.providerId)));
        }

        const userDocs = await Promise.all(userPromises);

        // Process results
        userDocs.forEach((userDoc, index) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const displayName = userData?.profile?.displayName || userData?.displayName;
            
            if (userIds[index] === task.clientId) {
              setClientName(displayName || t('client'));
            } else if (userIds[index] === task.providerId) {
              setProviderName(displayName || t('provider'));
            }
          }
        });
      } catch (err) {
        console.error('Error fetching user names:', err);
      }
    };

    fetchUserNames();
  }, [task]);

  // OPTIMIZATION: Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImageIndex(null);
        setLightboxZoom(1);
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIndex(prev => 
          prev! > 0 ? prev! - 1 : taskImages.length - 1
        );
        setLightboxZoom(1);
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex(prev => 
          prev! < taskImages.length - 1 ? prev! + 1 : 0
        );
        setLightboxZoom(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, taskImages.length]);

  // OPTIMIZATION: Swipe gestures for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && selectedImageIndex !== null) {
      // Swipe left = next image
      setSelectedImageIndex(prev => 
        prev! < taskImages.length - 1 ? prev! + 1 : 0
      );
      setLightboxZoom(1);
    } else if (isRightSwipe && selectedImageIndex !== null) {
      // Swipe right = previous image
      setSelectedImageIndex(prev => 
        prev! > 0 ? prev! - 1 : taskImages.length - 1
      );
      setLightboxZoom(1);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, selectedImageIndex, taskImages.length]);

  // OPTIMIZED: Use useCallback for handlers
  const handleAcceptOffer = useCallback(async (offerId: string) => {
    if (!user || !task) return;

    // Optimistic UI: Update state immediately
    const previousOffers = [...offers];
    setOffers(prevOffers => prevOffers.map(offer => 
      offer.id === offerId ? { ...offer, status: 'accepted' as const } : offer
    ));

    try {
      await acceptOffer(offerId, user.uid);
      
      toast({
        title: t('offerAcceptedTitle'),
        description: t('offerAcceptedDescription'),
      });

      // Batch fetch updated data
      const [updatedOffers, updatedTask] = await Promise.all([
        getOffersForTaskWithDetails(taskId),
        getTaskById(taskId)
      ]);

      setOffers(updatedOffers);
      if (updatedTask) {
        setTask(updatedTask);
      }
    } catch (err: any) {
      console.error('Error accepting offer:', err);
      
      // Revert optimistic update on error
      setOffers(previousOffers);
      
      toast({
        variant: 'destructive',
        title: t('error'),
        description: err.message || t('offerAcceptError'),
      });
    }
  }, [user, task, offers, taskId, toast, t]);

  const handleRejectOffer = useCallback(async (offerId: string) => {
    if (!user) return;

    // Optimistic UI: Update state immediately
    const previousOffers = [...offers];
    setOffers(prevOffers => prevOffers.map(offer => 
      offer.id === offerId ? { ...offer, status: 'rejected' as const } : offer
    ));

    try {
      await rejectOffer(offerId, user.uid);
      
      toast({
        title: t('offerRejectedTitle'),
        description: t('offerRejectedDescription'),
      });

      // Rafraîchir les offres
      const updatedOffers = await getOffersForTaskWithDetails(taskId);
      setOffers(updatedOffers);
    } catch (err: any) {
      console.error('Error rejecting offer:', err);
      
      // Revert optimistic update on error
      setOffers(previousOffers);
      
      toast({
        variant: 'destructive',
        title: t('error'),
        description: err.message || t('offerRejectError'),
      });
    }
  }, [user, offers, taskId, toast, t]);

  const handleDelete = useCallback(async () => {
    if (!task || !user) return;

    try {
      setDeleting(true);
      await deleteTask(taskId);
      router.push('/tasks');
    } catch (err: any) {
      console.error('Error deleting task:', err);
      setError(err.message || t('error'));
      setDeleting(false);
    }
  }, [task, user, taskId, router, t]);

  // ENHANCEMENT 6: Image captions with metadata
  const getImageCaption = useCallback((index: number) => {
    if (!task || !categoryData) return '';
    
    if (task.images && task.images.length > 0) {
      return `Photo ${index + 1} de ${taskImages.length} - ${task.title}`;
    }
    return `Image de catégorie - ${categoryData.displayName}`;
  }, [task, taskImages.length, categoryData]);

  // OPTIMIZED: Share handlers with useCallback
  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/${locale}/tasks/${taskId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: t('linkCopied'),
        description: t('linkCopiedDescription'),
      });
      setShowShareMenu(false);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  }, [locale, taskId, toast, t]);

  const handleShareEmail = useCallback(() => {
    const subject = encodeURIComponent(task?.title || 'Task on ImuTask');
    const body = encodeURIComponent(
      `Check out this task: ${task?.title}\n\n${window.location.href}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareMenu(false);
  }, [task?.title]);

  const handleShareWhatsApp = useCallback(() => {
    const text = encodeURIComponent(
      `Check out this task: ${task?.title}\n${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareMenu(false);
  }, [task?.title]);

  const handleStatusChange = useCallback(async (newStatus: Task['status']) => {
    if (!task || !user) return;

    // Optimistic UI: Update state immediately
    const previousStatus = task.status;
    setTask(prev => prev ? { ...prev, status: newStatus } : null);

    try {
      await updateTaskStatus(taskId, newStatus, user.uid);
      
      // Refresh task data to ensure consistency
      const updatedTask = await getTaskById(taskId);
      if (updatedTask) {
        setTask(updatedTask);
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      
      // Revert optimistic update on error
      setTask(prev => prev ? { ...prev, status: previousStatus } : null);
      
      throw err; // Re-throw to let TaskStatusActions handle the error
    }
  }, [task, user, taskId]);

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
        <Skeleton className="mb-4 h-8 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="mb-2 h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/tasks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToTasks')}
          </Link>
        </Button>
      </div>
    );
  }

  if (!task) return null;

  const isOwner = user.uid === task.clientId;
  const canEdit = isOwner && (task.status === 'open' || task.status === 'assigned');

  const CategoryIcon = categoryData?.icon;
  const categoryColor = categoryData?.color || '#3B82F6';
  const categoryDisplayName = categoryData?.displayName || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              {t('home')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/tasks" className="hover:text-foreground transition-colors">
              {t('tasks')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {task.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="container mx-auto px-4 pt-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header: Title, Badges & Actions */}
        <div className="mb-6">
          {/* Title & Budget */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3 flex-wrap">
                {task.title}
                <Badge variant="default" className="text-lg font-bold px-4 py-1.5">
                  {task.budget} €
                </Badge>
              </h1>
              
              {/* Category Badge & Status */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className="shadow-md bg-white text-gray-900 flex items-center gap-1.5 text-sm font-semibold"
                  style={{ borderLeft: `3px solid ${categoryColor}` }}
                >
                  {CategoryIcon ? (
                    <span style={{ color: categoryColor }}>
                      <CategoryIcon className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: categoryColor }} />
                  )}
                  <span>{categoryDisplayName}</span>
                </Badge>
                <TaskStatusBadge status={task.status} size="md" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Share Button */}
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  {t('share')}
                </Button>
                
                {showShareMenu && (
                  <Card className="absolute right-0 top-full mt-2 w-48 z-50 shadow-lg">
                    <CardContent className="p-2">
                      <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                        {t('copyLink')}
                      </button>
                      <button
                        onClick={handleShareWhatsApp}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                      >
                        <span className="text-lg">💬</span>
                        WhatsApp
                      </button>
                      <button
                        onClick={handleShareEmail}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Favorite Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className="gap-2"
              >
                <Heart 
                  className={`h-4 w-4 transition-all ${
                    isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                  }`}
                />
                {isFavorited ? t('removeFromFavorites') : t('addToFavorites')}
              </Button>

              {/* Owner Edit Button */}
              {isOwner && canEdit && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/tasks/${taskId}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('edit')}
                  </Link>
                </Button>
              )}

              {/* Owner Delete Button */}
              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" disabled={deleting}>
                      {deleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      {deleting ? t('deleting') : t('delete')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteConfirmDescription')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('deleteConfirmCancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                        {t('deleteConfirmDelete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>

        {/* Hero Image Gallery */}
        {taskImages && taskImages.length > 0 && (
          <div className="mb-8">
            {taskImages.length === 1 ? (
              /* Single image - full width */
              <div 
                className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => setSelectedImageIndex(0)}
              >
                <Image
                  src={taskImages[0]}
                  alt={task.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ) : taskImages.length === 2 ? (
              /* Two images - side by side */
              <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                {taskImages.map((image, index) => (
                  <div 
                    key={index}
                    className="relative h-[300px] md:h-[400px] cursor-pointer group"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`${task.title} - ${index + 1}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 40vw, 600px"
                      priority={index === 0}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            ) : taskImages.length === 3 ? (
              /* Three images - one large + two small */
              <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                <div 
                  className="relative row-span-2 h-[400px] md:h-[500px] cursor-pointer group"
                  onClick={() => setSelectedImageIndex(0)}
                >
                  <Image
                    src={taskImages[0]}
                    alt={`${task.title} - 1`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                {taskImages.slice(1, 3).map((image, index) => (
                  <div 
                    key={index + 1}
                    className="relative h-[195px] md:h-[245px] cursor-pointer group"
                    onClick={() => setSelectedImageIndex(index + 1)}
                  >
                    <Image
                      src={image}
                      alt={`${task.title} - ${index + 2}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 400px"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              /* Four or more images - grid layout */
              <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
                {/* Main large image */}
                <div 
                  className="relative col-span-2 row-span-2 h-[400px] md:h-[500px] cursor-pointer group"
                  onClick={() => setSelectedImageIndex(0)}
                >
                  <Image
                    src={taskImages[0]}
                    alt={`${task.title} - 1`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                
                {/* Secondary images */}
                {taskImages.slice(1, 5).map((image, index) => (
                  <div 
                    key={index + 1}
                    className="relative col-span-2 h-[195px] md:h-[245px] cursor-pointer group"
                    onClick={() => setSelectedImageIndex(index + 1)}
                  >
                    <Image
                      src={image}
                      alt={`${task.title} - ${index + 2}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 400px"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                    />
                    {/* Show remaining count on last visible image */}
                    {index === 3 && taskImages.length > 5 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          +{taskImages.length - 5}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            )}

            {/* Show all images button */}
            {taskImages.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSelectedImageIndex(0)}
              >
                {t('viewAllPhotos')} ({taskImages.length})
              </Button>
            )}
          </div>
        )}

        {/* Image Lightbox Modal */}
        {selectedImageIndex !== null && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center overflow-hidden"
            onClick={() => {
              setSelectedImageIndex(null);
              setLightboxZoom(1);
            }}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50 bg-black/30 rounded-full p-2"
              onClick={() => {
                setSelectedImageIndex(null);
                setLightboxZoom(1);
              }}
              title="Fermer (Esc)"
            >
              <XCircle className="h-8 w-8" />
            </button>

            {/* Zoom controls */}
            <div className="absolute top-4 left-4 flex gap-2 z-50">
              <button
                className="text-white hover:text-gray-300 transition-colors bg-black/30 rounded-full p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxZoom(prev => Math.min(prev + 0.5, 3));
                }}
                disabled={lightboxZoom >= 3}
                title="Zoom +"
              >
                <ZoomIn className="h-6 w-6" />
              </button>
              <button
                className="text-white hover:text-gray-300 transition-colors bg-black/30 rounded-full p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxZoom(prev => Math.max(prev - 0.5, 1));
                }}
                disabled={lightboxZoom <= 1}
                title="Zoom -"
              >
                <ZoomOut className="h-6 w-6" />
              </button>
              {lightboxZoom > 1 && (
                <button
                  className="text-white hover:text-gray-300 transition-colors bg-black/30 rounded-full px-3 py-2 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxZoom(1);
                  }}
                  title="Réinitialiser zoom"
                >
                  {Math.round(lightboxZoom * 100)}%
                </button>
              )}
            </div>
            
            {/* Navigation arrows */}
            {taskImages.length > 1 && (
              <>
                <button
                  className="absolute left-4 text-white hover:text-gray-300 transition-colors z-50 bg-black/30 rounded-full p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(prev => prev! > 0 ? prev! - 1 : taskImages.length - 1);
                    setLightboxZoom(1);
                  }}
                  title="Précédent (←)"
                >
                  <ChevronRight className="h-12 w-12 rotate-180" />
                </button>
                <button
                  className="absolute right-4 text-white hover:text-gray-300 transition-colors z-50 bg-black/30 rounded-full p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(prev => prev! < taskImages.length - 1 ? prev! + 1 : 0);
                    setLightboxZoom(1);
                  }}
                  title="Suivant (→)"
                >
                  <ChevronRight className="h-12 w-12" />
                </button>
              </>
            )}

            {/* Image counter & keyboard hints */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 max-w-2xl">
              <div className="text-white text-sm bg-black/50 px-4 py-2 rounded-full">
                {selectedImageIndex + 1} / {taskImages.length}
              </div>
              {/* Image caption */}
              <div className="text-white text-sm bg-black/50 px-4 py-2 rounded-lg text-center">
                {getImageCaption(selectedImageIndex)}
              </div>
              <div className="text-white/70 text-xs bg-black/30 px-3 py-1 rounded-full">
                ← → pour naviguer • Esc pour fermer
              </div>
            </div>

            {/* Thumbnails strip */}
            {taskImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-2xl overflow-x-auto px-4 z-50">
                {taskImages.map((image, index) => (
                  <button
                    key={index}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex 
                        ? 'border-white scale-110' 
                        : 'border-white/30 hover:border-white/60'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(index);
                      setLightboxZoom(1);
                    }}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image with zoom */}
            <div 
              className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4 overflow-auto"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                style={{
                  transform: `scale(${lightboxZoom})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.3s ease-out',
                }}
                className="relative w-full h-full min-h-[90vh]"
              >
                <Image
                  src={taskImages[selectedImageIndex]}
                  alt={`${task.title} - ${selectedImageIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            </div>
          </div>
        )}

        {/* Main content grid: Content + Sidebar */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column: Task details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('postedBy')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{isOwner ? t('you') : clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('memberSince')} {new Date(task.createdAt).toLocaleDateString(locale, { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>{t('description')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {task.description}
                </p>
              </CardContent>
            </Card>

            {/* Status Actions */}
            {user && (
              <TaskStatusActions
                task={task}
                userId={user.uid}
                isOwner={isOwner}
                isProvider={task.providerId === user.uid}
                onStatusChange={handleStatusChange}
              />
            )}

            {/* Original card content continues below... */}
            
            {/* Task details grid */}
            <Card>
              <CardHeader>
                <CardTitle>{t('taskDetails')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Created date */}
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{t('createdAt')}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(task.createdAt).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Deadline if exists */}
                  {task.deadline && (
                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">{t('deadline')}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(task.deadline).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Provider if assigned */}
                  {task.providerId && providerName && (
                    <div className="flex items-start gap-3">
                      <User className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{t('provider')}</p>
                        <p className="text-sm text-muted-foreground">
                          {providerName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            {task.location && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('location')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskMapDisplay location={task.location} />
                </CardContent>
              </Card>
            )}

          {/* Provider offer section */}
          {task.status === 'open' && user && !isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>{t('interestedInTask')}</CardTitle>
                <CardDescription>{t('submitOfferDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/tasks/${taskId}/offer`}>
                    {t('submitOffer')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Provider proposals section (legacy - keep for now) */}
          {task.status === 'open' && user && !isOwner && (
            <Suspense fallback={
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            }>
              <ProposalForm
                taskId={taskId}
                taskTitle={task.title}
                taskBudget={task.budget}
                clientId={task.clientId}
                providerId={user.uid}
              />
            </Suspense>
          )}

          {/* Proposal list for task owner or providers who submitted */}
          {task.status === 'open' && user && (
            <ProposalList
              taskId={taskId}
              isTaskOwner={isOwner}
              currentUserId={user.uid}
              onProposalAccepted={() => {
                // Refresh task to show updated status
                window.location.reload();
              }}
            />
          )}

          {/* Offers list for task owner (NEW - Feature 2: Offer Comparison) */}
          {task.status === 'open' && user && isOwner && (
            <OffersList
              offers={offers}
              taskId={taskId}
              isTaskOwner={isOwner}
              currentUserId={user.uid}
              currentLocale={locale}
              onAcceptOffer={handleAcceptOffer}
              onRejectOffer={handleRejectOffer}
            />
          )}
        </div>

        {/* Right column: Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-6">
            {/* Price & CTA Card */}
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">{t('budget')}</p>
                  <p className="text-4xl font-bold text-primary">{task.budget} €</p>
                </div>

                {/* CTA Buttons */}
                {task.status === 'open' && user && !isOwner && (
                  <Button asChild className="w-full" size="lg">
                    <Link href={`/tasks/${taskId}/offer`}>
                      {t('submitOffer')}
                    </Link>
                  </Button>
                )}

                {/* Status info */}
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('status')}</span>
                    <TaskStatusBadge status={task.status} size="sm" />
                  </div>
                  
                  {task.deadline && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('deadline')}</span>
                      <span className="font-medium">
                        {new Date(task.deadline).toLocaleDateString(locale, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Card (if exists) */}
            {task.location && typeof task.location === 'object' && (task.location as any).address && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t('location')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {(task.location as any).address}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Provider suggestions (only for task owners) */}
            {isOwner && task.status === 'open' && (
              <Suspense fallback={
                <Card>
                  <CardHeader>
                    <Skeleton className="h-5 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              }>
                <ProviderSuggestions
                  taskCategory={task.category}
                  taskLocation={task.location}
                  currentUserId={user?.uid}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
