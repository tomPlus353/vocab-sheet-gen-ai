import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openAI } from '@genkit-ai/compat-oai/openai';

const OPENAI_MODEL = 'openai/gpt-4o-2024-08-06';
const GEMINI_MODEL = 'googleai/gemini-3-flash-preview';
const requestedProvider = (process.env.PROVIDER_NAME ?? 'openai').toLowerCase();


if (requestedProvider !== 'openai' && requestedProvider !== 'gemini') {
    console.warn(`[Genkit] Unsupported PROVIDER_NAME "${requestedProvider}", defaulting to openai.`);
}

console.log(`[Genkit] Using provider: ${requestedProvider}, model: ${requestedProvider === 'gemini' ? GEMINI_MODEL : OPENAI_MODEL}`);

export const ai = genkit({
    plugins: [requestedProvider === 'gemini'
        ? googleAI({ apiKey: process.env.GEMINI_API_KEY ?? process.env.GEMINI_KEY })
        : openAI({ apiKey: process.env.OPENAI_KEY ?? process.env.OPENAI_API_KEY })],
    model: requestedProvider === 'gemini' ? GEMINI_MODEL : OPENAI_MODEL,
});
