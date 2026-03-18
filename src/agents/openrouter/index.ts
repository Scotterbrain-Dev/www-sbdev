import { openrouterModels } from "@/db/schema";
import { fetchOpenRouterModels } from "./scraper";
import type { AgentModule } from "../types";

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export const openrouterAgent: AgentModule = {
  id: "openrouter",
  name: "OpenRouter Rankings",
  description: "Fetches OpenRouter model data, rankings, and benchmarks (weekly)",
  schedule: "0 9 * * 1", // weekly Monday at 9am

  async run({ db, log }) {
    const snapshotWeek = getWeekStart();
    log.info(`Fetching OpenRouter models for week of ${snapshotWeek}...`);

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
    return {
      rowsAffected: totalRows,
      metadata: {
        snapshotWeek,
        note: "Benchmark scores require manual scraping of openrouter.ai/rankings - add Playwright for full data",
      },
    };
  },
};
