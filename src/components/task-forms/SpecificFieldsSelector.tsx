/**
 * SpecificFieldsSelector
 * 
 * Composant qui affiche le formulaire de champs spécifiques approprié
 * en fonction de la catégorie de service sélectionnée.
 * 
 * Utilise un système de routing basé sur le slug de la catégorie.
 */

'use client';

import { UseFormReturn } from 'react-hook-form';
import { CleaningFields } from './specific-fields/CleaningFields';
import { GroceryFields } from './specific-fields/GroceryFields';
import { DogWalkingFields } from './specific-fields/DogWalkingFields';
import { HandymanFields } from './specific-fields/HandymanFields';
import { OrganizationFields } from './specific-fields/OrganizationFields';
import { PackageFields } from './specific-fields/PackageFields';
import { TechHelpFields } from './specific-fields/TechHelpFields';
import { AdminHelpFields } from './specific-fields/AdminHelpFields';
import { MovingFields } from './specific-fields/MovingFields';
import { HandlingFields } from './specific-fields/HandlingFields';
import { AccompanimentFields } from './specific-fields/AccompanimentFields';
import { CompanionshipFields } from './specific-fields/CompanionshipFields';
import { GardeningFields } from './specific-fields/GardeningFields';
import { PetSittingFields } from './specific-fields/PetSittingFields';
import { EventHelpFields } from './specific-fields/EventHelpFields';

interface SpecificFieldsSelectorProps {
  form: UseFormReturn<any>;
  categorySlug?: string;
}

/**
 * Map des slugs de catégories vers les composants de formulaire
 * 
 * Note: Ajoutez les nouveaux composants au fur et à mesure de leur création
 */
export function SpecificFieldsSelector({ form, categorySlug }: SpecificFieldsSelectorProps) {
  if (!categorySlug) return null;

  // Router vers le bon composant de formulaire selon le slug
  switch (categorySlug) {
    // 1. Aide à Domicile & Petits Travaux
    case 'menage-entretien':
    case 'cleaning':
      return <CleaningFields form={form} />;
    
    case 'petit-bricolage':
    case 'handyman':
      return <HandymanFields form={form} />;
    
    case 'rangement':
    case 'organization':
      return <OrganizationFields form={form} />;

    // 2. Courses & Livraisons
    case 'courses-alimentaires':
    case 'grocery':
      return <GroceryFields form={form} />;
    
    case 'colis-livraison':
    case 'package-delivery':
      return <PackageFields form={form} />;

    // 3. Aide Numérique & Administrative
    case 'aide-informatique':
    case 'tech-help':
      return <TechHelpFields form={form} />;
    
    case 'aide-administrative':
    case 'admin-help':
      return <AdminHelpFields form={form} />;

    // 4. Déménagement & Manutention
    case 'demenagement':
    case 'moving':
      return <MovingFields form={form} />;
    
    case 'manutention':
    case 'handling':
      return <HandlingFields form={form} />;

    // 5. Accompagnement & Présence
    case 'accompagnement':
    case 'accompaniment':
      return <AccompanimentFields form={form} />;
    
    case 'compagnie':
    case 'companionship':
      return <CompanionshipFields form={form} />;

    // 6. Jardinage & Extérieur
    case 'jardinage':
    case 'gardening':
      return <GardeningFields form={form} />;

    // 7. Garde d'Animaux
    case 'dog-walking':
    case 'promenade-chien':
      return <DogWalkingFields form={form} />;
    
    case 'pet-sitting':
    case 'garde-animaux':
      return <PetSittingFields form={form} />;

    // 8. Aide Événementielle
    case 'aide-evenementielle':
    case 'event-help':
      return <EventHelpFields form={form} />;

    default:
      // Pas de champs spécifiques pour cette catégorie
      return null;
  }
}
