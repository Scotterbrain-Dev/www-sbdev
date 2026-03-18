import { shortcuts, shortcutsApps } from "@/db/schema";
import { eq, isNull, or, lt, sql } from "drizzle-orm";
import { APPS } from "./apps";
import { generateShortcuts } from "./generator";
import type { AgentModule } from "../types";

export const keyboardShortcutsAgent: AgentModule = {
  id: "too-short",
  name: "Too-Short",
  description: "Uses Gemini 2.5 Flash to generate and update keyboard shortcuts, commands, and tips for apps",
  schedule: "0 2 * * 0", // weekly Sunday at 2am

  async run({ db, ai, log }) {
    // Ensure all apps exist in DB
    for (const app of APPS) {
      await db.insert(shortcutsApps).values({
        slug: app.slug,
        name: app.name,
        category: app.category,
      }).onConflictDoNothing();
    }

    // Find apps that need generation (never generated, or older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const appsToGenerate = await db
      .select()
      .from(shortcutsApps)
      .where(
        or(
          isNull(shortcutsApps.lastGeneratedAt),
          lt(shortcutsApps.lastGeneratedAt, thirtyDaysAgo)
        )
      );

    log.info(`Generating shortcuts for ${appsToGenerate.length} apps`);
    let totalRows = 0;

    for (const app of appsToGenerate) {
      const appConfig = APPS.find((a) => a.slug === app.slug);
      if (!appConfig) continue;

      log.info(`Generating for ${app.name}...`);

      const platforms = appConfig.platforms.includes("all") ? ["all"] : appConfig.platforms;

      for (const platform of platforms) {
        try {
          const generated = await generateShortcuts(appConfig, platform, ai);
          log.info(`Got ${generated.length} shortcuts for ${app.name}/${platform}`);

          for (const sc of generated) {
            await db.insert(shortcuts).values({
              appId: app.id,
              keyCombo: sc.keyCombo,
              action: sc.action,
              description: sc.description,
              category: sc.category,
              platform: sc.platform,
              confidence: sc.confidence,
            }).onConflictDoNothing();
            totalRows++;
          }
        } catch (err) {
          log.error(`Failed to generate for ${app.name}/${platform}: ${err instanceof Error ? err.message : err}`);
        }
      }

      // Update last generated timestamp
      await db.update(shortcutsApps).set({ lastGeneratedAt: new Date() }).where(eq(shortcutsApps.id, app.id));
    }

    return { rowsAffected: totalRows };
  },
};
