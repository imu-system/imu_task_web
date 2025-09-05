
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { loadGoogleMapsScript } from '@/lib/google-maps-config';
import { useTranslations } from 'next-intl';

const addressSchema = z.object({
  label: z.string().min(2, 'Le nom est requis.'),
  formatted: z.string().min(5, "L'adresse est requise."),
  latitude: z.number(),
  longitude: z.number(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  onSave: (data: AddressFormValues) => void;
  onClose: () => void;
  initialData?: AddressFormValues;
}

export default function AddressForm({ onSave, onClose, initialData }: AddressFormProps) {
  const t = useTranslations('AddressForm');
  const [isSaving, setIsSaving] = useState(false);
  const [isMapsScriptLoaded, setMapsScriptLoaded] = useState(false);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const autocompleteInstance = useRef<google.maps.places.Autocomplete | null>(null);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData || {
      label: '',
      formatted: '',
      latitude: 0,
      longitude: 0,
    },
  });

  useEffect(() => {
    loadGoogleMapsScript(() => {
      setMapsScriptLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isMapsScriptLoaded && autocompleteInputRef.current) {
      autocompleteInstance.current = new google.maps.places.Autocomplete(autocompleteInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'fr' }, // Restrict to France for now
        fields: ['formatted_address', 'geometry.location', 'address_components'],
      });

      autocompleteInstance.current.addListener('place_changed', () => {
        const place = autocompleteInstance.current?.getPlace();
        if (place?.formatted_address && place?.geometry?.location) {
          setValue('formatted', place.formatted_address, { shouldValidate: true });
          setValue('latitude', place.geometry.location.lat(), { shouldValidate: true });
          setValue('longitude', place.geometry.location.lng(), { shouldValidate: true });
        }
      });
    }
  }, [isMapsScriptLoaded, setValue]);
  
  const onSubmit = (data: AddressFormValues) => {
    setIsSaving(true);
    // Here you would typically save the data to your backend
    console.log('Saving address:', data);
    setTimeout(() => {
        onSave(data);
        setIsSaving(false);
        onClose();
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="label">{t('label')}</Label>
        <Controller
          name="label"
          control={control}
          render={({ field }) => (
            <Input id="label" placeholder={t('labelPlaceholder')} {...field} />
          )}
        />
        {errors.label && <p className="text-xs text-destructive mt-1">{errors.label.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="formatted">{t('address')}</Label>
        <Controller
          name="formatted"
          control={control}
          render={({ field }) => (
            <Input id="formatted" placeholder={t('addressPlaceholder')} {...field} ref={autocompleteInputRef} />
          )}
        />
         {errors.formatted && <p className="text-xs text-destructive mt-1">{errors.formatted.message}</p>}
      </div>

      <div className="flex justify-end gap-2">
         <Button type="button" variant="ghost" onClick={onClose}>
           {t('cancel')}
         </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('save')}
        </Button>
      </div>
    </form>
  );
}
