import { githubTrending, awesomeRepoEntries, trackedRepos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { scrapeTrending } from "./scraper";
import type { AgentModule } from "../types";
import type { Octokit } from "@octokit/rest";
import type { DB } from "@/db";

// Repos we fork and track for new entries
const AWESOME_REPOS = [
  {
    upstream: { owner: "hesreallyhim", repo: "awesome-claude-code" },
    fork: { owner: "Scotterbrain-Dev", repo: "awesome-claude-code" },
  },
  {
    upstream: { owner: "VoltAgent", repo: "awesome-agent-skills" },
    fork: { owner: "Scotterbrain-Dev", repo: "awesome-agent-skills" },
  },
  {
    upstream: { owner: "punkpeye", repo: "awesome-mcp-servers" },
    fork: { owner: "Scotterbrain-Dev", repo: "awesome-mcp-servers" },
  },
];

const MARKDOWN_LINK_RE = /^\s*[-*]\s+\[([^\]]+)\]\(([^)]+)\)(?:\s*[-–—]\s*(.+))?/;

async function getOrInitTrackedRepo(
  db: DB,
  upstreamOwner: string,
  upstreamRepo: string,
  forkOwner: string,
  forkRepo: string,
  github: Octokit
) {
  const upstreamFullName = `${upstreamOwner}/${upstreamRepo}`;
  const forkFullName = `${forkOwner}/${forkRepo}`;

  const [existing] = await db
    .select()
    .from(trackedRepos)
    .where(eq(trackedRepos.upstreamFullName, upstreamFullName));

  if (existing) return existing;

  // First run — get the current HEAD SHA of upstream to start tracking from
  const { data: branch } = await github.repos.getBranch({
    owner: upstreamOwner,
    repo: upstreamRepo,
    branch: "main",
  }).catch(() => github.repos.getBranch({ owner: upstreamOwner, repo: upstreamRepo, branch: "master" }));

  const headSha = branch.commit.sha;

  const [inserted] = await db
    .insert(trackedRepos)
    .values({ upstreamFullName, forkFullName, lastProcessedSha: headSha, lastSyncedAt: new Date() })
    .returning();

  return inserted;
}

async function processAwesomeRepo(
  db: DB,
  github: Octokit,
  upstream: { owner: string; repo: string },
  fork: { owner: string; repo: string },
  log: { info: (m: string) => void; warn: (m: string) => void }
): Promise<number> {
  const tracked = await getOrInitTrackedRepo(
    db, upstream.owner, upstream.repo, fork.owner, fork.repo, github
  );

  // Get current HEAD of upstream
  let upstreamHeadSha: string;
  try {
    const branch = await github.repos.getBranch({ owner: upstream.owner, repo: upstream.repo, branch: "main" })
      .catch(() => github.repos.getBranch({ owner: upstream.owner, repo: upstream.repo, branch: "master" }));
    upstreamHeadSha = branch.data.commit.sha;
  } catch (err) {
    log.warn(`Could not get upstream HEAD for ${upstream.owner}/${upstream.repo}: ${err instanceof Error ? err.message : err}`);
    return 0;
  }

  // Nothing new since last run
  if (tracked.lastProcessedSha === upstreamHeadSha) {
    log.info(`${upstream.owner}/${upstream.repo} — no new commits since last run`);
    return 0;
  }

  // Get unified diff of everything between last processed SHA and upstream HEAD
  let comparison;
  try {
    const { data } = await github.repos.compareCommitsWithBasehead({
      owner: upstream.owner,
      repo: upstream.repo,
      basehead: `${tracked.lastProcessedSha}...${upstreamHeadSha}`,
    });
    comparison = data;
  } catch (err) {
    log.warn(`Compare failed for ${upstream.owner}/${upstream.repo}: ${err instanceof Error ? err.message : err}`);
    return 0;
  }

  log.info(`${upstream.owner}/${upstream.repo} — ${comparison.commits.length} new commits, ${comparison.files?.length ?? 0} files changed`);

  // Collect all existing entry URLs to skip duplicates
  const repoSlug = `${upstream.owner}/${upstream.repo}`;
  const existing = await db
    .select({ entryUrl: awesomeRepoEntries.entryUrl })
    .from(awesomeRepoEntries)
    .where(eq(awesomeRepoEntries.awesomeRepo, repoSlug));
  const existingUrls = new Set(existing.map((e) => e.entryUrl));

  let rowsAdded = 0;
  let section = "General";

  for (const file of comparison.files ?? []) {
    if (!file.patch) continue;

    const addedLines = file.patch
      .split("\n")
      .filter((line) => line.startsWith("+") && !line.startsWith("+++"));

    for (const line of addedLines) {
      if (line.startsWith("+#")) {
        section = line.replace(/^\++#+\s*/, "").trim();
        continue;
      }

      const match = MARKDOWN_LINK_RE.exec(line.slice(1));
      if (!match) continue;

      const [, name, url, description] = match;
      if (!url || existingUrls.has(url)) continue;

      try {
        await db.insert(awesomeRepoEntries).values({
          awesomeRepo: repoSlug,
          entryName: name,
          entryUrl: url,
          entryDescription: description?.trim() ?? null,
          commitSha: upstreamHeadSha,
          addedAt: new Date(),
          section,
        }).onConflictDoNothing();
        existingUrls.add(url);
        rowsAdded++;
      } catch {
        // duplicate, skip
      }
    }
  }

  // Advance our tracked SHA to upstream HEAD
  await db
    .update(trackedRepos)
    .set({ lastProcessedSha: upstreamHeadSha, lastSyncedAt: new Date() })
    .where(eq(trackedRepos.upstreamFullName, `${upstream.owner}/${upstream.repo}`));

  // Sync fork HEAD to match upstream (keeps fork current)
  try {
    await github.repos.mergeUpstream({
      owner: fork.owner,
      repo: fork.repo,
      branch: "main",
    }).catch(() => github.repos.mergeUpstream({ owner: fork.owner, repo: fork.repo, branch: "master" }));
  } catch {
    // Non-critical — fork sync can be done manually if it fails
  }

  log.info(`${upstream.owner}/${upstream.repo} — added ${rowsAdded} new entries`);
  return rowsAdded;
}

export const gabbyGitrendAgent: AgentModule = {
  id: "gabby-gitrend",
  name: "Gabby-Gitrend",
  description: "Scrapes GitHub trending repos and tracks new entries in Awesome lists via compare API",
  schedule: "0 8 * * *", // daily at 8am

  async run({ db, github, log }) {
    const today = new Date().toISOString().split("T")[0];
    let totalRows = 0;

    // --- GitHub Trending ---
    for (const period of ["daily", "weekly", "monthly"] as const) {
      log.info(`Scraping ${period} trending...`);
      const repos = await scrapeTrending(period);
      log.info(`Found ${repos.length} repos for ${period}`);

      if (repos.length === 0) continue;

      await db.insert(githubTrending).values(
        repos.map((r) => ({
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
        }))
      ).onConflictDoNothing();

      totalRows += repos.length;
    }

    // --- Awesome Repos (compare API) ---
    for (const tracked of AWESOME_REPOS) {
      const added = await processAwesomeRepo(db, github, tracked.upstream, tracked.fork, log);
      totalRows += added;
    }

    return { rowsAffected: totalRows, metadata: { date: today } };
  },
};
