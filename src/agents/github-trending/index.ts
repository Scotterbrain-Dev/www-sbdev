import { sql } from "drizzle-orm";
import { githubTrending } from "@/db/schema";
import { scrapeTrending } from "./scraper";
import type { AgentModule } from "../types";

export const githubTrendingAgent: AgentModule = {
  id: "github-trending",
  name: "GitHub Trending",
  description: "Scrapes GitHub trending repos (daily, weekly, monthly)",
  schedule: "0 8 * * *", // daily at 8am

  async run({ db, log }) {
    const today = new Date().toISOString().split("T")[0];
    let totalRows = 0;

    for (const period of ["daily", "weekly", "monthly"] as const) {
      log.info(`Scraping ${period} trending...`);
      const repos = await scrapeTrending(period);
      log.info(`Found ${repos.length} repos for ${period}`);

      if (repos.length === 0) continue;

      const rows = repos.map((r) => ({
        repoFullName: r.repoFullName,
        name: r.name,
        owner: r.owner,
        description: r.description,
        language: r.language,
        starsTotal: r.starsTotal,
        starsToday: r.starsToday,
        forks: r.forks,
        url: r.url,
        period,
        snapshotDate: today,
      }));

      await db
        .insert(githubTrending)
        .values(rows)
        .onConflictDoNothing();

      totalRows += repos.length;
    }

    return { rowsAffected: totalRows, metadata: { date: today } };
  },
};
