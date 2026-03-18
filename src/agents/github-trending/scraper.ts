import axios from "axios";
import * as cheerio from "cheerio";

export interface TrendingRepo {
  repoFullName: string;
  name: string;
  owner: string;
  description: string | null;
  language: string | null;
  starsTotal: number | null;
  starsToday: number | null;
  forks: number | null;
  url: string;
}

export async function scrapeTrending(period: "daily" | "weekly" | "monthly"): Promise<TrendingRepo[]> {
  const sinceMap = { daily: "daily", weekly: "weekly", monthly: "monthly" };
  const url = `https://github.com/trending?since=${sinceMap[period]}`;

  const { data: html } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; sbdev-bot/1.0)" },
    timeout: 15000,
  });

  const $ = cheerio.load(html);
  const repos: TrendingRepo[] = [];

  $("article.Box-row").each((_, el) => {
    const $el = $(el);
    const relPath = $el.find("h2 a").attr("href")?.trim() ?? "";
    const repoFullName = relPath.startsWith("/") ? relPath.slice(1) : relPath;
    const [owner, name] = repoFullName.split("/");

    const description = $el.find("p").first().text().trim() || null;
    const language = $el.find("[itemprop='programmingLanguage']").text().trim() || null;

    const starsText = $el.find("a[href$='/stargazers']").text().replace(/,/g, "").trim();
    const starsTotal = parseInt(starsText) || null;

    const forksText = $el.find("a[href$='/forks']").text().replace(/,/g, "").trim();
    const forks = parseInt(forksText) || null;

    const todayText = $el.find(".float-sm-right").text().replace(/,/g, "").trim();
    const todayMatch = todayText.match(/(\d+)/);
    const starsToday = todayMatch ? parseInt(todayMatch[1]) : null;

    if (owner && name) {
      repos.push({
        repoFullName,
        name,
        owner,
        description,
        language,
        starsTotal,
        starsToday,
        forks,
        url: `https://github.com/${repoFullName}`,
      });
    }
  });

  return repos;
}
