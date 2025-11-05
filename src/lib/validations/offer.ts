import { z } from 'zod';

export const createOfferSchema = z.object({
    taskId: z.string().min(1, 'Task ID required'),
    proposedPrice: z.number()
        .min(5, 'Prix minimum 5€')
        .max(10000, 'Prix maximum 10,000€'),
    message: z.string()
        .min(20, 'Message minimum 20 caractères')
        .max(500, 'Message maximum 500 caractères'),
    estimatedDuration: z.number()
        .min(0.5, 'Durée minimum 30 minutes')
        .max(168, 'Durée maximum 1 semaine')
        .optional(),
    availableFrom: z.date().optional(),
    availableTo: z.date().optional(),
}).refine(
    (data) => {
        if (data.availableFrom && data.availableTo) {
            return data.availableTo > data.availableFrom;
        }
        return true;
    },
    {
        message: 'Date de fin doit être après date de début',
        path: ['availableTo'],
    }
);

export type CreateOfferFormData = z.infer<typeof createOfferSchema>;
