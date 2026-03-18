import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { aiTrends } from "@/db/schema";
import { AI_TREND_FEEDS } from "../ai-articles/feeds";
import type { AgentModule } from "../types";
import { eq } from "drizzle-orm";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

const AI_KEYWORDS = ["llm", "agentic", "agent", "gpt", "claude", "gemini", "copilot", "cursor", "windsurf", "openrouter", "anthropic", "openai", "mistral", "transformers", "fine-tuning", "rag", "mcp"];

function relevanceScore(title: string, description: string = ""): number {
  const text = `${title} ${description}`.toLowerCase();
  const matches = AI_KEYWORDS.filter((kw) => text.includes(kw));
  return Math.min(matches.length / 3, 1.0);
}

export const aiTrendsAgent: AgentModule = {
  id: "ai-trends",
  name: "AI Trends",
  description: "Tracks latest AI, LLM, and agentic coding trends from news sources",
  schedule: "0 */6 * * *", // every 6 hours

  async run({ db, log }) {
    let totalRows = 0;

    for (const feed of AI_TREND_FEEDS) {
      log.info(`Fetching ${feed.name}...`);
      try {
        const { data } = await axios.get(feed.url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; sbdev-bot/1.0)" },
          timeout: 10000,
        });

        const parsed = parser.parse(data);
        const channel = parsed?.rss?.channel ?? parsed?.feed;
        const items = channel?.item ?? channel?.entry ?? [];
        const itemList = Array.isArray(items) ? items : [items];

        for (const item of itemList.slice(0, 25)) {
          const url = typeof item.link === "string" ? item.link : String(item.link ?? "");
          if (!url) continue;

          const exists = await db.select({ id: aiTrends.id }).from(aiTrends).where(eq(aiTrends.url, url));
          if (exists.length > 0) continue;

          const title = item.title ?? "Untitled";
          const description = item.description ?? item.summary ?? "";
          const score = relevanceScore(title, description);

          if (score < 0.1) continue; // skip irrelevant items

          const publishedAt = item.pubDate ? new Date(item.pubDate) : null;

          try {
            await db.insert(aiTrends).values({
              title,
              url,
              source: feed.source,
              publishedAt: publishedAt && !isNaN(publishedAt.getTime()) ? publishedAt : null,
              summary: description.slice(0, 500) || null,
              relevanceScore: score,
              tags: AI_KEYWORDS.filter((kw) => `${title} ${description}`.toLowerCase().includes(kw)),
            }).onConflictDoNothing();
            totalRows++;
          } catch {
            // duplicate, skip
          }
        }
      } catch (err) {
        log.warn(`Failed to fetch ${feed.name}: ${err instanceof Error ? err.message : err}`);
      }
    }

    return { rowsAffected: totalRows };
  },
};
