"use server";

import { categorizeProviderSkills } from "@/ai/flows/categorize-provider-skills";

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
