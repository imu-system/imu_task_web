/**
 * Types pour les champs spécifiques des tâches selon la catégorie
 * 
 * Basé sur CREATE_MISSION.md
 * Ces types permettent de capturer des informations détaillées pour chaque catégorie de service,
 * améliorant la précision des demandes et facilitant le matching client-prestataire.
 */

/**
 * Base interface pour tous les champs spécifiques
 */
export interface BaseSpecificFields {
    categoryId: string;
    subcategoryId?: string;
}

// ============================================================================
// 1. AIDE À DOMICILE & PETITS TRAVAUX
// ============================================================================

/**
 * 1.1. Ménage & Entretien
 */
export interface CleaningSpecificFields extends BaseSpecificFields {
    // Type de lieu
    propertyType?: 'apartment' | 'house' | 'office' | 'other';
    propertyTypeOther?: string;

    // Surface
    surfaceArea?: 'under_30' | '30_60' | '60_100' | 'over_100';

    // Nombre de pièces
    roomsCount?: {
        bedrooms?: number;
        bathrooms?: number;
        toilets?: number;
    };

    // Type de prestation
    serviceType?: 'one_time' | 'deep_clean' | 'moving_clean' | 'specific';
    specificCleaningTasks?: ('windows' | 'oven' | 'fridge')[];

    // Fréquence
    frequency?: 'one_time' | 'weekly' | 'biweekly' | 'monthly';

    // Matériel
    materialsProvidedBy?: 'client' | 'provider' | 'provider_paid';

    // Accès
    access?: 'easy' | 'difficult';
    accessDetails?: string;
}

/**
 * 1.2. Petit Bricolage & Assemblage
 */
export interface HandymanSpecificFields extends BaseSpecificFields {
    // Type de tâche
    taskType?: 'assemble' | 'hang' | 'fix' | 'install' | 'repair' | 'other';

    // Détails meuble (si assemblage)
    furnitureDetails?: {
        brand?: string;
        type?: string;
        packageCount?: number;
        size?: 'small' | 'medium' | 'large';
    };

    // Outils
    toolsProvidedBy?: 'client' | 'provider';

    // Hauteur de travail
    workHeight?: 'ground' | 'medium' | 'high';

    // Type de mur (si fixation)
    wallType?: 'plaster' | 'concrete' | 'wood' | 'unknown';

    // Détails matériaux
    materialDetails?: string;
}

/**
 * 1.3. Rangement & Organisation
 */
export interface OrganizationSpecificFields extends BaseSpecificFields {
    // Zones à organiser
    areasToOrganize?: ('closet' | 'library' | 'cellar' | 'garage' | 'kitchen' | 'office' | 'other')[];

    // Objectif
    goal?: 'declutter' | 'sort' | 'classify' | 'optimize';

    // Volume estimé
    volumeEstimate?: 'small' | 'medium' | 'large';
}

// ============================================================================
// 2. COURSES & LIVRAISONS
// ============================================================================

/**
 * 2.1. Courses Alimentaires
 */
export interface GroceryShoppingSpecificFields extends BaseSpecificFields {
    // Type de magasin
    storeType?: 'supermarket' | 'local_market' | 'bio_store' | 'other';
    storeName?: string;

    // Liste de courses
    shoppingList?: string; // URL vers photo ou texte

    // Volume estimé
    volumeEstimate?: 'small' | 'medium' | 'large';

    // Besoins spécifiques
    specialNeeds?: ('fresh' | 'heavy' | 'frozen')[];

    // Paiement
    paymentMethod?: 'cash' | 'client_card' | 'provider_advance';
}

/**
 * 2.2. Récupération & Dépôt de Colis
 */
export interface PackageDeliverySpecificFields extends BaseSpecificFields {
    // Type de service
    serviceType?: 'pickup' | 'dropoff' | 'mail';

    // Lieu
    locationName?: string;
    locationAddress?: string;

    // Taille du colis
    packageSize?: 'small' | 'medium' | 'large_heavy';

    // Numéro de suivi
    trackingNumber?: string;

    // Paiement
    paymentMethod?: 'cash' | 'provider_advance';
}

// ============================================================================
// 3. AIDE NUMÉRIQUE & ADMINISTRATIVE
// ============================================================================

/**
 * 3.1. Aide Informatique
 */
export interface TechHelpSpecificFields extends BaseSpecificFields {
    // Type d'appareil
    deviceType?: 'smartphone' | 'tablet' | 'laptop' | 'desktop' | 'smart_tv' | 'internet_box';

    // Système d'exploitation
    operatingSystem?: 'windows' | 'macos' | 'ios' | 'android' | 'linux' | 'other';

    // Type de problème
    issueType?: 'installation' | 'training' | 'troubleshooting' | 'backup' | 'other';
    specificIssue?: string;

    // Accès à distance
    remoteAccessPossible?: boolean;
}

/**
 * 3.2. Aide Administrative
 */
export interface AdminHelpSpecificFields extends BaseSpecificFields {
    // Type de tâche
    taskType?: 'form_filling' | 'scanning' | 'email' | 'filing' | 'writing';

    // Logiciels nécessaires
    softwareNeeded?: ('word' | 'excel' | 'powerpoint' | 'pdf')[];

    // Niveau de confidentialité
    confidentialityLevel?: 'sensitive' | 'normal';

    // Équipement
    hasPrinterScanner?: boolean;
}

// ============================================================================
// 4. DÉMÉNAGEMENT & MANUTENTION
// ============================================================================

/**
 * 4.1. Aide au Déménagement
 */
export interface MovingSpecificFields extends BaseSpecificFields {
    // Volume estimé
    volumeEstimate?: 'few_boxes' | 'studio' | 't2' | 'cellar';

    // Nombre de personnes nécessaires
    peopleRequired?: number;

    // Point de départ
    fromFloor?: number;
    fromHasElevator?: boolean;

    // Point d'arrivée
    toFloor?: number;
    toHasElevator?: boolean;

    // Objets lourds
    heavyItems?: {
        description: string;
        photos?: string[];
    }[];

    // Véhicule
    vehicleNeeded?: 'client_has' | 'short_distance' | 'provider_needed';
}

/**
 * 4.2. Manutention Simple
 */
export interface HandlingSpecificFields extends BaseSpecificFields {
    // Type de tâche
    taskType?: 'move_furniture' | 'to_cellar' | 'carry_groceries';

    // Description des objets
    itemsDescription?: string;
    photos?: string[];

    // Étages
    floorsCount?: number;
    hasElevator?: boolean;
}

// ============================================================================
// 5. ACCOMPAGNEMENT & PRÉSENCE
// ============================================================================

/**
 * 5.1. Accompagnement de Personnes
 */
export interface AccompanimentSpecificFields extends BaseSpecificFields {
    // Type d'accompagnement
    accompanimentType?: 'medical' | 'walk' | 'shopping' | 'social' | 'visit';

    // Trajets
    fromAddress?: string;
    toAddress?: string;

    // Durée
    duration?: number; // minutes

    // Besoins spécifiques
    specialNeeds?: ('reduced_mobility' | 'wheelchair' | 'hearing' | 'visual')[];

    // Mode de transport
    transportMode?: 'walking' | 'public_transport' | 'client_car';
}

/**
 * 5.2. Compagnie & Loisirs
 */
export interface CompanionshipSpecificFields extends BaseSpecificFields {
    // Type d'activité
    activityType?: 'conversation' | 'reading' | 'games' | 'cultural' | 'walk';

    // Durée
    duration?: number; // minutes

    // Centres d'intérêt du client
    clientInterests?: string;
}

// ============================================================================
// 6. JARDINAGE & EXTÉRIEUR
// ============================================================================

/**
 * 6.1. Entretien Jardin/Extérieur
 */
export interface GardeningSpecificFields extends BaseSpecificFields {
    // Type de lieu
    placeType?: 'garden' | 'balcony' | 'courtyard' | 'driveway';

    // Surface
    surfaceArea?: 'under_50' | '50_150' | 'over_150';

    // Type de prestation
    serviceType?: ('mowing' | 'leaf_raking' | 'weeding' | 'watering' | 'planting' | 'terrace_cleaning' | 'hedge_trimming')[];

    // Outils
    toolsProvidedBy?: 'client' | 'provider';

    // Évacuation des déchets
    wasteDisposal?: 'green_bin' | 'compost' | 'provider_removes';
}

// ============================================================================
// 7. GARDE D'ANIMAUX
// ============================================================================

/**
 * 7.1. Promenade de Chien
 */
export interface DogWalkingSpecificFields extends BaseSpecificFields {
    // Détails du chien
    dogBreed?: string;
    dogSize?: 'small' | 'medium' | 'large';
    temperament?: ('sociable' | 'reactive' | 'calm' | 'energetic')[];

    // Fréquence
    walksPerDay?: number;
    walkDuration?: number; // minutes

    // Besoins spécifiques
    specialNeeds?: {
        medication?: boolean;
        feeding?: boolean;
    };

    // Équipement
    equipment?: ('leash' | 'muzzle' | 'waste_bags')[];
}

/**
 * 7.2. Visite à Domicile (Pet Sitting)
 */
export interface PetSittingSpecificFields extends BaseSpecificFields {
    // Type d'animal
    petType?: 'dog' | 'cat' | 'rodent' | 'fish' | 'bird';
    petCount?: number;

    // Dates d'absence
    absenceStartDate?: Date;
    absenceEndDate?: Date;

    // Fréquence des visites
    visitsPerDay?: number;

    // Tâches
    tasks?: ('feeding' | 'litter' | 'play' | 'medication' | 'water_plants')[];
}

// ============================================================================
// 8. AIDE ÉVÉNEMENTIELLE
// ============================================================================

/**
 * 8.1. Soutien Logistique Événementiel
 */
export interface EventHelpSpecificFields extends BaseSpecificFields {
    // Type d'événement
    eventType?: 'birthday' | 'family_reception' | 'association' | 'small_business';

    // Nombre d'invités
    guestCount?: number;

    // Type de service
    serviceType?: ('setup' | 'cleanup' | 'serving' | 'greeting' | 'preparation')[];

    // Durée
    duration?: number; // hours

    // Équipement lourd
    heavyEquipment?: string;
}

// ============================================================================
// UNION TYPE
// ============================================================================

/**
 * Union type de tous les champs spécifiques possibles
 * Utilisé dans le type Task pour typer le champ specificFields
 */
export type TaskSpecificFields =
    | CleaningSpecificFields
    | HandymanSpecificFields
    | OrganizationSpecificFields
    | GroceryShoppingSpecificFields
    | PackageDeliverySpecificFields
    | TechHelpSpecificFields
    | AdminHelpSpecificFields
    | MovingSpecificFields
    | HandlingSpecificFields
    | AccompanimentSpecificFields
    | CompanionshipSpecificFields
    | GardeningSpecificFields
    | DogWalkingSpecificFields
    | PetSittingSpecificFields
    | EventHelpSpecificFields;

/**
 * Type guard pour vérifier le type de champs spécifiques
 */
export function isCleaningFields(fields: TaskSpecificFields): fields is CleaningSpecificFields {
    return 'propertyType' in fields || 'surfaceArea' in fields;
}

export function isHandymanFields(fields: TaskSpecificFields): fields is HandymanSpecificFields {
    return 'taskType' in fields && ('furnitureDetails' in fields || 'toolsProvidedBy' in fields);
}

export function isGroceryFields(fields: TaskSpecificFields): fields is GroceryShoppingSpecificFields {
    return 'storeType' in fields || 'shoppingList' in fields;
}

export function isDogWalkingFields(fields: TaskSpecificFields): fields is DogWalkingSpecificFields {
    return 'dogBreed' in fields || 'dogSize' in fields;
}

// Ajouter d'autres type guards selon les besoins
