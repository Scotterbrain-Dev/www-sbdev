import { githubTrendingAgent } from "./github-trending";
import { changelogsAgent } from "./changelogs";
import { awesomeReposAgent } from "./awesome-repos";
import { aiArticlesAgent } from "./ai-articles";
import { aiTrendsAgent } from "./ai-trends";
import { openrouterAgent } from "./openrouter";
import { claudeSkillsAgent } from "./claude-skills";
import { keyboardShortcutsAgent } from "./keyboard-shortcuts";
import type { AgentModule } from "./types";

export const AGENTS: AgentModule[] = [
  githubTrendingAgent,
  changelogsAgent,
  awesomeReposAgent,
  aiArticlesAgent,
  aiTrendsAgent,
  openrouterAgent,
  claudeSkillsAgent,
  keyboardShortcutsAgent,
];

export const AGENT_MAP = new Map<string, AgentModule>(
  AGENTS.map((a) => [a.id, a])
);

export { runAgent } from "./runner";
