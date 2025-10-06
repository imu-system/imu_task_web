// src/ai/flows/categorize-provider-skills.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to categorize service provider skills
 * from their profile descriptions using GenAI.
 *
 * categorizeProviderSkills - A function that takes a provider's profile description and returns
 * a categorized list of skills.
 *
 * CategorizeProviderSkillsInput - The input type for the categorizeProviderSkills function.
 *
 * CategorizeProviderSkillsOutput - The return type for the categorizeProviderSkills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeProviderSkillsInputSchema = z.object({
  profileDescription: z
    .string()
    .describe('The profile description of the service provider.'),
});
export type CategorizeProviderSkillsInput = z.infer<
  typeof CategorizeProviderSkillsInputSchema
>;

const CategorizeProviderSkillsOutputSchema = z.object({
  skills: z
    .array(z.string())
    .describe('A list of categorized skills derived from the profile description.'),
});
export type CategorizeProviderSkillsOutput = z.infer<
  typeof CategorizeProviderSkillsOutputSchema
>;

export async function categorizeProviderSkills(
  input: CategorizeProviderSkillsInput
): Promise<CategorizeProviderSkillsOutput> {
  return categorizeProviderSkillsFlow(input);
}

const categorizeProviderSkillsPrompt = ai.definePrompt({
  name: 'categorizeProviderSkillsPrompt',
  input: {schema: CategorizeProviderSkillsInputSchema},
  output: {schema: CategorizeProviderSkillsOutputSchema},
  prompt: `You are an AI expert in categorizing skills. Given a service provider's profile description,
your task is to extract and categorize their skills into a list of strings.

Profile Description: {{{profileDescription}}}

Skills:`,
});

const categorizeProviderSkillsFlow = ai.defineFlow(
  {
    name: 'categorizeProviderSkillsFlow',
    inputSchema: CategorizeProviderSkillsInputSchema,
    outputSchema: CategorizeProviderSkillsOutputSchema,
  },
  async input => {
    const {output} = await categorizeProviderSkillsPrompt(input);
    return output!;
  }
);
