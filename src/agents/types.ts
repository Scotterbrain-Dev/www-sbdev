import type { DB } from "@/db";
import type Anthropic from "@anthropic-ai/sdk";
import type { Octokit } from "@octokit/rest";

export interface AgentContext {
  db: DB;
  anthropic: Anthropic;
  github: Octokit;
  log: AgentLogger;
}

export interface AgentLogger {
  info: (msg: string, data?: Record<string, unknown>) => void;
  error: (msg: string, data?: Record<string, unknown>) => void;
  warn: (msg: string, data?: Record<string, unknown>) => void;
}

export interface AgentResult {
  rowsAffected: number;
  metadata?: Record<string, unknown>;
}

export interface AgentModule {
  id: string;
  name: string;
  description: string;
  schedule: string; // cron expression
  run: (ctx: AgentContext) => Promise<AgentResult>;
}
