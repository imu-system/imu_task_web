'use server';

import {
  suggestTaskCategories as suggestTaskCategoriesFlow,
  type SuggestTaskCategoriesInput,
} from '@/ai/flows/automated-task-categorization';
import { z } from 'zod';
import { ZodError } from 'zod';

const inputSchema = z.object({
  taskDescription: z.string().min(10, "La description doit contenir au moins 10 caractères."),
});

export async function suggestTaskCategories(input: SuggestTaskCategoriesInput) {
  try {
    inputSchema.parse(input);
    const result = await suggestTaskCategoriesFlow(input);
    return { success: true, categories: result.suggestedCategories };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Error suggesting task categories:', error);
    return { success: false, error: 'Une erreur est survenue lors de la suggestion des catégories.' };
  }
}
