'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface PhotoGalleryProps {
  photos: string[];
  className?: string;
}

// ============================================================================
// PHOTO GALLERY COMPONENT
// ============================================================================

export default function PhotoGallery({ photos, className }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!photos || photos.length === 0) return null;

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1);
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === photos.length - 1 ? 0 : selectedIndex + 1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedIndex === null) return;
    
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') closeLightbox();
  };

  return (
    <>
      {/* Photo Grid */}
      <div className={cn('grid gap-2', className)}>
        {photos.length === 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="relative aspect-video overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-90"
          >
            <img
              src={photos[0]}
              alt="Review photo"
              className="h-full w-full object-cover"
            />
          </button>
        )}

        {photos.length === 2 && (
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className="relative aspect-square overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-90"
              >
                <img
                  src={photo}
                  alt={`Review photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {photos.length === 3 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className="relative aspect-square overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-90"
              >
                <img
                  src={photo}
                  alt={`Review photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {photos.length >= 4 && (
          <div className="grid grid-cols-2 gap-2">
            {photos.slice(0, 4).map((photo, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className="relative aspect-square overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-90"
              >
                <img
                  src={photo}
                  alt={`Review photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 3 && photos.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-2xl font-bold text-white">
                    +{photos.length - 4}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-4xl p-0" onKeyDown={handleKeyDown as any}>
          <div className="relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeLightbox}
              className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Navigation Buttons */}
            {photos.length > 1 && selectedIndex !== null && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image */}
            {selectedIndex !== null && (
              <div className="flex items-center justify-center bg-black">
                <img
                  src={photos[selectedIndex]}
                  alt={`Review photo ${selectedIndex + 1}`}
                  className="max-h-[80vh] w-full object-contain"
                />
              </div>
            )}

            {/* Photo Counter */}
            {photos.length > 1 && selectedIndex !== null && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                {selectedIndex + 1} / {photos.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
