import process from 'process';
export const revalidate = 60
import {GoogleGenerativeAI} from '@google/generative-ai'
export async function GET(request: Request) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log(request.text())
    const prompt = "Explain how AI works";
    
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    const data = result.response.text();
 
  return Response.json({ data: data });
}