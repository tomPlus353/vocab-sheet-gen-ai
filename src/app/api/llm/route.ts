import process from "process";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYS_PROMPT_VOCAB, SYS_PROMPT_GRAMMAR } from "./system_prompt";
import { getHtmlStringFromMarkdown } from "./utils/renderMarkdown";
import type { JsonArray } from "@prisma/client/runtime/library";

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
    const htmlMarkdownString =
      await getHtmlStringFromMarkdown(markdownResponse);
    return Response.json({ htmlMarkdownString: htmlMarkdownString });
  } catch (error) {
    console.error("error: ", error);
    return Response.json({ error: error });
  }
}

async function handleGeminiPrompt(
  prompt: string,
  mode?: string,
): Promise<string> {
  //get system prompt
  let sys_prompt = "";
  if (!mode) {
    mode = "vocab";
  }
  if (mode === "grammar") {
    sys_prompt = SYS_PROMPT_GRAMMAR;
  } else if (mode === "vocab") {
    sys_prompt = SYS_PROMPT_VOCAB;
  }

  //get gemini key
  const key: string | undefined = process.env.GEMINI_KEY;
  if (!key) {
    throw new Error("GEMINI_KEY is not set");
  }

  //initialize gemini
  const genAI = new GoogleGenerativeAI(key);

  //initialize model
  const model = genAI.getGenerativeModel({
    systemInstruction: sys_prompt,
    model: "gemini-2.0-flash",
  });

  //create prompt
  prompt = "Create a cheat sheet for this japanese text: \n\n" + prompt;

  //generate response
  const result = await model.generateContent(prompt);
  return result.response.text();
}
