/**
 * Éditeur de Portfolio
 * 
 * Permet au prestataire de gérer son portfolio:
 * - Ajouter/modifier/supprimer des items
 * - Upload d'images/vidéos
 * - Liens externes
 * - Réorganiser par drag & drop
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import {
  Plus,
  Trash2,
  Edit,
  GripVertical,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Upload,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { TagInput } from '@/components/ui/tag-input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PortfolioItem } from '@/types/public-profile';
import Image from 'next/image';

const portfolioItemSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  type: z.enum(['image', 'video', 'link']),
  mediaUrl: z.string().optional(),
  externalUrl: z.string().url('URL invalide').optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

type PortfolioItemFormValues = z.infer<typeof portfolioItemSchema>;

interface PortfolioEditorProps {
  items: PortfolioItem[];
  maxItems?: number;
  onAdd: (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (itemId: string, updates: Partial<PortfolioItem>) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
  onReorder: (itemIds: string[]) => Promise<void>;
  onUpload: (file: File) => Promise<string>; // Retourne l'URL uploadée
}

export function PortfolioEditor({
  items,
  maxItems = 10,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
  onUpload,
}: PortfolioEditorProps) {
  const t = useTranslations('ProfileEditor.portfolio');
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  const canAddMore = items.length < maxItems;

  const handleOpenDialog = (item?: PortfolioItem) => {
    setEditingItem(item || null);
    setUploadedUrl(item?.mediaUrl || '');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setUploadedUrl('');
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await onUpload(file);
      setUploadedUrl(url);
      toast({
        title: t('uploadSuccess'),
        description: t('uploadSuccessDescription'),
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: t('uploadError'),
        description: t('uploadErrorDescription'),
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {items.length}/{maxItems} {t('itemsUsed')}
            </p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            disabled={!canAddMore}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('addItem')}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('noItems')}</p>
            <Button
              onClick={() => handleOpenDialog()}
              variant="outline"
              className="mt-4 gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('addFirstItem')}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <PortfolioItemCard
                key={item.id}
                item={item}
                onEdit={() => handleOpenDialog(item)}
                onDelete={() => onDelete(item.id)}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Dialog d'ajout/édition */}
      <PortfolioItemDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        editingItem={editingItem}
        uploadedUrl={uploadedUrl}
        isUploading={isUploading}
        onFileUpload={handleFileUpload}
        onSave={async (data) => {
          if (editingItem) {
            await onUpdate(editingItem.id, data);
          } else {
            await onAdd(data as any);
          }
          handleCloseDialog();
        }}
      />
    </Card>
  );
}

interface PortfolioItemCardProps {
  item: PortfolioItem;
  onEdit: () => void;
  onDelete: () => void;
}

function PortfolioItemCard({ item, onEdit, onDelete }: PortfolioItemCardProps) {
  const t = useTranslations('ProfileEditor.portfolio');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-4 p-4 border rounded-lg group hover:border-primary/50 transition-colors">
      {/* Drag Handle */}
      <div className="flex items-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Thumbnail */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
        {item.type === 'image' && item.thumbnailUrl && (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover"
          />
        )}
        {item.type === 'video' && <Video className="h-8 w-8 absolute inset-0 m-auto text-muted-foreground" />}
        {item.type === 'link' && <ExternalLink className="h-8 w-8 absolute inset-0 m-auto text-muted-foreground" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {item.description}
              </p>
            )}
            <div className="flex gap-2 mt-2">
              {item.featured && (
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                  ⭐ {t('featured')}
                </span>
              )}
              {item.category && (
                <span className="text-xs px-2 py-1 bg-secondary rounded">
                  {item.category}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PortfolioItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: PortfolioItem | null;
  uploadedUrl: string;
  isUploading: boolean;
  onFileUpload: (file: File) => Promise<void>;
  onSave: (data: PortfolioItemFormValues) => Promise<void>;
}

function PortfolioItemDialog({
  isOpen,
  onClose,
  editingItem,
  uploadedUrl,
  isUploading,
  onFileUpload,
  onSave,
}: PortfolioItemDialogProps) {
  const t = useTranslations('ProfileEditor.portfolio');
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<PortfolioItemFormValues>({
    resolver: zodResolver(portfolioItemSchema),
    defaultValues: {
      title: editingItem?.title || '',
      description: editingItem?.description || '',
      type: editingItem?.type || 'image',
      mediaUrl: editingItem?.mediaUrl || '',
      externalUrl: editingItem?.externalUrl || '',
      category: editingItem?.category || '',
      tags: editingItem?.tags || [],
      featured: editingItem?.featured || false,
    },
  });

  const itemType = form.watch('type');

  const handleSubmit = async (data: PortfolioItemFormValues) => {
    setIsSaving(true);
    try {
      const submitData = {
        ...data,
        mediaUrl: uploadedUrl || data.mediaUrl,
      };
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? t('editItem') : t('addItem')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('itemType')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="type-image" />
                        <Label htmlFor="type-image" className="flex items-center gap-2 cursor-pointer">
                          <ImageIcon className="h-4 w-4" />
                          {t('typeImage')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="type-video" />
                        <Label htmlFor="type-video" className="flex items-center gap-2 cursor-pointer">
                          <Video className="h-4 w-4" />
                          {t('typeVideo')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="link" id="type-link" />
                        <Label htmlFor="type-link" className="flex items-center gap-2 cursor-pointer">
                          <ExternalLink className="h-4 w-4" />
                          {t('typeLink')}
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Upload ou URL */}
            {(itemType === 'image' || itemType === 'video') && (
              <div className="space-y-2">
                <Label>{t('uploadFile')}</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {uploadedUrl ? (
                    <div className="space-y-2">
                      <div className="relative w-32 h-32 mx-auto">
                        {itemType === 'image' && (
                          <Image
                            src={uploadedUrl}
                            alt="Preview"
                            fill
                            className="object-cover rounded"
                          />
                        )}
                        {itemType === 'video' && (
                          <Video className="h-16 w-16 mx-auto text-muted-foreground" />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        {t('changeFile')}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {t('uploading')}
                          </>
                        ) : (
                          t('selectFile')
                        )}
                      </Button>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept={itemType === 'image' ? 'image/*' : 'video/*'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onFileUpload(file);
                    }}
                    aria-label={t('uploadFile')}
                  />
                </div>
              </div>
            )}

            {itemType === 'link' && (
              <FormField
                control={form.control}
                name="externalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('externalUrl')}</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Titre */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('itemTitle')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('itemTitlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('itemDescription')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('itemDescriptionPlaceholder')}
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              {/* Catégorie */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('category')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('categoryPlaceholder')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Featured */}
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>{t('featured')}</FormLabel>
                      <FormDescription className="text-xs">
                        {t('featuredHelp')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tags')}</FormLabel>
                  <FormControl>
                    <TagInput
                      tags={field.value || []}
                      onChange={field.onChange}
                      placeholder={t('tagsPlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t('cancel')}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('saving')}
                  </>
                ) : (
                  t('save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
