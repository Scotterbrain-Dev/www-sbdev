import { awesomeRepoEntries } from "@/db/schema";
import type { AgentModule } from "../types";
import { eq } from "drizzle-orm";

const AWESOME_REPOS = [
  { slug: "claude-code-awesome", owner: "hesreallyhim", repo: "awesome-claude-code" },
  { slug: "gemini-cli-awesome", owner: "mehrbodkh", repo: "awesome-gemini" },
  { slug: "mcp-awesome", owner: "punkpeye", repo: "awesome-mcp-servers" },
];

const MARKDOWN_LINK_RE = /^\s*[-*]\s+\[([^\]]+)\]\(([^)]+)\)(?:\s*[-–—]\s*(.+))?/;

export const awesomeReposAgent: AgentModule = {
  id: "awesome-repos",
  name: "Awesome Repos Tracker",
  description: "Tracks new entries added to Claude-Code-Awesome, Gemini-CLI-Awesome, and MCP-Awesome",
  schedule: "0 10 * * *", // daily at 10am

  async run({ db, github, log }) {
    let totalRows = 0;

    for (const repo of AWESOME_REPOS) {
      log.info(`Checking ${repo.slug} (${repo.owner}/${repo.repo})...`);

      // Get existing entry URLs to avoid re-processing
      const existing = await db
        .select({ entryUrl: awesomeRepoEntries.entryUrl })
        .from(awesomeRepoEntries)
        .where(eq(awesomeRepoEntries.awesomeRepo, repo.slug));

      const existingUrls = new Set(existing.map((e) => e.entryUrl));

      // Get recent commits
      let commits;
      try {
        const { data } = await github.repos.listCommits({
          owner: repo.owner,
          repo: repo.repo,
          per_page: 10,
        });
        commits = data;
      } catch (err) {
        log.warn(`Failed to fetch commits for ${repo.slug}: ${err instanceof Error ? err.message : err}`);
        continue;
      }

      for (const commit of commits) {
        let diff: string;
        try {
          const { data: commitData } = await github.repos.getCommit({
            owner: repo.owner,
            repo: repo.repo,
            ref: commit.sha,
          });
          diff = commitData.files?.map((f) => f.patch ?? "").join("\n") ?? "";
        } catch {
          continue;
        }

        // Parse added lines that look like markdown list items with links
        const addedLines = diff.split("\n").filter((line) => line.startsWith("+") && !line.startsWith("+++"));
        let section = "General";

        for (const line of addedLines) {
          // Track section headers
          if (line.startsWith("+#")) {
            section = line.replace(/^\++#+ /, "").trim();
            continue;
          }

          const match = MARKDOWN_LINK_RE.exec(line.slice(1));
          if (!match) continue;

          const [, name, url, description] = match;
          if (!url || existingUrls.has(url)) continue;

          try {
            await db.insert(awesomeRepoEntries).values({
              awesomeRepo: repo.slug,
              entryName: name,
              entryUrl: url,
              entryDescription: description?.trim() ?? null,
              commitSha: commit.sha,
              addedAt: new Date(commit.commit.committer?.date ?? commit.commit.author?.date ?? Date.now()),
              section,
            }).onConflictDoNothing();
            existingUrls.add(url);
            totalRows++;
          } catch {
            // duplicate, skip
          }
        }
      }

      log.info(`Done with ${repo.slug}`);
    }

    return { rowsAffected: totalRows };
  },
};
