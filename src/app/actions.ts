"use server";

import { categorizeProviderSkills } from "@/ai/flows/categorize-provider-skills";
import { suggestTaskCategories as suggestTaskCategoriesAI } from "@/ai/flows/automated-task-categorization";

export async function getCategorizedSkills(profileDescription: string) {
  if (!profileDescription) {
    return { success: false, error: "Profile description cannot be empty." };
  }

  try {
    const result = await categorizeProviderSkills({ profileDescription });
    return { success: true, skills: result.skills };
  } catch (error) {
    console.error("Error categorizing skills:", error);
    return { success: false, error: "Failed to categorize skills due to an internal error." };
  }
}

export async function suggestTaskCategories(taskDescription: string) {
  if (!taskDescription) {
    return { success: false, error: "Task description cannot be empty." };
  }

  try {
    const result = await suggestTaskCategoriesAI({ taskDescription });
    return { success: true, categories: result.suggestedCategories };
  } catch (error) {
    console.error("Error suggesting task categories:", error);
    return { success: false, error: "Failed to suggest categories due to an internal error." };
  }
}
