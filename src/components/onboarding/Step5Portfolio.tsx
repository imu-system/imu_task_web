/**
 * Étape 5 : Portfolio
 * Upload de 3 photos minimum de réalisations
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Image, Upload, AlertCircle } from 'lucide-react';

interface Step5Props {
  data: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onNext: () => void;
}

export default function Step5Portfolio({ data, onSave, onNext }: Step5Props) {
  const [images, setImages] = useState<string[]>(data.images as string[] || []);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length < 3) {
      setError('Veuillez ajouter au moins 3 photos');
      return;
    }

    await onSave({ images });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Portfolio
          </CardTitle>
          <CardDescription>
            Ajoutez au moins 3 photos de vos réalisations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              {images.length} / 3 photos minimum
            </p>
            <Button type="button" variant="outline">
              Ajouter des photos
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              💡 Les photos de qualité professionnelle augmentent vos chances d'être contacté
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" size="lg" disabled={images.length < 3}>
            Continuer vers le calendrier
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
