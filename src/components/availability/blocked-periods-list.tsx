'use client';

/**
 * BlockedPeriodsList Component
 * 
 * Gestion des périodes d'indisponibilité (vacances, congés, etc.)
 * - Liste des périodes bloquées
 * - Ajout/modification/suppression
 * - Validation des dates
 * - Dialog de confirmation
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { fr, enUS, ja } from 'date-fns/locale';
import { Calendar, Plus, Trash2, Edit2, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  getBlockedPeriods,
  createBlockedPeriod,
  updateBlockedPeriod,
  deleteBlockedPeriod,
} from '@/lib/firestore-availability';
import type { BlockedPeriod } from '@/types/availability';
import { toDate } from '@/lib/date-utils';

type BlockType = BlockedPeriod['blockType'];

interface BlockedPeriodsListProps {
  providerId: string;
  locale: 'fr' | 'en' | 'ja';
  onUpdate?: () => void;
}

interface BlockedPeriodFormData {
  startDate: string;
  endDate: string;
  reason: string;
  blockType: BlockType;
}

const BLOCK_TYPES: BlockType[] = ['vacation', 'sick_leave', 'personal', 'other'];

export function BlockedPeriodsList({
  providerId,
  locale,
  onUpdate,
}: BlockedPeriodsListProps) {
  const t = useTranslations('Availability.blockedPeriods');
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState<BlockedPeriod[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<BlockedPeriod | null>(null);
  const [periodToDelete, setPeriodToDelete] = useState<BlockedPeriod | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BlockedPeriodFormData>({
    startDate: '',
    endDate: '',
    reason: '',
    blockType: 'vacation',
  });

  const dateLocale = locale === 'fr' ? fr : locale === 'ja' ? ja : enUS;

  useEffect(() => {
    loadPeriods();
  }, [providerId]);

  async function loadPeriods() {
    setLoading(true);
    try {
      const data = await getBlockedPeriods(providerId);
      setPeriods(data);
    } catch (error) {
      console.error('Error loading blocked periods:', error);
      toast({
        title: t('errorAdd'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  function openAddDialog() {
    setEditingPeriod(null);
    setFormData({
      startDate: '',
      endDate: '',
      reason: '',
      blockType: 'vacation',
    });
    setDialogOpen(true);
  }

  function openEditDialog(period: BlockedPeriod) {
    setEditingPeriod(period);
    setFormData({
      startDate: format(toDate(period.startDate) || new Date(), 'yyyy-MM-dd'),
      endDate: format(toDate(period.endDate) || new Date(), 'yyyy-MM-dd'),
      reason: period.reason,
      blockType: period.blockType,
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(period: BlockedPeriod) {
    setPeriodToDelete(period);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    // Validation
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast({
        title: t('errorAdd'),
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate >= endDate) {
      toast({
        title: t('errorAdd'),
        description: 'End date must be after start date',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingPeriod) {
        // Update existing period
        await updateBlockedPeriod(editingPeriod.id!, {
          startDate,
          endDate,
          reason: formData.reason,
          blockType: formData.blockType,
        });
        toast({
          title: t('successUpdate'),
        });
      } else {
        // Create new period
        await createBlockedPeriod({
          providerId,
          startDate,
          endDate,
          reason: formData.reason,
          blockType: formData.blockType,
        });
        toast({
          title: t('successAdd'),
        });
      }

      setDialogOpen(false);
      loadPeriods();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving blocked period:', error);
      toast({
        title: editingPeriod ? t('errorUpdate') : t('errorAdd'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!periodToDelete?.id) return;

    setSaving(true);
    try {
      await deleteBlockedPeriod(periodToDelete.id);
      toast({
        title: t('successDelete'),
      });
      setDeleteDialogOpen(false);
      setPeriodToDelete(null);
      loadPeriods();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting blocked period:', error);
      toast({
        title: t('errorDelete'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  function getBlockTypeColor(type: BlockType): string {
    switch (type) {
      case 'vacation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'sick':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'personal':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                {t('title')}
              </CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addPeriod')}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : periods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noPeriods')}</p>
              <Button
                variant="outline"
                onClick={openAddDialog}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('addPeriod')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {periods.map((period) => (
                <div
                  key={period.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(toDate(period.startDate) || new Date(), 'PPP', { locale: dateLocale })}
                        {' → '}
                        {format(toDate(period.endDate) || new Date(), 'PPP', { locale: dateLocale })}
                      </span>
                      <Badge className={getBlockTypeColor(period.blockType)}>
                        {t(`types.${period.blockType}`)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {period.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(period)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(period)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPeriod ? t('editPeriod') : t('addPeriod')}
            </DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t('startDate')}</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">{t('endDate')}</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blockType">{t('type')}</Label>
              <Select
                value={formData.blockType}
                onValueChange={(value: BlockType) =>
                  setFormData({ ...formData, blockType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">{t('reason')}</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder={t('reason')}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {periodToDelete && (
                <>
                  {format(toDate(periodToDelete.startDate) || new Date(), 'PPP', { locale: dateLocale })}
                  {' → '}
                  {format(toDate(periodToDelete.endDate) || new Date(), 'PPP', { locale: dateLocale })}
                  <br />
                  {periodToDelete.reason}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? 'Deleting...' : t('deletePeriod')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
