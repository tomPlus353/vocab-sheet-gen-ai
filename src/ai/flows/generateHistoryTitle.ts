'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';


const MAX_TITLE_LENGTH = 10;

const GenerateHistoryTitleInputSchema = z.object({
    text: z.string().describe('The source text used to extract vocabulary.'),
});

export type GenerateHistoryTitleInput = z.infer<typeof GenerateHistoryTitleInputSchema>;

const GenerateHistoryTitleOutputSchema = z.object({
    title: z.string().max(MAX_TITLE_LENGTH).describe('A short title summarizing the text.'),
});

export type GenerateHistoryTitleOutput = z.infer<typeof GenerateHistoryTitleOutputSchema> & {
    error?: boolean;
};

export async function generateHistoryTitle(
    input: GenerateHistoryTitleInput,
): Promise<GenerateHistoryTitleOutput> {
    return generateHistoryTitleFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateHistoryTitlePrompt',
    input: { schema: GenerateHistoryTitleInputSchema },
    output: { schema: GenerateHistoryTitleOutputSchema },
    prompt: `Create a short, descriptive title that summarizes the topic/context of the following text.

Rules:
- Output ONLY the title (no quotes, no brackets, no markdown).
- Keep it short: {{MAX_TITLE_LENGTH}} characters max.
- Use the same language as the text (Japanese for Japanese text, English for English text).
- Avoid trailing punctuation.

Text:
{{text}}`,
});

const truncateTitleIfNeeded = (output: { title: string }): { title: string } => {
    if (output.title.length <= MAX_TITLE_LENGTH) {
        return output;
    }
    return { ...output, title: [...output.title].slice(0, MAX_TITLE_LENGTH).join('').trimEnd() + "..."
 };
} 

const generateHistoryTitleFlow = ai.defineFlow(
    {
        name: 'generateHistoryTitleFlow',
        inputSchema: GenerateHistoryTitleInputSchema,
        outputSchema: GenerateHistoryTitleOutputSchema,
    },
    async (input) => {
        try {
            const { output } = await prompt(input);
            if (!output || typeof output.title !== 'string') {
                return { title: '', error: true };
            }
            return truncateTitleIfNeeded(output);
        } catch (error) {
            console.error('Error in generateHistoryTitleFlow:', error);
            return {
                title:
                    'Error generating title: ' +
                    (error instanceof Error ? error.message : String(error)),
                error: true,
            };
        }
    },
);

