import { z } from 'zod';
import { getSpecificFieldsSchema } from './task-specific-fields';

/**
 * Base schema object for task creation (common fields for all tasks)
 */
const baseTaskSchemaObject = z.object({
    title: z.string().min(5, 'Le titre doit faire au moins 5 caractères.'),
    description: z.string().min(20, 'La description doit faire au moins 20 caractères.'),
    categoryId: z.string({ required_error: 'Veuillez sélectionner une catégorie.' }),
    addressId: z.string({ required_error: 'Veuillez sélectionner une adresse.' }),
    timeWindowStart: z.date({
        required_error: 'Veuillez sélectionner une date et une heure de début.',
    }),
    timeWindowEnd: z.date({
        required_error: 'Veuillez sélectionner une date et une heure de fin.',
    }),
    priceOffered: z.coerce.number().min(5, 'Le prix doit être d\'au moins 5€.'),
    estimatedDurationMin: z.coerce.number().int().min(0, "La durée doit être positive.").optional(),
    numberOfProvidersRequired: z.coerce.number().int().min(1, "Il faut au moins 1 prestataire.").default(1),
    attachments: z.any().optional(),
});

/**
 * Base schema with time validation refinement
 */
export const baseTaskSchema = baseTaskSchemaObject.refine(
    data => data.timeWindowEnd > data.timeWindowStart,
    {
        message: "L'heure de fin doit être après l'heure de début.",
        path: ['timeWindowEnd'],
    }
);

/**
 * Create a dynamic task schema by merging base schema with category-specific fields
 * @param categorySlug - The slug of the selected category (e.g., 'menage-entretien', 'rangement')
 * @returns Combined Zod schema with base + specific fields
 */
export function createDynamicTaskSchema(categorySlug: string | undefined) {
    const specificSchema = getSpecificFieldsSchema(categorySlug);

    if (!specificSchema) {
        // No specific fields for this category, return base schema only
        return baseTaskSchema;
    }

    // Merge base schema object with specific fields, then apply time validation
    return baseTaskSchemaObject.merge(specificSchema).refine(
        data => data.timeWindowEnd > data.timeWindowStart,
        {
            message: "L'heure de fin doit être après l'heure de début.",
            path: ['timeWindowEnd'],
        }
    );
}

/**
 * Type inference helper for the dynamic schema
 * This type includes all base fields plus any additional specific fields
 */
export type TaskFormData = z.infer<typeof baseTaskSchema> & Record<string, any>;

export type TaskFormData = z.infer<typeof baseTaskSchema> & Record<string, any>;
