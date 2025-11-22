'use server';

/**
 * @fileOverview Extracts text from an image using an AI model.
 *
 * - extractTextFromImage - A function that handles the text extraction process.
 * - ExtractTextFromImageInput - The input type for the extractTextFromImage function.
 * - ExtractTextFromImageOutput - The return type for the extractTextFromImage function.
 */


// pnpm install genkit @genkit-ai/google-genai
// pnpm install -D genkit-cli

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractTextFromImageInputSchema = z.object({
    photoDataUri: z
        .string()
        .describe(
            "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
});
export type ExtractTextFromImageInput = z.infer<typeof ExtractTextFromImageInputSchema>;

const ExtractTextFromImageOutputSchema = z.object({
    extractedText: z.string().describe('The extracted text from the image.'),
});

export type ExtractTextFromImageOutput = z.infer<typeof ExtractTextFromImageOutputSchema> & {
    // Optional error message when extraction fails
    error?: boolean;
};

export async function extractTextFromImage(input: ExtractTextFromImageInput): Promise<ExtractTextFromImageOutput> {
    return extractTextFromImageFlow(input);
}

const prompt = ai.definePrompt({
    name: 'extractTextFromImagePrompt',
    input: { schema: ExtractTextFromImageInputSchema },
    output: { schema: ExtractTextFromImageOutputSchema },
    prompt: `Extract all the text from the following image. 
    Return only the text in the output. 
    Do not add any additional information. 
    
    Format the text as it appears in the image, preserving paragraphs and spacing where possible. However, if a new line is in the middle of a sentence, do not create a new line in the output. New line should be for new paragraphs only.

Image: {{media url=photoDataUri}}`,
});

const extractTextFromImageFlow = ai.defineFlow(
    {
        name: 'extractTextFromImageFlow',
        inputSchema: ExtractTextFromImageInputSchema,
        outputSchema: ExtractTextFromImageOutputSchema,
    },
    async input => {
        try {
            const { output } = await prompt(input);
            return output ?? { extractedText: 'LLM failed to parse data from image', error: true };
        } catch (error) {
            console.error("Error in extractTextFromImageFlow:", error);
            return {
                extractedText: 'Error extracting text from image: '
                    + (error instanceof Error ? error.message : String(error))
                , error: true
            };
        }
    }
);
