'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Download, Loader2, FileJson, FileSpreadsheet } from 'lucide-react';

interface DataExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: 'json' | 'csv', categories: string[]) => Promise<void>;
}

export default function DataExportDialog({
  open,
  onOpenChange,
  onExport,
}: DataExportDialogProps) {
  const t = useTranslations('SettingsPage.privacy.dataDownload');
  
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [categories, setCategories] = useState({
    profile: true,
    tasks: true,
    bookings: true,
    messages: true,
    reviews: true,
    transactions: true,
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const categoryKeys = Object.keys(categories) as (keyof typeof categories)[];
  const selectedCount = categoryKeys.filter((key) => categories[key]).length;

  const handleExport = async () => {
    const selectedCategories = categoryKeys.filter((key) => categories[key]);
    
    if (selectedCategories.length === 0) {
      setError(t('dialog.errors.noCategories'));
      return;
    }

    setLoading(true);
    setProgress(0);
    setError('');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await onExport(format, selectedCategories);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Small delay to show 100%
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      onOpenChange(false);
      
      // Reset state
      setProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dialog.errors.exportFailed'));
    } finally {
      setLoading(false);
    }
  };

  const estimatedSize = selectedCount * 2.5; // MB

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('dialog.title')}</DialogTitle>
          <DialogDescription>{t('dialog.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>{t('dialog.formatLabel')}</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as 'json' | 'csv')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                  <FileJson className="h-4 w-4" />
                  <span>JSON</span>
                  <span className="text-sm text-muted-foreground">
                    ({t('dialog.formatJson')})
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>CSV</span>
                  <span className="text-sm text-muted-foreground">
                    ({t('dialog.formatCsv')})
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Categories Selection */}
          <div className="space-y-3">
            <Label>{t('dialog.categoriesLabel')}</Label>
            <div className="space-y-2 border rounded-md p-4">
              {categoryKeys.map((key) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={categories[key]}
                    onCheckedChange={(checked) =>
                      setCategories((prev) => ({ ...prev, [key]: checked as boolean }))
                    }
                  />
                  <Label htmlFor={key} className="cursor-pointer">
                    {t(`dialog.categories.${key}`)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Size */}
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm">
              <span className="font-medium">{t('dialog.estimatedSize')}:</span>{' '}
              {estimatedSize.toFixed(1)} MB ({selectedCount} {t('dialog.categoriesSelected')})
            </p>
          </div>

          {/* Progress Bar */}
          {loading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                {t('dialog.exporting')} {progress}%
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('dialog.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={loading || selectedCount === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!loading && <Download className="mr-2 h-4 w-4" />}
            {t('dialog.export')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
