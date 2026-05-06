import { generateHistoryTitle } from "@/ai/flows/generateHistoryTitle";

type RequestBody = {
    text?: string;
};

function normalizeHistoryText(text: string): string {
    const trimmed = text.trim();
    if (!trimmed) return "";

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
            const parsed = JSON.parse(trimmed) as unknown;
            if (Array.isArray(parsed) && parsed.every((item): item is string => typeof item === "string")) {
                return parsed.join("\n").trim();
            }
        } catch {
            // ignore
        }
    }

    return trimmed;
}

export async function POST(request: Request) {
    const body = (await request.json().catch(() => ({}))) as RequestBody;
    const rawText = typeof body.text === "string" ? body.text : "";
    const text = normalizeHistoryText(rawText);

    if (!text) {
        return Response.json({ error: "Missing text" }, { status: 400 });
    }

    const truncated = text.length > 4000 ? text.slice(0, 4000) : text;
    const result = await generateHistoryTitle({ text: truncated });
    if (!result || typeof result.title !== "string") {
        return Response.json({ error: "LLM failed to generate title" }, { status: 500 });
    } else {
        // Log the generated title for debugging
        console.log("Generated title:", result.title);
    }
    const title = result.title?.trim() ?? "";


    return Response.json({ title });
}
