import { chromium } from "playwright";

export interface RankedModel {
  rank: number;
  name: string;
  provider: string;
  weeklyTokensB: number | null; // in billions
}

export interface TopApp {
  rank: number;
  name: string;
  description: string | null;
  weeklyTokensB: number | null;
}

/** Parse "1.61T tokens" → 1610 (billions) or "957B tokens" → 957 */
function parseTokens(raw: string): number | null {
  const m = raw.match(/([\d.]+)([TB])\s*tokens/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2].toUpperCase() === "T" ? n * 1000 : n;
}

/**
 * Scrapes https://openrouter.ai/rankings for:
 * - LLM leaderboard (usage-based rank + weekly token volume)
 * - Top Apps
 */
export async function scrapeOpenRouterRankings(): Promise<{
  models: RankedModel[];
  apps: TopApp[];
}> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://openrouter.ai/rankings", {
      waitUntil: "networkidle",
      timeout: 45000,
    });
    await page.waitForTimeout(4000);

    // Click "Show more" up to 4 times to get ~50 entries
    for (let i = 0; i < 4; i++) {
      const btn = page.locator('button:has-text("Show more")').first();
      const visible = await btn.isVisible().catch(() => false);
      if (!visible) break;
      await btn.click();
      await page.waitForTimeout(1500);
    }

    const bodyText = await page.locator("body").innerText();

    // Parse leaderboard: "This Week\n1.\nModelName\nby\nprovider\n1.61T tokens\n19%\n2.\n..."
    const models: RankedModel[] = [];
    const leaderStart = bodyText.indexOf("This Week");
    const leaderEnd = bodyText.indexOf("Market Share");
    if (leaderStart !== -1) {
      const section = bodyText.slice(leaderStart + "This Week".length, leaderEnd !== -1 ? leaderEnd : leaderStart + 5000);
      const lines = section.split("\n").map((l) => l.trim()).filter(Boolean);

      let i = 0;
      while (i < lines.length) {
        // Look for rank line: "1." or "10."
        const rankMatch = lines[i]?.match(/^(\d+)\.$/);
        if (rankMatch) {
          const rank = parseInt(rankMatch[1]);
          const name = lines[i + 1] ?? "";
          // lines[i+2] should be "by", lines[i+3] is provider
          const provider = lines[i + 2] === "by" ? (lines[i + 3] ?? "") : "";
          const offset = lines[i + 2] === "by" ? 4 : 2;
          const tokenLine = lines[i + offset] ?? "";
          const weeklyTokensB = parseTokens(tokenLine);

          if (name && name !== "by") {
            models.push({ rank, name, provider, weeklyTokensB });
          }
          i += offset + 2; // skip past percentage/new line
        } else {
          i++;
        }
      }
    }

    // Parse Top Apps section
    const apps: TopApp[] = [];
    const appsStart = bodyText.indexOf("Top Apps");
    const appsEnd = bodyText.indexOf("Visit the new App");
    if (appsStart !== -1) {
      const section = bodyText.slice(appsStart + "Top Apps".length, appsEnd !== -1 ? appsEnd : appsStart + 3000);
      const lines = section.split("\n").map((l) => l.trim()).filter(Boolean);

      let i = 0;
      while (i < lines.length) {
        const rankMatch = lines[i]?.match(/^(\d+)\.$/);
        if (rankMatch) {
          const rank = parseInt(rankMatch[1]);
          const name = lines[i + 1] ?? "";
          const description = lines[i + 2] && !lines[i + 2].match(/^\d+/) ? lines[i + 2] : null;
          const tokenOffset = description ? 3 : 2;
          const tokenLine = lines[i + tokenOffset] ?? "";
          const weeklyTokensB = parseTokens(tokenLine);

          if (name) {
            apps.push({ rank, name, description, weeklyTokensB });
          }
          i += tokenOffset + 1;
        } else {
          i++;
        }
      }
    }

    return { models, apps };
  } finally {
    await browser.close();
  }
}
