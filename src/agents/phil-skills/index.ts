import { claudeSkills } from "@/db/schema";
import { eq } from "drizzle-orm";
import { scrapeClaudeSkills } from "./scraper";
import type { AgentModule } from "../types";

export const claudeSkillsAgent: AgentModule = {
  id: "phil-skills",
  name: "Phil-Skills",
  description: "Fetches Claude skills, agents, and connectors from Anthropic (3x/week)",
  schedule: "0 9 * * 1,3,5", // Mon, Wed, Fri at 9am

  async run({ db, github, log }) {
    log.info("Scraping Claude skills and connectors...");
    const items = await scrapeClaudeSkills(github);
    log.info(`Found ${items.length} items`);

    let totalRows = 0;
    const now = new Date();

    for (const item of items) {
      try {
        // Check if already exists
        const existing = await db
          .select({ id: claudeSkills.id, name: claudeSkills.name })
          .from(claudeSkills)
          .where(eq(claudeSkills.slug, item.slug));

        if (existing.length === 0) {
          await db.insert(claudeSkills).values({
            name: item.name,
            slug: item.slug,
            type: item.type,
            description: item.description,
            url: item.url,
            category: item.category,
            isNew: true,
            seenAt: now,
          });
          totalRows++;
        } else {
          // Mark as not-new after first seen
          await db.update(claudeSkills).set({
            isNew: false,
            lastUpdatedAt: now,
            description: item.description,
            url: item.url,
          }).where(eq(claudeSkills.slug, item.slug));
        }
      } catch {
        // ignore
      }
    }

    return { rowsAffected: totalRows, metadata: { totalFound: items.length } };
  },
};
