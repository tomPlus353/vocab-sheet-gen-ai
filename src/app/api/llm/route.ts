import process from "process";
export const revalidate = 60;
import { GoogleGenerativeAI } from "@google/generative-ai";
import SYSTEM_PROMPT from "./system_prompt";
import { getHtmlStringFromMarkdown } from "./utils/renderMarkdown";
export async function POST(request: Request) {
  const requestBody = await request.json();
  console.log("resquest from the client: ", JSON.stringify(requestBody));
  const prompt = JSON.stringify(requestBody);

  const markdownResponse = await handleGeminiPrompt(prompt);
  console.log("markdownResponse: ", markdownResponse);
  const htmlMarkdownString = await getHtmlStringFromMarkdown(markdownResponse);
  return Response.json({ htmlMarkdownString: htmlMarkdownString });
}

async function handleGeminiPrompt(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
  const model = genAI.getGenerativeModel({
    systemInstruction: SYSTEM_PROMPT,
    model: "gemini-1.5-flash",
  });

  prompt = "Create a cheat sheet for this japanese text: \n\n" + prompt;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
