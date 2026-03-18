import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { aiArticles } from "@/db/schema";
import { AI_ARTICLE_FEEDS } from "./feeds";
import { classifyArticles } from "./classifier";
import type { AgentModule } from "../types";
import { eq } from "drizzle-orm";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

interface RssItem {
  title: string;
  link: string;
  description?: string;
  author?: string;
  pubDate?: string;
  "dc:creator"?: string;
}

async function fetchFeed(url: string): Promise<RssItem[]> {
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; sbdev-bot/1.0)" },
    timeout: 10000,
  });
  const parsed = parser.parse(data);
  const channel = parsed?.rss?.channel ?? parsed?.feed;
  const items = channel?.item ?? channel?.entry ?? [];
  return Array.isArray(items) ? items : [items];
}

export const aiArticlesAgent: AgentModule = {
  id: "arty-jotai",
  name: "Arty-Jotai",
  description: "Fetches and classifies funny/shocking AI articles from RSS feeds",
  schedule: "0 */4 * * *", // every 4 hours

  async run({ db, ai, log }) {
    let totalRows = 0;
    const newArticles: Array<{ title: string; url: string; source: string; author: string | null; publishedAt: Date | null; description?: string }> = [];

    // Fetch all feeds
    for (const feed of AI_ARTICLE_FEEDS) {
      log.info(`Fetching ${feed.name}...`);
      try {
        const items = await fetchFeed(feed.url);
        for (const item of items.slice(0, 20)) {
          const url = typeof item.link === "string" ? item.link : String(item.link ?? "");
          if (!url) continue;

          // Check if already exists
          const exists = await db.select({ id: aiArticles.id }).from(aiArticles).where(eq(aiArticles.url, url));
          if (exists.length > 0) continue;

          newArticles.push({
            title: item.title ?? "Untitled",
            url,
            source: feed.source,
            author: item.author ?? item["dc:creator"] ?? null,
            publishedAt: item.pubDate ? new Date(item.pubDate) : null,
            description: item.description,
          });
        }
      } catch (err) {
        log.warn(`Failed to fetch ${feed.name}: ${err instanceof Error ? err.message : err}`);
      }
    }

    if (newArticles.length === 0) {
      log.info("No new articles found");
      return { rowsAffected: 0 };
    }

    log.info(`Classifying ${newArticles.length} new articles...`);
    const classifications = await classifyArticles(
      newArticles.map((a) => ({ title: a.title, description: a.description })),
      ai
    );

    for (let i = 0; i < newArticles.length; i++) {
      const article = newArticles[i];
      const cls = classifications[i] ?? { funnyScore: 0, shockScore: 0, summary: "", tags: [] };

      // Only save articles that are at least somewhat funny or shocking
      if (cls.funnyScore < 3 && cls.shockScore < 3) continue;

      try {
        await db.insert(aiArticles).values({
          title: article.title,
          url: article.url,
          source: article.source,
          author: article.author,
          publishedAt: article.publishedAt,
          summary: cls.summary || null,
          funnyScore: cls.funnyScore / 10,
          shockScore: cls.shockScore / 10,
          tags: cls.tags,
        }).onConflictDoNothing();
        totalRows++;
      } catch {
        // duplicate, skip
      }
    }

    return { rowsAffected: totalRows, metadata: { found: newArticles.length, saved: totalRows } };
  },
};
