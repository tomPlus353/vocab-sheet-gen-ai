import { z } from "genkit";
import { ai } from "@/ai/genkit";
import {
  SYS_PROMPT_VOCAB,
  SYS_PROMPT_GRAMMAR,
  SYS_PROMPT_VOCAB_JSON,
  SYS_PROMPT_KANJI_GAME,
} from "./system_prompt";
import { getHtmlStringFromMarkdown } from "./utils/renderMarkdown";

type RequestBody = {
  text: string;
  mode: string;
};

const ExampleSentenceSchema = z.object({
  japanese: z.string(),
  kana: z.string(),
});

const VocabGameTermSchema = z.object({
  japanese: z.string(),
  kana: z.string(),
  english_definition: z.string(),
  example_sentences: z.array(ExampleSentenceSchema),
});

const VocabGameSchema = z.array(VocabGameTermSchema);

const KanjiGameTermSchema = z.object({
  japanese: z.string(),
  kana: z.string(),
  english_definition: z.string(),
  support_words: z.array(
    z.object({
      word: z.string(),
      kana: z.string(),
      english_definition: z.string(),
      sentence_template: z.string(),
    }),
  ),
  jlpt_level: z.string().optional(),
});

const KanjiGameSchema = z.array(KanjiGameTermSchema);

export async function POST(request: Request) {
  try {
    //get request from the client
    const requestBody = (await request.json()) as RequestBody;
    console.log("request from the client: ", JSON.stringify(requestBody));
    const prompt = requestBody.text;
    const mode = requestBody.mode;

    //get raw gemini response
    const llmResponse = await handlePrompt(prompt, mode);
    if (!llmResponse) {
      return Response.json({ error: "No response from LLM" }, { status: 500 });
    }
    console.log("markdownResponse: ", llmResponse);

    //convert response to markdown
    if (["vocab", "grammar"].includes(mode)) {
      const htmlMarkdownString =
        await getHtmlStringFromMarkdown(llmResponse);
      return Response.json({ htmlMarkdownString: htmlMarkdownString });
    } else {
      return Response.json({ jsonMarkdownString: llmResponse });
    }
  } catch (error) {
    console.error("error: ", error);
    return Response.json({ error: error });
  }
}

async function handlePrompt(
  prompt: string,
  mode?: string,
): Promise<string | undefined> {
  const requestedMode = mode ?? "vocab";
  const systemPrompt = getSystemPrompt(requestedMode);

  if (requestedMode === "vocabGame" || requestedMode === "kanjiGame") {
    //json output

    //create prompt
    prompt = "Create json data for this japanese text: \n\n" + prompt;

    try {
      const response = await ai.generate({
        system: systemPrompt,
        prompt,
        output: {
          schema:
            requestedMode === "kanjiGame" ? KanjiGameSchema : VocabGameSchema,
        },
      });

      const structuredOutput = response.output;
      if (!structuredOutput) {
        return "";
      }

      return JSON.stringify(structuredOutput);
    } catch (error) {
      console.log("Error when fetching response from llm: ", error);
      return "";
    }
  } else {
    //text output

    //create prompt
    prompt = "Create a cheat sheet for this japanese text: \n\n" + prompt;

    //generate response
    const response = await ai.generate({
      system: systemPrompt,
      prompt,
    });
    return response.text ?? "";
  }
}

function getSystemPrompt(mode: string): string {
  if (mode === "grammar") {
    return SYS_PROMPT_GRAMMAR;
  }
  if (mode === "vocabGame") {
    return SYS_PROMPT_VOCAB_JSON;
  }
  if (mode === "kanjiGame") {
    return SYS_PROMPT_KANJI_GAME;
  }
  return SYS_PROMPT_VOCAB;
}
