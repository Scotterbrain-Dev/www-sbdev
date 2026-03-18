import type { Octokit } from "@octokit/rest";

export interface ClaudeSkillItem {
  name: string;
  slug: string;
  type: "skill" | "agent" | "connector";
  description: string | null;
  url: string | null;
  category: string | null;
}

function toSlug(name: string, type: string): string {
  return `${type}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}`;
}

function parsePluginReadme(content: string, dirName: string): { name: string; description: string | null } {
  const lines = content.split("\n");
  const h1 = lines.find((l) => l.startsWith("# "))?.replace(/^# /, "").trim();
  // First non-heading, non-empty line after the title
  const descLine = lines.slice(1).find((l) => l.trim() && !l.startsWith("#") && !l.startsWith("```"));
  return {
    name: h1 ?? dirName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    description: descLine?.trim() ?? null,
  };
}

export async function scrapeClaudeSkills(github: Octokit): Promise<ClaudeSkillItem[]> {
  const items: ClaudeSkillItem[] = [];

  // List the plugins/ directory
  let pluginDirs: Array<{ name: string; html_url: string | null }> = [];
  try {
    const { data } = await github.repos.getContent({
      owner: "anthropics",
      repo: "claude-plugins-official",
      path: "plugins",
    });
    if (!Array.isArray(data)) return items;
    pluginDirs = data
      .filter((f) => f.type === "dir" && f.name !== "example-plugin")
      .map((f) => ({ name: f.name, html_url: f.html_url ?? null }));
  } catch (err) {
    console.warn(`[claude-skills] Failed to list plugins dir: ${err instanceof Error ? err.message : err}`);
    return items;
  }

  // For each plugin dir, fetch its README.md
  for (const dir of pluginDirs) {
    try {
      const { data: fileData } = await github.repos.getContent({
        owner: "anthropics",
        repo: "claude-plugins-official",
        path: `plugins/${dir.name}/README.md`,
      });

      if (!("content" in fileData)) continue;
      const content = Buffer.from(fileData.content, "base64").toString("utf-8");
      const { name, description } = parsePluginReadme(content, dir.name);

      items.push({
        name,
        slug: toSlug(dir.name, "skill"),
        type: "skill",
        description,
        url: dir.html_url,
        category: "plugin",
      });
    } catch {
      // Plugin without a README — use dir name as fallback
      const name = dir.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      items.push({
        name,
        slug: toSlug(dir.name, "skill"),
        type: "skill",
        description: null,
        url: dir.html_url,
        category: "plugin",
      });
    }
  }

  return items;
}
