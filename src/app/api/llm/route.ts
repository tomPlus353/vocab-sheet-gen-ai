import process from "process";
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import {
  SYS_PROMPT_VOCAB,
  SYS_PROMPT_GRAMMAR,
  SYS_PROMPT_VOCAB_JSON,
} from "./system_prompt";
import { getHtmlStringFromMarkdown } from "./utils/renderMarkdown";

type RequestBody = {
  text: string;
  mode: string;
};
export async function POST(request: Request) {
  try {
    //get request from the client
    const requestBody = (await request.json()) as RequestBody;
    console.log("request from the client: ", JSON.stringify(requestBody));
    const prompt = requestBody.text;
    const mode = requestBody.mode;

    //get raw gemini response
    const markdownResponse = await handleGeminiPrompt(prompt, mode);
    console.log("markdownResponse: ", markdownResponse);

    //convert response to markdown
    if (["vocab", "grammar"].includes(mode)) {
      const htmlMarkdownString =
        await getHtmlStringFromMarkdown(markdownResponse);
      return Response.json({ htmlMarkdownString: htmlMarkdownString });
    } else {
      return Response.json({ jsonMarkdownString: markdownResponse });
    }
  } catch (error) {
    console.error("error: ", error);
    return Response.json({ error: error });
  }
}

async function handleGeminiPrompt(
  prompt: string,
  mode?: string,
): Promise<string | undefined> {
  //get system prompt
  let sys_prompt = "";
  if (!mode) {
    mode = "vocab";
  }
  if (mode === "grammar") {
    sys_prompt = SYS_PROMPT_GRAMMAR;
  } else if (mode === "vocab") {
    sys_prompt = SYS_PROMPT_VOCAB;
  } else if (mode === "vocabGame") {
    sys_prompt = SYS_PROMPT_VOCAB_JSON;
  }

  //get gemini key
  const key: string | undefined = process.env.GEMINI_KEY;
  if (!key) {
    throw new Error("GEMINI_KEY is not set");
  }

  //initialize gemini
  const ai = new GoogleGenAI({ apiKey: key });

  if (["vocabGame"].includes(mode)) {
    //json output

    //create prompt
    prompt = "Create json data for this japanese text: \n\n" + prompt;

    //generate response
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: sys_prompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              japanese: {
                type: Type.STRING,
                description: "The Japanese term",
                nullable: false,
              },
              romanization: {
                type: Type.STRING,
                description: "The romanization of the Japanese term",
                nullable: false,
              },
              english_definition: {
                type: Type.STRING,
                description: "The English definition of the term",
                nullable: false,
              },
              example_sentences: {
                type: Type.ARRAY,
                description:
                  "Example sentences in Japanese and their romanization",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    japanese: {
                      type: Type.STRING,
                      description: "Example sentence in Japanese",
                      nullable: false,
                    },
                    romanization: {
                      type: Type.STRING,
                      description: "Romanization of the example sentence",
                      nullable: false,
                    },
                  },
                  required: ["japanese", "romanization"],
                },
                nullable: false,
              },
            },
            required: [
              "japanese",
              "romanization",
              "english_definition",
              "example_sentences",
            ],
          },
        },
      },
    });
    if (response) {
      if (response.text) {
        return response.text;
      } else {
        return "";
      }
    }
  } else {
    //text output

    //create prompt
    prompt = "Create a cheat sheet for this japanese text: \n\n" + prompt;

    //generate response
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: sys_prompt,
      },
    });
    return response.text ?? "";
  }
}
