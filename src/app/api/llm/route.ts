import process from 'process';
export const revalidate = 60
import {GoogleGenerativeAI} from '@google/generative-ai'
import SYSTEM_PROMPT from './system_prompt';
export async function POST(request: Request) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
    const model = genAI.getGenerativeModel({ systemInstruction: SYSTEM_PROMPT, model: "gemini-1.5-flash" });
    const requestBody = await request.json();
    console.log("resquest from the client: " , JSON.stringify(requestBody));

    const prompt = "Create a cheat sheet for this japanese text: \n\n" + JSON.stringify(requestBody);
    
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    const data = result.response.text();
 
  return Response.json({ data: data });
}