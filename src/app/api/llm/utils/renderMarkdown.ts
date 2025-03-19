import { remark } from "remark";
import html from "remark-html";

export async function getHtmlStringFromMarkdown(md: string) {
  // Use remark to convert markdown into HTML string
  const processedContent = await remark().use(html).process(md);

  return processedContent.toString();
}
