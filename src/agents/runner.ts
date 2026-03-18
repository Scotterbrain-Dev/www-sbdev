import { db } from "@/db";
import { agentRuns } from "@/db/schema";
import { eq } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { Octokit } from "@octokit/rest";
import { env } from "@/lib/env";
import type { AgentModule, AgentContext, AgentLogger } from "./types";

function makeLogger(agentId: string): AgentLogger {
  const prefix = `[agent:${agentId}]`;
  return {
    info: (msg, data) => console.log(`${prefix} ${msg}`, data ?? ""),
    warn: (msg, data) => console.warn(`${prefix} WARN ${msg}`, data ?? ""),
    error: (msg, data) => console.error(`${prefix} ERROR ${msg}`, data ?? ""),
  };
}

export async function runAgent(agent: AgentModule): Promise<void> {
  const log = makeLogger(agent.id);
  const startedAt = new Date();
  log.info(`Starting agent: ${agent.name}`);

  const [run] = await db.insert(agentRuns).values({
    agentId: agent.id,
    status: "running",
    startedAt,
  }).returning();

  const ctx: AgentContext = {
    db,
    anthropic: new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }),
    github: new Octokit({ auth: env.GITHUB_TOKEN }),
    log,
  };

  try {
    const result = await agent.run(ctx);
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();

    await db.update(agentRuns).set({
      status: "success",
      finishedAt,
      durationMs,
      rowsAffected: result.rowsAffected,
      metadata: result.metadata ?? null,
    }).where(eq(agentRuns.id, run.id));

    log.info(`Completed in ${durationMs}ms, rows: ${result.rowsAffected}`);
  } catch (err) {
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    const errorMessage = err instanceof Error ? err.message : String(err);

    await db.update(agentRuns).set({
      status: "error",
      finishedAt,
      durationMs,
      errorMessage,
    }).where(eq(agentRuns.id, run.id));

    log.error(`Failed in ${durationMs}ms: ${errorMessage}`);
    throw err;
  }
}
