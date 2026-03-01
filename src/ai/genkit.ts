import { genkit } from 'genkit';
// import { googleAI } from '@genkit-ai/google-genai';
import { openAI } from '@genkit-ai/compat-oai/openai';

// const genkitModel = 'googleai/gemini-3-flash-preview';
const genkitModel = 'openai/gpt-4o-2024-08-06';

console.log(`[Genkit] Using model: ${genkitModel}`);

export const ai = genkit({
    // plugins: [googleAI()],
    plugins: [openAI({ apiKey: process.env.OPENAI_KEY ?? process.env.OPENAI_API_KEY })],
    model: genkitModel,
});
