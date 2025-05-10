'use server';

/**
 * @fileOverview An AI agent that suggests labels for handwritten characters on a scanned practice sheet.
 *
 * - suggestCharacterLabels - A function that handles the suggestion of character labels.
 * - SuggestCharacterLabelsInput - The input type for the suggestCharacterLabels function.
 * - SuggestCharacterLabelsOutput - The return type for the suggestCharacterLabels function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCharacterLabelsInputSchema = z.object({
  practiceSheetDataUri: z
    .string()
    .describe(
      'A scanned handwriting practice sheet, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
  language: z.string().describe('The language of the handwritten characters.'),
  characterGridDescription: z
    .string()
    .describe('A description of the character grid on the practice sheet.'),
});
export type SuggestCharacterLabelsInput = z.infer<
  typeof SuggestCharacterLabelsInputSchema
>;

const SuggestCharacterLabelsOutputSchema = z.object({
  suggestedLabels: z
    .array(z.string())
    .describe('An array of suggested labels for the handwritten characters.'),
});
export type SuggestCharacterLabelsOutput = z.infer<
  typeof SuggestCharacterLabelsOutputSchema
>;

export async function suggestCharacterLabels(
  input: SuggestCharacterLabelsInput
): Promise<SuggestCharacterLabelsOutput> {
  return suggestCharacterLabelsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCharacterLabelsPrompt',
  input: {schema: SuggestCharacterLabelsInputSchema},
  output: {schema: SuggestCharacterLabelsOutputSchema},
  prompt: `You are an AI assistant that suggests labels for handwritten characters on a scanned practice sheet.

You will be provided with a scanned image of a handwriting practice sheet, the language of the characters, and a description of the character grid.

Based on this information, you will suggest labels for each handwritten character in the grid.

Here is the information:

Language: {{{language}}}
Character Grid Description: {{{characterGridDescription}}}
Scanned Practice Sheet: {{media url=practiceSheetDataUri}}

Output the suggested labels in a JSON array format.
`, // Added missing backticks here
});

const suggestCharacterLabelsFlow = ai.defineFlow(
  {
    name: 'suggestCharacterLabelsFlow',
    inputSchema: SuggestCharacterLabelsInputSchema,
    outputSchema: SuggestCharacterLabelsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
