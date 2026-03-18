import { openrouterModels, openrouterTopApps } from "@/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";
import { fetchOpenRouterModels } from "./scraper";
import { scrapeOpenRouterRankings } from "./rankings-scraper";
import type { AgentModule } from "../types";

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

/** Strip "Provider: " prefix from model names for matching: "Anthropic: Claude Sonnet 4.6" → "Claude Sonnet 4.6" */
function stripProviderPrefix(name: string): string {
  const colonIdx = name.indexOf(": ");
  return colonIdx !== -1 ? name.slice(colonIdx + 2) : name;
}

export const openrouterAgent: AgentModule = {
  id: "frank-router",
  name: "Frank-Router",
  description: "Fetches OpenRouter model data, usage rankings, and top apps (weekly)",
  schedule: "0 9 * * 1", // weekly Monday at 9am

  async run({ db, log }) {
    const snapshotWeek = getWeekStart();
    const today = getToday();
    log.info(`Fetching OpenRouter models for week of ${snapshotWeek}...`);

    // --- Step 1: Fetch all models from public API ---
    const models = await fetchOpenRouterModels();
    log.info(`Found ${models.length} models from OpenRouter API`);

    let totalRows = 0;
    for (const model of models) {
      try {
        await db.insert(openrouterModels).values({
          modelId: model.modelId,
          name: model.name,
          provider: model.provider,
          rank: null,
          scoreIntelligence: null,
          scoreCoding: null,
          scoreAgentic: null,
          tokensPerSec: model.tokensPerSec,
          contextLength: model.contextLength,
          snapshotWeek,
        }).onConflictDoNothing();
        totalRows++;
      } catch {
        // duplicate
      }
    }
    log.info(`Stored ${totalRows} model records`);

    // --- Step 2: Scrape usage rankings with Playwright ---
    log.info("Scraping OpenRouter rankings page...");
    let rankingsRows = 0;
    try {
      const { models: ranked, apps } = await scrapeOpenRouterRankings();
      log.info(`Got ${ranked.length} ranked models, ${apps.length} top apps`);

      // Match ranked models to DB entries and update rank + weeklyTokensB
      for (const rm of ranked) {
        const strippedName = rm.name;

        // Find matching model: look for models where name ends with the ranked name
        // e.g. DB "Anthropic: Claude Sonnet 4.6" should match ranked "Claude Sonnet 4.6"
        const dbModels = await db
          .select({ id: openrouterModels.id, name: openrouterModels.name })
          .from(openrouterModels)
          .where(
            and(
              eq(openrouterModels.snapshotWeek, snapshotWeek),
              eq(openrouterModels.provider, rm.provider),
              ilike(openrouterModels.name, `%${strippedName}%`)
            )
          )
          .limit(1);

        if (dbModels.length > 0) {
          await db.update(openrouterModels)
            .set({ rank: rm.rank, weeklyTokensB: rm.weeklyTokensB })
            .where(eq(openrouterModels.id, dbModels[0].id));
          rankingsRows++;
        }
      }
      log.info(`Updated ${rankingsRows} model ranks`);

      // Store top apps
      for (const app of apps) {
        try {
          await db.insert(openrouterTopApps).values({
            rank: app.rank,
            name: app.name,
            description: app.description,
            weeklyTokensB: app.weeklyTokensB,
            snapshotDate: today,
          }).onConflictDoNothing();
        } catch {
          // duplicate
        }
      }
      log.info(`Stored ${apps.length} top app records`);
    } catch (err) {
      log.warn(`Rankings scraping failed: ${err instanceof Error ? err.message : err}`);
    }

    return {
      rowsAffected: totalRows + rankingsRows,
      metadata: { snapshotWeek, modelsStored: totalRows, ranksUpdated: rankingsRows },
    };
  },
};
