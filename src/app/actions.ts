"use server";

import { suggestCharacterLabels as suggestCharacterLabelsFlow } from '@/ai/flows/suggest-character-labels';
import type { SuggestCharacterLabelsInput, SuggestCharacterLabelsOutput } from '@/ai/flows/suggest-character-labels';

export async function generateLabels(
  input: SuggestCharacterLabelsInput
): Promise<{ success: boolean; data?: SuggestCharacterLabelsOutput; error?: string }> {
  try {
    // Basic validation for data URI
    if (!input.practiceSheetDataUri.startsWith('data:image/')) {
      return { success: false, error: 'Invalid image data URI format. Must start with "data:image/".' };
    }
    if (!input.practiceSheetDataUri.includes(';base64,')) {
       return { success: false, error: 'Invalid image data URI format. Must include ";base64,".' };
    }

    const result = await suggestCharacterLabelsFlow(input);
    if (result && result.suggestedLabels) {
      return { success: true, data: result };
    } else {
      return { success: false, error: 'AI suggestion failed to produce valid labels.' };
    }
  } catch (error) {
    console.error("Error in generateLabels server action:", error);
    // Check if error is an instance of Error to safely access message
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while generating labels.";
    return { success: false, error: errorMessage };
  }
}
