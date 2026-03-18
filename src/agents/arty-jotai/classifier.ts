import type OpenAI from "openai";
import { MODELS } from "@/lib/openrouter";

export interface ClassificationResult {
  funnyScore: number;
  shockScore: number;
  summary: string;
  tags: string[];
}

const BATCH_SIZE = 10;

export async function classifyArticles(
  articles: Array<{ title: string; description?: string }>,
  ai: OpenAI
): Promise<ClassificationResult[]> {
  const results: ClassificationResult[] = [];

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const prompt = `You are classifying AI news articles. For each article, return a JSON array with objects containing:
- funnyScore (0-10): how funny, absurd, or humorous the AI topic is
- shockScore (0-10): how shocking, surprising, or jaw-dropping
- summary: one-sentence summary
- tags: array of relevant tags (e.g. ["llm", "agents", "safety"])

Articles:
${batch.map((a, idx) => `${idx + 1}. "${a.title}"${a.description ? `: ${a.description.slice(0, 150)}` : ""}`).join("\n")}

Return ONLY a JSON array with ${batch.length} objects, no other text.`;

    try {
      const response = await ai.chat.completions.create({
        model: MODELS.fast, // gemini-2.0-flash — cheapest for high-volume classification
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const text = response.choices?.[0]?.message?.content?.trim() ?? "[]";
      // Gemini may wrap in {"articles": [...]} or return array directly
      const raw = JSON.parse(text);
      const parsed: ClassificationResult[] = Array.isArray(raw) ? raw : (raw.articles ?? raw.results ?? []);
      results.push(...parsed);
    } catch {
      results.push(...batch.map(() => ({
        funnyScore: 0,
        shockScore: 0,
        summary: "",
        tags: [],
      })));
    }
  }

  return results;
}
