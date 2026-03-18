import axios from "axios";
import * as cheerio from "cheerio";
import { changelogs } from "@/db/schema";
import { CHANGELOG_SOURCES, type ChangelogSource } from "./sources";
import type { AgentModule } from "../types";
import { Octokit } from "@octokit/rest";

async function scrapeHtmlChangelog(source: ChangelogSource) {
  const entries: Array<{
    title: string;
    contentMd: string;
    url: string;
    version: string | null;
    publishedAt: Date | null;
  }> = [];

  try {
    const { data: html } = await axios.get(source.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; sbdev-bot/1.0)" },
      timeout: 15000,
    });

    const $ = cheerio.load(html);
    const sel = source.selectors!;
    const items = $(sel.item).slice(0, 20); // max 20 entries per run

    items.each((_, el) => {
      const $el = $(el);
      const title = $el.find(sel.title).first().text().trim();
      if (!title) return;

      const content = sel.content ? $el.find(sel.content).map((_, e) => $(e).text().trim()).get().join("\n") : "";
      const version = sel.version ? $el.find(sel.version).first().text().trim().match(/v?\d+\.\d+[\.\d]*/)?.[0] ?? null : null;
      const dateText = sel.date ? $el.find(sel.date).attr("datetime") ?? $el.find(sel.date).text().trim() : null;
      const publishedAt = dateText ? new Date(dateText) : null;

      // Build a slug URL from product + title for uniqueness
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
      const entryUrl = `${source.url}#${slug}-${Date.now()}`;

      if (title.length > 3) {
        entries.push({ title, contentMd: content, url: entryUrl, version, publishedAt: publishedAt && !isNaN(publishedAt.getTime()) ? publishedAt : null });
      }
    });
  } catch (err) {
    console.warn(`[changelogs] Failed to scrape ${source.product}: ${err instanceof Error ? err.message : err}`);
  }

  return entries;
}

async function fetchGithubReleases(source: ChangelogSource, octokit: Octokit) {
  const entries: Array<{
    title: string;
    contentMd: string;
    url: string;
    version: string | null;
    publishedAt: Date | null;
  }> = [];

  try {
    const { data: releases } = await octokit.repos.listReleases({
      owner: source.githubOwner!,
      repo: source.githubRepo!,
      per_page: 20,
    });

    for (const release of releases) {
      entries.push({
        title: release.name ?? release.tag_name,
        contentMd: release.body ?? "",
        url: release.html_url,
        version: release.tag_name,
        publishedAt: release.published_at ? new Date(release.published_at) : null,
      });
    }
  } catch (err) {
    console.warn(`[changelogs] Failed to fetch GitHub releases for ${source.product}: ${err instanceof Error ? err.message : err}`);
  }

  return entries;
}

export const changelogsAgent: AgentModule = {
  id: "changelogs",
  name: "Changelogs & News",
  description: "Fetches changelogs and release notes for Claude Code, Cursor, Windsurf, PiecesOS, Antigravity, OpenClaw, NanoClaw",
  schedule: "0 */6 * * *", // every 6 hours

  async run({ db, github, log }) {
    let totalRows = 0;

    for (const source of CHANGELOG_SOURCES) {
      log.info(`Processing ${source.displayName}...`);

      let entries: Awaited<ReturnType<typeof scrapeHtmlChangelog>> = [];

      if (source.type === "github-releases") {
        entries = await fetchGithubReleases(source, github);
      } else {
        entries = await scrapeHtmlChangelog(source);
      }

      if (entries.length === 0) {
        log.warn(`No entries found for ${source.displayName}`);
        continue;
      }

      for (const entry of entries) {
        try {
          await db
            .insert(changelogs)
            .values({
              product: source.product,
              version: entry.version,
              title: entry.title,
              contentMd: entry.contentMd || null,
              url: entry.url,
              publishedAt: entry.publishedAt,
            })
            .onConflictDoNothing();
          totalRows++;
        } catch {
          // ignore duplicate URLs
        }
      }

      log.info(`Inserted up to ${entries.length} entries for ${source.displayName}`);
    }

    return { rowsAffected: totalRows };
  },
};
