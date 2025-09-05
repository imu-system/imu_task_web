'use server';
/**
 * @fileOverview Automatically suggests task categories based on the task description.
 *
 * - suggestTaskCategories - A function that suggests task categories.
 * - SuggestTaskCategoriesInput - The input type for the suggestTaskCategories function.
 * - SuggestTaskCategoriesOutput - The return type for the suggestTaskCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskCategoriesInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task for which to suggest categories.'),
});
export type SuggestTaskCategoriesInput = z.infer<
  typeof SuggestTaskCategoriesInputSchema
>;

const SuggestTaskCategoriesOutputSchema = z.object({
  suggestedCategories: z
    .array(z.string())
    .describe('An array of suggested task categories.'),
});
export type SuggestTaskCategoriesOutput = z.infer<
  typeof SuggestTaskCategoriesOutputSchema
>;

export async function suggestTaskCategories(
  input: SuggestTaskCategoriesInput
): Promise<SuggestTaskCategoriesOutput> {
  return suggestTaskCategoriesFlow(input);
}

const suggestTaskCategoriesPrompt = ai.definePrompt({
  name: 'suggestTaskCategoriesPrompt',
  input: {schema: SuggestTaskCategoriesInputSchema},
  output: {schema: SuggestTaskCategoriesOutputSchema},
  prompt: `Based on the following task description, suggest three relevant task categories. Return the categories as a JSON array of strings.

Task Description: {{{taskDescription}}}`,
});

const suggestTaskCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestTaskCategoriesFlow',
    inputSchema: SuggestTaskCategoriesInputSchema,
    outputSchema: SuggestTaskCategoriesOutputSchema,
  },
  async input => {
    const {output} = await suggestTaskCategoriesPrompt(input);
    return output!;
  }
);
