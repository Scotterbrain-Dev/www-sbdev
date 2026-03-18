import axios from "axios";
import * as cheerio from "cheerio";

export interface ClaudeSkillItem {
  name: string;
  slug: string;
  type: "skill" | "agent" | "connector";
  description: string | null;
  url: string | null;
  category: string | null;
}

const SOURCES = [
  {
    url: "https://www.anthropic.com/claude-code/skills",
    type: "skill" as const,
    selectors: { item: "article, .skill-card, .card", title: "h2, h3, .title", description: "p, .description" },
  },
  {
    url: "https://www.anthropic.com/claude-code/connectors",
    type: "connector" as const,
    selectors: { item: "article, .connector-card, .card", title: "h2, h3, .title", description: "p, .description" },
  },
];

function toSlug(name: string, type: string): string {
  return `${type}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}`;
}

export async function scrapeClaudeSkills(): Promise<ClaudeSkillItem[]> {
  const items: ClaudeSkillItem[] = [];

  for (const source of SOURCES) {
    try {
      const { data: html } = await axios.get(source.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; sbdev-bot/1.0)" },
        timeout: 15000,
      });

      const $ = cheerio.load(html);

      $(source.selectors.item).each((_, el) => {
        const $el = $(el);
        const name = $el.find(source.selectors.title).first().text().trim();
        if (!name || name.length < 2) return;

        const description = $el.find(source.selectors.description).first().text().trim() || null;
        const href = $el.find("a").attr("href") ?? null;
        const url = href ? (href.startsWith("http") ? href : `https://www.anthropic.com${href}`) : null;

        items.push({
          name,
          slug: toSlug(name, source.type),
          type: source.type,
          description,
          url,
          category: null,
        });
      });
    } catch (err) {
      console.warn(`[claude-skills] Failed to scrape ${source.url}: ${err instanceof Error ? err.message : err}`);
    }
  }

  return items;
}
