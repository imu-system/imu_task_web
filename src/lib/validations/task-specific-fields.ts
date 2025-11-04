import { z } from 'zod';

// OrganizationFields
export const organizationFieldsSchema = z.object({
    areasToOrganize: z.array(z.enum(["closet", "library", "cellar", "garage", "kitchen", "office", "other"]))
        .min(1).optional(),
    goal: z.enum(["declutter", "sort", "classify", "optimize"]).optional(),
    volumeEstimate: z.enum(["small", "medium", "large"]).optional(),
});

// PackageFields
export const packageFieldsSchema = z.object({
    serviceType: z.enum(["pickup", "dropoff", "mail"]),
    locationName: z.string().min(1).optional(),
    locationAddress: z.string().min(1).optional(),
    packageSize: z.enum(["small", "medium", "large_heavy"]).optional(),
    trackingNumber: z.string().min(1).optional(),
    paymentMethod: z.enum(["cash", "provider_advance"]).optional(),
});

// TechHelpFields
export const techHelpFieldsSchema = z.object({
    deviceType: z.enum(["smartphone", "tablet", "laptop", "desktop", "smart_tv", "internet_box"]).optional(),
    operatingSystem: z.enum(["windows", "macos", "ios", "android", "linux", "other"]).optional(),
    issueType: z.enum(["installation", "training", "troubleshooting", "backup", "other"]).optional(),
    specificIssue: z.string().max(2000).optional(),
    remoteAccessPossible: z.boolean().optional(),
});

// AdminHelpFields
export const adminHelpFieldsSchema = z.object({
    taskType: z.enum(["form_filling", "scanning", "email", "filing", "writing"]).optional(),
    softwareNeeded: z.array(z.enum(["word", "excel", "powerpoint", "pdf"]))
        .optional(),
    confidentialityLevel: z.enum(["sensitive", "normal"]).optional(),
    hasPrinterScanner: z.boolean().optional(),
});

// MovingFields
export const movingFieldsSchema = z.object({
    volumeEstimate: z.enum(["few_boxes", "studio", "t2", "cellar"]).optional(),
    peopleRequired: z.number().int().min(1).optional(),
    departure: z.object({
        floor: z.number().int().min(0).optional(),
        hasElevator: z.boolean().optional(),
    }).optional(),
    arrival: z.object({
        floor: z.number().int().min(0).optional(),
        hasElevator: z.boolean().optional(),
    }).optional(),
    vehicleNeeded: z.enum(["client_has", "short_distance", "provider_needed"]).optional(),
});

// HandlingFields
export const handlingFieldsSchema = z.object({
    taskType: z.enum(["move_furniture", "to_cellar", "carry_groceries"]).optional(),
    itemsDescription: z.string().max(2000).optional(),
    floorsCount: z.number().int().min(0).optional(),
    hasElevator: z.boolean().optional(),
});

// AccompanimentFields
export const accompanimentFieldsSchema = z.object({
    accompanimentType: z.enum(["medical", "walk", "shopping", "social", "visit"]).optional(),
    fromAddress: z.string().min(1).optional(),
    toAddress: z.string().min(1).optional(),
    duration: z.number().int().min(0).optional(),
    specialNeeds: z.array(z.enum(["reduced_mobility", "wheelchair", "hearing", "visual"]))
        .optional(),
    transportMode: z.enum(["walk", "public_transport", "provider_car", "taxi"]).optional(),
});

// CompanionshipFields
export const companionshipFieldsSchema = z.object({
    activityType: z.enum(["conversation", "reading", "games", "cultural", "walk"]).optional(),
    duration: z.number().int().min(0).optional(),
    clientInterests: z.string().max(2000).optional(),
});

// GardeningFields
export const gardeningFieldsSchema = z.object({
    placeType: z.enum(["garden", "balcony", "courtyard", "driveway"]).optional(),
    surfaceArea: z.enum(["under_50", "50_150", "over_150"]).optional(),
    serviceType: z.array(z.enum(["mowing", "leaf_raking", "weeding", "watering", "planting", "terrace_cleaning", "hedge_trimming"]))
        .optional(),
    toolsProvidedBy: z.enum(["client", "provider"]).optional(),
    wasteDisposal: z.enum(["green_bin", "compost", "provider_removes"]).optional(),
});

// PetSittingFields
export const petSittingFieldsSchema = z.object({
    petType: z.string().min(1).optional(),
    petCount: z.number().int().min(0).optional(),
    absenceStartDate: z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg as any);
        return undefined;
    }, z.date().optional()),
    absenceEndDate: z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg as any);
        return undefined;
    }, z.date().optional()),
    visitsPerDay: z.number().int().min(0).optional(),
    tasks: z.array(z.enum(["feeding", "litter", "play", "medication", "water_plants"]))
        .optional(),
});

// EventHelpFields
export const eventHelpFieldsSchema = z.object({
    eventType: z.enum(["birthday", "family_reception", "association", "small_business"]).optional(),
    guestCount: z.number().int().min(0).optional(),
    serviceType: z.array(z.enum(["setup", "cleanup", "serving", "greeting", "preparation"]))
        .optional(),
    duration: z.number().min(0).optional(),
    heavyEquipment: z.string().max(2000).optional(),
});

// Export a union for convenience (optional)
export const AllSpecificSchemas = z.object({
    organization: organizationFieldsSchema.optional(),
    package: packageFieldsSchema.optional(),
    techHelp: techHelpFieldsSchema.optional(),
    adminHelp: adminHelpFieldsSchema.optional(),
    moving: movingFieldsSchema.optional(),
    handling: handlingFieldsSchema.optional(),
    accompaniment: accompanimentFieldsSchema.optional(),
    companionship: companionshipFieldsSchema.optional(),
    gardening: gardeningFieldsSchema.optional(),
    petSitting: petSittingFieldsSchema.optional(),
    eventHelp: eventHelpFieldsSchema.optional(),
});

/**
 * Get the appropriate Zod schema for specific fields based on category slug
 * @param categorySlug - The slug of the service category (e.g., 'menage-entretien', 'rangement')
 * @returns The corresponding Zod schema or undefined if no specific schema exists
 */
export function getSpecificFieldsSchema(categorySlug: string | undefined): z.ZodTypeAny | undefined {
    if (!categorySlug) return undefined;

    const schemaMap: Record<string, z.ZodTypeAny> = {
        // Aide à Domicile & Petits Travaux
        'rangement': organizationFieldsSchema,
        'organization': organizationFieldsSchema,

        // Courses & Livraisons
        'colis-livraison': packageFieldsSchema,
        'package-delivery': packageFieldsSchema,

        // Aide Numérique & Administrative
        'aide-informatique': techHelpFieldsSchema,
        'tech-help': techHelpFieldsSchema,
        'aide-administrative': adminHelpFieldsSchema,
        'admin-help': adminHelpFieldsSchema,

        // Déménagement & Manutention
        'demenagement': movingFieldsSchema,
        'moving': movingFieldsSchema,
        'manutention': handlingFieldsSchema,
        'handling': handlingFieldsSchema,

        // Accompagnement & Présence
        'accompagnement': accompanimentFieldsSchema,
        'accompaniment': accompanimentFieldsSchema,
        'compagnie': companionshipFieldsSchema,
        'companionship': companionshipFieldsSchema,

        // Jardinage & Extérieur
        'jardinage': gardeningFieldsSchema,
        'gardening': gardeningFieldsSchema,

        // Garde d'Animaux
        'pet-sitting': petSittingFieldsSchema,
        'garde-animaux': petSittingFieldsSchema,

        // Événements
        'aide-evenementielle': eventHelpFieldsSchema,
        'event-help': eventHelpFieldsSchema,
    };

    return schemaMap[categorySlug];
}
