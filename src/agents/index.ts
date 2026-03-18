import { gabbyGitrendAgent } from "./gabby-gitrend";
import { aiArticlesAgent } from "./arty-jotai";
import { aiTrendsAgent } from "./tony-trender";
import { changelogsAgent } from "./lucy-change";
import { keyboardShortcutsAgent } from "./too-short";
import { openrouterAgent } from "./frank-router";
import { claudeSkillsAgent } from "./phil-skills";
import type { AgentModule } from "./types";

// Run-CMD: orchestrator registry — all agents registered here
export const AGENTS: AgentModule[] = [
  gabbyGitrendAgent,  // Gabby-Gitrend
  aiArticlesAgent,    // Arty-Jotai
  aiTrendsAgent,      // Tony-Trender
  changelogsAgent,    // Lucy-Change
  keyboardShortcutsAgent, // Too-Short
  openrouterAgent,    // Frank-Router
  claudeSkillsAgent,  // Phil-Skills
];

export const AGENT_MAP = new Map<string, AgentModule>(
  AGENTS.map((a) => [a.id, a])
);

export { runAgent } from "./runner";
