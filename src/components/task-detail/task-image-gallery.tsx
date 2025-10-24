'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TaskImageGalleryProps {
  images: string[];
  title?: string;
}

export function TaskImageGallery({ images, title }: TaskImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const t = useTranslations('TaskDetail');

  if (!images || images.length === 0) {
    return null;
  }

  const openImage = (index: number) => {
    setSelectedIndex(index);
  };

  const closeImage = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            {t('images', { default: 'Images' })}
          </CardTitle>
          <CardDescription>
            {images.length} {images.length === 1 ? t('image', { default: 'image' }) : t('images', { default: 'images' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {images.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => openImage(index)}
                className="group relative overflow-hidden rounded-lg border bg-muted aspect-video hover:ring-2 hover:ring-primary transition-all"
              >
                <img
                  src={imageUrl}
                  alt={`${title || 'Task'} image ${index + 1}`}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Image viewer dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && closeImage()}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          <div className="relative h-full flex items-center justify-center bg-black">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={closeImage}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedIndex !== null && `${selectedIndex + 1} / ${images.length}`}
            </div>

            {/* Previous button */}
            {selectedIndex !== null && selectedIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-10 text-white hover:bg-white/20 h-12 w-12"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {/* Next button */}
            {selectedIndex !== null && selectedIndex < images.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-10 text-white hover:bg-white/20 h-12 w-12"
                onClick={goToNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            {/* Current image */}
            {selectedIndex !== null && (
              <img
                src={images[selectedIndex]}
                alt={`${title || 'Task'} image ${selectedIndex + 1}`}
                className="max-h-full max-w-full object-contain p-4"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
