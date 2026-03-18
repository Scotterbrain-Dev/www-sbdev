import type Anthropic from "@anthropic-ai/sdk";

export interface ClassificationResult {
  funnyScore: number;
  shockScore: number;
  summary: string;
  tags: string[];
}

const BATCH_SIZE = 10;

export async function classifyArticles(
  articles: Array<{ title: string; description?: string }>,
  anthropic: Anthropic
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
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.content[0];
      if (content.type !== "text") continue;

      const parsed = JSON.parse(content.text.trim()) as ClassificationResult[];
      results.push(...parsed);
    } catch {
      // fallback: add neutral scores
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
